<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import { getSession, logout } from '$lib/api';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	let {
		title = '',
		subtitle = '',
		activeReminders = 0,
		onMenuToggle
	}: {
		title?: string;
		subtitle?: string;
		activeReminders?: number;
		onMenuToggle?: () => void;
	} = $props();
	let session = $state(getSession());
	let isDropdownOpen = $state(false);
	const toggleMobileMenu = getContext<() => void>('toggleMobileMenu');

	onMount(() => {
		const updateSession = () => { session = getSession(); };
		window.addEventListener('session_updated', updateSession);
		return () => window.removeEventListener('session_updated', updateSession);
	});

	async function handleLogout() {
		logout();
		await goto('/login');
	}

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}

	const getUserInitial = (username: string) => {
		return username ? username.charAt(0).toUpperCase() : 'U';
	};
</script>

<header class="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/40 glass px-4 sm:px-6">
	<div class="flex min-w-0 items-center gap-2 sm:gap-3">
		<button
			class="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
			aria-label="เปิดเมนู"
			onclick={() => (onMenuToggle ?? toggleMobileMenu)?.()}
		>
			<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
			</svg>
		</button>
		<div class="min-w-0">
			{#if title}
				<h1 class="truncate text-base font-bold text-gray-800 sm:text-xl">{title}</h1>
			{/if}
			{#if subtitle}
				<p class="truncate text-xs text-gray-500 sm:text-sm">{subtitle}</p>
			{/if}
		</div>
	</div>

	<div class="flex shrink-0 items-center gap-1 sm:gap-4">
		<a href="/reminders"
			class="relative rounded-xl p-2 text-gray-500 transition-all duration-300 hover:bg-gray-100/50 hover:text-brand-600 hover:scale-105 block"
		>
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
				/>
			</svg>
			{#if activeReminders > 0}
				<span
					class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 shadow-lg shadow-brand-500/40 text-[10px] font-bold text-white animate-pulse"
				>
					{activeReminders}
				</span>
			{/if}
		</a>

		<div class="relative">
			<button
				onclick={toggleDropdown}
				class="flex items-center gap-3 rounded-lg p-2 sm:px-3 transition-all duration-300 hover:bg-white/60 hover:shadow-sm"
			>
				<div class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 shadow-inner">
					{getUserInitial(session?.user.username || 'U')}
				</div>
				<div class="hidden sm:block text-left">
					<p class="text-sm font-medium text-gray-700">{session?.user.username || 'ผู้ใช้'}</p>
					<p class="text-xs text-gray-400">{session?.user.email || 'email@example.com'}</p>
				</div>
			</button>

			{#if isDropdownOpen}
				<div class="absolute right-0 mt-2 w-48 rounded-xl glass-heavy border border-white/60 shadow-xl shadow-brand-500/5 animate-fade-in origin-top-right">
					<a href="/settings" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-700 first:rounded-t-xl">
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
							<circle cx="12" cy="12" r="3" />
						</svg>
						ตั้งค่า
					</a>
					<button
						onclick={handleLogout}
						class="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 last:rounded-b-xl border-t border-gray-100 text-left"
					>
						<Icon name="log-out" class="w-4 h-4" />
						ออกจากระบบ
					</button>
				</div>
			{/if}
		</div>
	</div>
</header>
