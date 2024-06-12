import React, { useState, useEffect } from 'react';
import { IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonLabel, IonDatetime, IonItem, IonFooter, IonIcon } from '@ionic/react';
import { closeOutline } from "ionicons/icons";
import { deleteEvent, updateEvent, updateEventTime, createEvent } from '../repositories/EventRepository';

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

const DisplayEvents: React.FC<DisplayEventsProps> = ({ events, setEvents, isCurrentDate, marginTop }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [addEventName, setAddEventName] = useState('');
  const [addEventDate, setAddEventDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const [addEventStartTime, setAddEventStartTime] = useState(currentTime);
  const [addEventEndTime, setAddEventEndTime] = useState(currentTime);
  const [addEventColor, setAddEventColor] = useState('#ffffff');

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!draggingEvent) return;
      setCurrentY(event.clientY);
      setIsDragging(true);
    };

    const handleMouseUp = async () => {
      if (!draggingEvent) return;

      if (isDragging) {
        const deltaY = currentY - initialY;
        const minutesMoved = Math.round(deltaY / 1.5);

        const updatedEvents = await Promise.all(events.map(async (e) => {
          if (e.idEvent === draggingEvent.idEvent) {
            const newStart = new Date(e.dateStart);
            newStart.setMinutes(newStart.getMinutes() + minutesMoved);
            const newEnd = new Date(e.dateEnd);
            newEnd.setMinutes(newEnd.getMinutes() + minutesMoved);

            if (newStart.getHours() >= 0 && newEnd.getHours() <= 24) {
              const result = await updateEventTime(draggingEvent.idEvent, formatDateTime(newStart), formatDateTime(newEnd));
              if (result.success) {
                return { ...e, dateStart: formatDateTime(newStart), dateEnd: formatDateTime(newEnd) };
              }
            }
          }
          return e;
        }));

        setEvents(updatedEvents);
      }

      setDraggingEvent(null);
      setIsDragging(false);
      setInitialY(0);
      setCurrentY(0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [currentY, draggingEvent, events, initialY, setEvents, isDragging]);

  const calculateEventPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const top = (start.getHours() * 60 + start.getMinutes()) * 1.5;
    const height = ((end.getHours() * 60 + end.getMinutes()) - (start.getHours() * 60 + start.getMinutes())) * 1.5;
    return { top, height };
  };

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
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setSelectedEvent(null);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

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

  const handleUpdateEvent = async () => {
    if (selectedEvent && selectedEvent.idEvent) {
      const newDateStart = `${eventDate} ${eventStartTime}`;
      const newDateEnd = `${eventDate} ${eventEndTime}`;

      const result = await updateEvent(
        selectedEvent.idEvent,
        eventName,
        eventColor,
        newDateStart,
        newDateEnd
      );

      if (result.success) {
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

  const handleCreateEvent = async () => {
    const addDateStart = `${addEventDate} ${addEventStartTime}`;
    const addDateEnd = `${addEventDate} ${addEventEndTime}`;

    const result = await createEvent(
      addEventName,
      addEventColor,
      addDateStart,
      addDateEnd
    );

    if (result.success) {
      closeAddModal();
      const newEvent = {
        idEvent: result.idEvent,
        name: addEventName,
        color: addEventColor,
        dateStart: addDateStart,
        dateEnd: addDateEnd
      };

      setEvents(prevEvents => [...prevEvents, newEvent]);
    } else {
      console.error("Erreur");
    }
  }

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>, initialEvent: Event) => {
    setDraggingEvent(initialEvent);
    setInitialY(e.clientY);
    setCurrentY(e.clientY);
  };

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
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
        const offset = isDraggingEvent ? currentY - initialY : 0;

        return (
          <div key={event.idEvent} className="event"
            onMouseDown={(e) => onMouseDown(e, event)}
            onMouseMove={() => setIsDragging(true)}
            style={{
              backgroundColor: event.color + '30',
              marginTop: isDraggingEvent ? top + offset : top,
              height: height,
              cursor: 'move',
            }}
          >
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
                <IonLabel position="fixed">Nom de l'évènement</IonLabel>
                <IonInput value={eventName} onIonChange={(e) => setEventName(e.detail.value as string)} />
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
              <IonInput placeholder="..." value={addEventName} onIonChange={(e) => setAddEventName(e.detail.value as string)} />
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

    </>
  );
};

export default DisplayEvents;