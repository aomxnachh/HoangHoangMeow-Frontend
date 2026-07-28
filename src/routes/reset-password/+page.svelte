<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ApiError, api } from '$lib/api';
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let message = $state('');
	let loading = $state(false);
	async function submit() {
		error = '';
		if (password !== confirmPassword) { error = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน'; return; }
		loading = true;
		try {
			const result = await api<{ message: string }>('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token: page.url.searchParams.get('token'), password }) });
			message = result.message;
			setTimeout(() => goto('/login'), 1200);
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถตั้งรหัสผ่านใหม่ได้'; }
		finally { loading = false; }
	}
</script>
<svelte:head><title>ตั้งรหัสผ่านใหม่ | Hoang Hoang Meow</title></svelte:head>
<div class="flex min-h-screen items-center justify-center bg-rose-50 p-6"><form class="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm" onsubmit={(event) => { event.preventDefault(); submit(); }}><h1 class="text-2xl font-bold text-gray-900">ตั้งรหัสผ่านใหม่</h1><p class="mt-2 text-sm text-gray-500">รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร</p><div class="mt-6 space-y-4"><input type="password" required minlength="8" bind:value={password} placeholder="รหัสผ่านใหม่" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" /><input type="password" required bind:value={confirmPassword} placeholder="ยืนยันรหัสผ่านใหม่" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />{#if error}<p class="text-sm text-red-600">{error}</p>{/if}{#if message}<p class="text-sm text-emerald-600">{message}</p>{/if}<button disabled={loading} class="w-full rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? 'กำลังบันทึก…' : 'บันทึกรหัสผ่านใหม่'}</button></div></form></div>
