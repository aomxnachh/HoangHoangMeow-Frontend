<script lang="ts">
	import { modal } from '$lib/actions/modal';
	import { onMount } from 'svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import { ApiError, api, getSession, saveSession, request } from '$lib/api';
	let error = $state('');
	let loading = $state(true);
	let currentPlan = $state<'FREE' | 'PREMIUM'>('FREE');
	let paymentMode = $state<'DEMO' | 'LIVE' | 'UNAVAILABLE'>('UNAVAILABLE');

    onMount(() => {
        void Promise.all([
            api<{ user: any }>('/api/me'),
            api<{ mode: 'DEMO' | 'LIVE' | 'UNAVAILABLE'; amount: number }>('/api/billing/options')
        ]).then(([result, options]) => {
            currentPlan = result.user.planType;
            paymentMode = options.mode; amount = options.amount;
            const session = getSession(); if (session) saveSession(session.token, result.user);
        }).catch(err => { error = err instanceof ApiError ? err.message : 'โหลดแพ็กเกจไม่ได้'; }).finally(() => loading = false);
    });


    let showDemo = $state(false);
    let cardType = $state('CREDIT');
    let paymentResult = $state('SUCCESS');
    let amount = $state(39);
    let message = $state('');
    async function checkout() {
        if (loading || currentPlan === 'PREMIUM') return;
        loading = true; error = ''; message = ''; paymentResult = 'SUCCESS';
        try {
            const result = await request<{ checkoutUrl?: string; demo?: boolean; amount: number }>('/api/billing/checkout', 'POST');
            amount = result.amount;
            if (result.demo) showDemo = true;
            else if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
        } catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถเริ่มการชำระเงินได้'; }
        finally { loading = false; }
    }
    async function payDemo() {
        if (loading) return;
        loading = true; error = ''; message = '';
        try {
            const result = await request<{ user: any; status: string; message: string }>('/api/billing/simulate-payment', 'POST', { cardType, result: paymentResult });
            if (result.status === 'SUCCESS') {
                const session = getSession(); if (session) saveSession(session.token, result.user);
                currentPlan = result.user.planType; showDemo = false; message = result.message;
            } else error = result.message;
        } catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถจำลองการชำระเงินได้'; }
        finally { loading = false; }
    }

	const freeFeatures = ['เพิ่มสัตว์เลี้ยงได้สูงสุด 3 ตัว', 'บันทึกข้อมูลสุขภาพ', 'ระบบแจ้งเตือน', 'แดชบอร์ดสรุป', 'บันทึกค่าใช้จ่ายพื้นฐาน'];
	const premiumFeatures = ['เพิ่มสัตว์เลี้ยงไม่จำกัด', 'บันทึกสุขภาพละเอียด', 'การแจ้งเตือนขั้นสูง', 'แผนการดูแลรายตัว', 'คำแนะนำเฉพาะบุคคล', 'ส่งออกข้อมูลสุขภาพ', 'รายงานค่าใช้จ่ายรายเดือน'];
</script>

<svelte:head>
	<title>อัปเกรดแพ็กเกจ | HoangHoang Meow</title>
</svelte:head>

<TopNav title="อัปเกรดเป็น Premium" subtitle="ปลดล็อกเครื่องมือดูแลสัตว์เลี้ยงแบบครบชุด" />

