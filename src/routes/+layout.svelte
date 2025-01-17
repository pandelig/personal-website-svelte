<script>
	import '../app.css';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

	let { children } = $props();
</script>

<nav class="z-10 mx-auto max-w-screen-sm p-8 py-4 text-base bg-base-100/90 text-base-content sticky top-0">
	<div class="flex justify-end gap-2">
		{#if page.url.pathname !== '/'}
			<a
				href="/"
				class="inline-block text-base-content/50 hover:text-base-content"
				in:fade
			>
				home
			</a> 
			<span in:fade> | </span>
		{/if}
		<a
			href="/blog"
			class="inline-block hover:text-base-content {page.url.pathname === '/blog' ? 'text-base-content' : 'text-base-content/50'}"
		>
			blog
		</a> 
		<span> | </span>
		<a
			href="/projects"
			class="inline-block hover:text-base-content {page.url.pathname === '/projects' ? 'text-base-content' : 'text-base-content/50'}"
		>
			projects
		</a>
	</div>
</nav>

<main class="mx-auto max-w-screen-sm text-base bg-base-100 text-base-content">
	{@render children()}
</main>
