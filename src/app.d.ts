// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Window {
		google?: { accounts: { id: {
			initialize(options: { client_id: string; callback: (response: { credential: string }) => void; context: string; ux_mode: string; auto_prompt: boolean }): void;
			renderButton(element: HTMLElement, options: Record<string, unknown>): void;
		} } };
	}
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
