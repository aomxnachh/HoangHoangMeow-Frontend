import { redirect } from '@sveltejs/kit';

export const ssr = false;

export const load = async () => {
	// Client-side check will be done in +page.svelte
	// This is just a placeholder
};

