<script lang="ts">
	let { image = '', name = 'สัตว์เลี้ยง' }: { image?: string; name?: string } = $props();
	let failedImage = $state('');
	let imageSource = $derived(/^(data:image\/|https?:\/\/|\/)/i.test(image));
	let emoji = $derived(image && !imageSource && image.length <= 16 ? image : '🐾');
</script>

<span class="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-2xl">
	{#if imageSource && failedImage !== image}
		<img src={image} alt={`รูปของ ${name}`} class="h-full w-full object-cover" onerror={() => failedImage = image} />
	{:else}
		<span aria-hidden="true">{imageSource ? '🐾' : emoji}</span>
	{/if}
</span>
