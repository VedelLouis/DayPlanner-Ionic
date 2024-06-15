const API_URL = 'https://dayplanner.tech/api/';

export interface Event {
    idEvent?: number;
    name: string;
    color: string;
    dateStart: string;
    dateEnd: string;
}

export const fetchEvents = async (dateString: string): Promise<Event[]> => {
    try {
        const response = await fetch(`${API_URL}?controller=event&action=index&date=${dateString}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const events = await response.json();
        return Array.isArray(events) ? events : [];
    } catch (error) {
        console.error("Network error", error);
        return [];
    }
};

export const updateEvent = async (idEvent: number, name: string, color: string, dateStart: string, dateEnd: string): Promise<{ success: number }> => {
    try {
        const formData = new URLSearchParams();
        formData.append('idEvent', idEvent.toString());
        formData.append('name', name);
        formData.append('color', color);
        formData.append('dateStart', dateStart);
        formData.append('dateEnd', dateEnd);
        const response = await fetch(`${API_URL}?controller=event&action=update`, {
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

export const updateEventTime = async (idEvent: number, dateStart: string, dateEnd: string): Promise<{ success: number }> => {
    try {
        const formData = new URLSearchParams();
        formData.append('idEvent', idEvent.toString());
        formData.append('dateStart', dateStart);
        formData.append('dateEnd', dateEnd);
        const response = await fetch(`${API_URL}?controller=event&action=updateTime`, {
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

export const deleteEvent = async (idEvent: number): Promise<{ success: number }> => {
    try {
        const formData = new URLSearchParams();
        formData.append('idEvent', idEvent.toString());
        const response = await fetch(`${API_URL}?controller=event&action=delete`, {
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

export const createEvent = async (name: string, color: string, dateStart: string, dateEnd: string): Promise<{ success: number, idEvent: number }> => {
    try {
        const formData = new URLSearchParams();
        formData.append('name', name);
        formData.append('color', color);
        formData.append('dateStart', dateStart);
        formData.append('dateEnd', dateEnd);
        const response = await fetch(`${API_URL}?controller=event&action=create`, {
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
        return { success: 0, idEvent: 0 };
    }
};

export const eventSameTime = async (dateStart: string, dateEnd: string, idEvent?: number): Promise<{ success: number }> => {
    try {
        const formData = new URLSearchParams();
        formData.append('dateStart', dateStart);
        formData.append('dateEnd', dateEnd);
        if (idEvent !== undefined) {
            formData.append('idEvent', idEvent.toString());
        }
        const response = await fetch(`${API_URL}?controller=event&action=sameTime`, {
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

export const choiceMoveEvent = async (
    choice: number,
    idEvent: number,
    newDateStart: string,
    newDateEnd: string,
    oldDateStart: string,
    oldDateEnd: string,
    name?: string,
    color?: string
): Promise<{ success: number }> => {
    try {
        const formData = new URLSearchParams();
        formData.append('choice', choice.toString());
        formData.append('idEvent', idEvent.toString());
        formData.append('newDateStart', newDateStart);
        formData.append('newDateEnd', newDateEnd);
        formData.append('oldDateStart', oldDateStart);
        formData.append('oldDateEnd', oldDateEnd);
        if (name) {
            formData.append('name', name);
        }
        if (color) {
            formData.append('color', color);
        }
        const response = await fetch(`${API_URL}?controller=event&action=choiceMove`, {
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
