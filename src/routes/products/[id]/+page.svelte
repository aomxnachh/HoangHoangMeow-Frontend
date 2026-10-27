<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { api, request, getSession, ApiError } from '$lib/api';
	import TopNav from '$lib/components/TopNav.svelte';
	let product = $state<any>(null);
	let error = $state('');
	let loading = $state(false);
	const returnTo = () => `/login?next=${encodeURIComponent($page.url.pathname)}`;
	onMount(async () => {
		if (!getSession()) { await goto(returnTo()); return; }
		try { product = (await api<{ product: any }>(`/api/products/${$page.params.id}`)).product; }
		catch (err) { error = err instanceof ApiError ? err.message : 'ไม่สามารถโหลดสินค้าได้'; }
	});
	async function checkout() {
		loading = true; error = '';
		try {
			const result = await request<{ url: string }>(`/api/products/${$page.params.id}/checkout`, 'POST');
			window.location.assign(result.url);
		} catch (err) { error = err instanceof ApiError ? err.message : 'สินค้าหมดชั่วคราว'; }
		finally { loading = false; }
	}
</script>
<svelte:head><title>สินค้าแนะนำ | HoangHoang Meow</title></svelte:head>
<TopNav title="สินค้าแนะนำ" subtitle="สินค้าที่เกี่ยวข้องกับการดูแลสัตว์เลี้ยง" />
<div class="mx-auto max-w-2xl space-y-5 p-6">
	{#if error}<p role="alert" class="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>{/if}
	{#if product}
		{#if product.imageUrl}<img class="max-h-80 w-full rounded-xl object-contain" src={product.imageUrl} alt={product.title || 'สินค้าแนะนำ'} />{/if}
		<h1 class="text-2xl font-bold">{product.title || 'สินค้าแนะนำ'}</h1><p>{product.content}</p>
		<button onclick={checkout} disabled={loading} class="rounded-xl bg-brand-500 px-5 py-3 font-bold text-white disabled:opacity-50">{loading ? 'กำลังตรวจสอบสินค้า…' : 'ไปหน้าสั่งซื้อ'}</button>
	{/if}
	<a class="block text-brand-600 underline" href="/care">กลับไปแผนดูแล</a>
</div>
