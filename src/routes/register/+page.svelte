<script lang="ts">
	import { goto } from '$app/navigation';
	import { ApiError, api, saveSession } from '$lib/api';
	import { i18n } from '$lib/i18n';
	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');
	async function register() {
		error = '';
		if (password !== confirmPassword) { error = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน'; return; }
		loading = true;
		try {
			const result = await api<{ token: string; user: any }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) });
			saveSession(result.token, result.user);
			await goto('/');
		} catch (err) { error = err instanceof ApiError ? err.message : 'เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่'; }
		finally { loading = false; }
	}
</script>

<svelte:head>
	<title>{i18n.register.title} | Hoang Hoang Meow</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-white p-6">
	<div class="w-full max-w-2xl rounded-2xl border border-rose-100 bg-white p-8 shadow-sm sm:p-12">
		<a href="/" class="flex items-center justify-center gap-3">
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-white text-2xl text-rose-500">
				🐾
			</div>
			<div>
				<p class="text-lg font-bold leading-tight text-gray-900">Hoang</p>
				<p class="text-lg font-bold leading-tight text-gray-900">Hoang Meow!</p>
			</div>
		</a>

		<h1 class="mt-8 text-center text-2xl font-bold text-gray-900">{i18n.register.title}</h1>
		<p class="mt-2 text-center text-sm text-gray-500">{i18n.register.subtitle}</p>

		<form class="mt-8 space-y-4" onsubmit={(event) => { event.preventDefault(); register(); }}>
			<div>
				<label for="register-name" class="mb-1.5 block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
				<input id="register-name" required bind:value={username} placeholder={i18n.register.namePlaceholder} class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
			</div>
			<div>
				<label for="register-email" class="mb-1.5 block text-sm font-medium text-gray-700">อีเมล</label>
				<input id="register-email" type="email" required bind:value={email} placeholder="name@example.com" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
			</div>
			<div>
				<label for="register-password" class="mb-1.5 block text-sm font-medium text-gray-700">รหัสผ่าน</label>
				<input id="register-password" type="password" minlength="8" required bind:value={password} placeholder="อย่างน้อย 8 ตัวอักษร" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
			</div>
			<div>
				<label for="register-confirm-password" class="mb-1.5 block text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
				<input id="register-confirm-password" type="password" required bind:value={confirmPassword} placeholder="••••••••" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
			</div>
			{#if error}<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>{/if}
			<button disabled={loading} class="block w-full rounded-xl bg-rose-500 px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-60">{loading ? 'กำลังสร้างบัญชี…' : 'สมัครสมาชิก'}</button>
		</form>

		<p class="mt-6 text-center text-sm text-gray-500">
			มีบัญชีอยู่แล้ว?
			<a href="/login" class="font-semibold text-rose-500 hover:text-rose-600">เข้าสู่ระบบ</a>
		</p>
	</div>
</div>
