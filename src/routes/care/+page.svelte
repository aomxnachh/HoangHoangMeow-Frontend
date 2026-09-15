<script lang="ts">
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import { carePlans as mockCarePlans, careRecommendations as mockCareRecommendations, pets as mockPets } from '$lib/data/mock-data';
	import { ApiError, api, request } from '$lib/api';
	import { i18n } from '$lib/i18n';
	let carePlans = $state<any[]>(mockCarePlans);
	let careRecommendations = $state<any[]>(mockCareRecommendations);
	let pets = $state<any[]>(mockPets);
	let error = $state('');

	let activeTab = $state('plans');
	let selectedRec = $state<any>(null);
	let filterPet = $state('ทั้งหมด');

	let showModal = $state(false);
	let isEditing = $state(false);
	let editId = $state('');
	let formData = $state({ petId: '', title: '', detail: '', frequencyDays: 1, nextDueAt: '' });
	const frequencies = [
		{ label: 'ทุกวัน', value: 1 },
		{ label: 'ทุกสัปดาห์', value: 7 },
		{ label: 'ทุกเดือน', value: 30 },
		{ label: 'ทุก 3 เดือน', value: 90 },
		{ label: 'ทุก 6 เดือน', value: 180 },
		{ label: 'ทุกปี', value: 365 }
	];

	let petNames = $derived(['ทั้งหมด', ...pets.map((p) => p.name)]);

	let filteredPlans = $derived(
		carePlans.filter((c) => {
			let pet = pets.find((p) => p.id === c.petId);
			return filterPet === 'ทั้งหมด' || pet?.name === filterPet;
		})
	);

	let filteredRecommendations = $derived(
		careRecommendations.filter((r) => {
			let pet = pets.find((p) => p.id === r.petId);
			return filterPet === 'ทั้งหมด' || pet?.name === filterPet;
		})
	);

	function openAddModal() {
		isEditing = false;
		formData = { petId: pets[0]?.id || '', title: '', detail: '', frequencyDays: 1, nextDueAt: '' };
		showModal = true;
	}

	function openEditModal(plan: any) {
		isEditing = true;
		editId = plan.id;
		const nextDue = plan.nextDueAt ? plan.nextDueAt.split('T')[0] : '';
		formData = { petId: plan.petId, title: plan.title, detail: plan.detail || '', frequencyDays: plan.frequencyDays || 1, nextDueAt: nextDue };
		showModal = true;
	}

	async function handleSubmit() {
		try {
			const payload = { ...formData, petId: Number(formData.petId), frequencyDays: Number(formData.frequencyDays) };
			if (isEditing) {
				await request(`/api/care-plans/${editId}`, 'PATCH', payload);
			} else {
				await request('/api/care-plans', 'POST', payload);
			}
			showModal = false;
			await loadCare();
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถบันทึกข้อมูลได้'; }
	}

	async function handleDone(id: string) {
		try {
			await request(`/api/care-plans/${id}`, 'PATCH', { status: 'DONE' });
			await loadCare();
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถอัปเดตสถานะได้'; }
	}

	async function handleDelete(id: string) {
		if (!confirm('ยืนยันการลบแผนดูแลนี้?')) return;
		try {
			await request(`/api/care-plans/${id}`, 'DELETE');
			await loadCare();
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถลบข้อมูลได้'; }
	}

	async function loadCare() {
		try {
			const [petResult, planResult, recommendationResult] = await Promise.all([api<{ pets: any[] }>('/api/pets'), api<{ plans: any[] }>('/api/care-plans'), api<{ recommendations: any[] }>('/api/care-recommendations')]);
			pets = petResult.pets.map((pet) => ({ ...pet, id: String(pet.id), image: pet.image || '🐾' }));
			carePlans = planResult.plans.map((plan) => ({ ...plan, id: String(plan.id), petId: String(plan.petId), frequency: plan.frequencyDays ? `ทุก ${plan.frequencyDays} วัน` : 'กำหนดเอง', nextDate: plan.nextDueAt ? new Date(plan.nextDueAt).toLocaleDateString('th-TH') : '-', status: plan.status === 'DONE' ? 'completed' : 'upcoming', items: plan.detail ? plan.detail.split('\n').filter(Boolean) : [] }));
			careRecommendations = recommendationResult.recommendations.map((item) => ({ ...item, id: String(item.id), petId: item.petId != null ? String(item.petId) : '', type: item.ageRange, title: item.title || `คำแนะนำการดูแลสำหรับ ${item.petName}`, description: item.content, imageUrl: item.imageUrl || '', priority: 'low', dueDate: '-' }));
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดแผนดูแลได้'; }
	}
	onMount(loadCare);
</script>

<svelte:head>
	<title>{i18n.care.title} | HoangHoang Meow</title>
</svelte:head>

<TopNav title={i18n.care.title} subtitle={i18n.care.subtitle} />

<div class="p-4 space-y-6 animate-fade-in stagger-1 sm:p-6 lg:p-8">
	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}
	<!-- Tabs -->
	<div class="flex flex-wrap items-center gap-3 sm:gap-4">
		<div class="flex rounded-xl border border-gray-200 bg-white p-1">
			<button
				onclick={() => (activeTab = 'plans')}
				class="rounded-lg px-4 py-2 text-sm font-medium transition-colors {activeTab === 'plans'
					? 'bg-brand-600 text-white shadow-sm'
					: 'text-gray-600 hover:text-gray-800'}"
			>
				📋 แผนดูแล ({carePlans.length})
			</button>
			<button
				onclick={() => (activeTab = 'recommendations')}
				class="rounded-lg px-4 py-2 text-sm font-medium transition-colors {activeTab === 'recommendations'
					? 'bg-brand-600 text-white shadow-sm'
					: 'text-gray-600 hover:text-gray-800'}"
			>
				💡 คำแนะนำ ({careRecommendations.length})
			</button>
		</div>

		<select
			bind:value={filterPet}
			class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white sm:max-w-[200px]"
		>
			{#each petNames as name}
				<option value={name}>🐾 {name}</option>
			{/each}
		</select>

		{#if activeTab === 'plans'}
			<button onclick={openAddModal} class="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group sm:ml-auto sm:w-auto">
				+ สร้างแผนดูแล
			</button>
		{/if}
	</div>

	{#if activeTab === 'plans'}
		<!-- Care Plans Grid -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredPlans as plan}
				{@const pet = pets.find(p => p.id === plan.petId)}
				<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-5">
					<div class="flex items-start justify-between">
						<div class="flex items-center gap-2">
							<span class="text-2xl">{pet?.image}</span>
							<div>
								<p class="text-xs text-gray-400">{pet?.name}</p>
								<h3 class="text-sm font-bold text-gray-800">{plan.title}</h3>
							</div>
						</div>
						<span
							class="rounded-full px-2.5 py-0.5 text-xs font-medium {plan.status === 'completed'
								? 'bg-green-100 text-green-700'
								: plan.status === 'overdue'
									? 'bg-red-100 text-red-700'
									: 'bg-blue-100 text-blue-700'}"
						>
							{plan.status === 'completed' ? 'เสร็จสิ้น' : plan.status === 'overdue' ? 'เลยกำหนด' : 'กำลังจะถึง'}
						</span>
					</div>

					<div class="mt-3 flex gap-4 text-xs text-gray-500">
						<span>🔄 {plan.frequency}</span>
						<span>📅 ถัดไป: {plan.nextDate}</span>
					</div>

					<ul class="mt-4 space-y-2">
						{#each plan.items as item}
							<li class="flex items-center gap-2 text-sm text-gray-600">
								<svg class="h-4 w-4 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{item}
							</li>
						{/each}
					</ul>

					<div class="mt-4 flex gap-2">
						<button onclick={() => handleDone(plan.id)} class="flex-1 rounded-lg bg-brand-50 py-2 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100">
							ดำเนินการ
						</button>
						<button onclick={() => openEditModal(plan)} class="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50">
							แก้ไข
						</button>
						<button onclick={() => handleDelete(plan.id)} class="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50">
							ลบ
						</button>
					</div>
				</div>
			{/each}
		</div>

	{:else}
		<!-- Care Recommendations — Card Grid -->
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each filteredRecommendations as rec, i}
				{@const pet = pets.find(p => p.id === rec.petId)}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					onclick={() => selectedRec = rec}
					class="group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-white/60 bg-white/90 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/10 active:scale-[0.97] animate-fade-up"
					style="animation-delay: {i * 60}ms"
				>
					<!-- Image -->
					<div class="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100">
						{#if rec.imageUrl}
							<img
								src={rec.imageUrl}
								alt={rec.title}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
							/>
						{:else}
							<div class="flex h-full w-full items-center justify-center">
								<span class="text-5xl opacity-40 transition-transform duration-500 group-hover:scale-125">🐾</span>
							</div>
						{/if}
						<!-- Gradient overlay -->
						<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
						<!-- Species badge -->
						<div class="absolute left-3 top-3 flex gap-2">
							<span class="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
								{rec.species || 'ทุกประเภท'}
							</span>
							<span class="rounded-full bg-brand-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
								{rec.type === 'ALL' ? 'ทุกวัย' : rec.type === 'BABY' ? 'วัยเด็ก' : rec.type === 'ADULT' ? 'วัยโต' : rec.type === 'SENIOR' ? 'สูงวัย' : rec.type}
							</span>
						</div>
						<!-- Hover read indicator -->
						<div class="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-600 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
							<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
							</svg>
							อ่านเพิ่มเติม
						</div>
					</div>

					<!-- Content -->
					<div class="p-4">
						<div class="mb-2 flex items-center gap-2">
							<span class="text-lg">{pet?.image || '🐾'}</span>
							<span class="text-xs text-gray-400">{pet?.name || rec.petName}</span>
						</div>
						<h3 class="text-sm font-bold text-gray-800 line-clamp-1 transition-colors duration-200 group-hover:text-brand-600">
							{rec.title}
						</h3>
						<p class="mt-1.5 text-xs leading-relaxed text-gray-500 line-clamp-2">
							{rec.description}
						</p>
					</div>
				</div>
			{/each}
		</div>

		{#if filteredRecommendations.length === 0}
			<div class="flex flex-col items-center justify-center py-16">
				<span class="text-5xl mb-4">📭</span>
				<p class="text-sm text-gray-500">ไม่พบคำแนะนำสำหรับตัวกรองที่เลือก</p>
			</div>
		{/if}
	{/if}
</div>

<!-- Recommendation Detail Popup -->
{#if selectedRec}
	{@const pet = pets.find(p => p.id === selectedRec.petId)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
		onclick={(e) => { if (e.target === e.currentTarget) selectedRec = null; }}
	>
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-gray-900/50 backdrop-blur-md" style="animation: rec-fade-in 0.25s ease-out forwards;"></div>

		<!-- Modal -->
		<div
			class="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
			style="animation: rec-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;"
		>
			<!-- Close Button -->
			<button
				onclick={() => selectedRec = null}
				class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-110 active:scale-95"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<!-- Image -->
			<div class="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100">
				{#if selectedRec.imageUrl}
					<img
						src={selectedRec.imageUrl}
						alt={selectedRec.title}
						class="h-full w-full object-cover"
					/>
				{:else}
					<div class="flex h-full w-full items-center justify-center">
						<span class="text-7xl opacity-30">🐾</span>
					</div>
				{/if}
				<div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
				<!-- Badges on image -->
				<div class="absolute bottom-4 left-4 flex flex-wrap gap-2">
					<span class="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
						{selectedRec.species || 'ทุกประเภท'}
					</span>
					<span class="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
						{selectedRec.type === 'ALL' ? 'ทุกช่วงวัย' : selectedRec.type === 'BABY' ? 'วัยเด็ก' : selectedRec.type === 'ADULT' ? 'วัยโต' : selectedRec.type === 'SENIOR' ? 'สูงวัย' : selectedRec.type}
					</span>
				</div>
			</div>

			<!-- Content -->
			<div class="p-6">
				<div class="mb-3 flex items-center gap-2">
					<span class="text-2xl">{pet?.image || '🐾'}</span>
					<span class="text-sm text-gray-500">สำหรับ {pet?.name || selectedRec.petName || 'สัตว์เลี้ยง'}</span>
				</div>
				<h2 class="text-lg font-bold text-gray-800">{selectedRec.title}</h2>
				<div class="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
					{selectedRec.description}
				</div>
			</div>

			<!-- Footer -->
			<div class="border-t border-gray-100 px-6 py-4">
				<button
					onclick={() => selectedRec = null}
					class="w-full rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0"
				>
					ปิด
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes rec-fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes rec-slide-up {
		from { opacity: 0; transform: translateY(30px) scale(0.96); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}
</style>

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-md">
		<div class="my-auto w-full max-w-md rounded-3xl glass-heavy p-5 shadow-xl sm:p-8">
			<h2 class="text-xl font-bold text-gray-800 mb-4">{isEditing ? 'แก้ไขแผนดูแล' : 'สร้างแผนดูแล'}</h2>
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="petId">สัตว์เลี้ยง</label>
					<select id="petId" bind:value={formData.petId} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
						{#each pets as pet}
							<option value={pet.id}>{pet.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="title">หัวข้อ</label>
					<input type="text" id="title" bind:value={formData.title} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="detail">รายละเอียด (แต่ละบรรทัดคือ 1 รายการ)</label>
					<textarea id="detail" bind:value={formData.detail} rows="3" class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"></textarea>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="frequency">ความถี่</label>
					<select id="frequency" bind:value={formData.frequencyDays} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
						{#each frequencies as freq}
							<option value={freq.value}>{freq.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="nextDueAt">วันที่ครบกำหนดครั้งถัดไป</label>
					<input type="date" id="nextDueAt" bind:value={formData.nextDueAt} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
				</div>
				<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<button type="button" onclick={() => showModal = false} class="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
						ยกเลิก
					</button>
					<button type="submit" class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group">
						บันทึก
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
