<script>
	import '../app.css';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

	let { children } = $props();
</script>

<nav
	class="sticky top-0 z-10 mx-auto max-w-screen-sm bg-base-100/90 p-8 py-4 text-base text-base-content"
>
	<div class="flex justify-end gap-2">
		{#if page.url.pathname !== '/'}
			<a href="/" class="inline-block text-stone-500 hover:text-base-content" in:fade> home </a>
			<span in:fade> | </span>
		{/if}
		<a
			href="/blog"
			class="inline-block hover:text-base-content {page.url.pathname === '/blog'
				? 'text-base-content'
				: 'text-stone-500'}"
		>
			blog
		</a>
		<span> | </span>
		<a
			href="/projects"
			class="inline-block hover:text-base-content {page.url.pathname === '/projects'
				? 'text-base-content'
				: 'text-stone-500'}"
		>
			projects
		</a>
	</div>
</nav>

<main class="relative mx-auto max-w-screen-sm bg-base-100 text-base text-base-content">
	{@render children()}
</main>
