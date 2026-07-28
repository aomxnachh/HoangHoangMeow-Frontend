<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import PetCard from '$lib/components/PetCard.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { Pet } from '$lib/data/mock-data';
	import { ApiError, api, isAuthenticated, getSession } from '$lib/api';
	import { i18n } from '$lib/i18n';
	let pets = $state<Pet[]>([]);
	let userName = $state('');
	let dashboardStats = $state({ totalPets: 0, upcomingVaccinations: 0, thisMonthExpenses: 0, activeReminders: 0 });
	let upcomingEvents = $state<Array<{ id: number; petName: string; type: string; title: string; date: string; color: string }>>([]);
	let expenseSummary = $state({ totalThisMonth: 0, byCategory: [] as Array<{ category: string; amount: number; percentage: number }>, monthlyTrend: [] as Array<{ month: string; amount: number }> });
	let error = $state('');
	let ads = $state<Array<{ id: number; title: string; content: string; imageUrl?: string; targetUrl?: string }>>([]);
	let userPlanType = $state<'FREE' | 'PREMIUM'>('FREE');

	async function loadDashboard() {
		try {
			const result = await api<any>('/api/dashboard');
			pets = result.pets.map((pet: any) => ({ ...pet, id: String(pet.id), image: pet.image || '🐾', age: pet.age || '-', weight: pet.weight || '-', color: pet.color || '-', status: pet.status || 'ปกติ' }));
			dashboardStats = { ...result.stats, thisMonthExpenses: result.stats.totalThisMonth };
			expenseSummary = { totalThisMonth: result.stats.totalThisMonth, byCategory: result.byCategory, monthlyTrend: result.monthlyTrend };
			upcomingEvents = result.upcoming.map((item: any) => ({ ...item, date: item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString('th-TH') : '-', color: 'bg-indigo-100 text-indigo-700' }));
			
			if (userPlanType === 'FREE') {
				try {
					const adsResult = await api<{ ads: any[] }>('/api/ads');
					ads = adsResult.ads || [];
				} catch { ads = []; }
			}
		} catch (err) { error = err instanceof ApiError ? err.message : i18n.dashboard.error; }
	}
	onMount(() => {
		if (!isAuthenticated()) {
			goto('/login');
		} else {
			const session = getSession();
			const user = session?.user || JSON.parse(localStorage.getItem('hhm_user') || '{}');
			userName = user.username || user.name || i18n.common.defaultUserName;
			userPlanType = user.planType || 'FREE';
			loadDashboard();
		}
	});
</script>

<svelte:head>
	<title>{i18n.dashboard.title} | PetCare</title>
</svelte:head>

<TopNav title={i18n.dashboard.title} subtitle={i18n.dashboard.subtitle} activeReminders={dashboardStats.activeReminders} />

