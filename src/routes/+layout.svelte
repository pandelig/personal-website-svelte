<script>
	import '../app.css';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

	let { children } = $props();
</script>

<nav
	class="bg-base-100/90 text-secondary sticky top-0 z-10 mx-auto max-w-screen-sm p-8 py-4 text-base"
>
	<div class="flex justify-end gap-2">
		{#if page.url.pathname !== '/'}
			<a href="/" class="text-secondary hover:text-accent inline-block" in:fade> home </a>
			<span in:fade> | </span>
		{/if}
		<a
			href="/blog"
			class="hover:text-accent inline-block {page.url.pathname === '/blog'
				? 'text-accent'
				: 'text-secondary'}"
		>
			blog
		</a>
		<span> | </span>
		<a
			href="/projects"
			class="hover:text-accent inline-block {page.url.pathname === '/projects'
				? 'text-accent'
				: 'text-secondary'}"
		>
			projects
		</a>
	</div>
</nav>

<main class="bg-base-100 text-primary relative mx-auto max-w-screen-sm text-base">
	{@render children()}
</main>
