<script lang="ts">
	import type { Pet } from '$lib/data/mock-data';

	let { pet }: { pet: Pet } = $props();
</script>

<a
	href="/pets/{pet.id}"
	class="group flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-100"
>
	<!-- Pet Avatar -->
	<div
		class="mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-50 text-4xl transition-colors group-hover:bg-indigo-50"
	>
		{pet.image}
	</div>

	<!-- Pet Info -->
	<h3 class="text-base font-semibold text-gray-800">{pet.name}</h3>
	<p class="text-sm text-gray-500">{pet.species} · {pet.breed}</p>

	<!-- Status badge -->
	<span
		class="mt-2 rounded-full px-3 py-0.5 text-xs font-medium {pet.status === 'ปกติ'
			? 'bg-green-100 text-green-700'
			: 'bg-amber-100 text-amber-700'}"
	>
		{pet.status}
	</span>
</a>
