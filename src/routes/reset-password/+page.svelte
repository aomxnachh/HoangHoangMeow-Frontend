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

<svelte:head>
	<title>ตั้งรหัสผ่านใหม่ | Hoang Hoang Meow</title>
</svelte:head>

<div class="relative flex min-h-screen items-center justify-center auth-bg overflow-hidden p-4 sm:p-6 lg:p-8 selection:bg-brand-500 selection:text-white">
	<!-- Animated Background Blobs -->
	<div class="absolute top-0 -left-4 w-72 h-72 bg-brand-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob pointer-events-none"></div>
	<div class="absolute top-0 -right-4 w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
	<div class="absolute -bottom-8 left-20 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

	<!-- Main Glass Container (Centered single column for reset password) -->
	<div class="relative z-10 w-full max-w-md overflow-hidden rounded-3xl glass-heavy border border-white/60 shadow-[0_8px_32px_0_rgba(226,50,50,0.15)] animate-fade-up">
		
		<section class="flex flex-col justify-center p-8 sm:p-12 relative">
			<a href="/" class="group mx-auto flex items-center justify-center gap-4 transition-transform hover:-translate-y-1 w-fit">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl shadow-lg shadow-brand-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
					🐾
				</div>
			</a>

			<div class="mt-8 text-center animate-fade-in stagger-1">
				<h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">ตั้งรหัสผ่านใหม่</h1>
				<p class="mt-2 text-sm font-medium text-gray-500">รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร</p>
			</div>

			<form class="mt-8 space-y-4 animate-fade-in stagger-2" onsubmit={(event) => { event.preventDefault(); submit(); }}>
				<div class="group">
					<input type="password" required minlength="8" bind:value={password} placeholder="รหัสผ่านใหม่" class="w-full rounded-2xl border-2 border-transparent bg-gray-50/50 px-5 py-3.5 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-gray-50" />
				</div>
				<div class="group">
					<input type="password" required bind:value={confirmPassword} placeholder="ยืนยันรหัสผ่านใหม่" class="w-full rounded-2xl border-2 border-transparent bg-gray-50/50 px-5 py-3.5 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-gray-50" />
				</div>
				
				{#if error}
					<div class="rounded-xl bg-red-50/80 backdrop-blur border border-red-100 p-4 animate-fade-in mt-4">
						<p class="text-sm font-medium text-red-600 flex gap-2 items-center">
							<svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>
							{error}
						</p>
					</div>
				{/if}
				{#if message}
					<div class="rounded-xl bg-emerald-50/80 backdrop-blur border border-emerald-100 p-4 animate-fade-in mt-4">
						<p class="text-sm font-medium text-emerald-700 flex gap-2 items-center">
							<svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
							{message}
						</p>
					</div>
				{/if}

				<button disabled={loading} class="relative block w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-4 mt-6 text-center text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none group">
					<span class="relative z-10">{loading ? 'กำลังบันทึก…' : 'บันทึกรหัสผ่านใหม่'}</span>
					<div class="absolute inset-0 h-full w-full bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
				</button>
			</form>
		</section>
	</div>
</div>
