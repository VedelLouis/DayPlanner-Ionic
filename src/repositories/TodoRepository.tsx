const API_URL = 'https://dayplanner.tech/api/';

interface Task {
  idTask?: number;
  title: string;
  done: boolean;
  priority: number;
}

interface Note {
  idNote?: number;
  text: string;
}

export const fetchNotes = async (dateString: string): Promise<Note[]> => {
  try {
    const response = await fetch(`${API_URL}?controller=note&action=index&date=${dateString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const notes = await response.json();
    return Array.isArray(notes) ? notes : [];
  } catch (error) {
    console.error("Network error", error);
    return [];
  }
};

export const createNote = async (text: string, date: string): Promise<{success: number}> => {
  try {
    const formData = new URLSearchParams();
    formData.append('text', text);
    formData.append('date', date);
    const response = await fetch(`${API_URL}?controller=note&action=create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString(),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Network error", error);
    return { success: 0 };
  }
};

export const updateNote = async (text: string, date: string): Promise<{success: number}> => {
  try {
    const formData = new URLSearchParams();
    formData.append('text', text);
    formData.append('date', date);
    const response = await fetch(`${API_URL}?controller=note&action=update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString(),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Network error", error);
    return { success: 0 };
  }
};

export const fetchTasks = async (dateString: string): Promise<Task[]> => {
  try {
    const response = await fetch(`${API_URL}?controller=task&action=index&date=${dateString}`, {
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
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    console.error("Network error", error);
    return [];
  }
};

export const updateTask = async (idTask: number, done: boolean): Promise<{ success: number }> => {
  try {
    const formData = new URLSearchParams();
    formData.append('idTask', idTask.toString());
    formData.append('done', done ? '1' : '0');

    const response = await fetch(`${API_URL}?controller=task&action=update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Network error", error);
    return { success: 0 };
  }
};

export const deleteTask = async (idTask: number): Promise<{ success: number }> => {
  try {
    const formData = new URLSearchParams();
    formData.append('idTask', idTask.toString());
    const response = await fetch(`${API_URL}?controller=task&action=delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const result = text ? JSON.parse(text) : { success: 1 };

    return result;
  } catch (error) {
    console.error("Network error", error);
    return { success: 0 };
  }
};

export const createTask = async (title: string, priority: boolean, date: string): Promise<{ newIdTask: number }> => {
  try {
    const formData = new URLSearchParams();
    formData.append('title', title);
    formData.append('priority', priority ? '1' : '0');
    formData.append('date', date);
    const response = await fetch(`${API_URL}?controller=task&action=create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return { newIdTask: parseInt(result.idTask, 10) };
  } catch (error) {
    console.error("Network error", error);
    return { newIdTask: 0 };
  }
};

export const delayTask = async (idTask: number, date: string): Promise<{ success: number }> => {
  try {
    const formData = new URLSearchParams();
    formData.append('idTask', idTask.toString());
    formData.append('date', date);
    const response = await fetch(`${API_URL}?controller=task&action=delay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const result = text ? JSON.parse(text) : { success: 1 };

    return result;
  } catch (error) {
    console.error("Network error", error);
    return { success: 0 };
  }
};
