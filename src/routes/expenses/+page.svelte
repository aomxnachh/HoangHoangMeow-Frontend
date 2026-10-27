<script lang="ts">
	import { modal } from '$lib/actions/modal';
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import PetAvatar from '$lib/components/PetAvatar.svelte';
	import { ApiError, api, request } from '$lib/api';
	import { localDate } from '$lib/validation';
	let expenses = $state<any[]>([]);
	let pets = $state<any[]>([]);
	let period = $state('all');
    let selectedYear = $state(String(new Date().getFullYear()));
    let selectedMonth = $state(String(new Date().getMonth() + 1).padStart(2, '0'));
    let years = $derived([...new Set([String(new Date().getFullYear()), ...expenses.map(e => e.date.slice(0, 4))])].sort().reverse());
    let expenseSummary = $derived.by(() => {
        const rows = filteredExpenses;
        const categories = new Map<string, number>();
        const months = new Map<string, number>();
        for (const row of rows) {
            categories.set(row.category, (categories.get(row.category) || 0) + row.amount);
            months.set(row.date.slice(0, 7), (months.get(row.date.slice(0, 7)) || 0) + row.amount);
        }
        const total = rows.reduce((sum, row) => sum + row.amount, 0);
        return { totalThisMonth: total, averagePerMonth: months.size ? Math.round(total / months.size * 100) / 100 : 0, byCategory: [...categories].map(([category, amount]) => ({ category, amount, percentage: total ? Math.round(amount / total * 100) : 0 })), monthlyTrend: [...months].sort(([a], [b]) => a.localeCompare(b)).map(([month, amount]) => ({ month, amount })) };
    });
	let loading = $state(true);
	let error = $state('');

	let filterPet = $state('ทั้งหมด');
	let filterCategory = $state('ทั้งหมด');

	let showAddModal = $state(false);
	let formData = $state({ petId: '', category: 'อาหาร', description: '', date: '', amount: '' });
	const formCategories = ['อาหาร', 'สุขภาพ', 'ของใช้', 'ความสวยงาม', 'อื่นๆ'];

	// --- Special character validation ---
	const specialCharRegex = /[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?`~]/;
	function hasSpecialChars(value: string): boolean {
		return specialCharRegex.test(value);
	}
	let descriptionError = $derived(hasSpecialChars(formData.description) ? 'ห้ามใช้อักขระพิเศษ เช่น @#$%^&*' : '');
	let expenseFormValid = $derived(!descriptionError);

	let editablePets = $derived(pets.filter(p => !p.readOnly));
	let categories = $derived(['ทั้งหมด', ...new Set(expenses.map((e) => e.category))]);

	let topCategory = $derived(() => {
		const counts: Record<string, number> = {};
		for (const e of filteredExpenses) counts[e.category] = (counts[e.category] || 0) + e.amount;
		const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
		return sorted.length ? sorted[0][0] : '-';
	});

	let estimatePetId = $state('');
	let estimates = $state<any[] | null>(null);
	let estimateError = $state('');

	async function loadEstimates() {
		if (!estimatePetId) return;
		try {
			estimateError = '';
			const result = await api<{ estimates: any[] }>(`/api/expenses/estimate?petId=${estimatePetId}`);
			estimates = result.estimates;
		} catch (err) {
			estimateError = err instanceof ApiError ? err.message : 'ไม่สามารถประเมินค่ารักษาได้';
		}
	}

	function openModal() {
		formData = { petId: editablePets[0]?.id || '', category: 'อาหาร', description: '', date: '', amount: '' };
		showAddModal = true;
	}

	async function handleAdd() {
		error = '';
		if (!formData.description.trim() || !expenseFormValid) { error = 'กรุณากรอกรายละเอียดโดยไม่ใช้อักขระพิเศษ'; return; }
		if (!formData.date || formData.date > localDate()) { error = 'กรุณากรอกวันที่ถูกต้องและไม่เกินวันนี้'; return; }
		if (formData.amount === '' || formData.amount == null || !Number.isFinite(Number(formData.amount)) || Number(formData.amount) < 0) { error = 'กรุณากรอกจำนวนเงินที่ถูกต้อง'; return; }
		try {
			await request('/api/expenses', 'POST', { ...formData, petId: Number(formData.petId), amount: Number(formData.amount) });
			showAddModal = false;
			await loadExpenses();
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถบันทึกข้อมูลได้'; }
	}

	async function handleDelete(id: string) {
		if (!confirm('ยืนยันการลบรายการนี้?')) return;
		try {
			await request(`/api/expenses/${id}`, 'DELETE');
			await loadExpenses();
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถลบข้อมูลได้'; }
	}

	let filteredExpenses = $derived(
		expenses.filter((e) => {
			let pet = pets.find((p) => p.id === e.petId);
			let matchesPet = filterPet === 'ทั้งหมด' || e.petId === filterPet;
			let matchesCategory = filterCategory === 'ทั้งหมด' || e.category === filterCategory;
			const matchesPeriod = period === 'all' || (e.date.startsWith(selectedYear) && (period === 'year' || e.date.startsWith(`${selectedYear}-${selectedMonth}`)));
            return matchesPet && matchesCategory && matchesPeriod;
		})
	);

	let filteredTotal = $derived(filteredExpenses.reduce((sum, e) => sum + e.amount, 0));

	async function loadExpenses() {
		try {
			const [expenseResult, petResult] = await Promise.all([api<{ expenses: any[] }>('/api/expenses'), api<{ pets: any[] }>('/api/pets')]);
			pets = petResult.pets.map((pet) => ({ ...pet, id: String(pet.id) }));
			expenses = expenseResult.expenses.map((expense) => ({ ...expense, petId: String(expense.petId), amount: Number(expense.amount), description: expense.description || '-' }));
			const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดค่าใช้จ่ายได้'; }
		finally { loading = false; }
	}
	onMount(loadExpenses);
</script>

<svelte:head>
	<title>ค่าใช้จ่าย | HoangHoang Meow</title>
</svelte:head>

<TopNav title="ค่าใช้จ่าย" subtitle="ติดตามค่าใช้จ่ายในการดูแลสัตว์เลี้ยง" />

<div class="p-4 space-y-6 animate-fade-in stagger-1 sm:p-6 lg:p-8">
	<div class="flex items-center justify-between gap-3">
		<h1 class="text-2xl font-bold text-gray-800 hidden sm:block">ค่าใช้จ่าย</h1>
		<button onclick={openModal} disabled={loading || !editablePets.length} class="relative ml-auto whitespace-nowrap overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group sm:px-6 disabled:opacity-50">
			+ เพิ่มรายจ่าย
		</button>
	</div>

	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}
	<div class="flex flex-wrap gap-3 rounded-xl bg-white p-4">
        <label>ช่วงเวลา<select aria-label="ช่วงเวลาค่าใช้จ่าย" bind:value={period} class="ml-2 rounded-lg border p-2"><option value="all">ทั้งหมด</option><option value="month">รายเดือน</option><option value="year">รายปี</option></select></label>
        {#if period !== 'all'}<label>ปี<select aria-label="ปีค่าใช้จ่าย" bind:value={selectedYear} class="ml-2 rounded-lg border p-2">{#each years as year}<option value={year}>{Number(year) + 543}</option>{/each}</select></label>{/if}
        {#if period === 'month'}<label>เดือน<select aria-label="เดือนค่าใช้จ่าย" bind:value={selectedMonth} class="ml-2 rounded-lg border p-2">{#each Array.from({ length: 12 }, (_, i) => i + 1) as month}<option value={String(month).padStart(2, '0')}>{new Date(2000, month - 1).toLocaleString('th-TH', { month: 'long' })}</option>{/each}</select></label>{/if}
    </div>
    <!-- Stats -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
		<StatCard label="ค่าใช้จ่ายตามช่วงที่เลือก" value="฿{expenseSummary.totalThisMonth.toLocaleString()}" icon="money" color="rose" />
		<StatCard label="ค่าเฉลี่ยต่อเดือน" value="฿{expenseSummary.averagePerMonth.toLocaleString()}" icon="trending" color="blue" />
		<StatCard label="รายการทั้งหมด" value={filteredExpenses.length} icon="receipt" color="indigo" />
		<StatCard label="หมวดหมู่มากที่สุด" value={topCategory()} icon="heart" color="amber" />
	</div>

	<!-- Chart + Category Summary -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Monthly Trend -->
		<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-6 lg:col-span-2">
			<h2 class="text-base font-bold text-gray-800">แนวโน้มค่าใช้จ่ายรายเดือน</h2>
			<div class="overflow-x-auto pb-8"><div class="mt-8 flex h-60 items-end justify-between gap-2 px-2 w-full relative border-l border-b border-gray-100 pb-2">
				{#if expenseSummary?.monthlyTrend?.length > 0}
					<!-- Grid lines -->
					<div class="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none">
						{#each [1, 2, 3, 4] as _}
							<div class="w-full border-t border-dashed border-gray-200/60"></div>
						{/each}
					</div>

					{#each expenseSummary.monthlyTrend as month}
						{@const maxAmount = Math.max(...expenseSummary.monthlyTrend.map((m: any) => m.amount), 5000)}
						{@const heightPercent = Math.max((month.amount / maxAmount) * 100, 2)}
						<div class="group relative min-w-12 flex flex-1 flex-col items-center justify-end h-full z-10">
							<!-- Tooltip -->
							<div class="absolute -top-12 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 pointer-events-none z-20">
								<div class="bg-gray-900 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap">
									฿{month.amount.toLocaleString()}
								</div>
								<div class="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1"></div>
							</div>
							
							<!-- Bar -->
							<div
								class="w-full max-w-[48px] rounded-t-xl transition-all duration-700 ease-out bg-gradient-to-t from-rose-400/20 to-rose-500 hover:to-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer"
								style="height: {heightPercent}%;"
							></div>
							
							<!-- Label -->
							<span class="text-xs font-medium text-gray-500 mt-3 absolute -bottom-7">{month.month}</span>
						</div>
					{/each}
				{:else}
					<div class="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
						<svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
						<span class="text-sm">ยังไม่มีข้อมูลค่าใช้จ่าย</span>
					</div>
				{/if}
			</div>
		</div>

        </div>
		<!-- By Category -->
		<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-6">
			<h2 class="text-base font-bold text-gray-800 mb-4">ตามหมวดหมู่</h2>
			<div class="space-y-4">
				{#each expenseSummary.byCategory as cat}
					<div>
						<div class="flex items-center justify-between text-sm mb-1">
							<span class="text-gray-600">{cat.category}</span>
							<span class="text-xs text-gray-400">{cat.percentage}%</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
								<div
									class="h-full rounded-full transition-all duration-500 {cat.category === 'อาหาร' ? 'bg-brand-500' : cat.category === 'วัคซีน' ? 'bg-blue-500' : cat.category === 'ทันตกรรม' ? 'bg-amber-500' : 'bg-purple-400'}"
									style="width: {cat.percentage}%"
								></div>
							</div>
							<span class="text-sm font-medium text-gray-700 whitespace-nowrap">฿{cat.amount.toLocaleString()}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex flex-wrap gap-3">
			<select
				aria-label="กรองสัตว์เลี้ยง" bind:value={filterPet}
				class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white text-gray-700"
			>
				<option value="ทั้งหมด">ทั้งหมด</option>{#each pets as pet}<option value={pet.id}>{pet.name}</option>{/each}
			</select>

			<select
				bind:value={filterCategory}
				class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white text-gray-700"
			>
				{#each categories as cat}
					<option value={cat}>{cat}</option>
				{/each}
			</select>
		</div>

		<p class="text-sm text-gray-500">
			รวม: <span class="font-semibold text-gray-800">฿{filteredTotal.toLocaleString()}</span>
		</p>
	</div>

	<!-- Expense Table -->
	<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up overflow-hidden">
		<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users must be able to scroll this region.) -->
			<div class="table-scroll" tabindex="0" role="region" aria-label="ตารางข้อมูล เลื่อนซ้ายขวาเพื่อดูเพิ่มเติม">
			<table class="w-full">
				<thead>
					<tr class="border-b border-gray-200 bg-gray-50/50">
						<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">สัตว์เลี้ยง</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">หมวดหมู่</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">รายละเอียด</th>
						<th class="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">วันที่</th>
						<th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">จำนวนเงิน</th>
						<th class="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">จัดการ</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredExpenses as expense}
						{@const pet = pets.find(p => p.id === expense.petId)}
						<tr class="border-b border-gray-100 transition-colors hover:bg-gray-50">
							<td class="px-6 py-4">
								<div class="flex items-center gap-2">
									<PetAvatar image={pet?.image} name={pet?.name} />
									<span class="text-sm font-medium text-gray-800">{pet?.name}</span>
								</div>
							</td>
							<td class="px-6 py-4">
								<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {expense.category === 'อาหาร' ? 'bg-brand-100 text-brand-700' : expense.category === 'วัคซีน' ? 'bg-blue-100 text-blue-700' : expense.category === 'ทันตกรรม' ? 'bg-amber-100 text-amber-700' : expense.category === 'ตรวจสุขภาพ' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
									{expense.category}
								</span>
							</td>
							<td class="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{expense.description}</td>
							<td class="px-6 py-4 text-sm text-gray-500">{expense.date}</td>
							<td class="px-6 py-4 text-right text-sm font-semibold text-gray-800">฿{expense.amount.toLocaleString()}</td>
							<td class="px-6 py-4 text-right text-sm font-medium">
								<button onclick={() => handleDelete(expense.id)} class="text-red-500 hover:text-red-700 transition-colors">
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

	<!-- Estimate Section -->
	<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-6">
		<h2 class="text-lg font-bold text-gray-800 mb-4">ประเมินค่ารักษาประจำปี</h2>
		<div class="flex flex-wrap gap-4 items-end">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1" for="estimatePet">เลือกสัตว์เลี้ยง</label>
				<select id="estimatePet" bind:value={estimatePetId} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white text-gray-700">
					<option value="" disabled selected>เลือก...</option>
					{#each pets as pet}
						<option value={pet.id}>{pet.name}</option>
					{/each}
				</select>
			</div>
			<button onclick={loadEstimates} disabled={!estimatePetId} class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed">
				ประเมิน
			</button>
		</div>
		{#if estimateError}
			<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{estimateError}</p>
		{/if}
		{#if estimates}
			<div class="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{#each estimates as est}
					<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-4">
						<h3 class="font-bold text-gray-800">{est.name}</h3>
						<p class="text-sm text-gray-500 mt-1">{est.description}</p>
						<p class="mt-2 text-lg font-bold text-rose-600">฿{est.cost.toLocaleString()}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

{#if showAddModal}
	<div use:modal class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4 backdrop-blur-md animate-fade-in">
		<div class="my-auto w-full max-w-md rounded-3xl glass-heavy p-5 shadow-xl sm:p-8">
			<h2 class="text-xl font-bold text-gray-800 mb-4">เพิ่มรายจ่าย</h2>
			{#if error}<p role="alert" class="mb-4 text-sm text-red-600">{error}</p>{/if}
			<form onsubmit={(e) => { e.preventDefault(); handleAdd(); }} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="petId">สัตว์เลี้ยง</label>
					<select id="petId" bind:value={formData.petId} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white text-gray-700">
						{#each pets as pet}
							<option value={pet.id} disabled={pet.readOnly}>{pet.name}{pet.readOnly ? ' (ดูข้อมูลเท่านั้น)' : ''}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="category">หมวดหมู่</label>
					<select id="category" bind:value={formData.category} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white text-gray-700">
						{#each formCategories as cat}
							<option value={cat}>{cat}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="description">รายละเอียด</label>
					<input type="text" id="description" bind:value={formData.description} required class="w-full rounded-2xl border-2 {descriptionError ? 'border-red-400 focus:border-red-400 focus:ring-red-100/50' : 'border-transparent focus:border-brand-400 focus:ring-brand-100/50'} bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:bg-white hover:bg-white text-gray-700" />
					{#if descriptionError}<p class="mt-1 text-xs text-red-500">{descriptionError}</p>{/if}
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="date">วันที่</label>
					<input type="date" max={localDate()} id="date" bind:value={formData.date} required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white text-gray-700" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="amount">จำนวนเงิน (บาท)</label>
					<input type="number" step="0.01" max="99999999.99" id="amount" bind:value={formData.amount} min="0" required class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white text-gray-700" />
				</div>
				<div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<button type="button" onclick={() => showAddModal = false} class="rounded-2xl border-2 border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all hover:-translate-y-0.5">
						ยกเลิก
					</button>
					<button type="submit" disabled={!expenseFormValid} class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg">
						บันทึก
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
