<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import TopNav from '$lib/components/TopNav.svelte';
	import PetCard from '$lib/components/PetCard.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { Pet } from '$lib/data/mock-data';
	import { ApiError, api } from '$lib/api';
	import { i18n } from '$lib/i18n';

	let pets = $state<Pet[]>([]);
	let loading = $state(true);
	let error = $state('');
	let saving = $state(false);
	let newPet = $state({ name: '', species: 'แมว', breed: '', gender: 'UNKNOWN', birthdate: '', weight: '', color: '', allergies: '', notes: '' });

	let searchQuery = $state('');
	let filterSpecies = $state('ทั้งหมด');

	let speciesOptions = $derived(['ทั้งหมด', ...new Set(pets.map((p) => p.species))]);

	let filteredPets = $derived(
		pets.filter((p) => {
			const matchesSearch =
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.breed.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesSpecies = filterSpecies === 'ทั้งหมด' || p.species === filterSpecies;
			return matchesSearch && matchesSpecies;
		})
	);

	let showAddModal = $state(false);
	let showLimitPopup = $state(false);

	async function loadPets() {
		loading = true;
		try {
			const result = await api<{ pets: Array<any> }>('/api/pets');
			pets = result.pets.map((pet) => ({ ...pet, id: String(pet.id), image: pet.image || '🐾', age: pet.age || '-', weight: pet.weight ? `${pet.weight} กก.` : '-', color: pet.color || '-', status: pet.status || 'ปกติ' }));
		} catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดข้อมูลสัตว์เลี้ยงได้'; }
		finally { loading = false; }
	}

	async function addPet() {
		saving = true; error = '';
		try {
			await api('/api/pets', { method: 'POST', body: JSON.stringify({ ...newPet, weight: newPet.weight || undefined }) });
			showAddModal = false;
			newPet = { name: '', species: 'แมว', breed: '', gender: 'UNKNOWN', birthdate: '', weight: '', color: '', allergies: '', notes: '' };
			await loadPets();
		} catch (err) {
			if (err instanceof ApiError && err.code === 'PET_LIMIT_REACHED') {
				showAddModal = false;
				showLimitPopup = true;
			} else {
				error = err instanceof ApiError ? err.message : 'ไม่สามารถเพิ่มสัตว์เลี้ยงได้';
			}
		}
		finally { saving = false; }
	}

	onMount(loadPets);
</script>

<svelte:head>
	<title>{i18n.pets.title} | PetCare</title>
</svelte:head>

<TopNav title={i18n.pets.title} subtitle={i18n.pets.subtitle} />

