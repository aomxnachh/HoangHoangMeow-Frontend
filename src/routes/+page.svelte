<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import PetCard from '$lib/components/PetCard.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
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
	<div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
		<div class="relative z-10">
			<h2 class="text-xl font-bold">{i18n.dashboard.greeting(userName)} </h2>
			<p class="mt-1 text-indigo-100">{i18n.dashboard.petsCount(dashboardStats.totalPets)}</p>
		</div>
		<div class="absolute -right-6 -top-6 text-[120px] opacity-10">
			🐾
		</div>
	</div>

	{#if userPlanType === 'FREE' && ads.length > 0}
		<!-- Ads Section for Free Users -->
		<div class="space-y-4">
			<h2 class="text-lg font-bold text-gray-800">โฆษณาแนะนำ</h2>
			<div class="flex overflow-x-auto gap-4 pb-4 snap-x">
				{#each ads as ad}
					<a
						href={ad.targetUrl || '#'}
						target={ad.targetUrl ? "_blank" : "_self"}
						class="flex-shrink-0 w-72 rounded-2xl border border-gray-200 bg-white shadow-sm snap-start overflow-hidden hover:shadow-md transition-shadow block"
					>
						{#if ad.imageUrl}
							<img src={ad.imageUrl} alt={ad.title} class="h-32 w-full object-cover" />
						{/if}
						<div class="p-4">
							<h3 class="font-bold text-gray-800 line-clamp-1">{ad.title}</h3>
							<p class="mt-1 text-sm text-gray-600 line-clamp-2">{ad.content}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<StatCard label={i18n.dashboard.stats.totalPets} value={dashboardStats.totalPets} icon="paw" color="indigo" />
		<StatCard label={i18n.dashboard.stats.upcomingVaccinations} value={dashboardStats.upcomingVaccinations} icon="syringe" color="amber" />
		<StatCard label={i18n.dashboard.stats.expenses} value="฿{expenseSummary.totalThisMonth.toLocaleString()}" icon="money" color="rose" />
		<StatCard label={i18n.dashboard.stats.activeReminders} value={dashboardStats.activeReminders} icon="bell" color="green" />
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- My Pets -->
		<div class="lg:col-span-2 space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-800">{i18n.dashboard.myPets}</h2>
				<a href="/pets" class="text-sm font-medium text-indigo-600 hover:text-indigo-800">
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
				<h2 class="text-lg font-bold text-gray-800">{i18n.dashboard.upcomingEvents}</h2>
			</div>
			<div class="space-y-3">
				{#each upcomingEvents as event}
					<div class="rounded-xl border border-gray-200 bg-white p-4">
						<div class="flex items-start justify-between">
							<div>
								<span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium {event.color}">
									{event.type}
								</span>
								<h3 class="mt-1.5 text-sm font-semibold text-gray-800">{event.title}</h3>
								<p class="mt-0.5 text-xs text-gray-500">{event.petName} · {event.date}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Expense Summary -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- By Category -->
		<div class="rounded-2xl border border-gray-200 bg-white p-6">
			<h2 class="text-lg font-bold text-gray-800">{i18n.dashboard.expensesByCategory}</h2>
			<div class="mt-4 space-y-3">
				{#each expenseSummary.byCategory as cat}
					<div>
						<div class="flex items-center justify-between text-sm">
							<span class="text-gray-600">{cat.category}</span>
							<span class="font-medium text-gray-800">฿{cat.amount.toLocaleString()}</span>
						</div>
						<div class="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
							<div
								class="h-full rounded-full bg-indigo-500 transition-all duration-500"
								style="width: {cat.percentage}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Monthly Trend (Simple Bar Chart) -->
		<div class="rounded-2xl border border-gray-200 bg-white p-6">
			<h2 class="text-lg font-bold text-gray-800">{i18n.dashboard.monthlyTrend}</h2>
			<div class="mt-6 flex h-48 items-end justify-between gap-2 px-2">
				{#each expenseSummary.monthlyTrend as month}
					<div class="flex flex-1 flex-col items-center gap-1">
						<span class="text-[10px] font-medium text-gray-500">
							{(month.amount / 1000).toFixed(1)}k
						</span>
						<div
							class="w-full rounded-t-lg bg-indigo-400 transition-all duration-300 hover:bg-indigo-600"
							style="height: {(month.amount / 12000) * 100}%"
						></div>
						<span class="text-xs text-gray-500">{month.month}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
