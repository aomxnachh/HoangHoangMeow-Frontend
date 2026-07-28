<script lang="ts">
	import { goto } from '$app/navigation';
	import { ApiError, api, saveSession } from '$lib/api';
	import { i18n } from '$lib/i18n';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');
	let message = $state('');

	async function login() {
		loading = true;
		error = '';
		try {
			const result = await api<{ token: string; user: any }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
			saveSession(result.token, result.user);
			await goto('/');
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่';
		} finally { loading = false; }
	}

	async function forgotPassword() {
		if (!email) { error = 'กรอกอีเมลก่อนขอรีเซ็ตรหัสผ่าน'; return; }
		error = '';
		try {
			const result = await api<{ message: string; developmentResetUrl?: string }>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
			message = result.developmentResetUrl ? `${result.message} เปิดลิงก์ทดสอบ: ${result.developmentResetUrl}` : result.message;
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถส่งลิงก์รีเซ็ตได้'; }
	}

	async function socialLogin(provider: string) {
		try { await api(`/api/auth/social/${provider}`, { method: 'POST' }); }
		catch (err) { error = err instanceof ApiError ? err.message : 'Social Login ยังไม่พร้อมใช้งาน'; }
	}
</script>
<svelte:head>
	<title>{i18n.login.title} | Hoang Hoang Meow</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-white p-6">
	<div class="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-white via-white to-rose-50 shadow-sm lg:grid-cols-2">
		<section class="flex flex-col justify-center p-8 sm:p-12">
			<a href="/" class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-white text-2xl text-rose-500">
					🐾
				</div>
				<div>
					<p class="text-lg font-bold leading-tight text-gray-900">Hoang</p>
					<p class="text-lg font-bold leading-tight text-gray-900">Hoang Meow!</p>
				</div>
			</a>

			<h1 class="mt-8 text-2xl font-bold text-gray-900">ยินดีต้อนรับกลับ</h1>
			<p class="mt-2 text-sm text-gray-500">{i18n.login.subtitle}</p>

			<form class="mt-8 space-y-4" onsubmit={(event) => { event.preventDefault(); login(); }}>
				<div>
					<label for="login-email" class="mb-1.5 block text-sm font-medium text-gray-700">อีเมล</label>
					<input id="login-email" type="email" required bind:value={email} placeholder="name@example.com" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
				</div>
				<div>
					<label for="login-password" class="mb-1.5 block text-sm font-medium text-gray-700">รหัสผ่าน</label>
					<input id="login-password" type="password" required bind:value={password} placeholder="••••••••" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
				</div>
				<div class="flex items-center justify-between text-sm">
					<label class="flex items-center gap-2 text-gray-600">
						<input type="checkbox" class="rounded border-gray-300 text-rose-500 focus:ring-rose-300" />
						จดจำฉัน
					</label>
					<button type="button" onclick={forgotPassword} class="font-medium text-rose-500 hover:text-rose-600">ลืมรหัสผ่าน?</button>
				</div>
				{#if error}<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>{/if}
				{#if message}<p class="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>{/if}
				<button disabled={loading} class="block w-full rounded-xl bg-rose-500 px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-60">{loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}</button>
			</form>

			<div class="mt-6 text-center">
				<p class="text-sm text-gray-500">หรือเข้าสู่ระบบด้วย</p>
				<div class="mt-3 flex justify-center gap-3">
					<button onclick={() => socialLogin('google')} aria-label="Google" class="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-lg hover:bg-gray-50">G</button>
					<button onclick={() => socialLogin('apple')} aria-label="Apple" class="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-bold text-gray-800 hover:bg-gray-50">●</button>
				</div>
				<p class="mt-6 text-sm text-gray-500">
					ยังไม่มีบัญชี?
					<a href="/register" class="font-semibold text-rose-500 hover:text-rose-600">สมัครสมาชิก</a>
				</p>
			</div>
		</section>

		<section class="hidden items-end justify-center bg-gradient-to-br from-rose-50 to-orange-50 p-10 lg:flex">
			<div class="text-center">
				<div class="text-[180px] leading-none">🐶🐱</div>
				<p class="mt-4 text-sm font-medium text-gray-500">จัดการสุขภาพ ค่าใช้จ่าย และแจ้งเตือนในที่เดียว</p>
			</div>
		</section>
	</div>
</div>
