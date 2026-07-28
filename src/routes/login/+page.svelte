<script lang="ts">
	import { goto } from '$app/navigation';
	import { ApiError, api, saveSession } from '$lib/api';
	import { i18n } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';

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

	onMount(() => {
		const handleGoogleLogin = async (response: any) => {
			try {
				loading = true;
				const result = await api<{ token: string; user: any }>('/api/auth/google', { 
					method: 'POST', 
					body: JSON.stringify({ token: response.credential }) 
				});
				saveSession(result.token, result.user);
				window.location.href = '/'; // Force full redirect to ensure layout picks up session
			} catch (err) {
				error = err instanceof ApiError ? err.message : 'ล็อกอิน Google ไม่สำเร็จ';
			} finally {
				loading = false;
			}
		};

		const initGoogle = () => {
			if (window.google?.accounts?.id) {
				window.google.accounts.id.initialize({
					client_id: PUBLIC_GOOGLE_CLIENT_ID,
					callback: handleGoogleLogin,
					context: 'signin',
					ux_mode: 'popup',
					auto_prompt: false
				});
				const btnContainer = document.getElementById('googleSignInDiv');
				if (btnContainer) {
					window.google.accounts.id.renderButton(btnContainer, {
						type: 'standard',
						shape: 'pill',
						theme: 'outline',
						text: 'continue_with',
						size: 'large',
						width: 320
					});
				}
			} else {
				setTimeout(initGoogle, 100); // Retry until script loads
			}
		};
		initGoogle();
	});
</script>
<svelte:head>
	<title>{i18n.login.title} | Hoang Hoang Meow</title>
	<script src="https://accounts.google.com/gsi/client" async defer></script>
</svelte:head>

