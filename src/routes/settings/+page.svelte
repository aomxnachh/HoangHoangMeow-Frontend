<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import TopNav from '$lib/components/TopNav.svelte';
	import { api, request, isAuthenticated, getSession, saveSession, clearSession, ApiError } from '$lib/api';

	let session = getSession();
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');
	
	let profile = $state({
		username: '',
		phone: ''
	});

	let passwordMessage = $state('');
	let passwordError = $state('');
	
	let showDeleteModal = $state(false);
	let deleteConfirmText = $state('');
	let deleting = $state(false);
	let deleteError = $state('');

	onMount(async () => {
		if (!isAuthenticated()) {
			await goto('/login');
			return;
		}
		
		try {
			const data = await api<{ user: any }>('/api/me');
			profile.username = data.user.username || '';
			profile.phone = data.user.phone || '';
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดข้อมูลบัญชีได้';
		} finally {
			loading = false;
		}
	});

	async function updateProfile() {
		saving = true;
		error = '';
		success = '';
		try {
			const data = await request<{ user: any }>('/api/me', 'PATCH', profile);
			success = 'อัปเดตข้อมูลบัญชีสำเร็จ';
			if (session && data.user) {
				session.user = data.user;
				saveSession(session.token, session.user);
			}
		} catch (err) {
			error = err instanceof ApiError ? err.message : 'ไม่สามารถอัปเดตข้อมูลได้';
		} finally {
			saving = false;
		}
	}

	async function sendResetPassword() {
		if (!session?.user?.email) return;
		passwordError = '';
		passwordMessage = '';
		try {
			const result = await request<{ message: string }>('/api/auth/forgot-password', 'POST', { email: session.user.email });
			passwordMessage = result.message || 'ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบอีเมลของคุณ';
		} catch (err) {
			passwordError = err instanceof ApiError ? err.message : 'ไม่สามารถส่งลิงก์รีเซ็ตได้';
		}
	}

	async function deleteAccount() {
		if (deleteConfirmText !== 'ลบบัญชี') {
			deleteError = 'กรุณาพิมพ์คำว่า "ลบบัญชี" เพื่อยืนยัน';
			return;
		}
		deleting = true;
		deleteError = '';
		try {
			await request('/api/me', 'DELETE');
			clearSession();
			await goto('/login');
		} catch (err) {
			deleteError = err instanceof ApiError ? err.message : 'ไม่สามารถลบบัญชีได้';
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>ตั้งค่าบัญชี | Hoang Hoang Meow</title>
</svelte:head>

<TopNav title="ตั้งค่าบัญชี" />

<div class="p-6 space-y-6 max-w-3xl mx-auto animate-fade-in stagger-1">
	{#if loading}
		<p class="py-12 text-center text-sm text-gray-500">กำลังโหลดข้อมูล…</p>
	{:else}
		<!-- Profile Section -->
		<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-8">
			<h2 class="text-lg font-bold text-gray-800 mb-4">ข้อมูลโปรไฟล์</h2>
			<form onsubmit={(e) => { e.preventDefault(); updateProfile(); }} class="space-y-4">
				{#if error}<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>{/if}
				{#if success}<p class="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>{/if}
				
				<div>
					<label for="username" class="mb-1.5 block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
					<input
						id="username"
						type="text"
						required
						bind:value={profile.username}
						class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"
					/>
				</div>
				
				<div>
					<label for="phone" class="mb-1.5 block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
					<input
						id="phone"
						type="tel"
						bind:value={profile.phone}
						class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"
					/>
				</div>
				
				<div>
					<label class="mb-1.5 block text-sm font-medium text-gray-700">อีเมล</label>
					<input
						type="email"
						disabled
						value={session?.user?.email}
						class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
					/>
				</div>

				<div class="pt-2">
					<button
						type="submit"
						disabled={saving}
						class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 group disabled:opacity-60"
					>
						{saving ? 'กำลังบันทึก…' : 'บันทึกการเปลี่ยนแปลง'}
					</button>
				</div>
			</form>
		</div>

		<!-- Password Section -->
		<div class="rounded-3xl glass-heavy border border-white/60 shadow-xl animate-fade-up p-8">
			<h2 class="text-lg font-bold text-gray-800 mb-4">รหัสผ่านและความปลอดภัย</h2>
			{#if passwordError}<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{passwordError}</p>{/if}
			{#if passwordMessage}<p class="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{passwordMessage}</p>{/if}
			<p class="text-sm text-gray-500 mb-4">ระบบจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณ ({session?.user?.email})</p>
			<button
				onclick={sendResetPassword}
				class="rounded-2xl border-2 border-transparent bg-white/60 px-6 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-white shadow-sm"
			>
				ส่งอีเมลรีเซ็ตรหัสผ่าน
			</button>
		</div>

		<!-- Delete Account Section -->
		<div class="rounded-3xl glass-heavy border border-red-200/60 bg-red-50/50 shadow-xl animate-fade-up p-8">
			<h2 class="text-lg font-bold text-red-700 mb-2">เขตอันตราย</h2>
			<p class="text-sm text-red-600 mb-4">การลบบัญชีจะไม่สามารถกู้คืนได้ ข้อมูลสัตว์เลี้ยงและประวัติทั้งหมดจะถูกลบถาวร</p>
			<button
				onclick={() => (showDeleteModal = true)}
				class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/40 active:translate-y-0 group"
			>
				ลบบัญชีถาวร
			</button>
		</div>
	{/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 animate-fade-in"
		onclick={(e) => { if (e.target === e.currentTarget) showDeleteModal = false; }}
		onkeydown={(e) => { if (e.key === 'Escape') showDeleteModal = false; }}
		role="button"
		tabindex="0"
	>
		<div class="w-full max-w-md rounded-3xl glass-heavy p-8 shadow-2xl cursor-default animate-fade-up">
			<h2 class="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบบัญชี</h2>
			<p class="text-sm text-gray-500 mb-4">
				โปรดพิมพ์คำว่า <span class="font-bold text-red-600">ลบบัญชี</span> เพื่อยืนยันการลบข้อมูลทั้งหมดของคุณอย่างถาวร
			</p>
			
			{#if deleteError}<p class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{deleteError}</p>{/if}

			<input
				type="text"
				bind:value={deleteConfirmText}
				placeholder="ลบบัญชี"
				class="w-full mb-6 rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100/50 hover:bg-white"
			/>
			
			<div class="flex justify-end gap-3">
				<button
					onclick={() => { showDeleteModal = false; deleteConfirmText = ''; deleteError = ''; }}
					class="rounded-2xl border-2 border-transparent bg-white/60 px-6 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-white shadow-sm"
				>
					ยกเลิก
				</button>
				<button
					onclick={deleteAccount}
					disabled={deleting}
					class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/40 active:translate-y-0 group disabled:opacity-60"
				>
					{deleting ? 'กำลังลบ…' : 'ยืนยันการลบ'}
				</button>
			</div>
		</div>
	</div>
{/if}
