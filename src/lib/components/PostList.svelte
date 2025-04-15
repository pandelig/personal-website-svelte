<!-- @component Displays a filterable list of posts (blog or project articles) with tags and animated transitions -->
<script>
	import { fade } from "svelte/transition";
	import { page } from "$app/state";

	// Handle tag selection, called onclick
	function selectTag(tag) {
		if (selectedTags.includes(tag)) {
			// Remove the tag if it's already selected
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			// Add the tag if it's not already selected
			selectedTags.push(tag);
		}

		showContent = Array(filteredPosts.length).fill(false);

		let delay = 200;
		filteredPosts.forEach((_, index) => {
			setTimeout(() => {
				showContent[index] = true;
			}, delay);
			delay += 200;
		});
	}
	let { posts, tags } = $props();

	const postType = page.url.pathname.slice(1);
	let delay = 200;

	let showContent = $state(Array(posts.length).fill(false));
	let selectedTags = $state(
		page.url.searchParams.get("tag") ? [page.url.searchParams.get("tag")] : []
	);

	let filteredPosts = $derived(
		posts.filter((post) => selectedTags.every((tag) => post.tags.includes(tag)))
	);

	posts.forEach((_, index) => {
		setTimeout(() => {
			showContent[index] = true;
		}, delay);
		delay += 200;
	});
</script>

<svelte:head>
	<title>{postType === "blog" ? "Blog" : "Projects"} - Pantelis Deligiannidis</title>
	<meta
		name="description"
		content="Discover {postType === 'blog'
			? 'articles'
			: 'projects'} on full stack Web Development, DevOps, Cloud Computing, Linux, and occasionally random ideas."
	/>
</svelte:head>

<div class="p-8 pt-28">
	<h1 class="text-lg font-semibold" in:fade>{postType === "blog" ? "Blog" : "Projects"}</h1>

	<!-- Tag Filter -->
	<div class="flex flex-wrap p-2" in:fade>
		{#each tags as tag}
			<button
				onclick={() => selectTag(tag)}
				class="px-2 {selectedTags.includes(tag)
					? 'text-accent'
					: 'text-secondary'} sm:hover:text-accent"
			>
				#{tag}
			</button>
		{/each}
	</div>

	<!-- Post List -->
	<ul class="space-y-4">
		{#each filteredPosts as post, index}
			{#if showContent[index]}
				<li in:fade>
					<a href="/{postType}/{post.slug}" class="hover:link">
						<h2>{post.title}</h2>
						<p class="text-sm text-secondary">
							{post.date}
							{#if post.date_updated}
								- updated {post.date_updated}
							{/if}
						</p>
					</a>
				</li>
			{/if}
		{/each}
		{#if filteredPosts.length === 0}
			<p class="text-secondary" in:fade>No posts found for these tags.</p>
		{/if}
	</ul>
</div>
