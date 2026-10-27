<script lang="ts">
	import { modal } from '$lib/actions/modal';
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { ApiError, api, request } from '$lib/api';
	import { localDate, localTime, futureTime } from '$lib/validation';
	import ProductCards from '$lib/components/ProductCards.svelte';
	let editId = $state('');
	let success = $state('');
	let saving = $state(false);
	let snoozeError = $state('');
	let description = $state('');
	let detailReminder = $state<any>(null);
	let pets = $state<any[]>([]);
	let loading = $state(true);
	let reminders = $state<any[]>([]);
	let error = $state('');
	let title = $state('');
	let date = $state('');
	let time = $state('09:00');
	let notice = $state('0');
	let productUrl = $state('');

	let showSnoozeModal = $state(false);
	let snoozeId = $state('');
	let snoozeDate = $state('');
	let snoozeTime = $state('');

	let activeTab = $state('list');
	let filterPet = $state('ทั้งหมด');
	let filterStatus = $state('ทั้งหมด');

	let petNames = $derived(['ทั้งหมด', ...pets.map((p) => p.name)]);
	const statusOptions = ['ทั้งหมด', 'active', 'overdue', 'completed', 'snoozed'];
	const reminderTypes = ['วัคซีน', 'ออกกำลังกาย', 'ตรวจสุขภาพ', 'อาหาร', 'ทำความสะอาด', 'ป้องกันเห็บหมัด', 'ยา'];

	let selectedPet = $state('');
	let selectedType = $state(reminderTypes[0]);
	let repeat = $state('ไม่ซ้ำ');

	let filteredReminders = $derived(
		reminders.filter((reminder) => {
			const matchesPet = filterPet === 'ทั้งหมด' || reminder.petName === filterPet;
			const matchesStatus = filterStatus === 'ทั้งหมด' || reminder.status === filterStatus;
			return matchesPet && matchesStatus;
		})
	);

	let todayStr = new Date().toLocaleDateString('th-TH');
	let todayCount = $derived(
		reminders.filter((r) => r.status === 'active' && r.date === todayStr).length
	);

	function statusLabel(status: string) {
		if (status === 'overdue') return 'เกินกำหนด';
        if (status === 'completed') return 'เสร็จแล้ว';
		if (status === 'snoozed') return 'เลื่อนเตือน';
		return 'กำลังใช้งาน';
	}

	async function loadReminders() {
		try {
			const [petResult, reminderResult] = await Promise.all([api<{ pets: any[] }>('/api/pets'), api<{ reminders: any[] }>('/api/reminders')]);
			pets = petResult.pets.map((pet) => ({ ...pet, id: String(pet.id) }));
			if (!selectedPet && pets.length) selectedPet = pets.find(p => !p.readOnly)?.id || '';
			reminders = reminderResult.reminders.map((item) => { const when = item.scheduledAt ? new Date(item.scheduledAt) : null; return { ...item, id: String(item.id), petId: String(item.petId), date: when ? when.toLocaleDateString('th-TH') : '-', time: when ? when.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-', repeat: item.recurrenceDays ? `ทุก ${item.recurrenceDays} วัน` : 'ไม่ซ้ำ', status: item.status === 'DONE' ? 'completed' : item.overdue ? 'overdue' : item.snoozedUntil ? 'snoozed' : 'active' }; });
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดการแจ้งเตือนได้'; }
		finally { loading = false; }
	}

	async function createReminder() {
		if (saving) return;
		error = ''; success = '';
		if (!selectedPet || !title.trim() || !date || !time) { error = 'กรอกสัตว์เลี้ยง หัวข้อ และวันเวลาให้ครบถ้วน'; return; }
		const when = futureTime(date, time);
		if (!when) { error = 'ไม่สามารถเลือกวัน/เวลาที่ผ่านมาแล้วได้'; return; }
		saving = true;
		try {
			const recurrenceDays = repeat.includes('ทุกวัน') ? 1 : repeat.includes('สัปดาห์') ? 7 : repeat.includes('เดือน') ? 30 : repeat.includes('ปี') ? 365 : repeat.startsWith('ทุก ') ? Number(repeat.split(' ')[1]) : null;
			await request(editId ? `/api/reminders/${editId}` : '/api/reminders', editId ? 'PATCH' : 'POST', { petId: Number(selectedPet), type: selectedType, title: title.trim(), description, scheduledAt: when.toISOString(), reminderMinutes: Number(notice), recurrenceDays, productUrl: productUrl.trim() });
			success = editId ? 'แก้ไขรายการแจ้งเตือนเรียบร้อยแล้ว' : 'สร้างการแจ้งเตือนเรียบร้อยแล้ว';
			editId = ''; title = ''; date = ''; productUrl = ''; description = ''; activeTab = 'list'; await loadReminders();
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถสร้างการแจ้งเตือนได้'; }
		finally { saving = false; }
	}

	function openCreate() {
		editId = ''; title = ''; date = ''; time = '09:00'; repeat = 'ไม่ซ้ำ'; notice = '0'; productUrl = ''; description = ''; error = ''; success = ''; activeTab = 'create';
	}

	function openEdit(reminder: any) {
		editId = reminder.id; selectedPet = reminder.petId; selectedType = reminder.type;
		title = reminder.title; description = reminder.description || ''; productUrl = reminder.productUrl || '';
		const when = new Date(reminder.scheduledAt);
		date = localDate(when); time = localTime(when);
		const repeats: Record<number, string> = { 1: 'ทุกวัน', 7: 'รายสัปดาห์', 30: 'รายเดือน', 365: 'รายปี' };
		repeat = reminder.recurrenceDays ? repeats[reminder.recurrenceDays] || `ทุก ${reminder.recurrenceDays} วัน` : 'ไม่ซ้ำ';
		notice = String(reminder.reminderMinutes || 0); error = ''; success = ''; activeTab = 'create';
	}

	async function markDone(id: string) { try { await request(`/api/reminders/${id}/done`, 'POST'); await loadReminders(); } catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถบันทึกรายการได้'; } }
	
	function openSnooze(id: string) {
		snoozeId = id;
		const next = new Date(Date.now() + 3_600_000);
		snoozeDate = localDate(next);
		snoozeTime = localTime(next);
		snoozeError = '';
		showSnoozeModal = true;
	}

	async function confirmSnooze() {
		snoozeError = '';
		if (!snoozeDate || !snoozeTime) { snoozeError = 'กรุณากรอกวันและเวลาใหม่ให้ครบถ้วน'; return; }
		const when = futureTime(snoozeDate, snoozeTime);
		if (!when) { snoozeError = 'ไม่สามารถเลื่อนการแจ้งเตือนไปยังวัน/เวลาที่ผ่านไปแล้วได้'; return; }
		try {
			await request(`/api/reminders/${snoozeId}/snooze`, 'POST', { scheduledAt: when.toISOString() });
			showSnoozeModal = false;
			error = ''; success = 'เลื่อนการแจ้งเตือนเรียบร้อยแล้ว';
			await loadReminders();
		} catch (err) { snoozeError = err instanceof ApiError ? err.message : 'ไม่สามารถเลื่อนการแจ้งเตือนได้'; }
	}

	async function handleDelete(id: string) {
		if (!confirm('ยืนยันการลบการแจ้งเตือนนี้?')) return;
		try {
			await request(`/api/reminders/${id}`, 'DELETE');
			await loadReminders();
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถลบข้อมูลได้'; }
	}

	onMount(() => {
        void loadReminders();
        const timer = window.setInterval(() => {
            reminders = reminders.map(r => ['active', 'snoozed'].includes(r.status) && new Date(r.scheduledAt).valueOf() < Date.now() ? { ...r, status: 'overdue' } : r);
        }, 1000);
        return () => clearInterval(timer);
    });
    let permissionMessage = $state('');
    async function enableNotifications() {
        if (!('Notification' in window)) { permissionMessage = 'เบราว์เซอร์นี้ใช้การแจ้งเตือนภายในเว็บได้'; return; }
        try { permissionMessage = await Notification.requestPermission() === 'granted' ? 'เปิดการแจ้งเตือนแล้วเมื่อเปิดเว็บอยู่' : 'ยังใช้การแจ้งเตือนภายในเว็บได้ตามปกติ'; }
        catch { permissionMessage = 'ยังใช้การแจ้งเตือนภายในเว็บได้ตามปกติ'; }
    }
</script>

<svelte:head>
	<title>การแจ้งเตือน | HoangHoang Meow</title>
</svelte:head>

<TopNav title="การแจ้งเตือน" subtitle="จัดการนัดหมายและกิจวัตรของสัตว์เลี้ยง" />

<div class="space-y-6 p-4 animate-fade-in stagger-1 sm:p-6 lg:p-8">
	{#if error}<p role="alert" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}
	<div class="rounded-xl bg-blue-50 p-3 text-sm text-blue-800"><p>แจ้งเตือนตามเวลาเมื่อเปิดเว็บอยู่ รายการค้างจะยังแสดงจนกว่าคุณจะทำแล้ว เลื่อนเวลา หรือลบ</p><button class="mt-2 underline" onclick={enableNotifications}>เปิดการแจ้งเตือนของเบราว์เซอร์</button>{#if permissionMessage}<p role="status">{permissionMessage}</p>{/if}</div>
    {#if success}<p role="status" class="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>{/if}
	{#if !pets.length}<p>กรุณา <a class="text-brand-600 underline" href="/pets">เพิ่มสัตว์เลี้ยงตัวแรก</a> ก่อนสร้างการแจ้งเตือน</p>{/if}
	<div class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
			<button
				onclick={() => (activeTab = 'list')}
				class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors {activeTab === 'list'
					? 'bg-brand-500 text-white shadow-sm'
					: 'text-gray-600 hover:text-gray-900'}"
			>
				รายการแจ้งเตือน
			</button>
			<button
				onclick={openCreate}
				disabled={loading}
				class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors {activeTab === 'create'
					? 'bg-brand-500 text-white shadow-sm'
					: 'text-gray-600 hover:text-gray-900'}"
			>
				สร้างการแจ้งเตือน
			</button>
		</div>

		<button
			onclick={openCreate}
			disabled={loading}
			class="inline-flex items-center justify-center gap-2 relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group"
		>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
			สร้างการแจ้งเตือน
		</button>
	</div>

	{#if activeTab === 'list'}
		<ProductCards location="REMINDERS" petId={pets.find((pet) => pet.name === filterPet)?.id || ''} />
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-5">
				<p class="text-sm text-gray-500">ทั้งหมด</p>
				<p class="mt-1 text-2xl font-bold text-gray-800">{reminders.length} รายการ</p>
			</div>
			<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-5">
				<p class="text-sm text-gray-500">กำลังใช้งาน</p>
				<p class="mt-1 text-2xl font-bold text-emerald-600">
					{reminders.filter((r) => r.status === 'active').length} รายการ
				</p>
			</div>
			<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-5">
				<p class="text-sm text-gray-500">วันนี้</p>
				<p class="mt-1 text-2xl font-bold text-brand-500">{todayCount} รายการ</p>
			</div>
		</div>

		<div class="flex flex-wrap gap-3">
			<select
				bind:value={filterPet}
				class="w-full max-w-[200px] rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"
			>
				{#each petNames as name}
					<option value={name}>{name}</option>
				{/each}
			</select>
			<select
				bind:value={filterStatus}
				class="w-full max-w-[200px] rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"
			>
				{#each statusOptions as status}
					<option value={status}>{status === 'ทั้งหมด' ? status : statusLabel(status)}</option>
				{/each}
			</select>
		</div>

		<div class="overflow-hidden rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up">
			<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users must be able to scroll this region.) -->
			<div class="table-scroll" tabindex="0" role="region" aria-label="ตารางข้อมูล เลื่อนซ้ายขวาเพื่อดูเพิ่มเติม">
				<table class="w-full">
					<thead>
						<tr class="border-b border-gray-200 bg-gray-50/70">
							<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">วันเวลา</th>
							<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">การแจ้งเตือน</th>
							<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">สัตว์เลี้ยง</th>
							<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">ทำซ้ำ</th>
							<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">สถานะ</th>
							<th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">จัดการ</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredReminders as reminder}
							{@const pet = pets.find((p) => p.id === reminder.petId)}
							<tr class="border-b border-gray-100 transition-colors hover:bg-brand-50/40">
								<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
									<div class="font-medium text-gray-800">{reminder.date}</div>
									<div class="text-xs text-gray-400">{reminder.time}</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm font-semibold text-gray-800">{reminder.title}</div>
									<div class="mt-1 max-w-md truncate text-xs text-gray-500">{reminder.description}</div>
									{#if reminder.productUrl}
										<a href={reminder.productUrl} target="_blank" rel="noopener noreferrer" class="mt-1 inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600">
											<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
											ลิงก์สินค้า
										</a>
									{/if}
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center gap-2 text-sm font-medium text-gray-700">
										<span class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-500">
											<Icon name={pet?.species === 'หมา' ? 'dog' : 'cat'} class="w-5 h-5" />
										</span>
										{reminder.petName}
									</div>
								</td>
								<td class="px-6 py-4 text-sm text-gray-500">{reminder.repeat}</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold {reminder.status === 'active'
											? 'bg-emerald-100 text-emerald-700'
											: reminder.status === 'completed'
												? 'bg-gray-100 text-gray-600'
												: 'bg-amber-100 text-amber-700'}"
									>
										{statusLabel(reminder.status)}
									</span>
								</td>
								<td class="px-6 py-4 text-right">
									<div class="flex items-center justify-end gap-2">
										<button onclick={() => detailReminder = reminder} class="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">รายละเอียด</button>
										{#if ['active', 'snoozed', 'overdue'].includes(reminder.status) && !pets.find(p => p.id === reminder.petId)?.readOnly}
											<button onclick={() => openEdit(reminder)} class="rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">แก้ไข</button>
											<button onclick={() => markDone(reminder.id)} class="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">ทำแล้ว</button>
											<button onclick={() => openSnooze(reminder.id)} class="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100">เลื่อน</button>
										{/if}
										<button aria-label="ลบการแจ้งเตือน" onclick={() => handleDelete(reminder.id)} class="text-red-500 hover:text-red-700 transition-colors p-1">
											<svg class="w-5 h-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else}
		<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-6">
			<h2 class="text-lg font-bold text-gray-800">{editId ? 'แก้ไขรายการแจ้งเตือน' : 'สร้างการแจ้งเตือน'}</h2>
			<form novalidate class="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2" onsubmit={(e) => { e.preventDefault(); createReminder(); }}>
				<div>
					<label for="reminder-pet" class="mb-1.5 block text-sm font-medium text-gray-700">เลือกสัตว์เลี้ยง</label>
					<select id="reminder-pet" bind:value={selectedPet} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
						{#each pets as pet}
							<option value={pet.id}>{pet.name} ({pet.species})</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="reminder-type" class="mb-1.5 block text-sm font-medium text-gray-700">ประเภทการแจ้งเตือน</label>
					<select id="reminder-type" bind:value={selectedType} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
						{#each reminderTypes as type}
							<option>{type}</option>
						{/each}
					</select>
				</div>
				<div class="lg:col-span-2">
					<label for="reminder-title" class="mb-1.5 block text-sm font-medium text-gray-700">หัวข้อ</label>
					<input id="reminder-title" required bind:value={title} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" placeholder="เช่น ฉีดวัคซีนประจำปี" />
				</div>
				<div>
					<label for="reminder-date" class="mb-1.5 block text-sm font-medium text-gray-700">วันที่</label>
					<input id="reminder-date" required type="date" bind:value={date} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
				</div>
				<div>
					<label for="reminder-time" class="mb-1.5 block text-sm font-medium text-gray-700">เวลา</label>
					<input id="reminder-time" required type="time" bind:value={time} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
				</div>
				<div>
					<label for="reminder-repeat" class="mb-1.5 block text-sm font-medium text-gray-700">ทำซ้ำ</label>
					<select id="reminder-repeat" bind:value={repeat} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
						<option>ไม่ซ้ำ</option>
						<option>ทุกวัน</option>
						<option>รายสัปดาห์</option>
						<option>รายเดือน</option>
						<option>รายปี</option>
						{#if repeat.startsWith('ทุก ')}<option>{repeat}</option>{/if}
					</select>
				</div>
				<div>
					<label for="reminder-notice" class="mb-1.5 block text-sm font-medium text-gray-700">แจ้งเตือนล่วงหน้า</label>
					<select id="reminder-notice" bind:value={notice} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
						<option value="0">ตรงเวลา</option>
						<option value="15">15 นาที</option>
						<option value="60">1 ชั่วโมง</option>
						<option value="1440">1 วัน</option>
						{#if !['0', '15', '60', '1440'].includes(notice)}<option value={notice}>{notice} นาที</option>{/if}
					</select>
				</div>
				<div class="lg:col-span-2">
					<label for="reminder-productUrl" class="mb-1.5 block text-sm font-medium text-gray-700">ลิงก์สินค้า (ถ้ามี)</label>
					<input id="reminder-productUrl" bind:value={productUrl} type="url" class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" placeholder="https://..." />
				</div>
				<div class="flex justify-end gap-3 lg:col-span-2">
					<button type="button" onclick={() => (activeTab = 'list')} class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
						ยกเลิก
					</button>
					<button type="submit" disabled={saving || !pets.length} class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group disabled:opacity-50">
						บันทึก
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>

{#if detailReminder}
	<div use:modal class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-md">
		<div role="dialog" tabindex="-1" aria-modal="true" aria-label="รายละเอียดการแจ้งเตือน" class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
			<h2 class="text-xl font-bold">{detailReminder.title}</h2>
			<p class="mt-2">{detailReminder.petName} · {detailReminder.type}</p>
			<p>{detailReminder.date} {detailReminder.time} · {detailReminder.repeat}</p>
			<p class="mt-2 whitespace-pre-wrap">{detailReminder.description}</p>
			<ProductCards location="REMINDERS" petId={detailReminder.petId} topic={detailReminder.type} />
			<button onclick={() => detailReminder = null} class="mt-4 rounded-xl bg-brand-500 px-5 py-2 text-white">ปิด</button>
		</div>
	</div>
{/if}

{#if showSnoozeModal}
	<div use:modal class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4">
		<div class="w-full max-w-sm rounded-3xl glass-heavy p-8 shadow-xl">
			<h2 class="text-xl font-bold text-gray-800 mb-4">เลื่อนการแจ้งเตือน</h2>
			{#if snoozeError}<p role="alert" class="mb-4 text-sm text-red-600">{snoozeError}</p>{/if}
			<form novalidate onsubmit={(e) => { e.preventDefault(); confirmSnooze(); }} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="snoozeDate">วันที่</label>
					<input type="date" id="snoozeDate" bind:value={snoozeDate} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="snoozeTime">เวลา</label>
					<input type="time" id="snoozeTime" bind:value={snoozeTime} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white" />
				</div>
				<div class="mt-6 flex justify-end gap-3">
					<button type="button" onclick={() => showSnoozeModal = false} class="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
						ยกเลิก
					</button>
					<button type="submit" class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group">
						ยืนยันเลื่อน
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
