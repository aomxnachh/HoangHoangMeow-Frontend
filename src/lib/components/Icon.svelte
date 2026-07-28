<script lang="ts">
	let { name, class: className = "w-5 h-5" } = $props<{ name: string; class?: string }>();
</script>

{#if name === 'gender'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<circle cx="10" cy="14" r="5" />
		<path d="M10 19v4" />
		<path d="M8 21h4" />
		<circle cx="16" cy="8" r="4" />
		<path d="M18.8 5.2 22 2" />
		<path d="M18 2h4v4" />
	</svg>
{:else if name === 'calendar'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
		<path d="M16 2v4" />
		<path d="M8 2v4" />
		<path d="M3 10h18" />
		<circle cx="17" cy="17" r="2.5" />
	</svg>
{:else if name === 'id-card'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<rect x="2" y="5" width="20" height="14" rx="2" />
		<path d="M2 10h20" />
		<circle cx="7" cy="15" r="2" />
		<path d="M12 14h6" />
		<path d="M12 17h6" />
	</svg>
{:else if name === 'collar'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M12 2C7 2 3 4.2 3 7v2c0 2.8 4 5 9 5s9-2.2 9-5V7c0-2.8-4-5-9-5z" />
		<circle cx="12" cy="18" r="4" />
		<circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
		<circle cx="10.5" cy="17.5" r="0.5" fill="currentColor" />
		<circle cx="13.5" cy="17.5" r="0.5" fill="currentColor" />
	</svg>
{:else if name === 'weight'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
		<path d="M9 10V7a3 3 0 0 1 6 0v3" />
		<text x="12" y="17" font-size="5" font-family="sans-serif" font-weight="bold" text-anchor="middle" stroke="none" fill="currentColor">KG</text>
	</svg>
{:else if name === 'palette'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M12 2.15a9.8 9.8 0 0 0-9.8 9.8c0 5.4 4.4 9.8 9.8 9.8 2 0 3.5-1.5 3.5-3.5 0-.8-.3-1.5-.7-2a2 2 0 0 1 1.4-3.4h2.1c3.1 0 5.7-2.6 5.7-5.7 0-3-4.5-5-12-5Z"/>
		<circle cx="7.5" cy="10.5" r="1.5" stroke="none" fill="currentColor" />
		<circle cx="10.5" cy="6.5" r="1.5" stroke="none" fill="currentColor" />
		<circle cx="14.5" cy="7.5" r="1.5" stroke="none" fill="currentColor" />
	</svg>
{:else if name === 'clipboard'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
		<rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
	</svg>
{:else if name === 'pill'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
		<path d="m8.5 8.5 7 7" />
	</svg>
{:else if name === 'syringe'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="m18 2 4 4" />
		<path d="m17 7 3-3" />
		<path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.4 0-3.4L15 5" />
		<path d="m9 11 4 4" />
		<path d="m5 19-3 3" />
		<path d="m14 4 6 6" />
	</svg>
{:else if name === 'stethoscope'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
		<path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
		<circle cx="20" cy="10" r="2" />
	</svg>
{:else if name === 'tooth'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M10 21V14" />
		<path d="M14 21V14" />
		<path d="M19 14.5c0-1.7-1-3-2-3s-2-1-2-2-1-3-3-3-3 2-4 3-2 1-2 2-1 1.3-1 3c0 2 1.5 3.5 3.5 3.5h.5c1.1 0 2 1.2 2 2.5V21h4v-1.5c0-1.3.9-2.5 2-2.5h.5c2 0 3.5-1.5 3.5-3.5Z" />
	</svg>
{:else if name === 'search'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<circle cx="11" cy="11" r="8" />
		<path d="m21 21-4.3-4.3" />
	</svg>
{:else if name === 'crown'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
	</svg>
{:else if name === 'sparkles'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
		<path d="M5 3v4" />
		<path d="M19 17v4" />
		<path d="M3 5h4" />
		<path d="M17 19h4" />
	</svg>
{:else if name === 'cat' || name === 'pet'}
	<img src="/cat-icon.png" alt="cat" class="{className} object-contain" />
{:else if name === 'dog'}
	<img src="/dog-icon.png" alt="dog" class="{className} object-contain" />
{:else if name === 'log-out'}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
		<polyline points="16 17 21 12 16 7" />
		<line x1="21" y1="12" x2="9" y2="12" />
	</svg>
{/if}
