<script lang="ts">
	import { modal } from '$lib/actions/modal';
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import ProductCards from '$lib/components/ProductCards.svelte';
	import PetAvatar from '$lib/components/PetAvatar.svelte';
	import { ApiError, api, request } from '$lib/api';
	import { i18n } from '$lib/i18n';
	let carePlans = $state<any[]>([]);
	let careRecommendations = $state<any[]>([]);
	let pets = $state<any[]>([]);
	let warnings = $state<any[]>([]);
	let loading = $state(true);
	let error = $state('');
	let loadVersion = 0;

	let activeTab = $state('plans');
	let selectedRecId = $state<string | null>(null);
	let filterPet = $state('');

	let showModal = $state(false);
	let isEditing = $state(false);
	let editId = $state('');
	let formData = $state({ petId: '', title: '', detail: '', frequencyDays: 1, nextDueAt: '' });

	// --- Special character validation ---
	const specialCharRegex = /[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?`~]/;
	function hasSpecialChars(value: string): boolean {
		return specialCharRegex.test(value || '');
	}
	let titleError = $derived(hasSpecialChars(formData.title) ? 'ห้ามใช้อักขระพิเศษ เช่น @#$%^&*' : '');
	let detailError = $derived(formData.detail.length > 5000 ? 'กรุณากรอกรายละเอียดไม่เกิน 5000 ตัวอักษร' : '');
	let careFormValid = $derived(!titleError && !detailError);
	const frequencies = [
		{ label: 'ทุกวัน', value: 1 },
		{ label: 'ทุกสัปดาห์', value: 7 },
		{ label: 'ทุกเดือน', value: 30 },
		{ label: 'ทุก 3 เดือน', value: 90 },
		{ label: 'ทุก 6 เดือน', value: 180 },
		{ label: 'ทุกปี', value: 365 }
	];

	let filteredPlans = $derived(
		carePlans.filter((c) => !filterPet || c.petId === filterPet)
	);

	let filteredRecommendations = $derived.by(() => {
		const groups = new Map<string, any>();
		for (const rec of careRecommendations) {
			if (filterPet && rec.petId !== filterPet) continue;
			let group = groups.get(rec.id);
			if (!group) {
				group = { ...rec, members: [] };
				groups.set(rec.id, group);
			}
			if (!group.members.some((member: any) => member.petId === rec.petId)) {
				const pet = pets.find(p => p.id === rec.petId);
				group.members.push({ ...rec, petName: pet?.name || rec.petName, image: pet?.image });
			}
		}
		return [...groups.values()];
	});
	let selectedRec = $derived(filteredRecommendations.find(rec => rec.id === selectedRecId) || null);

	function openAddModal() {
		if (!pets.length) { error = 'กรุณาเพิ่มข้อมูลสัตว์เลี้ยงตัวแรกก่อนสร้างแผนดูแล'; return; }
		error = '';
		isEditing = false;
		formData = { petId: pets.find(p => !p.readOnly)?.id || '', title: '', detail: '', frequencyDays: 1, nextDueAt: '' };
		useRecommendations();
		showModal = true;
	}

	function useRecommendations() {
		if (isEditing) return;
		const pet = pets.find((pet) => pet.id === formData.petId);
		const recommendations = careRecommendations.filter((item) => item.petId === formData.petId);
		formData.title = recommendations.length ? `แผนดูแล${pet?.name || ''}` : '';
		formData.detail = recommendations.length ? [
			pet?.allergies ? `ข้อมูลการแพ้: ${pet.allergies}` : '',
			...recommendations.map((item) => item.description),
			pet?.notes ? `หมายเหตุ: ${pet.notes}` : ''
		].filter(Boolean).join('\n') : '';
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
        const version = ++loadVersion;
		try {
			const [petResult, planResult, recommendationResult] = await Promise.all([api<{ pets: any[] }>('/api/pets'), api<{ plans: any[] }>('/api/care-plans'), api<{ recommendations: any[]; warnings?: any[] }>('/api/care-recommendations')]);
			if (version !== loadVersion) return;
            error = '';
            warnings = recommendationResult.warnings || [];
			pets = petResult.pets.map((pet) => ({ ...pet, id: String(pet.id), image: pet.image || '🐾' }));
			carePlans = planResult.plans.map((plan) => ({ ...plan, id: String(plan.id), petId: String(plan.petId), frequency: plan.frequencyDays ? `ทุก ${plan.frequencyDays} วัน` : 'กำหนดเอง', nextDate: plan.nextDueAt ? new Date(plan.nextDueAt).toLocaleDateString('th-TH') : '-', status: plan.status === 'DONE' ? 'completed' : 'upcoming', items: plan.detail ? plan.detail.split('\n').filter(Boolean) : [] }));
			careRecommendations = recommendationResult.recommendations.map((item) => ({ ...item, id: String(item.id), petId: item.petId != null ? String(item.petId) : '', type: item.ageRange, title: item.title || `คำแนะนำการดูแลสำหรับ ${item.petName}`, description: item.content, imageUrl: item.imageUrl || '', priority: 'low', dueDate: '-' }));
            if (selectedRecId && !careRecommendations.some(rec => rec.id === selectedRecId)) selectedRecId = null;
		} catch (err) { if (version === loadVersion) error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดแผนดูแลได้'; }
		finally { if (version === loadVersion) loading = false; }
	}
	onMount(() => {
        const refresh = () => { if (document.visibilityState === 'visible') void loadCare(); };
        const storageChanged = (event: StorageEvent) => { if (event.key === 'hhm_data_changed') refresh(); };
        void loadCare();
        const timer = window.setInterval(refresh, 15000);
        window.addEventListener('focus', refresh);
        window.addEventListener('online', refresh);
        window.addEventListener('api_updated', refresh);
        window.addEventListener('storage', storageChanged);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            ++loadVersion;
            clearInterval(timer);
            window.removeEventListener('focus', refresh);
            window.removeEventListener('online', refresh);
            window.removeEventListener('api_updated', refresh);
            window.removeEventListener('storage', storageChanged);
            document.removeEventListener('visibilitychange', refresh);
        };
    });
</script>

<svelte:head>
	<title>{i18n.care.title} | HoangHoang Meow</title>
</svelte:head>

<TopNav title={i18n.care.title} subtitle={i18n.care.subtitle} />

<div class="p-4 space-y-6 animate-fade-in stagger-1 sm:p-6 lg:p-8">
	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}
	{#if !pets.length}<p><a class="text-brand-600 underline" href="/pets">เพิ่มข้อมูลสัตว์เลี้ยงตัวแรก</a> เพื่อสร้างแผนดูแลและรับคำแนะนำ</p>{/if}
	{#each warnings as warning}
		<p role="status" class="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{warning.petName || ''} {warning.message}
			{#if warning.code === 'INVALID_PROFILE'}<a class="underline" href={`/pets/${warning.petId}`}>แก้ไขโปรไฟล์</a>{/if}
			{#if warning.code === 'NO_STANDARD_PLAN'}<a class="underline" href="/reminders">ตั้งค่าแจ้งเตือนด้วยตนเอง</a>{/if}
		</p>
	{/each}
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
				💡 คำแนะนำ ({filteredRecommendations.length})
			</button>
		</div>

		<select
			bind:value={filterPet}
			aria-label="กรองตามสัตว์เลี้ยง"
			class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white sm:max-w-[200px]"
		>
			<option value="">🐾 ทั้งหมด</option>
			{#each pets as pet}
				<option value={pet.id}>🐾 {pet.name}</option>
			{/each}
		</select>

		{#if activeTab === 'plans'}
			<button onclick={openAddModal} disabled={loading} class="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group sm:ml-auto sm:w-auto">
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
							<PetAvatar image={pet?.image} name={pet?.name} />
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
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					onclick={() => selectedRecId = rec.id}
					data-recommendation-id={rec.id}
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
						<div class="mb-2 flex flex-wrap items-center gap-2">
							{#each rec.members as member (member.petId)}
								<span class="inline-flex min-w-0 max-w-full items-center gap-2">
									<PetAvatar image={member.image} name={member.petName} />
									<span class="break-words text-xs text-gray-400">{member.petName}</span>
								</span>
							{/each}
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
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		use:modal class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
		onclick={(e) => { if (e.target === e.currentTarget) selectedRecId = null; }}
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
				onclick={() => selectedRecId = null}
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
				<div class="mb-3 flex flex-wrap items-center gap-2">
					<span class="text-sm text-gray-500">สำหรับ</span>
					{#each selectedRec.members as member (member.petId)}
						<span class="inline-flex min-w-0 max-w-full items-center gap-2">
							<PetAvatar image={member.image} name={member.petName} />
							<span class="break-words text-sm text-gray-500">{member.petName}</span>
						</span>
					{/each}
				</div>
				<h2 class="text-lg font-bold text-gray-800">{selectedRec.title}</h2>
				<div class="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
					{selectedRec.description}
				</div>
				{#each selectedRec.members as member (member.petId)}
					{#if member.allergies}<p class="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">ข้อมูลการแพ้ของ {member.petName}: {member.allergies}</p>{/if}
					{#if member.notes}<p class="mt-2 text-sm">หมายเหตุของ {member.petName}: {member.notes}</p>{/if}
					{#if selectedRec.members.length > 1}<p class="mt-4 text-sm font-semibold">สินค้าสำหรับ {member.petName}</p>{/if}
					<ProductCards location="CARE" petId={member.petId} topic={selectedRec.title} />
				{/each}
			</div>

			<!-- Footer -->
			<div class="border-t border-gray-100 px-6 py-4">
				<button
					onclick={() => selectedRecId = null}
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
	<div use:modal class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-md">
		<div class="my-auto w-full max-w-md rounded-3xl glass-heavy p-5 shadow-xl sm:p-8">
			<h2 class="text-xl font-bold text-gray-800 mb-4">{isEditing ? 'แก้ไขแผนดูแล' : 'สร้างแผนดูแล'}</h2>
			{#if error}<p role="alert" class="mb-4 text-sm text-red-600">{error}</p>{/if}
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="petId">สัตว์เลี้ยง</label>
					<select id="petId" bind:value={formData.petId} onchange={useRecommendations} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
						{#each pets as pet}
							<option value={pet.id} disabled={pet.readOnly}>{pet.name}{pet.readOnly ? ' (ดูข้อมูลเท่านั้น)' : ''}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="title">หัวข้อ</label>
					<input type="text" id="title" bind:value={formData.title} required class="w-full rounded-2xl border-2 {titleError ? 'border-red-400 focus:border-red-400 focus:ring-red-100/50' : 'border-transparent focus:border-brand-400 focus:ring-brand-100/50'} bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:bg-white hover:bg-white text-gray-700" />
					{#if titleError}<p class="mt-1 text-xs text-red-500">{titleError}</p>{/if}
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="detail">รายละเอียด (แต่ละบรรทัดคือ 1 รายการ)</label>
					<textarea id="detail" bind:value={formData.detail} rows="3" class="w-full rounded-2xl border-2 {detailError ? 'border-red-400 focus:border-red-400 focus:ring-red-100/50' : 'border-transparent focus:border-brand-400 focus:ring-brand-100/50'} bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:bg-white hover:bg-white text-gray-700"></textarea>
					{#if detailError}<p class="mt-1 text-xs text-red-500">{detailError}</p>{/if}
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
					<button type="submit" disabled={!careFormValid} class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg">
						บันทึก
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
