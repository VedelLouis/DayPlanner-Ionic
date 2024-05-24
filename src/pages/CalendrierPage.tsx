import React, { useState, useEffect } from "react";
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonGrid, IonRow, IonCol, IonIcon, IonImg, IonModal, IonDatetime, IonItem, IonCheckbox, IonLabel,
} from "@ionic/react";
import { caretBackOutline, caretForwardOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./CalendrierPage.css";

const CalendrierPage: React.FC = () => {
  const history = useHistory();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [pickedDate, setPickedDate] = useState<string>(new Date().toISOString());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const joursSemaine = ["L", "M", "M", "J", "V", "S", "D"];
  const heures = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const [weekDates, setWeekDates] = useState<Date[]>([]);

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
    const fetchTasks = async () => {
      const dateString = selectedDate.toLocaleDateString('en-CA');
      console.log(`Fetching tasks for date: ${dateString}`);
      try {
        const response = await fetch(`https://dayplanner.tech/api/?controller=task&action=index&date=${dateString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json();
        console.log('Fetched tasks:', tasks);
        setTasks(Array.isArray(tasks) ? tasks : []);
      } catch (error) {
        console.error("Network error", error);
        setTasks([]);
      }
    };

    fetchTasks();
  }, [selectedDate]);

  const handleButtonClickToday = () => {
    setSelectedDate(new Date());
  };

  const handleDayClick = (day: Date): void => {
    console.log(`Day clicked: ${day}`);
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
      await fetch("https://dayplanner.tech/api/?controller=connexion&action=deconnect", {
        method: "GET",
      });
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

  const currentDate = new Date();
  const isCurrentDate = isSameDay(selectedDate, currentDate);
  const marginTop = selectedDate.getHours() * 60 * 1.5 + selectedDate.getMinutes() * 1.5;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonImg slot="start" src="../dayPlannerLogo.png" className="logoCalendar" />
          <IonTitle>Calendrier</IonTitle>
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
              <IonCol size="9">
                <IonButton className="btn-addEvent">Ajouter un évènement</IonButton>
                {isCurrentDate && (
                  <div className="heure-ligne" style={{ marginTop: `${marginTop}px` }}>
                    <div className="heure-actuelle">
                      {selectedDate.getHours().toString().padStart(2, "0") +
                        ":" +
                        selectedDate.getMinutes().toString().padStart(2, "0")}
                    </div>
                  </div>
                )}
                <div className="liste-heures">
                  {heures.map((heure) => (
                    <div key={heure} className="heure">
                      {heure}:00
                    </div>
                  ))}
                </div>
              </IonCol>

              <IonCol size="3" className="todolist">
                <IonGrid>
                  <IonRow className="priorities">
                    <h1>Mes priorités</h1>
                    {tasks.filter(task => task.priority !== 0).map((task, index) => (
                      <IonItem className="task" key={`priority-${task.id || index}`}>
                        <IonCheckbox slot="start" checked={task.done === 1} />
                        <IonLabel>{task.title}</IonLabel>
                      </IonItem>
                    ))}
                  </IonRow>
                  <IonRow className="tasks">
                    <h1>Mes tâches à faire</h1>
                    {tasks.filter(task => task.priority === 0).map((task, index) => (
                      <IonItem className="task" key={`task-${task.id || index}`}>
                        <IonCheckbox slot="start" checked={task.done === 1} />
                        <IonLabel>{task.title}</IonLabel>
                      </IonItem>
                    ))}
                  </IonRow>
                  <IonRow className="notes">
                    <h1>Mes notes</h1>
                  </IonRow>
                </IonGrid>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>

      <IonModal
        isOpen={isModalOpen}
        onDidDismiss={() => setIsModalOpen(false)}
        className="modal-goToDate"
      >
        <div className="modal-content">
          <IonItem className="modal-item">
            <IonDatetime
              className="datePicker-modal-date"
              presentation="date"
              value={pickedDate}
              onIonChange={(e) => setPickedDate(e.detail.value as string)}
            />
          </IonItem>
          <IonButton className="btn-go-date" onClick={handleConfirmDate}>
            Aller à cette date
          </IonButton>
          <IonButton
            className="btn-go-date-close"
            color="medium"
            onClick={() => setIsModalOpen(false)}
          >
            Fermer
          </IonButton>
        </div>
      </IonModal>
    </IonPage>
  );
};

export default CalendrierPage;