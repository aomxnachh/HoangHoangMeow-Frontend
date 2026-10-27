<script lang="ts">
	import { onMount } from 'svelte';
	type Ad = { id: number; title?: string | null; content: string; imageUrl?: string | null };
	let { items, title = 'สินค้าแนะนำ' }: { items: Ad[]; title?: string } = $props();
	let width = $state(0);
	let pageIndex = $state(0);
	let paused = $state(false);
	let hovered = $state(false);
	let focused = $state(false);
	let visible = $state(true);
	let pageSize = $derived(width >= 900 ? 3 : width >= 560 ? 2 : 1);
	let pageCount = $derived(Math.ceil(items.length / pageSize));
	let currentPage = $derived(Math.min(pageIndex, Math.max(0, pageCount - 1)));
	let visibleItems = $derived(items.slice(currentPage * pageSize, (currentPage + 1) * pageSize));
	let itemIds = $derived(items.map(item => item.id).join(','));

	$effect(() => {
		// A new filter/result set or a resized container starts at the first set.
		void itemIds;
		void pageSize;
		pageIndex = 0;
	});
	onMount(() => {
		const updateVisibility = () => visible = document.visibilityState === 'visible';
		updateVisibility();
		document.addEventListener('visibilitychange', updateVisibility);
		return () => document.removeEventListener('visibilitychange', updateVisibility);
	});
	$effect(() => {
		const page = currentPage;
		const count = pageCount;
		if (count <= 1 || paused || hovered || focused || !visible) return;
		const timer = window.setTimeout(() => pageIndex = (page + 1) % count, 5000);
		return () => window.clearTimeout(timer);
	});
</script>

{#if items.length}
	<section aria-label={title} class="mt-4 min-w-0 space-y-3" bind:clientWidth={width}
		onpointerenter={() => hovered = true} onpointerleave={() => hovered = false}
		onfocusin={() => focused = true} onfocusout={(event) => focused = !!event.relatedTarget && event.currentTarget.contains(event.relatedTarget as Node)}>
		<div class="flex flex-wrap items-center justify-between gap-3">
			<h2 class="text-base font-bold text-gray-800">{title}</h2>
				<div class="flex flex-wrap items-center gap-2">
					<button type="button" aria-label="โฆษณาชุดก่อนหน้า" disabled={currentPage === 0} onclick={() => pageIndex = currentPage - 1} class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-40">ก่อนหน้า</button>
					<span role="status" aria-live={paused || hovered || focused ? 'polite' : 'off'} aria-atomic="true" class="text-xs text-gray-500">ชุดที่ {currentPage + 1} จาก {pageCount}</span>
					<button type="button" aria-label="โฆษณาชุดถัดไป" disabled={currentPage === pageCount - 1} onclick={() => pageIndex = currentPage + 1} class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-40">ถัดไป</button>
				</div>
		</div>
		{#if pageCount > 1}
			<div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
				<span>{paused ? 'หยุดเลื่อนอัตโนมัติอยู่' : 'เลื่อนอัตโนมัติทุก 5 วินาที · หยุดชั่วคราวขณะชี้เมาส์หรือเลือกอ่าน'}</span>
				<button type="button" onclick={() => paused = !paused} class="rounded-lg px-2 py-1 font-semibold text-brand-600 underline focus-visible:outline-2 focus-visible:outline-brand-500">{paused ? 'เริ่มเลื่อนอัตโนมัติ' : 'หยุดเลื่อนอัตโนมัติ'}</button>
			</div>
		{:else}
			<p class="text-xs text-gray-500">แสดงโฆษณาครบแล้วในชุดนี้</p>
		{/if}
		<div class="grid min-w-0 gap-3" style={`grid-template-columns: repeat(${pageSize}, minmax(0, 1fr))`}>
			{#each visibleItems as product (product.id)}
				<a href={`/products/${product.id}`} class="group block min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-brand-500">
					{#if product.imageUrl}<img src={product.imageUrl} alt={product.title || 'สินค้าแนะนำ'} class="h-32 w-full object-cover" />{/if}
					<div class="min-w-0 p-4">
						<p class="line-clamp-2 break-words font-semibold text-gray-800 group-hover:text-brand-600">{product.title || 'สินค้าแนะนำ'}</p>
						<p class="mt-1 line-clamp-2 break-words text-sm text-gray-600">{product.content}</p>
						<span class="mt-3 inline-block text-sm text-brand-600">ดูสินค้า</span>
					</div>
				</a>
			{/each}
		</div>
	</section>
{/if}