<div class="p-4 space-y-6 sm:p-6 lg:p-8">
	<!-- Search & Filter Bar -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex w-full flex-1 flex-col gap-3 min-[480px]:flex-row">
			<!-- Search -->
			<div class="relative flex-1 max-w-md">
				<svg
					class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
					/>
				</svg>
				<input
					type="text"
					placeholder="ค้นหาชื่อหรือพันธุ์..."
					bind:value={searchQuery}
					class="w-full rounded-2xl border-2 border-transparent bg-white/60 py-3 pl-11 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"
				/>
			</div>

			<!-- Filter -->
			<select
				bind:value={filterSpecies}
				class="rounded-2xl border-2 border-transparent bg-white/60 px-5 py-3 text-sm text-gray-700 outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white appearance-none cursor-pointer"
			>
				{#each speciesOptions as opt}
					<option value={opt}>{opt}</option>
				{/each}
			</select>
		</div>

		<!-- Add Pet Button -->
		<button
			onclick={() => (showAddModal = true)}
			class="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 sm:w-auto"
		>
			<span class="relative z-10 flex items-center gap-2">
				<svg class="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
				</svg>
				เพิ่มสัตว์เลี้ยง
			</span>
			<div class="absolute inset-0 h-full w-full bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
		</button>
	</div>

	<!-- Pet Grid -->
	{#if error}<p class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>{/if}
	{#if loading}<p class="py-12 text-center text-sm text-gray-500">กำลังโหลดข้อมูล…</p>{/if}
	<div class="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each filteredPets as pet (pet.id)}
			<PetCard {pet} />
		{/each}
	</div>

	{#if filteredPets.length === 0}
		<div class="py-20 text-center">
			<div class="flex justify-center text-gray-300"><Icon name="search" class="w-16 h-16" /></div>
			<p class="mt-4 text-gray-500">ไม่พบสัตว์เลี้ยงที่ตรงกับการค้นหา</p>
		</div>
	{/if}

	<!-- Add Pet Modal -->
	{#if showAddModal}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 transition-all"
			onclick={(e) => { if (e.target === e.currentTarget) showAddModal = false; }}
			onkeydown={(e) => { if (e.key === 'Escape') showAddModal = false; }}
			role="button"
			tabindex="0"
		>
			<div class="mx-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/60 glass-heavy p-5 shadow-2xl animate-fade-up cursor-default sm:p-8">
				<div class="flex items-center justify-between mb-8">
					<h2 class="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
						<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><Icon name="sparkles" class="w-6 h-6" /></span>
						เพิ่มสัตว์เลี้ยง
					</h2>
					<button
						aria-label="ปิดหน้าต่างเพิ่มสัตว์เลี้ยง"
						onclick={() => (showAddModal = false)}
						class="rounded-xl bg-gray-100/50 p-2 text-gray-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); addPet(); }}>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label for="pet-name" class="mb-1 block text-sm font-medium text-gray-700">ชื่อ</label>
							<input
								id="pet-name"
								type="text"
								required
								bind:value={newPet.name}
								placeholder="เช่น โมจิ"
								class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"
							/>
						</div>
						<div>
							<label for="pet-species" class="mb-1.5 block text-sm font-bold text-gray-700">ชนิด</label>
							<select id="pet-species" bind:value={newPet.species} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
								<option value="แมว">แมว</option>
								<option value="หมา">หมา</option>
							</select>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label for="pet-breed" class="mb-1.5 block text-sm font-bold text-gray-700">พันธุ์</label>
							<input
								id="pet-breed"
								type="text"
								bind:value={newPet.breed}
								placeholder="เช่น สก็อตติชโฟลด์"
								class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"
							/>
						</div>
						<div>
							<label for="pet-gender" class="mb-1.5 block text-sm font-bold text-gray-700">เพศ</label>
							<select id="pet-gender" bind:value={newPet.gender} class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white">
								<option value="UNKNOWN">ไม่ระบุ</option>
								<option value="MALE">เพศผู้</option>
								<option value="FEMALE">เพศเมีย</option>
							</select>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label for="pet-age" class="mb-1.5 block text-sm font-bold text-gray-700">อายุ (วันเกิด)</label>
							<input
								id="pet-age"
								type="date"
								bind:value={newPet.birthdate}
								class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"
							/>
						</div>
						<div>
							<label for="pet-weight" class="mb-1.5 block text-sm font-bold text-gray-700">น้ำหนัก</label>
							<input
								id="pet-weight"
								type="number"
								step="0.01"
								bind:value={newPet.weight}
								placeholder="เช่น 3.5 กก."
								class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label for="pet-color" class="mb-1.5 block text-sm font-bold text-gray-700">สี</label>
							<input
								id="pet-color"
								type="text"
								bind:value={newPet.color}
								placeholder="เช่น ส้ม"
								class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"
							/>
						</div>
						<div>
							<label for="pet-allergies" class="mb-1.5 block text-sm font-bold text-gray-700">ข้อมูลการแพ้</label>
							<textarea
								id="pet-allergies"
								bind:value={newPet.allergies}
								placeholder="เช่น แพ้ยา..."
								rows="1"
								class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"
							></textarea>
						</div>
					</div>

					<div>
						<label for="pet-notes" class="mb-1.5 block text-sm font-bold text-gray-700">หมายเหตุเพิ่มเติม</label>
						<textarea
							id="pet-notes"
							bind:value={newPet.notes}
							placeholder="ข้อมูลอื่นๆ ที่เป็นประโยชน์"
							rows="2"
							class="w-full rounded-2xl border-2 border-transparent bg-white/60 px-4 py-3 text-sm outline-none transition-all focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100/50 hover:bg-white"
						></textarea>
					</div>

					<div class="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
						<button
							type="button"
							onclick={() => (showAddModal = false)}
							class="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 border border-gray-200 shadow-sm"
						>
							ยกเลิก
						</button>
						<button
							type="submit"
							disabled={saving}
							class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none group"
						>
							<span class="relative z-10">{saving ? 'กำลังบันทึก…' : 'บันทึก'}</span>
							<div class="absolute inset-0 h-full w-full bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	{#if showLimitPopup}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
			onclick={(e) => { if (e.target === e.currentTarget) showLimitPopup = false; }}
			onkeydown={(e) => { if (e.key === 'Escape') showLimitPopup = false; }}
			role="button"
			tabindex="0"
		>
			<div class="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
				<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500"><Icon name="crown" class="w-8 h-8" /></div>
				<h2 class="mt-4 text-xl font-bold text-gray-800">ถึงขีดจำกัดแล้ว!</h2>
				<p class="mt-2 text-sm text-gray-500">แพ็กเกจ Free สามารถเพิ่มสัตว์เลี้ยงได้สูงสุด <strong class="text-gray-700">3 ตัว</strong> เท่านั้น</p>
				<p class="mt-1 text-sm text-gray-500">อัปเกรดเป็น <span class="font-semibold text-amber-600">Premium</span> เพื่อเพิ่มสัตว์เลี้ยงได้ไม่จำกัด</p>
				<div class="mt-6 flex justify-center gap-3">
					<button
						onclick={() => (showLimitPopup = false)}
						class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
					>
						ภายหลัง
					</button>
					<button
						onclick={() => { showLimitPopup = false; goto('/upgrade'); }}
						class="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:from-amber-600 hover:to-orange-600"
					>
						<Icon name="crown" class="w-4 h-4" /> อัปเกรดเลย
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
