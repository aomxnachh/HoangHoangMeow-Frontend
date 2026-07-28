<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import TopNav from '$lib/components/TopNav.svelte';
	import { getSession, api, request, ApiError } from '$lib/api';

	let planType = $state<'FREE' | 'PREMIUM'>('FREE');
	let payments = $state<Array<any>>([]);
	let loading = $state(true);
	let error = $state('');
	let canceling = $state(false);

	async function loadBillingData() {
		loading = true;
		error = '';
		try {
			const result = await api<any>('/api/billing/history');
			planType = result.planType || 'FREE';
			payments = result.payments || [];
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดข้อมูลการชำระเงินได้';
		} finally {
			loading = false;
		}
	}

	async function cancelSubscription() {
		if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการต่ออายุอัตโนมัติ?')) return;
		canceling = true;
		error = '';
		try {
			await request('/api/billing/cancel', 'POST');
			await loadBillingData(); // Reload to refresh plan status
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถยกเลิกได้';
		} finally {
			canceling = false;
		}
	}

	onMount(() => {
		const session = getSession();
		if (!session) {
			goto('/login');
			return;
		}
		planType = session.user.planType || 'FREE';
		loadBillingData();
	});

	function formatDate(dateString: string) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>การชำระเงินและแพ็กเกจ | PetCare</title>
</svelte:head>

<TopNav title="การชำระเงินและแพ็กเกจ" subtitle="จัดการแพ็กเกจและประวัติการชำระเงิน" />

<div class="p-6 space-y-6 max-w-4xl mx-auto">
	{#if error}
		<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
	{/if}

	<!-- Current Plan Card -->
	<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h2 class="text-sm font-medium text-gray-500 mb-1">แพ็กเกจปัจจุบัน</h2>
			<div class="flex items-center gap-3">
				{#if planType === 'PREMIUM'}
					<span class="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-700">
						👑 Premium
					</span>
				{:else}
					<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
						Free Plan
					</span>
				{/if}
			</div>
		</div>
		<div>
			{#if planType === 'PREMIUM'}
				<button 
					onclick={cancelSubscription} 
					disabled={canceling}
					class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
				>
					{canceling ? 'กำลังยกเลิก...' : 'ยกเลิกการต่ออายุอัตโนมัติ'}
				</button>
			{:else}
				<button 
					onclick={() => goto('/upgrade')} 
					class="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-600 transition-colors"
				>
					อัปเกรดเป็น Premium
				</button>
			{/if}
		</div>
	</div>

	<!-- Payment History Table -->
	<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
		<div class="px-6 py-4 border-b border-gray-200">
			<h2 class="text-lg font-bold text-gray-800">ประวัติการชำระเงิน</h2>
		</div>
		
		{#if loading}
			<p class="py-12 text-center text-sm text-gray-500">กำลังโหลด...</p>
		{:else if payments.length === 0}
			<div class="py-12 text-center">
				<p class="text-gray-500">ไม่มีประวัติการชำระเงิน</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm text-gray-600">
					<thead class="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
						<tr>
							<th class="px-6 py-3">วันที่</th>
							<th class="px-6 py-3">จำนวนเงิน</th>
							<th class="px-6 py-3">สถานะ</th>
							<th class="px-6 py-3">อ้างอิง</th>
							<th class="px-6 py-3">สิ้นสุดรอบบิล</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each payments as payment}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4">{formatDate(payment.createdAt)}</td>
								<td class="px-6 py-4 font-medium text-gray-900">฿{payment.amount.toLocaleString()}</td>
								<td class="px-6 py-4">
									<span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold
										{payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 
										payment.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}">
										{payment.status}
									</span>
								</td>
								<td class="px-6 py-4 text-xs font-mono">{payment.reference || '-'}</td>
								<td class="px-6 py-4">{formatDate(payment.periodEnd)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
