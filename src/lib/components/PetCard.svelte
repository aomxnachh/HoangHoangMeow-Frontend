<script lang="ts">
	import type { Pet } from '$lib/data/mock-data';
	import Icon from '$lib/components/Icon.svelte';

	let { pet }: { pet: Pet } = $props();
</script>

<a
	href="/pets/{pet.id}"
	class="group flex flex-col items-center rounded-2xl glass-card p-5 relative overflow-hidden"
>
	<!-- Decorative background blob on hover -->
	<div class="absolute inset-0 bg-gradient-to-t from-brand-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"></div>

	<!-- Pet Avatar -->
	<div
		class="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50/50 text-brand-500 shadow-sm transition-all duration-300 group-hover:bg-brand-100 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-brand-200/50 relative z-10"
	>
		{#if !pet.image || pet.image === '🐾' || pet.image.match(/[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u)}
			<Icon name={pet.species === 'หมา' ? 'dog' : 'cat'} class="w-10 h-10" />
		{:else}
			<img src={pet.image} alt={pet.name} class="w-full h-full object-cover rounded-2xl" />
		{/if}
	</div>

	<!-- Pet Info -->
	<h3 class="text-base font-semibold text-gray-800 transition-colors group-hover:text-brand-700 relative z-10">{pet.name}</h3>
	<p class="text-sm text-gray-500 relative z-10">{pet.species} · {pet.breed}</p>

	<!-- Status badge -->
	<span
		class="mt-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 relative z-10 {pet.status === 'ปกติ'
			? 'bg-green-100 text-green-700 border border-green-200/50'
			: 'bg-amber-100 text-amber-700 border border-amber-200/50'}"
	>
		{pet.status}
	</span>
</a>
