<script lang="ts">
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import { ApiError, api, getSession } from '$lib/api';
	let error = $state('');
	let loading = $state(false);
	let currentPlan = $state<'FREE' | 'PREMIUM'>('FREE');

	onMount(() => {
		const session = getSession();
		if (session) {
			currentPlan = session.user.planType || 'FREE';
		}
	});

	async function checkout() {
		if (currentPlan === 'PREMIUM') return;
		loading = true; error = '';
		try { const result = await api<{ checkoutUrl: string }>('/api/billing/checkout', { method: 'POST' }); window.location.assign(result.checkoutUrl); }
		catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถเริ่มการชำระเงินได้'; }
		finally { loading = false; }
	}

	const freeFeatures = ['เพิ่มสัตว์เลี้ยงได้สูงสุด 3 ตัว', 'บันทึกข้อมูลสุขภาพ', 'ระบบแจ้งเตือน', 'แดชบอร์ดสรุป', 'บันทึกค่าใช้จ่ายพื้นฐาน'];
	const premiumFeatures = ['เพิ่มสัตว์เลี้ยงไม่จำกัด', 'บันทึกสุขภาพละเอียด', 'การแจ้งเตือนขั้นสูง', 'แผนการดูแลรายตัว', 'คำแนะนำเฉพาะบุคคล', 'ส่งออกข้อมูลสุขภาพ', 'รายงานค่าใช้จ่ายรายเดือน'];
</script>

<svelte:head>
	<title>อัปเกรดแพ็กเกจ | PetCare</title>
</svelte:head>

<TopNav title="อัปเกรดเป็น Premium" subtitle="ปลดล็อกเครื่องมือดูแลสัตว์เลี้ยงแบบครบชุด" />

<div class="p-6">
	{#if error}<p class="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</p>{/if}
	
	<div class="mb-6 flex justify-end">
		<a href="/billing" class="text-sm font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1">
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
			</svg>
			ประวัติการชำระเงิน
		</a>
	</div>

	<div class="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
		<div class="grid gap-6 lg:grid-cols-2">
			<section class="relative rounded-2xl border border-gray-200 bg-white p-6 {currentPlan === 'FREE' ? 'ring-2 ring-rose-500' : ''}">
				{#if currentPlan === 'FREE'}
					<div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
						แพ็กเกจปัจจุบัน
					</div>
				{/if}
				<h2 class="text-center text-xl font-bold text-gray-900">Free Plan</h2>
				<ul class="mt-8 space-y-4">
					{#each freeFeatures as feature}
						<li class="flex items-center gap-3 text-sm text-gray-600">
							<span class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-xs text-emerald-600">✓</span>
							{feature}
						</li>
					{/each}
				</ul>
				<div class="mt-12 text-center">
					<span class="text-4xl font-bold text-gray-900">0</span>
					<span class="ml-1 text-sm font-medium text-gray-500">บาท / ตลอดชีพ</span>
				</div>
			</section>

			<section class="relative rounded-2xl border border-rose-300 bg-rose-50/70 p-6 shadow-sm shadow-rose-100 {currentPlan === 'PREMIUM' ? 'ring-2 ring-rose-500' : ''}">
				{#if currentPlan === 'PREMIUM'}
					<div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
						แพ็กเกจปัจจุบัน
					</div>
				{/if}
				<div class="text-center">
					<div class="text-3xl">👑</div>
					<h2 class="mt-2 text-xl font-bold text-gray-900">Premium Plan</h2>
				</div>
				<ul class="mt-8 space-y-4">
					{#each premiumFeatures as feature}
						<li class="flex items-center gap-3 text-sm text-gray-700">
							<span class="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs text-emerald-600">✓</span>
							{feature}
						</li>
					{/each}
				</ul>
				<div class="mt-12 text-center">
					<span class="text-4xl font-bold text-gray-900">149</span>
					<span class="ml-1 text-sm font-bold text-rose-600">บาท / เดือน</span>
				</div>
			</section>
		</div>

		<div class="mt-8 flex justify-center">
			{#if currentPlan === 'PREMIUM'}
				<button disabled class="rounded-xl bg-gray-200 px-12 py-3 text-sm font-bold text-gray-500">
					คุณใช้แพ็กเกจนี้อยู่แล้ว
				</button>
			{:else}
				<button onclick={checkout} disabled={loading} class="rounded-xl bg-rose-500 px-12 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-60">
					อัปเกรดเลย
				</button>
			{/if}
		</div>
	</div>
</div>
