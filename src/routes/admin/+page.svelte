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
	<title>แดชบอร์ด Admin | HoangHoang Meow</title>
</svelte:head>

<TopNav title="แดชบอร์ด Admin" subtitle="ภาพรวมระบบและการจัดการ" />

<div class="p-4 space-y-6 animate-fade-in stagger-1 sm:p-6 lg:p-8">
	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<StatCard label="ผู้ใช้งานทั้งหมด" value={stats.users} icon="user" color="purple" />
		<StatCard label="ผู้ใช้แบบฟรี" value={stats.freeUsers} icon="user" color="gray" />
		<StatCard label="ผู้ใช้แบบ Premium" value={stats.premiumUsers} icon="crown" color="rose" />
		<StatCard label="สัตว์เลี้ยงทั้งหมด" value={stats.pets} icon="paw" color="purple" />
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<a href="/admin/users" class="block rounded-3xl glass-heavy border border-white/60 p-6 shadow-xl animate-fade-up hover:border-brand-300 transition-all">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
					</svg>
				</div>
				<div>
					<h2 class="text-lg font-bold text-gray-800">จัดการผู้ใช้</h2>
					<p class="mt-1 text-sm text-gray-500">ดูรายชื่อ เปลี่ยน Role/Plan และลบผู้ใช้</p>
				</div>
			</div>
		</a>

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
