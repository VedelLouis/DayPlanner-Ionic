import React, { useState, useEffect } from 'react';
import { IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonLabel, IonDatetime, IonItem, IonFooter, IonIcon, IonToast } from '@ionic/react';
import { closeOutline } from "ionicons/icons";
import { deleteEvent, updateEvent, updateEventTime, createEvent, eventSameTime, choiceMoveEvent } from '../repositories/EventRepository';

interface Event {
  idEvent: number;
  dateStart: string;
  dateEnd: string;
  name: string;
  color: string;
}

interface DisplayEventsProps {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  isCurrentDate: boolean;
  marginTop: number;
}

// Composant qui affiche et gère les évènements

const DisplayEvents: React.FC<DisplayEventsProps> = ({ events, setEvents, isCurrentDate, marginTop }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [eventStartTime, setEventStartTime] = useState<string>('');
  const [eventEndTime, setEventEndTime] = useState<string>('');
  const [eventColor, setEventColor] = useState<string>('');
  const [draggingEvent, setDraggingEvent] = useState<Event | null>(null);
  const [initialY, setInitialY] = useState<number>(0);
  const [currentY, setCurrentY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [resizingEvent, setResizingEvent] = useState<Event | null>(null);
  const [resizingType, setResizingType] = useState<string | null>(null);
  const [addEventName, setAddEventName] = useState('');
  const [addEventDate, setAddEventDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const [addEventStartTime, setAddEventStartTime] = useState(currentTime);
  const [addEventEndTime, setAddEventEndTime] = useState(currentTime);
  const [addEventColor, setAddEventColor] = useState('#000000');
  const [showToast, setShowToast] = useState({ show: false, message: '' });
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [draggingIdEvent, setDraggingIdEvent] = useState<number | null>(null);
  const [formattedOriginalStart, setFormattedOriginalStart] = useState('');
  const [formattedOriginalEnd, setFormattedOriginalEnd] = useState('');
  const [moveEventName, setMoveEventName] = useState('');
  const [moveEventColor, setMoveEventColor] = useState('#000000');

  useEffect(() => {

    // Fonction qui gère le déplacement et le redimensionnement des évènements, quand on clique ou appuie sur un évènement

    const handleMove = (event: MouseEvent | TouchEvent) => {
      if (isDragging && draggingEvent) {
        const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
        const newY = clientY;
        const deltaY = newY - initialY;
        const minutesMoved = Math.round(deltaY / 1.5);

        const potentialNewStart = new Date(draggingEvent.dateStart);
        const potentialNewEnd = new Date(draggingEvent.dateEnd);
        potentialNewStart.setMinutes(potentialNewStart.getMinutes() + minutesMoved);
        potentialNewEnd.setMinutes(potentialNewEnd.getMinutes() + minutesMoved);

        if (potentialNewStart.getDate() === potentialNewEnd.getDate()) {
          setCurrentY(newY);
          setIsDragging(true);
        } else {
          setIsDragging(false);
        }
      }

      if (isResizing && resizingEvent) {
        const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
        const deltaY = clientY - initialY;
        const minutesMoved = Math.round(deltaY / 1.5);

        const newStart = new Date(resizingEvent.dateStart);
        const newEnd = new Date(resizingEvent.dateEnd);

        if (resizingType === 'top') {
          newStart.setMinutes(newStart.getMinutes() + minutesMoved);
          if (newStart < newEnd) {
            setCurrentY(clientY);
          }
        } else if (resizingType === 'bottom') {
          newEnd.setMinutes(newEnd.getMinutes() + minutesMoved);
          if (newEnd > newStart) {
            setCurrentY(clientY);
          }
        }
      }
    };

    // Fonction qui gère la fin du déplacement et du redimensionnement des évènements, 
    // quand on relache la souris ou le doigt

    const handleEnd = async () => {
      const minimumMovement = 1;

      if (isDragging && draggingEvent) {
        const originalStart = new Date(draggingEvent.dateStart);
        const originalEnd = new Date(draggingEvent.dateEnd);

        const startMinutes = originalStart.getMinutes();
        const endMinutes = originalEnd.getMinutes();
        const deltaY = currentY - initialY;
        const minutesMoved = Math.round(deltaY / 1.5);

        const newStart = new Date(draggingEvent.dateStart);
        const newEnd = new Date(draggingEvent.dateEnd);
        newStart.setMinutes(startMinutes + minutesMoved);
        newEnd.setMinutes(endMinutes + minutesMoved);

        if (Math.abs(deltaY) > minimumMovement) {
          setDraggingIdEvent(draggingEvent.idEvent);
          setFormattedOriginalStart(formatDateTime(originalStart));
          setFormattedOriginalEnd(formatDateTime(originalEnd));

          if (newStart.getDate() === newEnd.getDate()) {
            const sameTimeResult = await eventSameTime(formatDateTime(newStart), formatDateTime(newEnd), draggingEvent.idEvent);
            if (sameTimeResult.success > 0) {
              setShowToast({ show: true, message: 'Il y a déjà un événement prévu pour cette période' });
            } else {
              setIsMoveModalOpen(true);
              const result = await updateEventTime(draggingEvent.idEvent, formatDateTime(newStart), formatDateTime(newEnd));
              if (result.success) {
                setEvents(events.map(e => e.idEvent === draggingEvent.idEvent ? { ...e, dateStart: formatDateTime(newStart), dateEnd: formatDateTime(newEnd) } : e));
              }
            }
          }
        }

        setDraggingEvent(null);
        setIsDragging(false);
        setInitialY(0);
        setCurrentY(0);
      }

      if (isResizing && resizingEvent) {
        const newStart = new Date(resizingEvent.dateStart);
        const newEnd = new Date(resizingEvent.dateEnd);

        const deltaY = currentY - initialY;
        const minutesMoved = Math.round(deltaY / 1.5);

        if (resizingType === 'top') {
          newStart.setMinutes(newStart.getMinutes() + minutesMoved);
        } else if (resizingType === 'bottom') {
          newEnd.setMinutes(newEnd.getMinutes() + minutesMoved);
        }

        if (newStart < newEnd) {
          const sameTimeResult = await eventSameTime(formatDateTime(newStart), formatDateTime(newEnd), resizingEvent.idEvent);
          if (sameTimeResult.success > 0) {
            setShowToast({ show: true, message: 'Il y a déjà un événement prévu pour cette période' });
          } else {
            const result = await updateEventTime(resizingEvent.idEvent, formatDateTime(newStart), formatDateTime(newEnd));
            if (result.success) {
              setEvents(events.map(e => e.idEvent === resizingEvent.idEvent ? { ...e, dateStart: formatDateTime(newStart), dateEnd: formatDateTime(newEnd) } : e));
            }
          }
        }

        setResizingEvent(null);
        setResizingType(null);
        setInitialY(0);
        setCurrentY(0);
        setIsResizing(false);
      }
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [currentY, draggingEvent, events, initialY, isDragging, resizingEvent, resizingType, isResizing, setEvents]);

  // Fonction qui calcule la position d'un évènement en fonction du marge du haut et de la hauteur de l'évènement,
  // qui donnera donc son heure de début et de fin
  // Permet d'afficher les évènements sur la grille

  const calculateEventPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const top = (start.getHours() * 60 + start.getMinutes()) * 1.5;
    const height = ((end.getHours() * 60 + end.getMinutes()) - (start.getHours() * 60 + start.getMinutes())) * 1.5;
    return { top, height };
  };

  // Ouverture et fermeture des modals

  const openModal = (event: Event) => {
    setSelectedEvent(event);
    setEventName(event.name);
    setEventDate(event.dateStart.split(' ')[0]);
    setEventStartTime(event.dateStart.split(' ')[1].substring(0, 5));
    setEventEndTime(event.dateEnd.split(' ')[1].substring(0, 5));
    setEventColor(event.color);
    setIsModalOpen(true);
    setIsDragging(false);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    resetUpdateModal();
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setSelectedEvent(null);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    resetAddModal();
    setIsAddModalOpen(false);
  };

  const closeMoveModal = () => {
    resetMoveModal();
    setIsMoveModalOpen(false);
  };

  // Fonction qui gère la suppression d'un évènement

  const handleDeleteEvent = async () => {
    if (selectedEvent && selectedEvent.idEvent) {
      const result = await deleteEvent(selectedEvent.idEvent);
      if (result.success) {
        const updatedEvents = events.filter(event => event.idEvent !== selectedEvent.idEvent);
        setEvents(updatedEvents);
        closeModal();
      }
    }
  };

  // Fonction qui gère la mise à jour d'un évènement

  const handleUpdateEvent = async () => {

    if (selectedEvent && selectedEvent.idEvent) {
      const newDateStart = `${eventDate} ${eventStartTime}`;
      const newDateEnd = `${eventDate} ${eventEndTime}`;
      console.log(newDateStart, newDateEnd);
      if (!eventName || !eventDate || !eventStartTime || !eventEndTime || !eventColor) {
        setShowToast({ show: true, message: 'Tous les champs doivent être remplis' });
        return;
      }

      if (new Date(newDateEnd).getTime() - new Date(newDateStart).getTime() < 30 * 60 * 1000) {
        setShowToast({ show: true, message: 'Les événements doivent durer au moins 30 minutes' });
        return;
      }

      const sameTimeResult = await eventSameTime(newDateStart, newDateEnd, selectedEvent.idEvent);
      if (sameTimeResult.success > 0) {
        setShowToast({ show: true, message: 'Il y a déjà un événement prévu pour cette période' });
        return;
      }

      const result = await updateEvent(
        selectedEvent.idEvent,
        eventName,
        eventColor,
        newDateStart,
        newDateEnd
      );

      if (result.success === 1) {
        resetUpdateModal();
        const updatedEvents = events.map(event => {
          if (event.idEvent === selectedEvent.idEvent) {
            return {
              ...event,
              name: eventName,
              color: eventColor,
              dateStart: newDateStart,
              dateEnd: newDateEnd
            };
          }
          return event;
        });

        const filteredEvents = updatedEvents.filter(event =>
          new Date(event.dateStart).toLocaleDateString() === new Date().toLocaleDateString() ||
          new Date(event.dateEnd).toLocaleDateString() === new Date().toLocaleDateString()
        );

        setEvents(filteredEvents);
        closeModal();
      } else {
        console.error("Erreur");
      }
    }
  };

  // Fonction qui gère la création d'un évènement

  const handleCreateEvent = async () => {
    const addDateStart = `${addEventDate} ${addEventStartTime}`;
    const addDateEnd = `${addEventDate} ${addEventEndTime}`;

    if (!addEventName || !addEventDate || !addEventStartTime || !addEventEndTime || !addEventColor) {
      setShowToast({ show: true, message: 'Tous les champs doivent être remplis' });
      return;
    }

    if (new Date(addDateEnd).getTime() - new Date(addDateStart).getTime() < 30 * 60 * 1000) {
      setShowToast({ show: true, message: 'Les événements doivent durer au moins 30 minutes' });
      return;
    }

    const sameTimeResult = await eventSameTime(addDateStart, addDateEnd);
    if (sameTimeResult.success > 0) {
      setShowToast({ show: true, message: 'Il y a déjà un événement prévu pour cette période' });
      return;
    }

    const result = await createEvent(
      addEventName,
      addEventColor,
      addDateStart,
      addDateEnd
    );

    if (result.success && result.idEvent) {
      const newEvent = {
        idEvent: result.idEvent,
        name: addEventName,
        color: addEventColor,
        dateStart: addDateStart,
        dateEnd: addDateEnd
      };

      setEvents(prevEvents => [...prevEvents, newEvent]);

      setAddEventName('');
      setAddEventDate(new Date().toISOString().split('T')[0]);
      setAddEventStartTime(currentTime);
      setAddEventEndTime(currentTime);
      setAddEventColor('#000000');
      closeAddModal();
    } else {
      console.error("Erreur");
    }
  };

  // Fonction qui gère le choix de l'utilisateur après le déplacement d'un évènement,
  // soit laisser la place vide, soit remonter tous les autres évènements chronologiquement, soit créer un nouvel évènement

  const handleChoiceMoveEvent = async (
    choice: number, idEvent: number, originalStart: string, originalEnd: string, name: string, color: string
  ) => {
    try {
      if (!moveEventName && choice === 2) {
        setShowToast({ show: true, message: 'Tous les champs doivent être remplis' });
        return;
      }
      const sameTimeResult = await eventSameTime(originalStart, originalEnd);
      if (sameTimeResult.success > 0) {
        setShowToast({ show: true, message: 'Il y a déjà un événement prévu pour cette période' });
        return;
      }
      const result = await choiceMoveEvent(
        choice,
        idEvent,
        originalStart,
        originalEnd,
        name,
        color
      );
      if (choice === 2 && result.success && result.idEvent) {
        const newEvent = {
          idEvent: result.idEvent,
          name,
          color,
          dateStart: originalStart,
          dateEnd: originalEnd
        };

        setEvents(prevEvents => [...prevEvents, newEvent]);
      } else {
        window.location.reload();
      }

      closeMoveModal();
    } catch (error) {
      console.error('Erreur');
    }
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>, initialEvent: Event) => {
    setDraggingEvent(initialEvent);
    setInitialY(e.clientY);
    setCurrentY(e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>, initialEvent: Event) => {
    setDraggingEvent(initialEvent);
    setInitialY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const onResizerMouseDown = (e: React.MouseEvent<HTMLDivElement>, initialEvent: Event, type: 'top' | 'bottom') => {
    e.stopPropagation();
    setResizingEvent(initialEvent);
    setResizingType(type);
    setInitialY(e.clientY);
    setCurrentY(e.clientY);
    setIsResizing(true);
  };

  const onResizerTouchStart = (e: React.TouchEvent<HTMLDivElement>, initialEvent: Event, type: 'top' | 'bottom') => {
    e.stopPropagation();
    setResizingEvent(initialEvent);
    setResizingType(type);
    setInitialY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setIsResizing(true);
  };

  // Fonction qui donne la date formatée
  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Reinitalisation des modals après utilisation

  const resetUpdateModal = () => {
    setSelectedEvent(null);
    setEventName('');
    setEventDate('');
    setEventStartTime('');
    setEventEndTime('');
    setEventColor('');
    setIsModalOpen(false);
  };

  const resetAddModal = () => {
    setAddEventName('');
    setAddEventDate(new Date().toISOString().split('T')[0]);
    setAddEventStartTime(currentTime);
    setAddEventEndTime(currentTime);
    setAddEventColor('#000000');
    setIsAddModalOpen(false);
  };

  const resetMoveModal = () => {
    setMoveEventName('');
    setMoveEventColor('#000000');
    setIsMoveModalOpen(false);
  };

  return (
    <>
      <IonButton className="btn-addEvent" onClick={openAddModal}>Ajouter un évènement</IonButton>
      {isCurrentDate && (
        <div className="heure-ligne" style={{ marginTop: `${marginTop}px` }}>
          <div className="heure-actuelle">
            {new Date().getHours().toString().padStart(2, "0") + ":" + new Date().getMinutes().toString().padStart(2, "0")}
          </div>
        </div>
      )}
      {events.map(event => {
        const { top, height } = calculateEventPosition(event.dateStart, event.dateEnd);
        const isDraggingEvent = draggingEvent && draggingEvent.idEvent === event.idEvent;
        const isResizingEvent = resizingEvent && resizingEvent.idEvent === event.idEvent;
        const offset = isDraggingEvent ? currentY - initialY : 0;
        const resizeOffset = isResizingEvent ? currentY - initialY : 0;

        return (
          <div key={event.idEvent} className="event"
            onMouseDown={(e) => onMouseDown(e, event)}
            onTouchStart={(e) => onTouchStart(e, event)}
            onMouseMove={() => setIsDragging(true)}
            onTouchMove={() => setIsDragging(true)}
            style={{
              backgroundColor: event.color + '30',
              marginTop: isDraggingEvent ? top + offset : isResizingEvent && resizingType === 'top' ? top + resizeOffset : top,
              height: isResizingEvent && resizingType === 'top' ? height - resizeOffset : isResizingEvent && resizingType === 'bottom' ? height + resizeOffset : height,
              cursor: 'move',
            }}
          >
            <div className="resizerTop"
              onMouseDown={(e) => onResizerMouseDown(e, event, 'top')}
              onTouchStart={(e) => onResizerTouchStart(e, event, 'top')}
            ></div>
            <div className="timeStart">{event.dateStart.split(' ')[1]}</div>
            <button className="eventName"
              style={{
                backgroundColor: event.color,
              }}
              onClick={(e) => {
                e.stopPropagation();
                openModal(event);
              }}
            >
              {event.name}
            </button>
            <div className="timeEnd">{event.dateEnd.split(' ')[1]}</div>
            <div className="resizerBottom"
              onMouseDown={(e) => onResizerMouseDown(e, event, 'bottom')}
              onTouchStart={(e) => onResizerTouchStart(e, event, 'bottom')}
            ></div>
          </div>
        );
      })}

      <IonModal isOpen={isModalOpen} onDidDismiss={closeModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Modifier l'évènement</IonTitle>
            <IonButton className="closeModalParam" slot="end" color="medium" onClick={closeModal}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="modal-content">
          {selectedEvent && (
            <>
              <IonItem>
                <IonLabel position="fixed" >Nom de l'évènement</IonLabel>
                <IonInput required value={eventName} onIonChange={(e) => setEventName(e.detail.value as string)} />
              </IonItem>
              <IonItem>
                <IonLabel position="fixed">Date de l'évènement</IonLabel>
                <IonDatetime value={eventDate} onIonChange={(e) => setEventDate(e.detail.value as string)} presentation="date" />
              </IonItem>
              <IonItem>
                <IonLabel position="fixed">Heure de début</IonLabel>
                <IonDatetime value={eventStartTime} onIonChange={(e) => setEventStartTime(e.detail.value as string)} presentation="time" />
              </IonItem>
              <IonItem>
                <IonLabel position="fixed">Heure de fin</IonLabel>
                <IonDatetime value={eventEndTime} onIonChange={(e) => setEventEndTime(e.detail.value as string)} presentation="time" />
              </IonItem>
              <IonItem>
                <IonLabel position="fixed">Couleur de l'évènement</IonLabel>
                <input type="color" className="color-input" value={eventColor} onChange={(e) => setEventColor(e.target.value)} />
              </IonItem>
            </>
          )}
        </IonContent>
        <IonFooter>
          <IonButton className="button-modal" expand="block" onClick={handleUpdateEvent}>Enregistrer</IonButton>
          <IonButton className="button-modal-delete-event" expand="block" color="danger" onClick={handleDeleteEvent}>Supprimer</IonButton>
        </IonFooter>
      </IonModal>
    
      <IonModal isOpen={isAddModalOpen} onDidDismiss={closeAddModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Ajouter un évènement</IonTitle>
            <IonButton className="closeModalParam" slot="end" color="medium" onClick={closeAddModal}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="modal-content">
          <>
            <IonItem>
              <IonLabel position="fixed">Nom de l'évènement</IonLabel>
              <IonInput required placeholder="..." value={addEventName} onIonChange={(e) => setAddEventName(e.detail.value as string)} />
            </IonItem>
            <IonItem>
              <IonLabel position="fixed">Date de l'évènement</IonLabel>
              <IonDatetime value={addEventDate} onIonChange={(e) => setAddEventDate(e.detail.value as string)} presentation="date" />
            </IonItem>
            <IonItem>
              <IonLabel position="fixed">Heure de début</IonLabel>
              <IonDatetime value={addEventStartTime} onIonChange={(e) => setAddEventStartTime(e.detail.value as string)} presentation="time" />
            </IonItem>
            <IonItem>
              <IonLabel position="fixed">Heure de fin</IonLabel>
              <IonDatetime value={addEventEndTime} onIonChange={(e) => setAddEventEndTime(e.detail.value as string)} presentation="time" />
            </IonItem>
            <IonItem>
              <IonLabel position="fixed">Couleur de l'évènement</IonLabel>
              <input type="color" className="color-input" value={addEventColor} onChange={(e) => setAddEventColor(e.target.value)} />
            </IonItem>
          </>
        </IonContent>
        <IonFooter>
          <IonButton className="button-modal" expand="block" onClick={handleCreateEvent}>Ajouter</IonButton>
        </IonFooter>
      </IonModal>

      <IonModal isOpen={isMoveModalOpen} onDidDismiss={closeMoveModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Déplacer l'évènement</IonTitle>
            <IonButton className="closeModalParam" slot="end" color="medium" onClick={closeMoveModal}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="modal-content">
          <>
            <IonButton className="button-modal-move" expand="block" onClick={closeMoveModal}>Laisser l'emplacement vide</IonButton>
            <IonItem>
              <IonLabel position="fixed">Nom de l'évènement</IonLabel>
              <IonInput required placeholder="..." value={moveEventName} onIonChange={(e) => setMoveEventName(e.detail.value as string)} />
            </IonItem>
            <IonItem>
              <IonLabel position="fixed">Couleur de l'évènement</IonLabel>
              <input type="color" className="color-input" value={moveEventColor} onChange={(e) => setMoveEventColor(e.target.value)} />
            </IonItem>
            <IonButton className="button-modal-moveTime" expand="block" onClick={() =>
              handleChoiceMoveEvent(2, draggingIdEvent ?? 0, formattedOriginalStart, formattedOriginalEnd, moveEventName, moveEventColor)}>
              Créer un évènement sur l'emplacement vide</IonButton>
          </>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast.show}
        message={showToast.message}
        duration={2000}
        onDidDismiss={() => setShowToast({ show: false, message: '' })}
      />
    </>
  );
};

export default DisplayEvents;
