const API_URL = 'https://dayplanner.tech/api/';

export interface Event {
    idEvent?: number;
    name: string;
    color: string;
    startTime: string;
    endTime: string;
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