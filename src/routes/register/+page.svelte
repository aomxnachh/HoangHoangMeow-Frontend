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

<div class="relative flex min-h-screen items-center justify-center auth-bg overflow-hidden p-4 sm:p-6 lg:p-8 selection:bg-brand-500 selection:text-white">
	<!-- Animated Background Blobs -->
	<div class="absolute top-0 -left-4 w-72 h-72 bg-brand-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob pointer-events-none"></div>
	<div class="absolute top-0 -right-4 w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
	<div class="absolute -bottom-8 left-20 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

	<!-- Main Glass Container -->
	<div class="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl glass-heavy border border-white/60 shadow-[0_8px_32px_0_rgba(226,50,50,0.15)] lg:grid-cols-2 animate-fade-up">
		
		<!-- Left: Visual/Brand Section (Hidden on mobile) -->
		<section class="relative hidden p-0 lg:block overflow-hidden bg-brand-50/50">
			<!-- User uploaded image as background -->
			<img src="/register-bg.png" alt="HoangHoang Meow Friends" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
			
			<!-- Gradient overlay to make text readable -->
			<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
			
			<div class="absolute bottom-0 left-0 p-12 text-left w-full z-10">
				<h2 class="mt-8 text-4xl font-extrabold text-white drop-shadow-lg leading-tight">ร่วมเป็นครอบครัว <br/> Hoang Hoang Meow</h2>
				<p class="mt-4 text-lg font-medium text-white/90 max-w-md drop-shadow">เริ่มต้นใช้งานฟรีวันนี้ และให้เราช่วยดูแลเพื่อนรักของคุณอย่างดีที่สุด</p>
			</div>
		</section>

		<!-- Right: Form Section -->
		<section class="flex flex-col justify-center p-8 sm:p-12 xl:p-16 relative">
			<a href="/" class="group flex items-center gap-4 transition-transform hover:-translate-y-1 w-fit lg:hidden">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-brand-500/20 ring-1 ring-brand-100">
					<img src="/hoanghoangmeow-logo.png" alt="HoangHoang Meow" class="h-12 w-12 object-contain" />
				</div>
				<div>
					<p class="text-lg font-extrabold leading-tight text-gray-900 tracking-tight">HoangHoang</p>
					<p class="text-lg font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-rose-400 tracking-tight">Meow</p>
				</div>
			</a>

			<div class="mt-8 lg:mt-0 animate-fade-in stagger-1">
				<h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{i18n.register.title}</h1>
				<p class="mt-2 text-base font-medium text-gray-500">{i18n.register.subtitle}</p>
			</div>

			<form class="mt-8 space-y-4 animate-fade-in stagger-2" onsubmit={(event) => { event.preventDefault(); register(); }}>
				<div class="group">
					<label for="register-name" class="mb-1.5 block text-sm font-bold text-gray-700 transition-colors group-focus-within:text-brand-600">ชื่อผู้ใช้</label>
					<input id="register-name" required bind:value={username} placeholder={i18n.register.namePlaceholder} class="w-full rounded-2xl border-2 border-transparent bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-gray-50" />
				</div>
				<div class="group">
					<label for="register-email" class="mb-1.5 block text-sm font-bold text-gray-700 transition-colors group-focus-within:text-brand-600">อีเมล</label>
					<input id="register-email" type="email" required bind:value={email} placeholder="name@example.com" class="w-full rounded-2xl border-2 border-transparent bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-gray-50" />
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="group">
						<label for="register-password" class="mb-1.5 block text-sm font-bold text-gray-700 transition-colors group-focus-within:text-brand-600">รหัสผ่าน</label>
						<input id="register-password" type="password" minlength="8" required bind:value={password} placeholder="8+ ตัวอักษร" class="w-full rounded-2xl border-2 border-transparent bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-gray-50" />
					</div>
					<div class="group">
						<label for="register-confirm-password" class="mb-1.5 block text-sm font-bold text-gray-700 transition-colors group-focus-within:text-brand-600">ยืนยันรหัสผ่าน</label>
						<input id="register-confirm-password" type="password" required bind:value={confirmPassword} placeholder="••••••••" class="w-full rounded-2xl border-2 border-transparent bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-gray-50" />
					</div>
				</div>
				
				{#if error}
					<div class="rounded-xl bg-red-50/80 backdrop-blur border border-red-100 p-4 animate-fade-in mt-4">
						<p class="text-sm font-medium text-red-600 flex gap-2 items-center">
							<svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>
							{error}
						</p>
					</div>
				{/if}

				<button disabled={loading} class="relative block w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-4 mt-6 text-center text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none group">
					<span class="relative z-10">{loading ? 'กำลังสร้างบัญชี…' : 'สมัครสมาชิก'}</span>
					<div class="absolute inset-0 h-full w-full bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
				</button>
			</form>

			<p class="mt-8 text-center text-sm font-medium text-gray-500 animate-fade-in stagger-3">
				มีบัญชีอยู่แล้ว?
				<a href="/login" class="font-bold text-brand-600 hover:text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-4 transition-colors">เข้าสู่ระบบเลย</a>
			</p>
		</section>
	</div>
</div>
