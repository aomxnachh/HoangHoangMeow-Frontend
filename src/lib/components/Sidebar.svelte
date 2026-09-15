<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { getSession } from '$lib/api';

	let {
		collapsed = false,
		mobileOpen = false,
		onToggle,
		onClose
	}: {
		collapsed?: boolean;
		mobileOpen?: boolean;
		onToggle?: () => void;
		onClose?: () => void;
	} = $props();

	let isAdmin = $state(false);

	$effect(() => {
		if (browser) {
			// Re-check on every page navigation by reading $page
			void $page.url.pathname;
			const session = getSession();
			isAdmin = session?.user?.role === 'ADMIN';
		}
	});

	const navItems = [
		{ label: 'แดชบอร์ด', href: '/', icon: 'layout-dashboard' },
		{ label: 'จัดการสัตว์เลี้ยง', href: '/pets', icon: 'paw-print' },
		{ label: 'บันทึกสุขภาพ', href: '/health', icon: 'heart-pulse' },
		{ label: 'ค่าใช้จ่าย', href: '/expenses', icon: 'receipt' },
		{ label: 'แผนดูแล', href: '/care', icon: 'clipboard-list' },
		{ label: 'การแจ้งเตือน', href: '/reminders', icon: 'bell' },
		{ label: 'อัปเกรดแพ็กเกจ', href: '/upgrade', icon: 'crown' },
		{ label: 'ตั้งค่า', href: '/settings', icon: 'settings' },
		{ label: 'การชำระเงิน', href: '/billing', icon: 'credit-card' }
	];

	const adminItems = [
		{ label: 'แดชบอร์ด Admin', href: '/admin', icon: 'shield' },
		{ label: 'จัดการผู้ใช้', href: '/admin/users', icon: 'users' },
		{ label: 'จัดการโฆษณา', href: '/admin/ads', icon: 'megaphone' },
		{ label: 'จัดการคำแนะนำ', href: '/admin/recommendations', icon: 'sparkles' }
	];

	function isActive(href: string): boolean {
		if (href === '/') return $page.url.pathname === '/';
		if (href === '/admin' && $page.url.pathname !== '/admin') return false;
		return $page.url.pathname.startsWith(href);
	}

	let expanded = $derived(!collapsed || mobileOpen);
</script>

{#if mobileOpen}
	<button
		class="fixed inset-0 z-30 bg-gray-900/40 backdrop-blur-sm lg:hidden"
		aria-label="ปิดเมนู"
		onclick={onClose}
	></button>
{/if}

<aside
	class="fixed left-0 top-0 z-40 flex h-dvh w-72 -translate-x-full flex-col border-r border-white/40 bg-white/95 shadow-[4px_0_24px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 lg:bg-white/80 lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] {mobileOpen
		? 'translate-x-0'
		: '-translate-x-full'} {collapsed ? 'lg:w-20' : 'lg:w-64'}"
>
	<!-- Logo / Brand -->
	<div class="flex h-16 items-center gap-3 border-b border-gray-100 px-4">
		<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 shadow-sm ring-1 ring-brand-100 transition-transform duration-300 hover:scale-105">
			<img src="/hoanghoangmeow-logo.png" alt="HoangHoang Meow" class="h-10 w-10 object-contain" />
		</div>
		{#if expanded}
			<span class="text-lg font-bold text-gray-800 whitespace-nowrap">HoangHoang <span class="text-brand-600">Meow</span></span>
		{/if}
	</div>

	<!-- Navigation -->
	<nav class="flex-1 overflow-y-auto px-3 py-4">
		<ul class="space-y-1">
			{#each navItems as item}
				<li>
					<a
						href={item.href}
						class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 {isActive(item.href)
							? 'bg-brand-50 text-brand-700 shadow-sm'
							: 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:translate-x-1'}"
						title={!expanded ? item.label : undefined}
						onclick={onClose}
					>
						{#if item.icon === 'layout-dashboard'}
							<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
							</svg>
						{:else if item.icon === 'paw-print'}
							<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V2.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
							</svg>
						{:else if item.icon === 'heart-pulse'}
							<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
							</svg>
						{:else if item.icon === 'receipt'}
							<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
							</svg>
						{:else if item.icon === 'clipboard-list'}
							<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
							</svg>
						{:else if item.icon === 'bell'}
							<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
							</svg>
						{:else if item.icon === 'crown'}
							<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 3 8.25 8.25 0 018.638 5.214 8.251 8.251 0 013 5.25c.12 3.042.704 5.89 1.663 8.251C5.581 15.761 7.2 17.25 9 17.25h6c1.8 0 3.419-1.489 4.337-3.749.959-2.361 1.543-5.209 1.663-8.251a8.251 8.251 0 01-5.638-.036z" />
							</svg>
						{:else if item.icon === 'settings'}
							<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						{:else if item.icon === 'credit-card'}
							<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
								<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
							</svg>
						{/if}
						{#if expanded}
							<span class="whitespace-nowrap">{item.label}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>

		{#if isAdmin}
			<div class="mt-8 mb-2 px-3">
				{#if expanded}
					<h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">ผู้ดูแลระบบ</h3>
				{:else}
					<div class="h-px bg-gray-200 my-2"></div>
				{/if}
			</div>
			<ul class="space-y-1">
				{#each adminItems as item}
					<li>
						<a
							href={item.href}
							class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 {isActive(item.href)
								? 'bg-purple-50 text-purple-700 shadow-sm'
								: 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:translate-x-1'}"
							title={!expanded ? item.label : undefined}
							onclick={onClose}
						>
							{#if item.icon === 'shield'}
								<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
								</svg>
							{:else if item.icon === 'users'}
								<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
									<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
								</svg>
							{:else if item.icon === 'megaphone'}
								<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
								</svg>
							{:else if item.icon === 'sparkles'}
								<svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-.813 2.846a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
								</svg>
							{/if}
							{#if expanded}
								<span class="whitespace-nowrap">{item.label}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</nav>

	<!-- Collapse toggle -->
	<div class="hidden border-t border-gray-100 px-3 py-3 lg:block">
		<button
			onclick={onToggle}
			class="flex w-full items-center justify-center rounded-xl p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-800 hover:scale-105 active:scale-95"
		>
			{#if collapsed}
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
				</svg>
			{:else}
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
				</svg>
			{/if}
		</button>
	</div>
</aside>
