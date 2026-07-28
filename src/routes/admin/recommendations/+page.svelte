<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import TopNav from '$lib/components/TopNav.svelte';
	import { getSession, api, request, ApiError } from '$lib/api';

	let recommendations = $state<Array<any>>([]);
	let loading = $state(true);
	let error = $state('');

	let showModal = $state(false);
	let saving = $state(false);
	let editingId = $state<number | null>(null);

	let formData = $state({
		petCategoryId: 1,
		ageRange: 'ALL',
		content: ''
	});

	async function loadRecommendations() {
		loading = true; error = '';
		try {
			const result = await api<{ recommendations: any[] }>('/api/admin/recommendations');
			recommendations = result.recommendations || [];
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดคำแนะนำได้';
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
		loadRecommendations();
	});

	function openAddModal() {
		editingId = null;
		formData = { petCategoryId: 1, ageRange: 'ALL', content: '' };
		showModal = true;
	}

	function openEditModal(rec: any) {
		editingId = rec.id;
		formData = {
			petCategoryId: rec.petCategoryId || 1,
			ageRange: rec.ageRange || 'ALL',
			content: rec.content
		};
		showModal = true;
	}

	async function saveRecommendation() {
		saving = true; error = '';
		try {
			const body = {
				...formData,
				petCategoryId: Number(formData.petCategoryId)
			};
			
			if (editingId) {
				await request(`/api/admin/recommendations/${editingId}`, 'PATCH', body);
			} else {
				await request('/api/admin/recommendations', 'POST', body);
			}
			showModal = false;
			await loadRecommendations();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถบันทึกคำแนะนำได้';
		} finally {
			saving = false;
		}
	}

	async function deleteRecommendation(id: number) {
		if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคำแนะนำนี้?')) return;
		try {
			await request(`/api/admin/recommendations/${id}`, 'DELETE');
			await loadRecommendations();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถลบคำแนะนำได้';
		}
	}
</script>

<svelte:head>
	<title>จัดการคำแนะนำ | PetCare Admin</title>
</svelte:head>

<TopNav title="จัดการคำแนะนำ" subtitle="เพิ่ม ลบ แก้ไข คำแนะนำในการดูแลสัตว์เลี้ยง" />

<div class="p-6 space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-bold text-gray-800">รายการคำแนะนำ</h2>
		<button
			onclick={openAddModal}
			class="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
		>
			+ เพิ่มคำแนะนำ
		</button>
	</div>

	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}

	<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
		{#if loading}
			<p class="py-12 text-center text-sm text-gray-500">กำลังโหลด...</p>
		{:else if recommendations.length === 0}
			<p class="py-12 text-center text-sm text-gray-500">ไม่พบคำแนะนำ</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm text-gray-600">
					<thead class="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
						<tr>
							<th class="px-4 py-3">ID</th>
							<th class="px-4 py-3">หมวดหมู่สัตว์เลี้ยง</th>
							<th class="px-4 py-3">ช่วงอายุ</th>
							<th class="px-4 py-3">เนื้อหา</th>
							<th class="px-4 py-3 text-right">จัดการ</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each recommendations as rec}
							<tr class="hover:bg-gray-50">
								<td class="px-4 py-3 text-xs">{rec.id}</td>
								<td class="px-4 py-3">{rec.petCategoryId}</td>
								<td class="px-4 py-3">{rec.ageRange}</td>
								<td class="px-4 py-3 max-w-[300px] truncate">{rec.content}</td>
								<td class="px-4 py-3 text-right space-x-2">
									<button onclick={() => openEditModal(rec)} class="text-indigo-600 hover:text-indigo-900">แก้ไข</button>
									<button onclick={() => deleteRecommendation(rec.id)} class="text-red-600 hover:text-red-900">ลบ</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

{#if showModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		onclick={(e) => { if (e.target === e.currentTarget) showModal = false; }}
	>
		<div class="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
			<h2 class="text-lg font-bold text-gray-800 mb-6">{editingId ? 'แก้ไขคำแนะนำ' : 'เพิ่มคำแนะนำ'}</h2>

			<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); saveRecommendation(); }}>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">หมวดหมู่สัตว์เลี้ยง (ID) *</label>
						<input type="number" required bind:value={formData.petCategoryId} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100" />
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">ช่วงอายุ *</label>
						<select bind:value={formData.ageRange} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100">
							<option value="ALL">ทุกช่วงวัย</option>
							<option value="BABY">วัยเด็ก</option>
							<option value="ADULT">วัยโต</option>
							<option value="SENIOR">สูงวัย</option>
						</select>
					</div>
				</div>
				
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">เนื้อหา *</label>
					<textarea required bind:value={formData.content} rows="4" class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"></textarea>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button type="button" onclick={() => showModal = false} class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">ยกเลิก</button>
					<button type="submit" disabled={saving} class="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
				</div>
			</form>
		</div>
	</div>
{/if}
