import Cookies from 'js-cookie';
import globalSettings from "../settings";

const API_BASE_URL = `${globalSettings.BASE_URL}/api`;

export const fetcher = async (path: string, options: RequestInit = {}): Promise<[Error | null, any | null]> => {
    try {
        const res = await fetch(`${API_BASE_URL}${path}`, options);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Extract tokens from headers
        const token = res.headers.get('Authorization');
        const refreshToken = res.headers.get('Refresh-Token');
        // Store tokens if they exist
        if (token) {
            Cookies.set('Authorization', token.split(' ')[1], { secure: true, sameSite: 'strict' });
        }
        if (refreshToken) {
            Cookies.set('Refresh-Token', refreshToken, { secure: true, sameSite: 'strict' });
        }

        if(res.status === 204){
            return [null, { status: 204 }];
        }

        const data = await res.json();
        return [null, data];
    } catch (error) {
        return [error instanceof Error ? error : new Error('An unknown error occurred'), null];
    }
};