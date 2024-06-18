import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IonReactRouter } from '@ionic/react-router';
import CalendrierPage from '../pages/CalendrierPage';
import { act } from 'react-dom/test-utils';

jest.mock('../repositories/TodoRepository', () => ({
  fetchTasks: jest.fn(() => Promise.resolve([])),
  updateTask: jest.fn(() => Promise.resolve({ success: true })),
  deleteTask: jest.fn(() => Promise.resolve({ success: true })),
  createTask: jest.fn(() => Promise.resolve({ newIdTask: 1 })),
  delayTask: jest.fn(() => Promise.resolve({ success: true })),
  fetchNotes: jest.fn(() => Promise.resolve([])),
  createNote: jest.fn(() => Promise.resolve()),
  updateNote: jest.fn(() => Promise.resolve()),
}));

jest.mock('../repositories/EventRepository', () => ({
  fetchEvents: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../repositories/ConnexionRepository', () => ({
  deconnexion: jest.fn(() => Promise.resolve()),
}));

jest.mock('../components/TodoList', () => () => <div>TodoList Component</div>);
jest.mock('../components/DisplayEvents', () => () => <div>DisplayEvents Component</div>);

describe('CalendrierPage', () => {
  it('renders without crashing', () => {
    render(
      <IonReactRouter>
        <CalendrierPage />
      </IonReactRouter>
    );

    expect(screen.getByText('Calendrier')).toBeInTheDocument();
  });

  it('adds a new task', async () => {
    render(
      <IonReactRouter>
        <CalendrierPage />
      </IonReactRouter>
    );

    const addButton = screen.getByRole('button', { name: /ajouter une tâche/i });
    const input = screen.getByPlaceholderText('Nouvelle tâche');

    fireEvent.change(input, { target: { value: 'Test Task' } });
    fireEvent.click(addButton);

    await act(async () => {
      expect(await screen.findByText('Test Task')).toBeInTheDocument();
    });
  });

});
