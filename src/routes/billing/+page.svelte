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

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto animate-fade-in stagger-1">
	{#if error}
		<div class="rounded-2xl bg-red-50/80 backdrop-blur border border-red-100 p-4 animate-fade-in">
			<p class="text-sm font-medium text-red-600 flex gap-2 items-center">
				<svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>
				{error}
			</p>
		</div>
	{/if}

	<!-- Current Plan Card -->
	<div class="rounded-3xl border-2 {planType === 'PREMIUM' ? 'border-brand-300 bg-gradient-to-br from-brand-50 to-white/90' : 'border-white/60 bg-white/70'} backdrop-blur-md p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(226,50,50,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-[0_16px_48px_0_rgba(226,50,50,0.15)] hover:-translate-y-1">
		<div>
			<h2 class="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">แพ็กเกจปัจจุบัน</h2>
			<div class="flex items-center gap-3">
				{#if planType === 'PREMIUM'}
					<span class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-rose-400 px-4 py-1.5 text-sm font-extrabold text-white shadow-md shadow-brand-500/20">
						👑 Premium
					</span>
					<span class="text-xs font-semibold text-brand-600 bg-brand-100 px-2 py-1 rounded-md">ใช้งานได้เต็มรูปแบบ</span>
				{:else}
					<span class="inline-flex items-center gap-2 rounded-full bg-gray-100 border border-gray-200 px-4 py-1.5 text-sm font-bold text-gray-700">
						🌱 Free Plan
					</span>
				{/if}
			</div>
		</div>
		<div>
			{#if planType === 'PREMIUM'}
				<button 
					onclick={cancelSubscription} 
					disabled={canceling}
					class="rounded-2xl border-2 border-transparent bg-white/80 px-6 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-200 hover:bg-white hover:text-gray-900 focus:ring-4 focus:ring-gray-100 disabled:opacity-60 disabled:pointer-events-none"
				>
					{canceling ? 'กำลังยกเลิก...' : 'ยกเลิกการต่ออายุอัตโนมัติ'}
				</button>
			{:else}
				<button 
					onclick={() => goto('/upgrade')} 
					class="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0"
				>
					<span class="relative z-10 flex items-center gap-2">
						อัปเกรดเป็น Premium
						<svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
					</span>
					<div class="absolute inset-0 h-full w-full bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
				</button>
			{/if}
		</div>
	</div>

	<!-- Payment History Table -->
	<div class="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md overflow-hidden shadow-[0_8px_32px_0_rgba(226,50,50,0.05)] transition-all duration-300 hover:shadow-[0_16px_48px_0_rgba(226,50,50,0.1)] hover:-translate-y-1">
		<div class="px-6 py-5 border-b border-gray-100 bg-white/50">
			<h2 class="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
				<span class="text-brand-500">🧾</span> ประวัติการชำระเงิน
			</h2>
		</div>
		
		{#if loading}
			<div class="py-16 text-center flex flex-col items-center justify-center">
				<div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500 mb-4"></div>
				<p class="text-sm font-medium text-gray-500">กำลังโหลด...</p>
			</div>
		{:else if payments.length === 0}
			<div class="py-16 text-center">
				<div class="text-5xl mb-4 opacity-50">📄</div>
				<p class="text-base font-medium text-gray-500">ไม่มีประวัติการชำระเงิน</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm text-gray-600">
					<thead class="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
						<tr>
							<th class="px-6 py-4">วันที่</th>
							<th class="px-6 py-4">จำนวนเงิน</th>
							<th class="px-6 py-4">สถานะ</th>
							<th class="px-6 py-4">อ้างอิง</th>
							<th class="px-6 py-4">สิ้นสุดรอบบิล</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each payments as payment}
							<tr class="transition-colors hover:bg-white/80 group">
								<td class="px-6 py-4.5 font-medium">{formatDate(payment.createdAt)}</td>
								<td class="px-6 py-4.5 font-bold text-gray-900">฿{payment.amount.toLocaleString()}</td>
								<td class="px-6 py-4.5">
									<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold shadow-sm
										{payment.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
										payment.status === 'FAILED' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}">
										{payment.status}
									</span>
								</td>
								<td class="px-6 py-4.5 text-xs font-mono text-gray-500 group-hover:text-brand-600 transition-colors">{payment.reference || '-'}</td>
								<td class="px-6 py-4.5 font-medium">{formatDate(payment.periodEnd)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
