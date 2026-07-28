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
			careRecommendations = recommendationResult.recommendations.map((item) => ({ ...item, id: String(item.id), petId: String(item.petId), type: item.ageRange, title: `คำแนะนำการดูแลสำหรับ ${item.petName}`, description: item.content, priority: 'low', dueDate: '-' }));
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดแผนดูแลได้'; }
	}
	onMount(loadCare);
</script>

<svelte:head>
	<title>{i18n.care.title} | PetCare</title>
</svelte:head>

<TopNav title={i18n.care.title} subtitle={i18n.care.subtitle} />

<div class="p-6 space-y-6">
	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}
	<!-- Tabs -->
	<div class="flex items-center gap-4">
		<div class="flex rounded-xl border border-gray-200 bg-white p-1">
			<button
				onclick={() => (activeTab = 'plans')}
				class="rounded-lg px-4 py-2 text-sm font-medium transition-colors {activeTab === 'plans'
					? 'bg-indigo-600 text-white shadow-sm'
					: 'text-gray-600 hover:text-gray-800'}"
			>
				📋 แผนดูแล ({carePlans.length})
			</button>
			<button
				onclick={() => (activeTab = 'recommendations')}
				class="rounded-lg px-4 py-2 text-sm font-medium transition-colors {activeTab === 'recommendations'
					? 'bg-indigo-600 text-white shadow-sm'
					: 'text-gray-600 hover:text-gray-800'}"
			>
				💡 คำแนะนำ ({careRecommendations.length})
			</button>
		</div>

		<select
			bind:value={filterPet}
			class="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
		>
			{#each petNames as name}
				<option value={name}>🐾 {name}</option>
			{/each}
		</select>

		{#if activeTab === 'plans'}
			<button onclick={openAddModal} class="ml-auto rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
				+ สร้างแผนดูแล
			</button>
		{/if}
	</div>

	{#if activeTab === 'plans'}
		<!-- Care Plans Grid -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredPlans as plan}
				{@const pet = pets.find(p => p.id === plan.petId)}
				<div class="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
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
								<svg class="h-4 w-4 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{item}
							</li>
						{/each}
					</ul>

					<div class="mt-4 flex gap-2">
						<button onclick={() => handleDone(plan.id)} class="flex-1 rounded-lg bg-indigo-50 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100">
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
		<!-- Care Recommendations -->
		<div class="space-y-4">
			{#each filteredRecommendations as rec}
				{@const pet = pets.find(p => p.id === rec.petId)}
				<div class="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
					<div class="flex items-start gap-4">
						<!-- Priority indicator -->
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl {rec.priority === 'high' ? 'bg-red-100' : rec.priority === 'medium' ? 'bg-amber-100' : 'bg-blue-100'}">
							<span class="text-lg {rec.priority === 'high' ? 'animate-pulse' : ''}">
								{rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵'}
							</span>
						</div>

						<div class="flex-1 min-w-0">
							<div class="flex flex-wrap items-center gap-2">
								<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
									{rec.type}
								</span>
								<span class="text-xs text-gray-400">สำหรับ {pet?.name}</span>
							</div>
							<h3 class="mt-1.5 text-sm font-bold text-gray-800">{rec.title}</h3>
							<p class="mt-1 text-sm text-gray-500">{rec.description}</p>
							<div class="mt-3 flex items-center gap-3">
								<span class="text-xs text-gray-400">📅 กำหนด: {rec.dueDate}</span>
								<span
									class="rounded-full px-2 py-0.5 text-xs font-medium {rec.priority === 'high' ? 'bg-red-100 text-red-700' : rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}"
								>
									{rec.priority === 'high' ? 'สำคัญ' : rec.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ'}
								</span>
							</div>
						</div>

						<button class="shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100">
							นำไปใช้
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if showModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
			<h2 class="text-xl font-bold text-gray-800 mb-4">{isEditing ? 'แก้ไขแผนดูแล' : 'สร้างแผนดูแล'}</h2>
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="petId">สัตว์เลี้ยง</label>
					<select id="petId" bind:value={formData.petId} required class="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
						{#each pets as pet}
							<option value={pet.id}>{pet.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="title">หัวข้อ</label>
					<input type="text" id="title" bind:value={formData.title} required class="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="detail">รายละเอียด (แต่ละบรรทัดคือ 1 รายการ)</label>
					<textarea id="detail" bind:value={formData.detail} rows="3" class="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"></textarea>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="frequency">ความถี่</label>
					<select id="frequency" bind:value={formData.frequencyDays} required class="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
						{#each frequencies as freq}
							<option value={freq.value}>{freq.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="nextDueAt">วันที่ครบกำหนดครั้งถัดไป</label>
					<input type="date" id="nextDueAt" bind:value={formData.nextDueAt} required class="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
				</div>
				<div class="mt-6 flex justify-end gap-3">
					<button type="button" onclick={() => showModal = false} class="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
						ยกเลิก
					</button>
					<button type="submit" class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
						บันทึก
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
