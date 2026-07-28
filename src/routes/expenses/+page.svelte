<script lang="ts">
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import { expenses as mockExpenses, expenseSummary as mockExpenseSummary, pets as mockPets } from '$lib/data/mock-data';
	import { ApiError, api, request } from '$lib/api';
	let expenses = $state<any[]>(mockExpenses);
	let pets = $state<any[]>(mockPets);
	let expenseSummary = $state<any>(mockExpenseSummary);
	let error = $state('');

	let filterPet = $state('ทั้งหมด');
	let filterCategory = $state('ทั้งหมด');

	let showAddModal = $state(false);
	let formData = $state({ petId: '', category: 'อาหาร', description: '', date: '', amount: '' });
	const formCategories = ['อาหาร', 'สุขภาพ', 'ของใช้', 'ความสวยงาม', 'อื่นๆ'];

	let petNames = $derived(['ทั้งหมด', ...pets.map((p) => p.name)]);
	let categories = $derived(['ทั้งหมด', ...new Set(expenses.map((e) => e.category))]);

	let topCategory = $derived(() => {
		const counts: Record<string, number> = {};
		for (const e of expenses) counts[e.category] = (counts[e.category] || 0) + e.amount;
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
		formData = { petId: pets[0]?.id || '', category: 'อาหาร', description: '', date: '', amount: '' };
		showAddModal = true;
	}

	async function handleAdd() {
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
			let matchesPet = filterPet === 'ทั้งหมด' || pet?.name === filterPet;
			let matchesCategory = filterCategory === 'ทั้งหมด' || e.category === filterCategory;
			return matchesPet && matchesCategory;
		})
	);

	let filteredTotal = $derived(filteredExpenses.reduce((sum, e) => sum + e.amount, 0));

	async function loadExpenses() {
		try {
			const [expenseResult, petResult, dashboard] = await Promise.all([api<{ expenses: any[] }>('/api/expenses'), api<{ pets: any[] }>('/api/pets'), api<any>('/api/dashboard')]);
			pets = petResult.pets.map((pet) => ({ ...pet, id: String(pet.id), image: pet.image || '🐾' }));
			expenses = expenseResult.expenses.map((expense) => ({ ...expense, petId: String(expense.petId), amount: Number(expense.amount), description: expense.description || '-' }));
			const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
			expenseSummary = { totalThisMonth: dashboard.stats.totalThisMonth, averagePerMonth: dashboard.monthlyTrend.length ? Math.round(total / dashboard.monthlyTrend.length) : 0, byCategory: dashboard.byCategory, monthlyTrend: dashboard.monthlyTrend };
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดค่าใช้จ่ายได้'; }
	}
	onMount(loadExpenses);
</script>

<svelte:head>
	<title>ค่าใช้จ่าย | PetCare</title>
</svelte:head>

<TopNav title="ค่าใช้จ่าย" subtitle="ติดตามค่าใช้จ่ายในการดูแลสัตว์เลี้ยง" />

<div class="p-6 space-y-6">
	<div class="flex justify-between items-center">
		<h1 class="text-2xl font-bold text-gray-800 hidden sm:block">ค่าใช้จ่าย</h1>
		<button onclick={openModal} class="ml-auto rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white hover:bg-rose-600 transition-colors">
			+ เพิ่มรายจ่าย
		</button>
	</div>

	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}
	<!-- Stats -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<StatCard label="ค่าใช้จ่ายเดือนนี้" value="฿{expenseSummary.totalThisMonth.toLocaleString()}" icon="money" color="rose" />
		<StatCard label="ค่าเฉลี่ยต่อเดือน" value="฿{expenseSummary.averagePerMonth.toLocaleString()}" icon="trending" color="blue" />
		<StatCard label="รายการทั้งหมด" value={filteredExpenses.length} icon="receipt" color="indigo" />
		<StatCard label="หมวดหมู่มากที่สุด" value={topCategory()} icon="heart" color="amber" />
	</div>

	<!-- Chart + Category Summary -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Monthly Trend -->
		<div class="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
			<h2 class="text-base font-bold text-gray-800">แนวโน้มค่าใช้จ่ายรายเดือน</h2>
			<div class="mt-6 flex h-52 items-end justify-between gap-3 px-1">
				{#each expenseSummary.monthlyTrend as month}
					<div class="flex flex-1 flex-col items-center gap-1.5">
						<span class="text-[11px] font-semibold text-gray-600">
							{(month.amount / 1000).toFixed(1)}k
						</span>
						<div
							class="w-full max-w-[50px] rounded-lg transition-all duration-300 hover:bg-indigo-600 {month.amount >= 9000
								? 'bg-rose-400'
								: 'bg-indigo-400'}"
							style="height: {(month.amount / 12000) * 100}%"
						></div>
						<span class="text-xs text-gray-500">{month.month}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- By Category -->
		<div class="rounded-2xl border border-gray-200 bg-white p-6">
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
									class="h-full rounded-full transition-all duration-500 {cat.category === 'อาหาร' ? 'bg-indigo-500' : cat.category === 'วัคซีน' ? 'bg-blue-500' : cat.category === 'ทันตกรรม' ? 'bg-amber-500' : 'bg-purple-400'}"
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
				bind:value={filterPet}
				class="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
			>
				{#each petNames as name}
					<option value={name}>🐾 {name}</option>
				{/each}
			</select>

			<select
				bind:value={filterCategory}
				class="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
	<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
		<div class="overflow-x-auto">
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
									<span class="text-xl">{pet?.image}</span>
									<span class="text-sm font-medium text-gray-800">{pet?.name}</span>
								</div>
							</td>
							<td class="px-6 py-4">
								<span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {expense.category === 'อาหาร' ? 'bg-indigo-100 text-indigo-700' : expense.category === 'วัคซีน' ? 'bg-blue-100 text-blue-700' : expense.category === 'ทันตกรรม' ? 'bg-amber-100 text-amber-700' : expense.category === 'ตรวจสุขภาพ' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
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
	<div class="rounded-2xl border border-gray-200 bg-white p-6">
		<h2 class="text-lg font-bold text-gray-800 mb-4">ประเมินค่ารักษาประจำปี</h2>
		<div class="flex flex-wrap gap-4 items-end">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1" for="estimatePet">เลือกสัตว์เลี้ยง</label>
				<select id="estimatePet" bind:value={estimatePetId} class="rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100">
					<option value="" disabled selected>เลือก...</option>
					{#each pets as pet}
						<option value={pet.id}>{pet.name}</option>
					{/each}
				</select>
			</div>
			<button onclick={loadEstimates} disabled={!estimatePetId} class="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-600 disabled:opacity-50">
				ประเมิน
			</button>
		</div>
		{#if estimateError}
			<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{estimateError}</p>
		{/if}
		{#if estimates}
			<div class="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{#each estimates as est}
					<div class="rounded-xl border border-gray-100 bg-gray-50 p-4">
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
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
			<h2 class="text-xl font-bold text-gray-800 mb-4">เพิ่มรายจ่าย</h2>
			<form onsubmit={(e) => { e.preventDefault(); handleAdd(); }} class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="petId">สัตว์เลี้ยง</label>
					<select id="petId" bind:value={formData.petId} required class="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100">
						{#each pets as pet}
							<option value={pet.id}>{pet.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="category">หมวดหมู่</label>
					<select id="category" bind:value={formData.category} required class="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100">
						{#each formCategories as cat}
							<option value={cat}>{cat}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="description">รายละเอียด</label>
					<input type="text" id="description" bind:value={formData.description} required class="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="date">วันที่</label>
					<input type="date" id="date" bind:value={formData.date} required class="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
				</div>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1" for="amount">จำนวนเงิน (บาท)</label>
					<input type="number" id="amount" bind:value={formData.amount} min="0" required class="w-full rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
				</div>
				<div class="mt-6 flex justify-end gap-3">
					<button type="button" onclick={() => showAddModal = false} class="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
						ยกเลิก
					</button>
					<button type="submit" class="rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white hover:bg-rose-600 transition-colors">
						บันทึก
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
