<script lang="ts">
	import { goto } from '$app/navigation';
	import { getSession, logout } from '$lib/api';

	let { title = '', subtitle = '', activeReminders = 0 }: { title?: string; subtitle?: string; activeReminders?: number } = $props();
	let session = getSession();
	let isDropdownOpen = $state(false);

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

<header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md">
	<div>
		{#if title}
			<h1 class="text-xl font-bold text-gray-800">{title}</h1>
		{/if}
		{#if subtitle}
			<p class="text-sm text-gray-500">{subtitle}</p>
		{/if}
	</div>

	<div class="flex items-center gap-4">
		<!-- Notifications -->
		<a href="/reminders"
			class="relative rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 block"
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
					class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
				>
					{activeReminders}
				</span>
			{/if}
		</a>

		<!-- User menu -->
		<div class="relative">
			<button
				onclick={toggleDropdown}
				class="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
			>
				<div class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
					{getUserInitial(session?.user.username || 'U')}
				</div>
				<div class="hidden sm:block text-left">
					<p class="text-sm font-medium text-gray-700">{session?.user.username || 'ผู้ใช้'}</p>
					<p class="text-xs text-gray-400">{session?.user.email || 'email@example.com'}</p>
				</div>
			</button>

			<!-- Dropdown menu -->
			{#if isDropdownOpen}
				<div class="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200">
					<a href="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg">
						⚙️ ตั้งค่า
					</a>
					<button
						onclick={handleLogout}
						class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg border-t border-gray-200"
					>
						🚪 ออกจากระบบ
					</button>
				</div>
			{/if}
		</div>
	</div>
</header>
