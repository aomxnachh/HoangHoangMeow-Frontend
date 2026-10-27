<script lang="ts">
	import { api } from '$lib/api';
	import AdCarousel from '$lib/components/AdCarousel.svelte';
	let { location, petId = '', topic = '' }: { location: string; petId?: string; topic?: string } = $props();
	let products = $state<any[]>([]);
	let query = $derived(new URLSearchParams({ location, petId, topic }).toString());
	$effect(() => {
		let active = true;
		let version = 0;
		const path = `/api/ads?${query}`;
		products = [];
		const refresh = async () => {
			if (document.visibilityState !== 'visible') return;
			const requestVersion = ++version;
			try {
				const result = await api<{ ads: any[] }>(path);
				if (active && requestVersion === version) products = result.ads;
			} catch { /* Keep the last successful set during a temporary connection failure. */ }
		};
		const storageChanged = (event: StorageEvent) => { if (event.key === 'hhm_data_changed') void refresh(); };
		void refresh();
		const timer = window.setInterval(refresh, 15000);
		window.addEventListener('focus', refresh);
		window.addEventListener('api_updated', refresh);
		window.addEventListener('storage', storageChanged);
		document.addEventListener('visibilitychange', refresh);
		return () => {
			active = false;
			window.clearInterval(timer);
			window.removeEventListener('focus', refresh);
			window.removeEventListener('api_updated', refresh);
			window.removeEventListener('storage', storageChanged);
			document.removeEventListener('visibilitychange', refresh);
		};
	});
</script>

<AdCarousel items={products} />