<div class="p-6 space-y-6">
	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}
	
	<!-- Welcome Banner -->
	<div class="relative overflow-hidden rounded-3xl bg-mesh-banner p-8 text-white shadow-xl shadow-brand-500/20 animate-slide-in-right stagger-1">
		<div class="relative z-10">
			<h2 class="text-3xl font-extrabold tracking-tight drop-shadow-md">{i18n.dashboard.greeting(userName)} </h2>
			<p class="mt-2 text-brand-100 font-medium text-lg drop-shadow">{i18n.dashboard.petsCount(dashboardStats.totalPets)}</p>
		</div>
		<div class="absolute -right-10 -top-10 opacity-20 transform rotate-12 pointer-events-none mix-blend-overlay">
			<Icon name="pet" class="w-64 h-64 text-white" />
		</div>
	</div>

	{#if userPlanType === 'FREE' && ads.length > 0}
		<!-- Ads Section for Free Users -->
		<div class="space-y-4 animate-fade-up stagger-2">
			<h2 class="text-xl font-extrabold text-gray-800">โฆษณาแนะนำ</h2>
			<div class="flex overflow-x-auto gap-4 pb-4 snap-x">
				{#each ads as ad}
					<a
						href={ad.targetUrl || '#'}
						target={ad.targetUrl ? "_blank" : "_self"}
						class="group flex-shrink-0 w-72 rounded-2xl glass-card snap-start overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
					>
						{#if ad.imageUrl}
							<div class="overflow-hidden">
								<img src={ad.imageUrl} alt={ad.title} class="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-110" />
							</div>
						{/if}
						<div class="p-4 relative z-10">
							<h3 class="font-bold text-gray-800 line-clamp-1 group-hover:text-brand-600 transition-colors">{ad.title}</h3>
							<p class="mt-1 text-sm text-gray-600 line-clamp-2">{ad.content}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up stagger-3">
		<StatCard label={i18n.dashboard.stats.totalPets} value={dashboardStats.totalPets} icon="paw" color="brand" />
		<StatCard label={i18n.dashboard.stats.upcomingVaccinations} value={dashboardStats.upcomingVaccinations} icon="syringe" color="amber" />
		<StatCard label={i18n.dashboard.stats.expenses} value="฿{expenseSummary.totalThisMonth.toLocaleString()}" icon="money" color="rose" />
		<StatCard label={i18n.dashboard.stats.activeReminders} value={dashboardStats.activeReminders} icon="bell" color="green" />
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-fade-up stagger-4">
		<!-- My Pets -->
		<div class="lg:col-span-2 space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-extrabold text-gray-800">{i18n.dashboard.myPets}</h2>
				<a href="/pets" class="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors bg-brand-50 hover:bg-brand-100 px-4 py-1.5 rounded-full">
					{i18n.dashboard.viewAll}
				</a>
			</div>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
				{#each pets as pet}
					<PetCard {pet} />
				{/each}
			</div>
		</div>

		<!-- Upcoming Events -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-extrabold text-gray-800">{i18n.dashboard.upcomingEvents}</h2>
			</div>
			<div class="space-y-3">
				{#each upcomingEvents as event}
					<div class="rounded-2xl glass-card p-4 transition-transform hover:-translate-y-1">
						<div class="flex items-start justify-between">
							<div>
								<span class="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide {event.color.replace('indigo', 'brand')}">
									{event.type}
								</span>
								<h3 class="mt-2 text-base font-bold text-gray-800">{event.title}</h3>
								<p class="mt-0.5 text-sm font-medium text-gray-500">{event.petName} <span class="text-gray-300 mx-1">•</span> {event.date}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Expense Summary -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-up stagger-5 pb-8">
		<!-- By Category -->
		<div class="rounded-3xl glass-card p-6">
			<h2 class="text-xl font-extrabold text-gray-800">{i18n.dashboard.expensesByCategory}</h2>
			<div class="mt-6 space-y-4">
				{#each expenseSummary.byCategory as cat}
					<div class="group">
						<div class="flex items-center justify-between text-sm mb-1.5">
							<span class="font-medium text-gray-600 transition-colors group-hover:text-brand-600">{cat.category}</span>
							<span class="font-bold text-gray-800">฿{cat.amount.toLocaleString()}</span>
						</div>
						<div class="h-2.5 w-full overflow-hidden rounded-full bg-gray-100/80 shadow-inner">
							<div
								class="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-1000 ease-out"
								style="width: {cat.percentage}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Monthly Trend (Simple Bar Chart) -->
		<div class="rounded-3xl glass-card p-6">
			<h2 class="text-xl font-extrabold text-gray-800">{i18n.dashboard.monthlyTrend}</h2>
			<div class="mt-8 flex h-48 items-end justify-between gap-3 px-2">
				{#each expenseSummary.monthlyTrend as month}
					<div class="group flex flex-1 flex-col items-center gap-2">
						<span class="text-xs font-bold text-gray-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-1">
							{(month.amount / 1000).toFixed(1)}k
						</span>
						<div
							class="w-full rounded-t-xl bg-gray-200 transition-all duration-500 group-hover:bg-gradient-to-t group-hover:from-brand-500 group-hover:to-brand-400 shadow-sm"
							style="height: {(month.amount / 12000) * 100}%"
						></div>
						<span class="text-xs font-medium text-gray-500 group-hover:text-brand-600 transition-colors">{month.month}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
