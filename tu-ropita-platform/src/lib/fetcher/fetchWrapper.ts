import globalSettings from "../settings";

const API_BASE_URL = `${globalSettings.BASE_URL}/api`;

export const fetcher = async (path: string, options: RequestInit = {}): Promise<[Error | null, object | null]> => {
    try {
        const res = await fetch(`${API_BASE_URL}${path}`, options);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        return [null, data];
    } catch (error) {
        return [error instanceof Error ? error : new Error('An unknown error occurred'), null];
    }
};