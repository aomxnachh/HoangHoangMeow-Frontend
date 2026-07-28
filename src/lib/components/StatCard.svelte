<script lang="ts">
	let {
		label,
		value,
		icon,
		color = 'indigo'
	}: {
		label: string;
		value: string | number;
		icon: string;
		color?: 'indigo' | 'green' | 'amber' | 'rose' | 'blue' | 'purple';
	} = $props();

	const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
		indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', text: 'text-indigo-600' },
		green: { bg: 'bg-green-50', icon: 'text-green-600', text: 'text-green-600' },
		amber: { bg: 'bg-amber-50', icon: 'text-amber-600', text: 'text-amber-600' },
		rose: { bg: 'bg-rose-50', icon: 'text-rose-600', text: 'text-rose-600' },
		blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-600' },
		purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-600' }
	};

	let c = $derived(colorClasses[color] || colorClasses.indigo);
</script>

<div class="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
	<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl {c.bg}">
		{#if icon === 'paw'}
			<svg class="h-6 w-6 {c.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V2.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
			</svg>
		{:else if icon === 'syringe'}
			<svg class="h-6 w-6 {c.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.75v4.5m3-4.5v4.5M4.5 9.75h15M4.5 15h15a2.25 2.25 0 002.25-2.25V9.75a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 9.75v3.75A2.25 2.25 0 004.5 15zM12 9.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
			</svg>
		{:else if icon === 'money'}
			<svg class="h-6 w-6 {c.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
			</svg>
		{:else if icon === 'bell'}
			<svg class="h-6 w-6 {c.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
			</svg>
		{:else if icon === 'receipt'}
			<svg class="h-6 w-6 {c.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm4.5 4.5h.008v.008h-.008V13.5z" />
			</svg>
		{:else if icon === 'heart'}
			<svg class="h-6 w-6 {c.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
			</svg>
		{:else if icon === 'trending'}
			<svg class="h-6 w-6 {c.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
				<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
			</svg>
		{/if}
	</div>

	<div>
		<p class="text-sm text-gray-500">{label}</p>
		<p class="text-2xl font-bold {c.text}">{value}</p>
	</div>
</div>
