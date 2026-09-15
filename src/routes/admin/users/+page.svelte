<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import TopNav from '$lib/components/TopNav.svelte';
	import { getSession, api, request, ApiError } from '$lib/api';

	let userList = $state<Array<any>>([]);
	let loading = $state(true);
	let error = $state('');

	let showModal = $state(false);
	let saving = $state(false);
	let editingUser = $state<any>(null);
	let formData = $state({ role: 'USER', planType: 'FREE' });

	async function loadUsers() {
		loading = true; error = '';
		try {
			const result = await api<{ users: any[] }>('/api/admin/users');
			userList = result.users || [];
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		const session = getSession();
		if (!session || session.user.role !== 'ADMIN') {
			goto('/');
			return;
		}
		loadUsers();
	});

	function openEditModal(user: any) {
		editingUser = user;
		formData = {
			role: user.role || 'USER',
			planType: user.planType || 'FREE'
		};
		showModal = true;
	}

	async function saveUser() {
		if (!editingUser) return;
		saving = true; error = '';
		try {
			await request(`/api/admin/users/${editingUser.id}`, 'PATCH', formData);
			showModal = false;
			await loadUsers();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถบันทึกข้อมูลได้';
		} finally {
			saving = false;
		}
	}

	async function deleteUser(id: number) {
		if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? (Soft Delete)')) return;
		try {
			await request(`/api/admin/users/${id}`, 'DELETE');
			await loadUsers();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถลบผู้ใช้ได้';
		}
	}

	function formatDate(dateString: string) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>จัดการผู้ใช้ | HoangHoang Meow Admin</title>
</svelte:head>

<TopNav title="จัดการผู้ใช้" subtitle="ดูและจัดการบัญชีผู้ใช้ทั้งหมด" />

<div class="p-4 space-y-6 animate-fade-in stagger-1 sm:p-6 lg:p-8">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h2 class="text-lg font-bold text-gray-800">รายชื่อผู้ใช้ ({userList.length})</h2>
	</div>

	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}

	<div class="rounded-3xl glass-heavy border border-white/60 overflow-hidden shadow-xl animate-fade-up">
		{#if loading}
			<div class="py-16 text-center flex flex-col items-center justify-center">
				<div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500 mb-4"></div>
				<p class="text-sm font-medium text-gray-500">กำลังโหลด...</p>
			</div>
		{:else if userList.length === 0}
			<p class="py-12 text-center text-sm text-gray-500">ไม่พบผู้ใช้</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm text-gray-600">
					<thead class="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
						<tr>
							<th class="px-4 py-3">ID</th>
							<th class="px-4 py-3">ชื่อผู้ใช้</th>
							<th class="px-4 py-3">อีเมล</th>
							<th class="px-4 py-3">บทบาท</th>
							<th class="px-4 py-3">แพ็กเกจ</th>
							<th class="px-4 py-3">ผู้ให้บริการ</th>
							<th class="px-4 py-3">สถานะ</th>
							<th class="px-4 py-3">วันที่สมัคร</th>
							<th class="px-4 py-3 text-right">จัดการ</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each userList as user}
							<tr class="hover:bg-gray-50 {user.deletedAt ? 'opacity-50' : ''}">
								<td class="px-4 py-3 text-xs font-mono">{user.id}</td>
								<td class="px-4 py-3 font-medium text-gray-900">{user.username}</td>
								<td class="px-4 py-3">{user.email}</td>
								<td class="px-4 py-3">
									<span class="inline-flex rounded-full px-2 py-1 text-xs font-bold {user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}">
										{user.role}
									</span>
								</td>
								<td class="px-4 py-3">
									<span class="inline-flex rounded-full px-2 py-1 text-xs font-bold {user.planType === 'PREMIUM' ? 'bg-gradient-to-r from-brand-100 to-rose-100 text-brand-700' : 'bg-gray-100 text-gray-700'}">
										{user.planType === 'PREMIUM' ? '👑 PREMIUM' : '🌱 FREE'}
									</span>
								</td>
								<td class="px-4 py-3 text-xs">{user.authProvider}</td>
								<td class="px-4 py-3">
									{#if user.deletedAt}
										<span class="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">ถูกลบ</span>
									{:else}
										<span class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">ใช้งาน</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-xs">{formatDate(user.createdAt)}</td>
								<td class="px-4 py-3 text-right space-x-2">
									{#if !user.deletedAt}
										<button onclick={() => openEditModal(user)} class="text-brand-600 hover:text-brand-900 font-medium">แก้ไข</button>
										<button onclick={() => deleteUser(user.id)} class="text-red-600 hover:text-red-900 font-medium">ลบ</button>
									{:else}
										<span class="text-xs text-gray-400">ถูกลบแล้ว</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

{#if showModal && editingUser}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-md"
		onclick={(e) => { if (e.target === e.currentTarget) showModal = false; }}
	>
		<div class="my-auto w-full max-w-md rounded-3xl glass-heavy p-5 shadow-2xl sm:p-8">
			<h2 class="text-lg font-bold text-gray-800 mb-2">แก้ไขผู้ใช้</h2>
			<p class="text-sm text-gray-500 mb-6">{editingUser.username} ({editingUser.email})</p>

			<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); saveUser(); }}>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">บทบาท (Role)</label>
					<select bind:value={formData.role} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
						<option value="USER">USER</option>
						<option value="ADMIN">ADMIN</option>
					</select>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">แพ็กเกจ (Plan)</label>
					<select bind:value={formData.planType} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
						<option value="FREE">FREE</option>
						<option value="PREMIUM">PREMIUM</option>
					</select>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button type="button" onclick={() => showModal = false} class="rounded-2xl border-2 border-transparent bg-white/60 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-white transition-all">ยกเลิก</button>
					<button type="submit" disabled={saving} class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group disabled:opacity-60 disabled:hover:translate-y-0">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
				</div>
			</form>
		</div>
	</div>
{/if}
