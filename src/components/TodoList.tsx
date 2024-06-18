import React from 'react';
import { IonGrid, IonRow, IonCol, IonItem, IonInput, IonButton, IonIcon, IonLabel, IonCheckbox, IonTextarea } from '@ionic/react';
import { add, trash, calendarOutline } from 'ionicons/icons';

interface Task {
  idTask: number;
  title: string;
  done: boolean;
  priority: boolean;
}

// Composant qui gère l'affichage des tâches et des notes, la todo list

interface TodoListProps {
  tasks: Task[];
  onToggleTaskDone: (idTask: number, isDone: boolean) => void;
  onDeleteTask: (idTask: number) => void;
  onDateChange: (idTask: number) => void;
  onAddTask: (text: string, priority: boolean) => Promise<any>;
  notes: any[];
  onTextAreaChange: (e: any, note?: any) => void;
  editedNote: any | null;
  newNoteText: string;
  onEditNote: (note: any) => void;
  onSaveNote: (text: string, date: Date) => void;
  onCancelEdit: () => void;
  priorityTaskText: string;
  setPriorityTaskText: (text: string) => void;
  normalTaskText: string;
  setNormalTaskText: (text: string) => void;
  isMobile: boolean;
}

const TodoList: React.FC<TodoListProps> = ({
  tasks,
  onToggleTaskDone,
  onDeleteTask,
  onDateChange,
  onAddTask,
  notes,
  onTextAreaChange,
  editedNote,
  newNoteText,
  onEditNote,
  onSaveNote,
  onCancelEdit,
  priorityTaskText,
  setPriorityTaskText,
  normalTaskText,
  setNormalTaskText,
  isMobile
}) => {

  const handleAddTask = async (text: string, priority: boolean) => {
    if (text.trim() !== '') {
      try {
        const result = await onAddTask(text, priority);
        if (result) {
          priority ? setPriorityTaskText('') : setNormalTaskText('');
        }
      } catch (error) {
        console.error("Network error", error);
      }
    }
  };

  return (
    <IonCol size={isMobile ? '12' : '4'} className="todolist">
      <IonGrid>
        <IonRow className="priorities">
          <h1>Mes priorités</h1>
          {tasks.filter(task => task.priority).map((task, index) => (
            <IonItem className="task" key={`priority-${task.idTask || index}`}>
              <IonCheckbox
                justify="start"
                checked={task.done}
                onIonChange={() => onToggleTaskDone(task.idTask, !task.done)}
              />
              <IonLabel>{task.title}</IonLabel>
              <IonButton className="button-edit-task" color="medium" fill="clear" slot="end" onClick={() => onDateChange(task.idTask)}>
                <IonIcon icon={calendarOutline} />
              </IonButton>
              <IonButton className="button-edit-task" color="medium" fill="clear" slot="end" onClick={() => onDeleteTask(task.idTask)}>
                <IonIcon icon={trash} />
              </IonButton>
            </IonItem>
          ))}
          <IonItem className="add-task">
            <IonInput
              placeholder="Ajouter une tâche prioritaire"
              value={priorityTaskText}
              onIonChange={e => setPriorityTaskText(e.detail.value ?? '')}
            />
            <IonButton className="button-add-task" onClick={() => handleAddTask(priorityTaskText, true)}>
              <IonIcon icon={add} />
            </IonButton>
          </IonItem>
        </IonRow>
        <IonRow className="tasks">
          <h1>Mes tâches à faire</h1>
          {tasks.filter(task => !task.priority).map((task, index) => (
            <IonItem className="task" key={`task-${task.idTask || index}`}>
              <IonCheckbox
                className="checkbox-task"
                justify="start"
                checked={task.done}
                onIonChange={() => onToggleTaskDone(task.idTask, !task.done)}
              />
              <IonLabel>{task.title}</IonLabel>
              <IonButton className="button-edit-task" color="medium" fill="clear" slot="end" onClick={() => onDateChange(task.idTask)}>
                <IonIcon icon={calendarOutline} />
              </IonButton>
              <IonButton className="button-edit-task" color="medium" fill="clear" slot="end" onClick={() => onDeleteTask(task.idTask)}>
                <IonIcon icon={trash} />
              </IonButton>
            </IonItem>
          ))}
          <IonItem className="add-task">
            <IonInput
              placeholder="Ajouter une tâche"
              value={normalTaskText}
              onIonChange={e => setNormalTaskText(e.detail.value ?? '')}
            />
            <IonButton className="button-add-task" onClick={() => handleAddTask(normalTaskText, false)}>
              <IonIcon icon={add} />
            </IonButton>
          </IonItem>
        </IonRow>
        <IonRow className="notes">
          <h1>Mes notes</h1>
          {notes.length > 0 ? (
            notes.map((note, index) => (
              <IonItem className="note" key={`note-${note.idNote || index}`}>
                <IonTextarea
                  value={editedNote && editedNote.idNote === note.idNote ? editedNote.text : note.text}
                  onIonChange={(e) => onTextAreaChange(e, note)}
                  autoGrow
                  readonly={!(editedNote && editedNote.idNote === note.idNote)}
                  onFocus={() => onEditNote(note)}
                />
              </IonItem>
            ))
          ) : (
            <IonItem className="note">
              <IonTextarea
                value={newNoteText}
                onIonChange={(e) => onTextAreaChange(e)}
                placeholder="..."
                autoGrow
              />
            </IonItem>
          )}
          <IonItem className="note-actions">
            <IonButton className="button-save-notes" onClick={() => editedNote ? onSaveNote(editedNote.text, new Date()) : onSaveNote(newNoteText, new Date())} disabled={!(editedNote || newNoteText)}>Enregistrer</IonButton>
            <IonButton color="medium" onClick={onCancelEdit} disabled={!(editedNote || newNoteText)}>Annuler</IonButton>
          </IonItem>
        </IonRow>
      </IonGrid>
    </IonCol>
  );
};

export default TodoList;
