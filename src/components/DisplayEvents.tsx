import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';

interface Event {
  idEvent: number;
  dateStart: string;
  dateEnd: string;
  name: string;
  color: string;
}

interface DisplayEventsProps {
  events: Event[];
  isCurrentDate: boolean;
  marginTop: number;
}

const DisplayEvents: React.FC<DisplayEventsProps> = ({ events, isCurrentDate, marginTop }) => {

  const calculateEventPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const top = (start.getHours() * 60 + start.getMinutes()) * 1.5;
    const height = ((end.getHours() * 60 + end.getMinutes()) - (start.getHours() * 60 + start.getMinutes())) * 1.5;
    return { top, height };
  };

  return (
    <>
      <IonButton className="btn-addEvent">Ajouter un évènement</IonButton>
      {isCurrentDate && (
        <div className="heure-ligne" style={{ marginTop: `${marginTop}px` }}>
          <div className="heure-actuelle">
            {new Date().getHours().toString().padStart(2, "0") + ":" + new Date().getMinutes().toString().padStart(2, "0")}
          </div>
        </div>
      )}
      {events.map(event => {
        const { top, height } = calculateEventPosition(event.dateStart, event.dateEnd);
        return (
          <div key={event.idEvent} className="event"
            style={{
              backgroundColor: event.color + '30',
              marginTop: top,
              height: height
            }}>
            <button className="eventName"
              style={{
                backgroundColor: event.color,
              }}>
              {event.name}
            </button>
          </div>
        );
      })}
    </>
  );
};

export default DisplayEvents;

