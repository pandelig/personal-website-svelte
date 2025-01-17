<script>
	import { fade } from 'svelte/transition';
	
	let { data } = $props();
    let selectedTags = $state([]);

    // Filter articles by the selected tags
    let filteredArticles = $derived(
		data.articles.filter(article => 
			selectedTags.every(tag => article.tags.includes(tag))
		)
	);

    // Handle tag selection, called onclick
    function selectTag(tag) {
		if (selectedTags.includes(tag)) {
			// Remove the tag if it's already selected
			selectedTags = selectedTags.filter(t => t !== tag);
		} else {
			// Add the tag if it's not already selected
			selectedTags = [...selectedTags, tag];
		}

		showContent = Array(filteredArticles.length).fill(false);

		let delay = 100;
		filteredArticles.forEach((_, index) => {
			setTimeout(() => {
				showContent[index] = true;
			}, delay);
			delay += 200;
		});
	}

	let showContent = $state(Array(data.articles.length).fill(false));

	let delay = 200;
	data.articles.forEach((_, index) => {
		setTimeout(() => {
			showContent[index] = true;
		}, delay);
		delay += 200;
	});
</script>

<div class="p-8 pt-28">
    <h1 class="text-lg font-semibold" in:fade>Blog</h1>

    <!-- Tag Filter -->
    <div class="flex gap-2 mb-4" in:fade>
        {#each data.tags as tag}
            <button
                onclick={() => selectTag(tag)}
                class="px-4 py-2 {selectedTags.includes(tag) ? 'text-base-content' : 'text-base-content/50'} hover:text-base-content"
            >
                {tag}
            </button>
        {/each}
    </div>

    <!-- Article List -->
    <ul class="mt-4 space-y-4">
        {#each filteredArticles as article, index}
			{#if showContent[index]}
				<li in:fade>
					<a href="/blog/{article.slug}" class="hover:link">
						<h2>{article.title}</h2>
						<p class="text-sm text-base-content/50">{article.date}</p>
					</a>
				</li>
			{/if}
        {/each}
        {#if filteredArticles.length === 0}
            <p class="text-base-content/50" in:fade>No articles found for these tags.</p>
        {/if}
    </ul>
</div>
