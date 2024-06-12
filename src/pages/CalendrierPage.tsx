import React, { useState, useEffect } from "react";
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonGrid, IonRow,
  IonCol, IonIcon, IonImg, IonModal, IonDatetime, IonItem, IonToggle, IonRange, IonLabel
} from "@ionic/react";
import { caretBackOutline, caretForwardOutline, settingsOutline, sunnyOutline, moonOutline, closeOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./CalendrierPage.css";
import { fetchTasks, updateTask, deleteTask, createTask, delayTask, fetchNotes, createNote, updateNote } from '../repositories/TodoRepository';
import { fetchEvents } from '../repositories/EventRepository';
import { deconnexion } from '../repositories/ConnexionRepository';
import TodoList from '../components/TodoList';
import DisplayEvents from '../components/DisplayEvents';

const CalendrierPage: React.FC = () => {
  const history = useHistory();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [pickedDate, setPickedDate] = useState<string>(new Date().toISOString());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [editedNote, setEditedNote] = useState<any | null>(null);
  const joursSemaine = ["L", "M", "M", "J", "V", "S", "D"];
  const heures = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [originalNotes, setOriginalNotes] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [newNoteText, setNewNoteText] = useState("");
  const [isDateChangeModalOpen, setIsDateChangeModalOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [priorityTaskText, setPriorityTaskText] = useState('');
  const [normalTaskText, setNormalTaskText] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const getWeekStartDate = (date: Date): Date => {
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek >= 1 ? dayOfWeek - 1 : 6;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - diff);
  };

  const updateWeekDates = (date: Date) => {
    const startDate = getWeekStartDate(date);
    const dates = Array.from({ length: 7 }, (_, i) =>
      new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
    );
    setWeekDates(dates);
  };

  useEffect(() => {
    updateWeekDates(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isSameDay(selectedDate, new Date())) {
        setSelectedDate(new Date());
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  useEffect(() => {
    const fetchAndUpdateTasks = async () => {
      const dateString = selectedDate.toLocaleDateString('en-CA');
      const fetchedTasks = await fetchTasks(dateString);
      setTasks(fetchedTasks);
    };

    const fetchAndUpdateNotes = async () => {
      const dateString = selectedDate.toLocaleDateString('en-CA');
      const fetchedNotes = await fetchNotes(dateString);
      setNotes(fetchedNotes);
      setOriginalNotes(JSON.parse(JSON.stringify(fetchedNotes)));
    };

    const fetchAndUpdateEvents = async () => {
      const dateString = selectedDate.toLocaleDateString('en-CA');
      const fetchedEvents = await fetchEvents(dateString);
      setEvents(fetchedEvents);
    };

    fetchAndUpdateTasks();
    fetchAndUpdateNotes();
    fetchAndUpdateEvents();
  }, [selectedDate]);

  const handleButtonClickToday = () => {
    setSelectedDate(new Date());
  };

  const handleDayClick = (day: Date): void => {
    const now = new Date();
    const isToday = isSameDay(day, now);
    if (isToday) {
      setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()));
    } else {
      setSelectedDate(new Date(day.getFullYear(), day.getMonth(), day.getDate()));
    }
  };

  const handleButtonClickDeconnexion = async () => {
    try {
      await deconnexion();
      history.push("/Connexion");
    } catch (error) {
      console.error("Network error");
    }
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
    setSelectedDate(newDate);
  };

  const handleConfirmDate = () => {
    const newDate = new Date(pickedDate);
    setSelectedDate(newDate);
    setIsModalOpen(false);
  };

  const handleEditNote = (note: any) => {
    setEditedNote(note);
  };

  const handleSaveNote = async (text: string, date: Date) => {
    const formattedDate = date.toLocaleDateString('en-CA');
    if (editedNote) {
      try {
        await updateNote(text, formattedDate);
      } catch (error) {
        console.error("Erreur réseau", error);
      }
    } else {
      try {
        await createNote(text, formattedDate);
      } catch (error) {
        console.error("Erreur réseau", error);
      }
    }
  };

  const handleCancelEdit = () => {
    if (editedNote) {
      const originalNote = originalNotes.find(note => note.idNote === editedNote.idNote);
      if (originalNote) {
        setNotes(notes.map(note => note.idNote === editedNote.idNote ? originalNote : note));
      }
    }
    setEditedNote(null);
    setNewNoteText("");
  };

  const handleTextAreaChange = (e: any, note?: any) => {
    const value = e.detail.value!;
    if (note && editedNote && editedNote.idNote === note.idNote) {
      setEditedNote({ ...editedNote, text: value });
    } else {
      setNewNoteText(value);
    }
  };

  const handleToggleTaskDone = async (idTask: number, isDone: boolean) => {
    try {
      const result = await updateTask(idTask, isDone);
      if (result.success) {
        setTasks(tasks.map(task => task.idTask === idTask ? { ...task, done: isDone } : task));
      }
    } catch (error) {
      console.error("Erreur réseau", error);
    }
  };

  const handleDeleteTask = async (idTask: number) => {
    try {
      const result = await deleteTask(idTask);
      if (result.success) {
        setTasks(tasks.filter(task => task.idTask !== idTask));
      }
    } catch (error) {
      console.error("Erreur réseau", error);
    }
  };

  const handleDateChange = (idTask: number) => {
    setCurrentTaskId(idTask);
    setIsDateChangeModalOpen(true);
  };

  const handleDateChangeModal = async (idTask: number, newDate: Date) => {
    const formattedDate = newDate.toLocaleDateString('en-CA');
    try {
      const result = await delayTask(idTask, formattedDate);
      if (result.success) {
        setTasks(tasks.filter(task => task.idTask !== idTask));
      }
    } catch (error) {
      console.error("Erreur réseau", error);
    }
    setIsDateChangeModalOpen(false);
  };

  const handleAddTask = async (text: string, priority: boolean) => {
    if (text.trim() !== '') {
      const formattedDate = selectedDate.toLocaleDateString('en-CA');
      try {
        const result = await createTask(text, priority, formattedDate);
        if (result.newIdTask !== 0) {
          const newTask = {
            idTask: result.newIdTask,
            title: text,
            done: false,
            priority: priority,
            date: formattedDate
          };
          setTasks(prevTasks => [...prevTasks, newTask]);
          priority ? setPriorityTaskText('') : setNormalTaskText('');
        }
      } catch (error) {
        console.error("Network error", error);
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
  };

  const changeFontSize = (size: string) => {
    document.body.style.fontSize = size;
  };


  const currentDate = new Date();
  const isCurrentDate = isSameDay(selectedDate, currentDate);
  const marginTop = selectedDate.getHours() * 60 * 1.5 + selectedDate.getMinutes() * 1.5;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonImg slot="start" src="../dayPlannerLogo.png" className="logoCalendar" />
          <IonTitle>Calendrier</IonTitle>
          <IonButton slot="end" className="button-settings" onClick={() => setIsSettingsModalOpen(true)}>
            <IonIcon icon={settingsOutline} />
          </IonButton>
          <IonButton slot="end" className="button-today" onClick={handleButtonClickToday}>
            Aujourd'hui
          </IonButton>
          <IonButton slot="end" className="button-deconnexion" onClick={handleButtonClickDeconnexion}>
            Déconnexion
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonButton className="btn-goToDate" onClick={() => setIsModalOpen(true)}>
          Aller à une date
        </IonButton>
        <IonGrid>
          <IonRow>
            <IonCol size="1" className="colIconFleche">
              <IonButton className="button-week" onClick={handlePrevDay}>
                <IonIcon icon={caretBackOutline} />
              </IonButton>
            </IonCol>
            <IonCol size="10">
              <div className="semaine">
                <div className="jours-semaine">
                  {joursSemaine.map((jour, index) => (
                    <div key={`jour-${index}`} className="jour-semaine">
                      {jour}
                      <IonButton
                        key={`button-${index}`}
                        className="jour-mois"
                        fill="clear"
                        shape="round"
                        size="small"
                        color={
                          weekDates[index] && isSameDay(weekDates[index], currentDate)
                            ? "danger"
                            : "dark"
                        }
                        onClick={() =>
                          weekDates[index] && handleDayClick(weekDates[index])
                        }
                        style={{
                          border: `2px solid ${weekDates[index] &&
                            isSameDay(weekDates[index], selectedDate)
                            ? isSameDay(weekDates[index], currentDate)
                              ? "var(--ion-color-danger)"
                              : "var(--ion-color-dark)"
                            : "transparent"
                            }`,
                          borderRadius: "40%",
                        }}
                      >
                        {weekDates[index] ? weekDates[index].getDate().toString() : ""}
                      </IonButton>
                    </div>
                  ))}
                </div>
              </div>
            </IonCol>
            <IonCol size="1" className="colIconFleche">
              <IonButton className="button-week" onClick={handleNextDay}>
                <IonIcon icon={caretForwardOutline} />
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <div className="date-actuelle">
          <p>
            {selectedDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="container-heure">
          <IonTitle>
            <div className="titleCalendar">Calendrier</div>
          </IonTitle>
          <IonGrid>
            <IonRow>
              <IonCol size={isMobile ? '12' : '8'} className="calendarEvent">
                <DisplayEvents
                  events={events}
                  setEvents={setEvents}
                  isCurrentDate={isCurrentDate}
                  marginTop={marginTop}
                />
                <div className="liste-heures">
                  {heures.map((heure) => (
                    <div key={heure} className="heure">
                      {heure}:00
                    </div>
                  ))}
                </div>
              </IonCol>

              <TodoList
                tasks={tasks}
                onToggleTaskDone={handleToggleTaskDone}
                onDeleteTask={handleDeleteTask}
                onDateChange={handleDateChange}
                onAddTask={handleAddTask}
                notes={notes}
                onTextAreaChange={handleTextAreaChange}
                editedNote={editedNote}
                newNoteText={newNoteText}
                onEditNote={handleEditNote}
                onSaveNote={handleSaveNote}
                onCancelEdit={handleCancelEdit}
                priorityTaskText={priorityTaskText}
                setPriorityTaskText={setPriorityTaskText}
                normalTaskText={normalTaskText}
                setNormalTaskText={setNormalTaskText}
                isMobile={isMobile}
              />

            </IonRow>
          </IonGrid>
        </div>
      </IonContent>

      <IonModal
        isOpen={isModalOpen}
        onDidDismiss={() => setIsModalOpen(false)}
        className="modal-goToDate"
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Aller à une date</IonTitle>
            <IonButton className="closeModalParam" slot="end" color="medium" onClick={() => setIsModalOpen(false)}><IonIcon icon={closeOutline} /></IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="modal-content">
          <IonItem className="modal-item">
            <IonDatetime
              className="datePicker-modal-date"
              presentation="date"
              value={pickedDate}
              onIonChange={(e) => setPickedDate(e.detail.value as string)}
            />
          </IonItem>
          <IonButton className="button-modal" expand="block" onClick={handleConfirmDate}>
            Aller à cette date
          </IonButton>
        </IonContent>
      </IonModal>

      <IonModal
        isOpen={isDateChangeModalOpen}
        onDidDismiss={() => setIsDateChangeModalOpen(false)}
        className="modal-goToDate"
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Changer la date</IonTitle>
            <IonButton className="closeModalParam" slot="end" color="medium" onClick={() => setIsDateChangeModalOpen(false)}><IonIcon icon={closeOutline} /></IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="modal-content">
          <IonItem className="modal-item">
            <IonDatetime
              className="datePicker-modal-date"
              presentation="date"
              value={new Date().toISOString()}
              onIonChange={(e) => setPickedDate(e.detail.value as string)}
            />
          </IonItem>
          <IonButton
            className="button-modal" expand="block"
            onClick={() => {
              if (currentTaskId !== null) {
                handleDateChangeModal(currentTaskId, new Date(pickedDate));
              }
            }}>
            Changer la date
          </IonButton>
        </IonContent>
      </IonModal>

      <IonModal isOpen={isSettingsModalOpen} onDidDismiss={() => setIsSettingsModalOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Paramètres</IonTitle>
            <IonButton className="closeModalParam" slot="end" color="medium" onClick={() => setIsSettingsModalOpen(false)}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonLabel >Thème</IonLabel>
            <IonIcon icon={isDarkMode ? moonOutline : sunnyOutline} />
            <IonToggle
              checked={isDarkMode}
              onIonChange={() => toggleTheme()}
            />
          </IonItem>
          <IonItem>
            <IonLabel>Taille de la police</IonLabel>
            <IonButton color="medium" style={{ fontSize: '16px' }} fill="clear" onClick={() => changeFontSize('16px')}>
              A
            </IonButton>
            <IonButton color="medium" style={{ fontSize: '20px' }} fill="clear" onClick={() => changeFontSize('20px')}>
              A
            </IonButton>
            <IonButton color="medium" style={{ fontSize: '26px' }} fill="clear" onClick={() => changeFontSize('26px')}>
              A
            </IonButton>
          </IonItem>
        </IonContent>
      </IonModal>

    </IonPage>
  );
};

export default CalendrierPage;
