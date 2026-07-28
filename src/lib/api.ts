import { browser } from '$app/environment';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type SessionUser = {
	id: number;
	username: string;
	email: string;
	phone: string | null;
	role: 'USER' | 'ADMIN';
	planType: 'FREE' | 'PREMIUM';
};

export class ApiError extends Error {
	code?: string;

	constructor(message: string, code?: string) {
		super(message);
		this.code = code;
	}
}

export function getSession(): { token: string; user: SessionUser } | null {
	if (!browser) return null;
	const token = localStorage.getItem('hhm_token');
	const rawUser = localStorage.getItem('hhm_user');
	if (!token || !rawUser) return null;
	try {
		return { token, user: JSON.parse(rawUser) as SessionUser };
	} catch {
		return null;
	}
}

export function saveSession(token: string, user: SessionUser) {
	if (!browser) return;
	localStorage.setItem('hhm_token', token);
	localStorage.setItem('hhm_user', JSON.stringify(user));
}

export function clearSession() {
	if (!browser) return;
	localStorage.removeItem('hhm_token');
	localStorage.removeItem('hhm_user');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
	const headers = new Headers(init.headers);
	const session = getSession();
	if (session) headers.set('Authorization', `Bearer ${session.token}`);
	if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
	const response = await fetch(`${API_URL}${path}`, { ...init, headers });
	const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
	if (!response.ok) {
		if (response.status === 401) clearSession();
		throw new ApiError(payload.error || 'ไม่สามารถทำรายการได้', payload.code);
	}
	return payload as T;
}

export const request = <T>(path: string, method: string, body?: unknown) =>
	api<T>(path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

export function isAuthenticated() {
	return !!getSession();
}

export function logout() {
	clearSession();
}
