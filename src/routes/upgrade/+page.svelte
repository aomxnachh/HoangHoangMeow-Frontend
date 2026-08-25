<script lang="ts">
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import { ApiError, api, getSession, saveSession } from '$lib/api';
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
		try {
			const result = await api<{ checkoutUrl?: string }>('/api/billing/checkout', { method: 'POST' });
			if (result.checkoutUrl) {
				window.location.assign(result.checkoutUrl);
			}
		} catch (err) {
			if (err instanceof ApiError && err.code === 'PAYMENT_NOT_CONFIGURED') {
				// Fallback: simulate payment for demo/dev
				try {
					const simResult = await api<{ user?: any; reference?: string }>('/api/billing/simulate-payment', { method: 'POST' });
					if (simResult.user) {
						const session = getSession();
						if (session) saveSession(session.token, simResult.user);
						currentPlan = 'PREMIUM';
					}
				} catch (simErr) {
					error = simErr instanceof ApiError ? simErr.message : 'ไม่สามารถจำลองการชำระเงินได้';
				}
			} else {
				error = err instanceof ApiError ? err.message : 'ไม่สามารถเริ่มการชำระเงินได้';
			}
		} finally { loading = false; }
	}

	const freeFeatures = ['เพิ่มสัตว์เลี้ยงได้สูงสุด 3 ตัว', 'บันทึกข้อมูลสุขภาพ', 'ระบบแจ้งเตือน', 'แดชบอร์ดสรุป', 'บันทึกค่าใช้จ่ายพื้นฐาน'];
	const premiumFeatures = ['เพิ่มสัตว์เลี้ยงไม่จำกัด', 'บันทึกสุขภาพละเอียด', 'การแจ้งเตือนขั้นสูง', 'แผนการดูแลรายตัว', 'คำแนะนำเฉพาะบุคคล', 'ส่งออกข้อมูลสุขภาพ', 'รายงานค่าใช้จ่ายรายเดือน'];
</script>

<svelte:head>
	<title>อัปเกรดแพ็กเกจ | PetCare</title>
</svelte:head>

<TopNav title="อัปเกรดเป็น Premium" subtitle="ปลดล็อกเครื่องมือดูแลสัตว์เลี้ยงแบบครบชุด" />

<div class="p-4 sm:p-6 lg:p-8 animate-fade-in stagger-1">
	{#if error}
		<div class="mb-6 rounded-2xl bg-red-50/80 backdrop-blur border border-red-100 p-4 animate-fade-in">
			<p class="text-sm font-medium text-red-600 flex gap-2 items-center">
				<svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>
				{error}
			</p>
		</div>
	{/if}
	
	<div class="mb-6 flex justify-end">
		<a href="/billing" class="group flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm font-bold text-brand-600 shadow-sm transition-all hover:bg-white hover:shadow-md border border-brand-100">
			<svg class="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
			</svg>
			ประวัติการชำระเงิน
		</a>
	</div>

	<div class="mx-auto max-w-5xl">
		<div class="grid gap-6 lg:grid-cols-2 lg:gap-8 items-center">
			
			<!-- Free Plan -->
			<section class="relative flex flex-col h-full rounded-3xl border-2 bg-white/70 backdrop-blur-md p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 {currentPlan === 'FREE' ? 'border-brand-500 scale-100 lg:scale-95' : 'border-white/60'}">
				{#if currentPlan === 'FREE'}
					<div class="absolute -top-4 right-8 rounded-full bg-gradient-to-r from-brand-500 to-rose-400 px-4 py-1.5 text-xs font-extrabold text-white shadow-lg animate-fade-in">
						แพ็กเกจปัจจุบัน
					</div>
				{/if}
				<div class="text-center">
					<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl mb-4">🌱</div>
					<h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">Free Plan</h2>
					<p class="mt-2 text-sm font-medium text-gray-500">เริ่มต้นใช้งานได้ฟรีตลอดชีพ</p>
				</div>
				<ul class="mt-8 space-y-4 flex-grow">
					{#each freeFeatures as feature}
						<li class="flex items-center gap-3 text-sm font-medium text-gray-700">
							<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-600">✓</span>
							{feature}
						</li>
					{/each}
				</ul>
				<div class="mt-10 text-center border-t border-gray-100 pt-6">
					<span class="text-5xl font-extrabold text-gray-900 tracking-tight">0</span>
					<span class="ml-1 text-sm font-bold text-gray-500">บาท / ตลอดชีพ</span>
				</div>
			</section>

			<!-- Premium Plan -->
			<section class="relative flex flex-col h-full rounded-3xl border-2 bg-gradient-to-br from-brand-50 to-white/90 backdrop-blur-md p-8 shadow-[0_8px_32px_0_rgba(226,50,50,0.15)] transition-all duration-300 hover:shadow-[0_16px_48px_0_rgba(226,50,50,0.25)] hover:-translate-y-2 {currentPlan === 'PREMIUM' ? 'border-brand-500' : 'border-brand-200'}">
				<div class="absolute inset-0 bg-mesh-banner opacity-[0.03] rounded-3xl pointer-events-none"></div>
				{#if currentPlan === 'PREMIUM'}
					<div class="absolute -top-4 right-8 rounded-full bg-gradient-to-r from-brand-500 to-rose-400 px-4 py-1.5 text-xs font-extrabold text-white shadow-lg animate-fade-in">
						แพ็กเกจปัจจุบัน
					</div>
				{:else}
					<div class="absolute -top-4 right-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-1.5 text-xs font-extrabold text-white shadow-lg shadow-orange-500/20 animate-fade-in animate-pulse">
						แนะนำ
					</div>
				{/if}
				<div class="text-center relative z-10">
					<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-rose-100 text-3xl mb-4 shadow-inner">👑</div>
					<h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">Premium Plan</h2>
					<p class="mt-2 text-sm font-medium text-brand-600">ปลดล็อกขีดจำกัดเพื่อเพื่อนรักของคุณ</p>
				</div>
				<ul class="mt-8 space-y-4 flex-grow relative z-10">
					{#each premiumFeatures as feature}
						<li class="flex items-center gap-3 text-sm font-bold text-gray-800">
							<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-brand-400 text-xs text-white shadow-md shadow-brand-500/20">✓</span>
							{feature}
						</li>
					{/each}
				</ul>
				<div class="mt-10 text-center border-t border-brand-100 pt-6 relative z-10">
					<span class="text-5xl font-extrabold text-gray-900 tracking-tight">39</span>
					<span class="ml-1 text-sm font-bold text-brand-600">บาท / เดือน</span>
				</div>
				<div class="mt-8 flex justify-center relative z-10">
					{#if currentPlan === 'PREMIUM'}
						<button disabled class="w-full rounded-2xl bg-brand-100 px-8 py-4 text-sm font-bold text-brand-600 cursor-not-allowed">
							คุณใช้แพ็กเกจนี้อยู่แล้ว
						</button>
					{:else}
						<button onclick={checkout} disabled={loading} class="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-4 text-center text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none">
							<span class="relative z-10 flex items-center justify-center gap-2">
								{loading ? 'กำลังดำเนินการ…' : 'อัปเกรดเลย'}
								{#if !loading}
									<svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
								{/if}
							</span>
							<div class="absolute inset-0 h-full w-full bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
						</button>
					{/if}
				</div>
			</section>
		</div>
	</div>
</div>
