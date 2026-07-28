<script lang="ts">
	import { page } from '$app/stores';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();
	let sidebarCollapsed = $state(false);
	let isAuthPage = $derived(['/login', '/register', '/reset-password'].includes($page.url.pathname));

	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50" style="font-family: 'Noto Sans Thai', sans-serif;">
	{#if !isAuthPage}
		<Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
	{/if}

	<main class="transition-all duration-300 {isAuthPage ? '' : sidebarCollapsed ? 'ml-20' : 'ml-64'}">
		{@render children()}
	</main>
</div>
