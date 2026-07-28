<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import TopNav from '$lib/components/TopNav.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import { getSession, api, ApiError } from '$lib/api';

	let stats = $state({ users: 0, freeUsers: 0, premiumUsers: 0, pets: 0 });
	let error = $state('');
	let loading = $state(true);

	onMount(async () => {
		const session = getSession();
		if (!session || session.user.role !== 'ADMIN') {
			goto('/');
			return;
		}

		try {
			const result = await api<any>('/api/admin/dashboard');
			stats = {
				users: result.users || 0,
				freeUsers: result.freeUsers || 0,
				premiumUsers: result.premiumUsers || 0,
				pets: result.pets || 0
			};
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดข้อมูลผู้ดูแลระบบได้';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>แดชบอร์ด Admin | PetCare</title>
</svelte:head>

<TopNav title="แดชบอร์ด Admin" subtitle="ภาพรวมระบบและการจัดการ" />

<div class="p-6 space-y-6 animate-fade-in stagger-1">
	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<StatCard label="ผู้ใช้งานทั้งหมด" value={stats.users} icon="user" color="purple" />
		<StatCard label="ผู้ใช้แบบฟรี" value={stats.freeUsers} icon="user" color="gray" />
		<StatCard label="ผู้ใช้แบบ Premium" value={stats.premiumUsers} icon="crown" color="rose" />
		<StatCard label="สัตว์เลี้ยงทั้งหมด" value={stats.pets} icon="paw" color="purple" />
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<a href="/admin/ads" class="block rounded-3xl glass-heavy border border-white/60 p-6 shadow-xl animate-fade-up hover:border-brand-300 transition-all">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
					</svg>
				</div>
				<div>
					<h2 class="text-lg font-bold text-gray-800">จัดการโฆษณา</h2>
					<p class="mt-1 text-sm text-gray-500">เพิ่ม ลบ แก้ไข โฆษณาแนะนำสำหรับผู้ใช้แบบฟรี</p>
				</div>
			</div>
		</a>

		<a href="/admin/recommendations" class="block rounded-3xl glass-heavy border border-white/60 p-6 shadow-xl animate-fade-up hover:border-brand-300 transition-all">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<div>
					<h2 class="text-lg font-bold text-gray-800">จัดการคำแนะนำ</h2>
					<p class="mt-1 text-sm text-gray-500">จัดการเนื้อหาคำแนะนำในการดูแลสัตว์เลี้ยง</p>
				</div>
			</div>
		</a>
	</div>
</div>
