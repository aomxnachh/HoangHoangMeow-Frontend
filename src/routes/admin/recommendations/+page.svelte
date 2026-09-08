<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import TopNav from '$lib/components/TopNav.svelte';
	import { getSession, api, request, ApiError } from '$lib/api';

	let recommendations = $state<Array<any>>([]);
	let categories = $state<Array<{ id: number; species: string }>>([]);
	let loading = $state(true);
	let error = $state('');

	let showModal = $state(false);
	let saving = $state(false);
	let editingId = $state<number | null>(null);

	let formData = $state({
		petCategoryId: '' as number | '',
		ageRange: 'ALL',
		title: '',
		content: '',
		imageUrl: ''
	});

	async function loadRecommendations() {
		loading = true; error = '';
		try {
			const [recsResult, categoriesResult] = await Promise.all([
				api<{ recommendations: any[] }>('/api/admin/recommendations'),
				api<{ categories: Array<{ id: number; species: string }> }>('/api/admin/pet-species')
			]);
			recommendations = recsResult.recommendations || [];
			categories = categoriesResult.categories || [];
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
		formData = { petCategoryId: '', ageRange: 'ALL', title: '', content: '', imageUrl: '' };
		showModal = true;
	}

	function openEditModal(rec: any) {
		editingId = rec.id;
		formData = {
			petCategoryId: rec.petCategoryId ?? '',
			ageRange: rec.ageRange || 'ALL',
			title: rec.title || '',
			content: rec.content,
			imageUrl: rec.imageUrl || ''
		};
		showModal = true;
	}

	async function saveRecommendation() {
		saving = true; error = '';
		try {
			const body = {
				...formData,
				petCategoryId: formData.petCategoryId === '' ? null : Number(formData.petCategoryId)
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

<div class="p-4 space-y-6 animate-fade-in stagger-1 sm:p-6 lg:p-8">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h2 class="text-lg font-bold text-gray-800">รายการคำแนะนำ</h2>
		<button
			onclick={openAddModal}
			class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group"
		>
			+ เพิ่มคำแนะนำ
		</button>
	</div>

	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}

	<div class="rounded-3xl glass-heavy border border-white/60 overflow-hidden shadow-xl animate-fade-up">
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
							<th class="px-4 py-3">รูป</th>
							<th class="px-4 py-3">ชื่อโพสต์</th>
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
									<td class="px-4 py-3">
										{#if rec.imageUrl}
											<img src={rec.imageUrl} alt="" class="h-10 w-10 rounded-lg object-cover" />
										{:else}
											<span class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400 text-lg">📷</span>
										{/if}
									</td>
									<td class="px-4 py-3 font-medium">{rec.title || '-'}</td>
									<td class="px-4 py-3">{rec.species || 'ทุกประเภท'}</td>
									<td class="px-4 py-3">{rec.ageRange}</td>
								<td class="px-4 py-3 max-w-[300px] truncate">{rec.content}</td>
								<td class="px-4 py-3 text-right space-x-2">
									<button onclick={() => openEditModal(rec)} class="text-brand-600 hover:text-brand-900">แก้ไข</button>
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
		class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-md"
		onclick={(e) => { if (e.target === e.currentTarget) showModal = false; }}
	>
		<div class="my-auto w-full max-w-lg rounded-3xl glass-heavy p-5 shadow-2xl sm:p-8">
			<h2 class="text-lg font-bold text-gray-800 mb-6">{editingId ? 'แก้ไขคำแนะนำ' : 'เพิ่มคำแนะนำ'}</h2>

			<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); saveRecommendation(); }}>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">หมวดหมู่สัตว์เลี้ยง *</label>
						<select bind:value={formData.petCategoryId} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
							<option value="">ทุกประเภทสัตว์เลี้ยง</option>
							{#each categories as category}
								<option value={category.id}>{category.species}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">ช่วงอายุ *</label>
						<select bind:value={formData.ageRange} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
							<option value="ALL">ทุกช่วงวัย</option>
							<option value="BABY">วัยเด็ก</option>
							<option value="ADULT">วัยโต</option>
							<option value="SENIOR">สูงวัย</option>
						</select>
					</div>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">ชื่อโพสต์</label>
					<input type="text" bind:value={formData.title} placeholder="เช่น วิธีดูแลลูกแมวแรกเกิด" class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">URL รูปภาพ</label>
					<input type="url" bind:value={formData.imageUrl} placeholder="https://example.com/image.jpg" class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
					{#if formData.imageUrl}
						<div class="mt-2 overflow-hidden rounded-xl border border-gray-200">
							<img src={formData.imageUrl} alt="Preview" class="h-32 w-full object-cover" onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
						</div>
					{/if}
				</div>
				
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">เนื้อหา *</label>
					<textarea required bind:value={formData.content} rows="4" class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"></textarea>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button type="button" onclick={() => showModal = false} class="rounded-2xl border-2 border-transparent bg-white/60 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-white transition-all">ยกเลิก</button>
					<button type="submit" disabled={saving} class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group disabled:opacity-60 disabled:hover:translate-y-0">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
				</div>
			</form>
		</div>
	</div>
{/if}
