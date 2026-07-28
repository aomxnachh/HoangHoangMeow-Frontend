<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import TopNav from '$lib/components/TopNav.svelte';
	import { getSession, api, request, ApiError } from '$lib/api';

	let ads = $state<Array<any>>([]);
	let loading = $state(true);
	let error = $state('');

	let showModal = $state(false);
	let saving = $state(false);
	let editingId = $state<number | null>(null);

	let formData = $state({
		title: '',
		content: '',
		imageUrl: '',
		targetUrl: '',
		petCategoryId: 1,
		location: 'DASHBOARD'
	});

	async function loadAds() {
		loading = true; error = '';
		try {
			const result = await api<{ ads: any[] }>('/api/admin/ads');
			ads = result.ads || [];
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดโฆษณาได้';
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
		loadAds();
	});

	function openAddModal() {
		editingId = null;
		formData = { title: '', content: '', imageUrl: '', targetUrl: '', petCategoryId: 1, location: 'DASHBOARD' };
		showModal = true;
	}

	function openEditModal(ad: any) {
		editingId = ad.id;
		formData = {
			title: ad.title,
			content: ad.content,
			imageUrl: ad.imageUrl || '',
			targetUrl: ad.targetUrl || '',
			petCategoryId: ad.petCategoryId,
			location: ad.location || 'DASHBOARD'
		};
		showModal = true;
	}

	async function saveAd() {
		saving = true; error = '';
		try {
			const body = {
				...formData,
				petCategoryId: Number(formData.petCategoryId) || 1
			};
			
			if (editingId) {
				await request(`/api/admin/ads/${editingId}`, 'PATCH', body);
			} else {
				await request('/api/admin/ads', 'POST', body);
			}
			showModal = false;
			await loadAds();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถบันทึกโฆษณาได้';
		} finally {
			saving = false;
		}
	}

	async function deleteAd(id: number) {
		if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโฆษณานี้?')) return;
		try {
			await request(`/api/admin/ads/${id}`, 'DELETE');
			await loadAds();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถลบโฆษณาได้';
		}
	}
</script>

<svelte:head>
	<title>จัดการโฆษณา | PetCare Admin</title>
</svelte:head>

<TopNav title="จัดการโฆษณา" subtitle="เพิ่ม ลบ แก้ไข โฆษณาสำหรับผู้ใช้ฟรี" />

<div class="p-6 space-y-6 animate-fade-in stagger-1">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-bold text-gray-800">รายการโฆษณา</h2>
		<button
			onclick={openAddModal}
			class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group"
		>
			+ เพิ่มโฆษณา
		</button>
	</div>

	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}

	<div class="rounded-3xl glass-heavy border border-white/60 overflow-hidden shadow-xl animate-fade-up">
		{#if loading}
			<p class="py-12 text-center text-sm text-gray-500">กำลังโหลด...</p>
		{:else if ads.length === 0}
			<p class="py-12 text-center text-sm text-gray-500">ไม่พบโฆษณา</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm text-gray-600">
					<thead class="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
						<tr>
							<th class="px-4 py-3">หัวข้อ</th>
							<th class="px-4 py-3">เนื้อหา</th>
							<th class="px-4 py-3">ตำแหน่ง</th>
							<th class="px-4 py-3">สถานะ</th>
							<th class="px-4 py-3 text-right">จัดการ</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each ads as ad}
							<tr class="hover:bg-gray-50">
								<td class="px-4 py-3 font-medium text-gray-900">{ad.title}</td>
								<td class="px-4 py-3 max-w-[200px] truncate">{ad.content}</td>
								<td class="px-4 py-3">{ad.location}</td>
								<td class="px-4 py-3">
									{#if ad.isActive}
										<span class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">ใช้งาน</span>
									{:else}
										<span class="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">ปิดใช้งาน</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-right space-x-2">
									<button onclick={() => openEditModal(ad)} class="text-brand-600 hover:text-brand-900">แก้ไข</button>
									<button onclick={() => deleteAd(ad.id)} class="text-red-600 hover:text-red-900">ลบ</button>
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
		class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md"
		onclick={(e) => { if (e.target === e.currentTarget) showModal = false; }}
	>
		<div class="mx-4 w-full max-w-lg rounded-3xl glass-heavy p-8 shadow-2xl">
			<h2 class="text-lg font-bold text-gray-800 mb-6">{editingId ? 'แก้ไขโฆษณา' : 'เพิ่มโฆษณา'}</h2>

			<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); saveAd(); }}>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">หัวข้อโฆษณา *</label>
					<input type="text" required bind:value={formData.title} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
				</div>
				
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">เนื้อหา *</label>
					<textarea required bind:value={formData.content} rows="3" class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"></textarea>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">URL รูปภาพ</label>
					<input type="url" bind:value={formData.imageUrl} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">URL ปลายทาง (ลิงก์เมื่อคลิก)</label>
					<input type="url" bind:value={formData.targetUrl} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">ตำแหน่ง</label>
						<select bind:value={formData.location} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
							<option value="DASHBOARD">แดชบอร์ด</option>
							<option value="SIDEBAR">แถบด้านข้าง</option>
						</select>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">หมวดหมู่สัตว์เลี้ยง (ID) *</label>
						<input type="number" required min="1" bind:value={formData.petCategoryId} placeholder="เช่น 1" class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
					</div>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<button type="button" onclick={() => showModal = false} class="rounded-2xl border-2 border-transparent bg-white/60 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-white transition-all">ยกเลิก</button>
					<button type="submit" disabled={saving} class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group disabled:opacity-60 disabled:hover:translate-y-0">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
				</div>
			</form>
		</div>
	</div>
{/if}
