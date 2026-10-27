<script lang="ts">
	import { modal } from '$lib/actions/modal';
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import PetAvatar from '$lib/components/PetAvatar.svelte';
	import { localDate } from '$lib/validation';
	import { ApiError, api, request } from '$lib/api';
	let healthRecords = $state<any[]>([]);
	let pets = $state<any[]>([]);
	let error = $state('');
	let loading = $state(true);
	let saving = $state(false);
	let editId = $state('');
	let search = $state('');

	let filterPet = $state('ทั้งหมด');
	let filterType = $state('ทั้งหมด');

	let showAddModal = $state(false);
	let formData = $state({ petId: '', type: 'วัคซีน', title: '', description: '', date: '', provider: '', cost: '' });
	const formTypes = ['วัคซีน', 'ตรวจสุขภาพ', 'ทันตกรรม', 'ยา/การรักษา', 'ผ่าตัด', 'อื่นๆ'];

	// --- Special character validation ---
	const specialCharRegex = /[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?`~]/;
	function hasSpecialChars(value: string): boolean {
		return specialCharRegex.test(value || '');
	}
	let titleError = $derived(hasSpecialChars(formData.title) ? 'ห้ามใช้อักขระพิเศษ เช่น @#$%^&*' : '');
	let descriptionError = $derived(hasSpecialChars(formData.description) ? 'ห้ามใช้อักขระพิเศษ เช่น @#$%^&*' : '');
	let providerError = $derived(hasSpecialChars(formData.provider) ? 'ห้ามใช้อักขระพิเศษ เช่น @#$%^&*' : '');
	let healthFormValid = $derived(!titleError && !descriptionError && !providerError);

	let editablePets = $derived(pets.filter(p => !p.readOnly));
	let recordTypes = ['ทั้งหมด', 'วัคซีน', 'ตรวจสุขภาพ', 'ทันตกรรม', 'ขูดหู', 'ยา', 'ยา/การรักษา', 'ผ่าตัด', 'อื่นๆ'];

	let filteredRecords = $derived(
		healthRecords.filter((r) => {
			let pet = pets.find((p) => p.id === r.petId);
			let matchesPet = filterPet === 'ทั้งหมด' || r.petId === filterPet;
			let matchesType = filterType === 'ทั้งหมด' || r.type === filterType;
			return matchesPet && matchesType && [r.title, r.description, r.provider, pet?.name].some(value => String(value || '').toLowerCase().includes(search.trim().toLowerCase()));
		}).sort((a, b) => b.date.localeCompare(a.date) || Number(b.id) - Number(a.id))
	);

	let totalCost = $derived(filteredRecords.reduce((sum, r) => sum + r.cost, 0));

	let latestVaccineDate = $derived(() => {
		const vaccines = healthRecords.filter(r => r.type.includes('วัคซีน') && r.date).map(r => new Date(r.date));
		if (!vaccines.length) return '-';
		return new Date(Math.max(...vaccines.map(d => d.getTime()))).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' });
	});

	function editRecord(record: any) {
        error = ''; editId = record.id;
        formData = { petId: record.petId, type: record.type, title: record.title, description: record.description || '', date: record.date, provider: record.provider || '', cost: String(record.cost) };
        showAddModal = true;
    }
    function openModal() {
        error = ''; editId = '';
		formData = { petId: editablePets[0]?.id || '', type: 'วัคซีน', title: '', description: '', date: '', provider: '', cost: '' };
		showAddModal = true;
	}

	async function handleAdd() {
        if (saving) return;
        error = '';
        if (!formData.title.trim() || !formData.petId || !formData.date || formData.date > localDate() || !healthFormValid) { error = 'กรุณากรอกข้อมูลให้ครบและเลือกวันที่ไม่เกินวันนี้'; return; }
        saving = true;
        try {
			await request(editId ? `/api/health-records/${editId}` : '/api/health-records', editId ? 'PATCH' : 'POST', { ...formData, petId: Number(formData.petId), cost: Number(formData.cost) });
			showAddModal = false;
			await loadRecords();
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถบันทึกข้อมูลได้'; }
        finally { saving = false; }
	}

	async function handleDelete(id: string) {
		if (!confirm('ยืนยันการลบรายการนี้?')) return;
		try {
			await request(`/api/health-records/${id}`, 'DELETE');
			await loadRecords();
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถลบข้อมูลได้'; }
	}

	async function loadRecords() {
		try {
			const [petResult, recordResult] = await Promise.all([api<{ pets: any[] }>('/api/pets'), api<{ records: any[] }>('/api/health-records')]);
			pets = petResult.pets.map((pet) => ({ ...pet, id: String(pet.id) }));
			healthRecords = recordResult.records.map((record) => ({ ...record, id: String(record.id), petId: String(record.petId), vet: record.provider || '-', cost: Number(record.cost || 0) }));
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดประวัติสุขภาพได้'; }
        finally { loading = false; }
	}
	onMount(loadRecords);
</script>

<svelte:head>
	<title>บันทึกสุขภาพ | HoangHoang Meow</title>
</svelte:head>

<TopNav title="บันทึกสุขภาพ" subtitle="ประวัติการรักษาและตรวจสุขภาพสัตว์เลี้ยง" />

<div class="p-4 space-y-6 animate-fade-in stagger-1 sm:p-6 lg:p-8">
	<div class="flex items-center justify-between gap-3">
		<h1 class="text-2xl font-bold text-gray-800 hidden sm:block">บันทึกสุขภาพ</h1>
		<button onclick={openModal} disabled={loading || !editablePets.length} class="relative ml-auto whitespace-nowrap overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group sm:px-6">
			+ เพิ่มบันทึก
		</button>
	</div>

	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}
	<!-- Stats -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-5">
			<p class="text-sm text-gray-500">บันทึกทั้งหมด</p>
			<p class="mt-1 text-2xl font-bold text-gray-800">{filteredRecords.length} รายการ</p>
		</div>
		<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-5">
			<p class="text-sm text-gray-500">ค่ารักษารวม</p>
			<p class="mt-1 text-2xl font-bold text-rose-600">฿{totalCost.toLocaleString()}</p>
		</div>
		<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-5">
			<p class="text-sm text-gray-500">นัดวัคซีนล่าสุด</p>
			<p class="mt-1 text-2xl font-bold text-amber-600">{latestVaccineDate()}</p>
		</div>
	</div>

	<!-- Filters -->
    <input aria-label="ค้นหาประวัติสุขภาพ" bind:value={search} placeholder="ค้นหาหัวข้อ รายละเอียด หรือสถานพยาบาล" class="w-full rounded-xl border border-gray-200 p-3" />
	<div class="flex flex-wrap gap-3">
		<select
			aria-label="กรองสัตว์เลี้ยง" bind:value={filterPet}
			class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white text-gray-700"
		>
			<option value="ทั้งหมด">ทั้งหมด</option>{#each pets as pet}<option value={pet.id}>{pet.name}</option>{/each}
		</select>

		<select
			bind:value={filterType}
			class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white text-gray-700"
		>
			{#each recordTypes as type}
				<option value={type}>{type}</option>
			{/each}
		</select>
	</div>

	<!-- Health Records Table -->
	<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up overflow-hidden">
		<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users must be able to scroll this region.) -->
			<div class="table-scroll" tabindex="0" role="region" aria-label="ตารางข้อมูล เลื่อนซ้ายขวาเพื่อดูเพิ่มเติม">
			<table class="w-full">
				<thead>
					<tr class="border-b border-gray-200 bg-gray-50/50">
						<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">สัตว์เลี้ยง</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">ประเภท</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">รายละเอียด</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">สถานพยาบาล</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">วันที่</th>
						<th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">ค่าใช้จ่าย</th>
						<th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">จัดการ</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredRecords as record}
						{@const pet = pets.find(p => p.id === record.petId)}
						<tr class="border-b border-gray-100 transition-colors hover:bg-gray-50">
							<td class="px-6 py-4">
								<div class="flex items-center gap-2">
									<PetAvatar image={pet?.image} name={pet?.name} />
									<span class="text-sm font-medium text-gray-800">{pet?.name}</span>
								</div>
							</td>
							<td class="px-6 py-4">
								<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {record.type === 'วัคซีน' ? 'bg-blue-100 text-blue-700' : record.type === 'ตรวจสุขภาพ' ? 'bg-green-100 text-green-700' : record.type === 'ทันตกรรม' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}">
									{record.type}
								</span>
							</td>
							<td class="px-6 py-4 text-sm text-gray-700 max-w-xs break-words"><strong>{record.title}</strong><p>{record.description || '-'}</p></td>
							<td class="px-6 py-4 text-sm text-gray-500">{record.vet}</td>
							<td class="px-6 py-4 text-sm text-gray-500">{record.date}</td>
							<td class="px-6 py-4 text-right text-sm font-medium text-gray-800">฿{record.cost.toLocaleString()}</td>
							<td class="px-6 py-4 text-right text-sm font-medium">
								<button disabled={pet?.readOnly} aria-label="แก้ไขประวัติ {record.title}" onclick={() => editRecord(record)} class="mr-3 text-brand-600 disabled:opacity-40">แก้ไข</button>
								<button disabled={pet?.readOnly} aria-label="ลบประวัติ {record.title}" onclick={() => handleDelete(record.id)} class="text-red-500 hover:text-red-700 transition-colors">
									<svg class="w-5 h-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

{#if showAddModal}
	<div use:modal class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-md">
		<div class="my-auto w-full max-w-md rounded-3xl glass-heavy p-5 shadow-xl animate-fade-up sm:p-8">
			<h2 class="text-xl font-bold text-gray-800 mb-4">{editId ? 'แก้ไขบันทึกสุขภาพ' : 'เพิ่มบันทึกสุขภาพ'}</h2>
            {#if error}<p role="alert" class="mb-3 text-red-600">{error}</p>{/if}
			<form onsubmit={(e) => { e.preventDefault(); handleAdd(); }} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="petId">สัตว์เลี้ยง</label>
					<select id="petId" bind:value={formData.petId} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
						{#each editablePets as pet}
							<option value={pet.id}>{pet.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="type">ประเภท</label>
					<select id="type" bind:value={formData.type} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
						{#each formTypes as type}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="title">หัวข้อ</label>
					<input type="text" id="title" bind:value={formData.title} required class="w-full rounded-2xl border-2 {titleError ? 'border-red-400 focus:border-red-400 focus:ring-red-100/50' : 'border-transparent focus:border-brand-400 focus:ring-brand-100/50'} bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:bg-white hover:bg-white text-gray-700" />
					{#if titleError}<p class="mt-1 text-xs text-red-500">{titleError}</p>{/if}
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="description">รายละเอียด</label>
					<textarea id="description" bind:value={formData.description} class="w-full rounded-2xl border-2 {descriptionError ? 'border-red-400 focus:border-red-400 focus:ring-red-100/50' : 'border-transparent focus:border-brand-400 focus:ring-brand-100/50'} bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:bg-white hover:bg-white text-gray-700"></textarea>
					{#if descriptionError}<p class="mt-1 text-xs text-red-500">{descriptionError}</p>{/if}
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="date">วันที่</label>
					<input type="date" id="date" max={localDate()} bind:value={formData.date} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="provider">สถานพยาบาล</label>
					<input type="text" id="provider" bind:value={formData.provider} class="w-full rounded-2xl border-2 {providerError ? 'border-red-400 focus:border-red-400 focus:ring-red-100/50' : 'border-transparent focus:border-brand-400 focus:ring-brand-100/50'} bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:bg-white hover:bg-white text-gray-700" />
					{#if providerError}<p class="mt-1 text-xs text-red-500">{providerError}</p>{/if}
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="cost">ค่าใช้จ่าย (บาท)</label>
					<input type="number" id="cost" bind:value={formData.cost} min="0" step="0.01" max="99999999.99" required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
				</div>
				<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<button type="button" onclick={() => showAddModal = false} class="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
						ยกเลิก
					</button>
					<button type="submit" disabled={saving || !healthFormValid} class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg">
						บันทึก
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