<div class="p-4 sm:p-6 lg:p-8 animate-fade-in stagger-1">
	{#if paymentMode === 'DEMO'}
		<div class="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
			<p class="font-bold">โหมดจำลองชำระเงิน — ไม่มีการเรียกเก็บเงินจริง</p>
			<p class="mt-1">กดอัปเกรดและยืนยันชำระเงินจำลองเพื่อเปลี่ยนบัญชีจาก Free เป็น Premium ได้ทันที โดยไม่ต้องกรอกข้อมูลบัตรจริง</p>
		</div>
	{:else if !loading && paymentMode === 'UNAVAILABLE' && !error}
		<p class="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">ยังไม่ได้เปิดบริการชำระเงิน กรุณาติดต่อผู้ดูแล</p>
	{/if}
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
			<section class="relative flex flex-col h-full rounded-3xl border-2 bg-white/70 backdrop-blur-md p-5 sm:p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 {currentPlan === 'FREE' ? 'border-brand-500 scale-100 lg:scale-95' : 'border-white/60'}">
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
			<section class="relative flex flex-col h-full rounded-3xl border-2 bg-gradient-to-br from-brand-50 to-white/90 backdrop-blur-md p-5 sm:p-8 shadow-[0_8px_32px_0_rgba(226,50,50,0.15)] transition-all duration-300 hover:shadow-[0_16px_48px_0_rgba(226,50,50,0.25)] hover:-translate-y-2 {currentPlan === 'PREMIUM' ? 'border-brand-500' : 'border-brand-200'}">
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
					<span class="text-5xl font-extrabold text-gray-900 tracking-tight">{amount}</span>
					<span class="ml-1 text-sm font-bold text-brand-600">บาท / เดือน</span>
					{#if paymentMode === 'DEMO'}<p class="mt-2 text-sm text-amber-800">ราคาอ้างอิงสำหรับการจำลอง · ไม่มีการหักเงินจริง</p>{/if}
				</div>
				<div class="mt-8 flex justify-center relative z-10">
					{#if currentPlan === 'PREMIUM'}
						<button disabled class="w-full rounded-2xl bg-brand-100 px-8 py-4 text-sm font-bold text-brand-600 cursor-not-allowed">
							คุณใช้แพ็กเกจนี้อยู่แล้ว
						</button>
					{:else}
						<button onclick={checkout} disabled={loading || paymentMode === 'UNAVAILABLE'} class="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-4 text-center text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none">
							<span class="relative z-10 flex items-center justify-center gap-2">
								{loading ? 'กำลังดำเนินการ…' : paymentMode === 'DEMO' ? 'อัปเกรดด้วยการชำระเงินจำลอง' : 'อัปเกรดเลย'}
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

{#if showDemo}
 <div use:modal class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/40 p-4">
  <div role="dialog" tabindex="-1" aria-modal="true" aria-label="ชำระเงินจำลอง" class="my-auto w-full max-w-md space-y-4 rounded-2xl bg-white p-6">
   <h2 class="text-xl font-bold">ชำระเงินจำลอง — Premium {amount} บาท</h2>
   <p class="text-sm text-amber-800">สำหรับทดสอบเท่านั้น ไม่มีการหักเงินจริงและไม่ต้องกรอกข้อมูลบัตรจริง</p>
   <label class="block">ประเภทบัตร<select aria-label="ประเภทบัตร" bind:value={cardType} class="mt-1 w-full rounded-lg border p-3"><option value="CREDIT">บัตรเครดิตทดสอบ</option><option value="DEBIT">บัตรเดบิตทดสอบ</option></select></label>
   <label class="block">สถานการณ์ทดสอบ<select aria-label="สถานการณ์ทดสอบ" bind:value={paymentResult} class="mt-1 w-full rounded-lg border p-3"><option value="SUCCESS">ชำระเงินสำเร็จ</option><option value="FAILED">บัตรถูกปฏิเสธ</option></select></label>
   {#if error}<p role="alert" class="text-red-600">{error}</p>{/if}
   <div class="flex flex-wrap gap-3"><button disabled={loading} onclick={payDemo} class="rounded-xl bg-brand-500 p-3 font-semibold text-white">ยืนยันชำระเงินจำลอง</button><button disabled={loading} onclick={() => showDemo = false}>ยกเลิก</button></div>
  </div>
 </div>
{/if}
{#if message}<p role="status" class="m-6 rounded-xl bg-green-50 p-4 text-green-700">{message}</p>{/if}
