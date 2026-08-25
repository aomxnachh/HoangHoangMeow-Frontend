<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import TopNav from '$lib/components/TopNav.svelte';
	import { getSession, api, saveSession, ApiError } from '$lib/api';

	let status = $state<'loading' | 'SUCCESS' | 'PENDING' | 'FAILED' | 'error'>('loading');
	let paymentInfo = $state<any>(null);
	let error = $state('');

	onMount(async () => {
		const session = getSession();
		if (!session) {
			goto('/login');
			return;
		}

		const ref = $page.url.searchParams.get('ref');
		if (!ref) {
			error = 'ไม่พบรหัสอ้างอิงการชำระเงิน';
			status = 'error';
			return;
		}

		try {
			const result = await api<any>(`/api/billing/verify?ref=${encodeURIComponent(ref)}`);
			paymentInfo = result;
			status = result.status;
			
			// Update session if payment succeeded
			if (result.status === 'SUCCESS' && result.user) {
				const currentSession = getSession();
				if (currentSession) {
					saveSession(currentSession.token, result.user);
				}
			}
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถตรวจสอบสถานะการชำระเงินได้';
			status = 'error';
		}
	});

	function formatDate(dateString: string) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>ตรวจสอบการชำระเงิน | PetCare</title>
</svelte:head>

<TopNav title="ตรวจสอบการชำระเงิน" subtitle="ผลลัพธ์การชำระเงินของคุณ" />

<div class="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto animate-fade-in stagger-1">
	{#if status === 'loading'}
		<div class="rounded-3xl glass-heavy border border-white/60 p-12 text-center shadow-xl">
			<div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500 mb-6"></div>
			<h2 class="text-xl font-bold text-gray-800">กำลังตรวจสอบสถานะ...</h2>
			<p class="mt-2 text-sm text-gray-500">กรุณารอสักครู่</p>
		</div>
	{:else if status === 'SUCCESS'}
		<div class="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white/90 backdrop-blur-md p-8 sm:p-12 shadow-xl text-center">
			<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-5xl mb-6 shadow-inner">
				✅
			</div>
			<h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">ชำระเงินสำเร็จ!</h2>
			<p class="mt-3 text-base font-medium text-emerald-700">ยินดีด้วย! คุณได้อัปเกรดเป็น Premium เรียบร้อยแล้ว 🎉</p>
			
			{#if paymentInfo}
				<div class="mt-8 rounded-2xl bg-white/60 p-5 text-left space-y-3">
					<div class="flex justify-between text-sm">
						<span class="text-gray-500">จำนวนเงิน</span>
						<span class="font-bold text-gray-900">฿{Number(paymentInfo.amount).toLocaleString()}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-gray-500">รหัสอ้างอิง</span>
						<span class="font-mono text-xs text-gray-600">{paymentInfo.reference}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-gray-500">สิ้นสุดรอบบิล</span>
						<span class="font-medium text-gray-900">{formatDate(paymentInfo.periodEnd)}</span>
					</div>
				</div>
			{/if}

			<div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
				<a href="/" class="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 text-center">
					กลับหน้าหลัก
				</a>
				<a href="/billing" class="rounded-2xl border-2 border-transparent bg-white/80 px-8 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-200 hover:bg-white text-center">
					ดูประวัติการชำระเงิน
				</a>
			</div>
		</div>
	{:else if status === 'PENDING'}
		<div class="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white/90 backdrop-blur-md p-8 sm:p-12 shadow-xl text-center">
			<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-5xl mb-6 shadow-inner animate-pulse">
				⏳
			</div>
			<h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">กำลังดำเนินการ</h2>
			<p class="mt-3 text-base font-medium text-amber-700">การชำระเงินของคุณอยู่ระหว่างดำเนินการ กรุณารอสักครู่</p>
			<p class="mt-2 text-sm text-gray-500">ระบบจะอัปเดตสถานะให้อัตโนมัติ</p>
			
			<div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
				<button onclick={() => location.reload()} class="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3 text-sm font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0">
					ตรวจสอบอีกครั้ง
				</button>
				<a href="/" class="rounded-2xl border-2 border-transparent bg-white/80 px-8 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-200 hover:bg-white text-center">
					กลับหน้าหลัก
				</a>
			</div>
		</div>
	{:else if status === 'FAILED'}
		<div class="rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white/90 backdrop-blur-md p-8 sm:p-12 shadow-xl text-center">
			<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-5xl mb-6 shadow-inner">
				❌
			</div>
			<h2 class="text-2xl font-extrabold text-gray-900 tracking-tight">ชำระเงินไม่สำเร็จ</h2>
			<p class="mt-3 text-base font-medium text-red-600">การชำระเงินของคุณไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</p>
			
			<div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
				<a href="/upgrade" class="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 text-center">
					ลองอีกครั้ง
				</a>
				<a href="/" class="rounded-2xl border-2 border-transparent bg-white/80 px-8 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-200 hover:bg-white text-center">
					กลับหน้าหลัก
				</a>
			</div>
		</div>
	{:else}
		<div class="rounded-3xl glass-heavy border border-white/60 p-8 sm:p-12 shadow-xl text-center">
			<div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-5xl mb-6 shadow-inner">
				⚠️
			</div>
			<h2 class="text-xl font-extrabold text-gray-900">เกิดข้อผิดพลาด</h2>
			<p class="mt-3 text-sm text-red-600">{error}</p>
			
			<div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
				<a href="/billing" class="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 text-center">
					ดูประวัติการชำระเงิน
				</a>
				<a href="/" class="rounded-2xl border-2 border-transparent bg-white/80 px-8 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-200 hover:bg-white text-center">
					กลับหน้าหลัก
				</a>
			</div>
		</div>
	{/if}
</div>
