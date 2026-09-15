<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import TopNav from '$lib/components/TopNav.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { pets as mockPets, healthRecords as mockHealthRecords, carePlans as mockCarePlans } from '$lib/data/mock-data';
	import { ApiError, api, request } from '$lib/api';
	import { goto } from '$app/navigation';

	let pets = $state<any[]>(mockPets);
	let healthRecords = $state<any[]>(mockHealthRecords);
	let carePlans = $state<any[]>(mockCarePlans);
	let error = $state('');
	
	let showEditModal = $state(false);
	let savingEdit = $state(false);
	let editPetData = $state<any>({});
	
	let showDeleteModal = $state(false);
	let deleting = $state(false);
	
	let showAddHealthModal = $state(false);
	let savingHealth = $state(false);
	let newHealthRecord = $state({
		type: 'วัคซีน',
		title: '',
		description: '',
		date: '',
		provider: '',
		cost: ''
	});

	const petId = $derived($page.params.id);
	let pet = $derived(pets.find((p) => p.id === petId) || pets[0]);
	let petRecords = $derived(healthRecords.filter((r) => r.petId === pet.id));
	let petCarePlans = $derived(carePlans.filter((c) => c.petId === pet.id));

	let activeTab = $state('info');

	const tabs = [
		{ id: 'info', label: 'ข้อมูลทั่วไป' },
		{ id: 'health', label: 'บันทึกสุขภาพ' },
		{ id: 'care', label: 'แผนดูแล' }
	];

	async function loadPet() {
		try {
			const [petResult, recordResult, planResult] = await Promise.all([api<{ pet: any }>(`/api/pets/${petId}`), api<{ records: any[] }>(`/api/health-records?petId=${petId}`), api<{ plans: any[] }>('/api/care-plans')]);
			const livePet = { ...petResult.pet, id: String(petResult.pet.id), image: petResult.pet.image || '🐾', age: petResult.pet.age || '-', weight: petResult.pet.weight ? `${petResult.pet.weight} กก.` : '-', color: petResult.pet.color || '-', status: 'ปกติ' };
			pets = [livePet];
			healthRecords = recordResult.records.map((record) => ({ ...record, id: String(record.id), petId: String(record.petId), vet: record.provider || '-', cost: Number(record.cost || 0) }));
			carePlans = planResult.plans.filter((plan) => String(plan.petId) === String(petId)).map((plan) => ({ ...plan, id: String(plan.id), petId: String(plan.petId), frequency: plan.frequencyDays ? `ทุก ${plan.frequencyDays} วัน` : 'กำหนดเอง', nextDate: plan.nextDueAt ? new Date(plan.nextDueAt).toLocaleDateString('th-TH') : '-', status: plan.status === 'DONE' ? 'completed' : 'upcoming', items: plan.detail ? plan.detail.split('\n') : [] }));
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดข้อมูลสัตว์เลี้ยงได้'; }
	}

	function openEditModal() {
		editPetData = { ...pet };
		if (editPetData.weight) editPetData.weight = editPetData.weight.replace(' กก.', '');
		showEditModal = true;
	}

	async function saveEditPet() {
		savingEdit = true;
		error = '';
		try {
			const data = { ...editPetData };
			delete data.id;
			delete data.image;
			delete data.age;
			delete data.status;
			await request(`/api/pets/${pet.id}`, 'PATCH', data);
			showEditModal = false;
			await loadPet();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถแก้ไขข้อมูลได้';
		} finally {
			savingEdit = false;
		}
	}

	async function deletePet() {
		deleting = true;
		error = '';
		try {
			await request(`/api/pets/${pet.id}`, 'DELETE');
			await goto('/pets');
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถลบสัตว์เลี้ยงได้';
			deleting = false;
			showDeleteModal = false;
		}
	}

	async function saveHealthRecord() {
		savingHealth = true;
		error = '';
		try {
			const body = {
				petId: Number(pet.id),
				type: newHealthRecord.type,
				title: newHealthRecord.title,
				description: newHealthRecord.description,
				date: newHealthRecord.date,
				provider: newHealthRecord.provider,
				cost: newHealthRecord.cost ? Number(newHealthRecord.cost) : undefined
			};
			await request('/api/health-records', 'POST', body);
			showAddHealthModal = false;
			newHealthRecord = { type: 'วัคซีน', title: '', description: '', date: '', provider: '', cost: '' };
			await loadPet();
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถเพิ่มบันทึกสุขภาพได้';
		} finally {
			savingHealth = false;
		}
	}

	onMount(loadPet);
</script>

<svelte:head>
	<title>{pet.name} | HoangHoang Meow</title>
</svelte:head>

<TopNav title={pet.name} subtitle={pet.species + ' · ' + pet.breed} />

<div class="p-4 space-y-6 sm:p-6 lg:p-8">
	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}
	<!-- Pet Profile Header -->
		<div class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
		<div class="flex flex-col gap-6 sm:flex-row sm:items-center">
			<!-- Avatar -->
			<div class="flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-50 text-5xl overflow-hidden">
				{#if !pet.image || pet.image === '🐾' || pet.image.match(/[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u)}
					<Icon name={pet.species === 'หมา' ? 'dog' : 'cat'} class="w-12 h-12 text-gray-400" />
				{:else}
					<img src={pet.image} alt={pet.name} class="w-full h-full object-cover" />
				{/if}
			</div>

			<!-- Info -->
			<div class="flex-1">
				<div class="flex items-center gap-3">
					<h2 class="text-2xl font-bold text-gray-800">{pet.name}</h2>
					<span
						class="rounded-full px-3 py-0.5 text-xs font-medium {pet.status === 'ปกติ'
							? 'bg-green-100 text-green-700'
							: 'bg-amber-100 text-amber-700'}"
					>
						{pet.status}
					</span>
				</div>
				<div class="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
					<span class="flex items-center gap-1.5"><Icon name="collar" class="w-4 h-4" /> {pet.species}</span>
					<span class="flex items-center gap-1.5"><Icon name="id-card" class="w-4 h-4" /> {pet.breed}</span>
					<span class="flex items-center gap-1.5"><Icon name="gender" class="w-4 h-4" /> {pet.gender}</span>
					<span class="flex items-center gap-1.5"><Icon name="calendar" class="w-4 h-4" /> {pet.age}</span>
					<span class="flex items-center gap-1.5"><Icon name="weight" class="w-4 h-4" /> {pet.weight}</span>
					<span class="flex items-center gap-1.5"><Icon name="palette" class="w-4 h-4" /> {pet.color}</span>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex gap-2">
				<button
					onclick={openEditModal}
					class="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
						/>
					</svg>
					แก้ไข
				</button>
				<button
					onclick={() => showDeleteModal = true}
					class="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
					</svg>
					ลบ
				</button>
			</div>
		</div>
	</div>

	<!-- Tab Navigation -->
	<div class="border-b border-gray-200">
		<nav class="flex gap-0 overflow-x-auto">
			{#each tabs as tab}
				<button
					onclick={() => (activeTab = tab.id)}
					class="relative shrink-0 border-b-2 px-6 py-3 text-sm font-medium transition-colors {activeTab === tab.id
						? 'border-indigo-600 text-indigo-700'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
				>
					{tab.label}
				</button>
			{/each}
		</nav>
	</div>

	<!-- Tab Content -->
	{#if activeTab === 'info'}
		<!-- General Info -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
				<h3 class="text-base font-bold text-gray-800 mb-4 flex items-center gap-1.5"><Icon name="clipboard" class="w-5 h-5 text-gray-600" /> ข้อมูลพื้นฐาน</h3>
				<div class="space-y-3">
					{#each [
						{ label: 'ชื่อ', value: pet.name },
						{ label: 'ชนิด', value: pet.species },
						{ label: 'พันธุ์', value: pet.breed },
						{ label: 'เพศ', value: pet.gender },
						{ label: 'อายุ', value: pet.age },
						{ label: 'น้ำหนัก', value: pet.weight },
						{ label: 'สี', value: pet.color }
					] as info}
						<div class="flex justify-between border-b border-gray-100 pb-2 last:border-0">
							<span class="text-sm text-gray-500">{info.label}</span>
							<span class="text-sm font-medium text-gray-800">{info.value}</span>
						</div>
					{/each}
				</div>
			</div>

			<div class="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
				<h3 class="text-base font-bold text-gray-800 mb-4 flex items-center gap-1.5"><Icon name="pill" class="w-5 h-5 text-gray-600" /> ประวัติการรักษาล่าสุด</h3>
				{#each petRecords.slice(0, 4) as record}
					<div class="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
						<div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg {record.type === 'วัคซีน' ? 'bg-blue-100 text-blue-600' : record.type === 'ตรวจสุขภาพ' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}">
							{#if record.type === 'วัคซีน'}
								<Icon name="syringe" class="w-5 h-5" />
							{:else if record.type === 'ตรวจสุขภาพ'}
								<Icon name="stethoscope" class="w-5 h-5" />
							{:else}
								<Icon name="tooth" class="w-5 h-5" />
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-sm font-medium text-gray-800">{record.description}</p>
							<p class="text-xs text-gray-400">{record.date} · {record.vet}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

	{:else if activeTab === 'health'}
		<!-- Health Records -->
		<div class="rounded-2xl border border-gray-200 bg-white">
			<div class="flex items-center justify-between p-6 pb-4">
				<div class="flex items-center gap-3">
					<h3 class="text-base font-bold text-gray-800 flex items-center gap-1.5"><Icon name="clipboard" class="w-5 h-5 text-gray-600" /> บันทึกสุขภาพทั้งหมด</h3>
					<span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
						{petRecords.length} รายการ
					</span>
				</div>
				<button
					onclick={() => showAddHealthModal = true}
					class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
				>
					+ เพิ่มบันทึกสุขภาพ
				</button>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-t border-b border-gray-100 bg-gray-50/50">
							<th class="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">ประเภท</th>
							<th class="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">รายละเอียด</th>
							<th class="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">วันที่</th>
							<th class="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">สถานพยาบาล</th>
							<th class="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">ค่าใช้จ่าย</th>
						</tr>
					</thead>
					<tbody>
						{#each petRecords as record}
							<tr class="border-b border-gray-100 transition-colors hover:bg-gray-50">
								<td class="px-6 py-4">
									<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium {record.type === 'วัคซีน' ? 'bg-blue-100 text-blue-700' : record.type === 'ตรวจสุขภาพ' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">
										{record.type}
									</span>
								</td>
								<td class="px-6 py-4 text-sm text-gray-700">{record.description}</td>
								<td class="px-6 py-4 text-sm text-gray-500">{record.date}</td>
								<td class="px-6 py-4 text-sm text-gray-500">{record.vet}</td>
								<td class="px-6 py-4 text-right text-sm font-medium text-gray-800">฿{record.cost.toLocaleString()}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

	{:else if activeTab === 'care'}
		<!-- Care Plans -->
		<div class="space-y-4">
			{#each petCarePlans as plan}
				<div class="rounded-2xl border border-gray-200 bg-white p-6">
					<div class="flex items-start justify-between">
						<div>
							<h3 class="text-base font-bold text-gray-800">{plan.title}</h3>
							<p class="mt-1 text-sm text-gray-500">
								ทำซ้ำ: {plan.frequency} · ครั้งถัดไป: {plan.nextDate}
							</p>
						</div>
						<span
							class="rounded-full px-3 py-0.5 text-xs font-medium {plan.status === 'completed'
								? 'bg-green-100 text-green-700'
								: plan.status === 'overdue'
									? 'bg-red-100 text-red-700'
									: 'bg-blue-100 text-blue-700'}"
						>
							{plan.status === 'completed' ? 'เสร็จสิ้น' : plan.status === 'overdue' ? 'เลยกำหนด' : 'กำลังจะถึง'}
						</span>
					</div>
					<ul class="mt-4 space-y-2">
						{#each plan.items as item}
							<li class="flex items-center gap-2 text-sm text-gray-600">
								<svg class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{item}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Edit Pet Modal -->
	{#if showEditModal}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto"
			onclick={(e) => { if (e.target === e.currentTarget) showEditModal = false; }}
			onkeydown={(e) => { if (e.key === 'Escape') showEditModal = false; }}
			role="button"
			tabindex="0"
		>
			<div class="mx-4 my-8 w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl cursor-default sm:p-6">
				<h2 class="text-lg font-bold text-gray-800 mb-6">แก้ไขข้อมูลสัตว์เลี้ยง</h2>
				<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); saveEditPet(); }}>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">ชื่อ</label>
							<input type="text" required bind:value={editPetData.name} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">ชนิด</label>
							<select bind:value={editPetData.species} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
								<option>แมว</option>
								<option>หมา</option>
								<option>กระต่าย</option>
								<option>นก</option>
								<option>อื่นๆ</option>
							</select>
						</div>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">พันธุ์</label>
							<input type="text" bind:value={editPetData.breed} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">เพศ</label>
							<select bind:value={editPetData.gender} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
								<option value="UNKNOWN">ไม่ระบุ</option>
								<option value="MALE">เพศผู้</option>
								<option value="FEMALE">เพศเมีย</option>
							</select>
						</div>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">วันเกิด</label>
							<input type="date" bind:value={editPetData.birthdate} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">น้ำหนัก (กก.)</label>
							<input type="number" step="0.01" bind:value={editPetData.weight} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
						</div>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">สี</label>
							<input type="text" bind:value={editPetData.color} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">ข้อมูลการแพ้</label>
							<textarea bind:value={editPetData.allergies} rows="1" class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"></textarea>
						</div>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">หมายเหตุเพิ่มเติม</label>
						<textarea bind:value={editPetData.notes} rows="2" class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"></textarea>
					</div>
					
					<div class="flex justify-end gap-3 pt-2">
						<button type="button" onclick={() => showEditModal = false} class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">ยกเลิก</button>
						<button type="submit" disabled={savingEdit} class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60">{savingEdit ? 'กำลังบันทึก…' : 'บันทึกการแก้ไข'}</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Delete Pet Modal -->
	{#if showDeleteModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 cursor-default">
			<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
				<h2 class="text-xl font-bold text-gray-900 mb-2">ลบสัตว์เลี้ยง</h2>
				<p class="text-sm text-gray-500 mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบ <span class="font-bold">{pet.name}</span>? ข้อมูลทั้งหมดจะถูกลบอย่างถาวรและไม่สามารถกู้คืนได้</p>
				<div class="flex justify-end gap-3">
					<button onclick={() => showDeleteModal = false} class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50">ยกเลิก</button>
					<button onclick={deletePet} disabled={deleting} class="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60">{deleting ? 'กำลังลบ…' : 'ยืนยันการลบ'}</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Add Health Record Modal -->
	{#if showAddHealthModal}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto"
			onclick={(e) => { if (e.target === e.currentTarget) showAddHealthModal = false; }}
			onkeydown={(e) => { if (e.key === 'Escape') showAddHealthModal = false; }}
			role="button"
			tabindex="0"
		>
			<div class="mx-4 my-8 w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl cursor-default sm:p-6">
				<h2 class="text-lg font-bold text-gray-800 mb-6">เพิ่มบันทึกสุขภาพ</h2>
				<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); saveHealthRecord(); }}>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">ประเภท</label>
						<select bind:value={newHealthRecord.type} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
							<option value="วัคซีน">วัคซีน</option>
							<option value="ตรวจสุขภาพ">ตรวจสุขภาพ</option>
							<option value="ทันตกรรม">ทันตกรรม</option>
							<option value="ยา/การรักษา">ยา/การรักษา</option>
							<option value="ผ่าตัด">ผ่าตัด</option>
							<option value="อื่นๆ">อื่นๆ</option>
						</select>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">หัวข้อ / รายละเอียดสั้นๆ</label>
						<input type="text" required bind:value={newHealthRecord.title} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">รายละเอียด (เพิ่มเติม)</label>
						<textarea bind:value={newHealthRecord.description} rows="2" class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"></textarea>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">วันที่</label>
							<input type="date" required bind:value={newHealthRecord.date} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
						</div>
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700">ค่าใช้จ่าย (บาท)</label>
							<input type="number" step="0.01" bind:value={newHealthRecord.cost} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
						</div>
					</div>
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">สถานพยาบาล / ผู้ให้บริการ</label>
						<input type="text" bind:value={newHealthRecord.provider} class="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
					</div>
					
					<div class="flex justify-end gap-3 pt-2">
						<button type="button" onclick={() => showAddHealthModal = false} class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">ยกเลิก</button>
						<button type="submit" disabled={savingHealth} class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60">{savingHealth ? 'กำลังบันทึก…' : 'บันทึก'}</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>
