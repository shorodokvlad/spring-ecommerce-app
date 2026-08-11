jest.mock('axios', () => ({
    interceptors: {
        response: { use: jest.fn() }
    }
}));

import axios from 'axios';
import ApiService, { SESSION_EXPIRED_EVENT } from './ApiService';

const rejectedResponse = axios.interceptors.response.use.mock.calls[0][1];

const createToken = (expiresAt) => {
    const payload = window.btoa(JSON.stringify({ exp: expiresAt }));
    return `header.${payload}.signature`;
};

describe('ApiService session checks', () => {
    afterEach(() => {
        localStorage.clear();
    });

    test('rejects an expired JWT stored in the browser', () => {
        localStorage.setItem('token', createToken(Math.floor(Date.now() / 1000) - 60));
        localStorage.setItem('role', 'ADMIN');

        expect(ApiService.isAuthenticated()).toBe(false);
        expect(ApiService.isAdmin()).toBe(false);
    });

    test('accepts a JWT whose expiration is still in the future', () => {
        localStorage.setItem('token', createToken(Math.floor(Date.now() / 1000) + 60));

        expect(ApiService.isAuthenticated()).toBe(true);
    });

    test('clears the session when an authenticated request returns 401', async () => {
        localStorage.setItem('token', createToken(Math.floor(Date.now() / 1000) + 60));
        localStorage.setItem('role', 'USER');
        const sessionExpiredListener = jest.fn();
        window.addEventListener(SESSION_EXPIRED_EVENT, sessionExpiredListener);
        const error = {
            response: { status: 401 },
            config: { headers: { Authorization: 'Bearer token' } }
        };

        await expect(rejectedResponse(error)).rejects.toBe(error);

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('role')).toBeNull();
        expect(sessionExpiredListener).toHaveBeenCalledTimes(1);
        window.removeEventListener(SESSION_EXPIRED_EVENT, sessionExpiredListener);
    });

    test('keeps a valid session when a request is genuinely forbidden', async () => {
        const token = createToken(Math.floor(Date.now() / 1000) + 60);
        localStorage.setItem('token', token);
        const error = {
            response: { status: 403 },
            config: { headers: { Authorization: `Bearer ${token}` } }
        };

        await expect(rejectedResponse(error)).rejects.toBe(error);

        expect(localStorage.getItem('token')).toBe(token);
    });

    test('treats the legacy profile 403 response as an expired session', async () => {
        const token = createToken(Math.floor(Date.now() / 1000) + 60);
        localStorage.setItem('token', token);
        const error = {
            response: { status: 403 },
            config: {
                url: 'https://api.example.com/user/my-info',
                headers: { Authorization: `Bearer ${token}` }
            }
        };

        await expect(rejectedResponse(error)).rejects.toBe(error);

        expect(localStorage.getItem('token')).toBeNull();
    });
});