<div class="relative flex min-h-screen items-center justify-center auth-bg overflow-hidden p-4 sm:p-6 lg:p-8 selection:bg-brand-500 selection:text-white">
	<!-- Animated Background Blobs -->
	<div class="absolute top-0 -left-4 w-72 h-72 bg-brand-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob pointer-events-none"></div>
	<div class="absolute top-0 -right-4 w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
	<div class="absolute -bottom-8 left-20 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

	<!-- Main Glass Container -->
	<div class="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl glass-heavy border border-white/60 shadow-[0_8px_32px_0_rgba(226,50,50,0.15)] lg:grid-cols-2 animate-fade-up">
		
		<!-- Left: Form Section -->
		<section class="flex flex-col justify-center p-8 sm:p-12 xl:p-16 relative">
			<a href="/" class="group flex items-center gap-4 transition-transform hover:-translate-y-1 w-fit">
				<div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
					<svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12 2C7 2 3 4.2 3 7v2c0 2.8 4 5 9 5s9-2.2 9-5V7c0-2.8-4-5-9-5z" />
						<circle cx="12" cy="18" r="4" />
						<circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
						<circle cx="10.5" cy="17.5" r="0.5" fill="currentColor" />
						<circle cx="13.5" cy="17.5" r="0.5" fill="currentColor" />
					</svg>
				</div>
				<div>
					<p class="text-xl font-extrabold leading-tight text-gray-900 tracking-tight">HoangHoang</p>
					<p class="text-xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-rose-400 tracking-tight">Meow</p>
				</div>
			</a>

			<div class="mt-10 animate-fade-in stagger-1">
				<h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">ยินดีต้อนรับกลับ</h1>
				<p class="mt-2 text-base font-medium text-gray-500">{i18n.login.subtitle}</p>
			</div>

			<form class="mt-10 space-y-5 animate-fade-in stagger-2" onsubmit={(event) => { event.preventDefault(); login(); }}>
				<div class="group">
					<label for="login-email" class="mb-2 block text-sm font-bold text-gray-700 transition-colors group-focus-within:text-brand-600">อีเมล</label>
					<input id="login-email" type="email" required bind:value={email} placeholder="name@example.com" class="w-full rounded-2xl border-2 border-transparent bg-gray-50/50 px-5 py-3.5 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-gray-50" />
				</div>
				<div class="group">
					<label for="login-password" class="mb-2 block text-sm font-bold text-gray-700 transition-colors group-focus-within:text-brand-600">รหัสผ่าน</label>
					<input id="login-password" type="password" required bind:value={password} placeholder="••••••••" class="w-full rounded-2xl border-2 border-transparent bg-gray-50/50 px-5 py-3.5 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-gray-50" />
				</div>
				
				<div class="flex items-center justify-between text-sm px-1">
					<label class="flex items-center gap-3 text-gray-600 font-medium cursor-pointer group">
						<div class="relative flex items-center justify-center">
							<input type="checkbox" class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 checked:border-brand-500 checked:bg-brand-500 transition-all focus:ring-2 focus:ring-brand-200 focus:ring-offset-1" />
							<svg class="absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 14" fill="none">
								<path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor"></path>
							</svg>
						</div>
						<span class="group-hover:text-gray-900 transition-colors">จดจำฉัน</span>
					</label>
					<button type="button" onclick={forgotPassword} class="font-bold text-brand-600 hover:text-brand-700 transition-colors">ลืมรหัสผ่าน?</button>
				</div>
				
				{#if error}
					<div class="rounded-xl bg-red-50/80 backdrop-blur border border-red-100 p-4 animate-fade-in">
						<p class="text-sm font-medium text-red-600 flex gap-2 items-center">
							<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>
							{error}
						</p>
					</div>
				{/if}
				{#if message}
					<div class="rounded-xl bg-emerald-50/80 backdrop-blur border border-emerald-100 p-4 animate-fade-in">
						<p class="text-sm font-medium text-emerald-700 flex gap-2 items-center">
							<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
							{message}
						</p>
					</div>
				{/if}

				<button disabled={loading} class="relative block w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-4 text-center text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none group">
					<span class="relative z-10">{loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}</span>
					<div class="absolute inset-0 h-full w-full bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
				</button>
			</form>

			<div class="mt-8 text-center animate-fade-in stagger-3">
				<div class="relative flex items-center py-5">
					<div class="flex-grow border-t border-gray-200"></div>
					<span class="shrink-0 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">หรือเข้าสู่ระบบด้วย</span>
					<div class="flex-grow border-t border-gray-200"></div>
				</div>
				
				<div class="mt-4 flex justify-center w-full">
					<div id="googleSignInDiv" class="hover:scale-105 transition-transform duration-300 w-full flex justify-center"></div>
				</div>

				<p class="mt-8 text-sm font-medium text-gray-500">
					ยังไม่มีบัญชี?
					<a href="/register" class="font-bold text-brand-600 hover:text-brand-700 underline decoration-brand-300 decoration-2 underline-offset-4 transition-colors">สร้างบัญชีฟรี</a>
				</p>
			</div>
		</section>

		<!-- Right: Visual/Brand Section (Hidden on mobile) -->
		<section class="relative hidden p-0 lg:block overflow-hidden bg-brand-50/50">
			<!-- User uploaded image as background -->
			<img src="/login-bg.png" alt="PetCare Cats and Dogs" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
			
			<!-- Gradient overlay to make text readable -->
			<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
			
			<div class="absolute bottom-0 left-0 p-12 text-left w-full z-10">
				<h2 class="mt-8 text-4xl font-extrabold text-white drop-shadow-lg leading-tight">การดูแลเพื่อนรัก <br/> ที่ง่ายกว่าที่เคย</h2>
				<p class="mt-4 text-lg font-medium text-white/90 max-w-md drop-shadow">จัดการข้อมูลสุขภาพ ค่าใช้จ่าย และรับการแจ้งเตือนวัคซีนในที่เดียว ครบจบเพื่อคนที่คุณรัก</p>
			</div>
		</section>
	</div>
</div>
