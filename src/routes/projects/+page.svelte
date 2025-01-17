<script>
	import { fade } from 'svelte/transition';
	
	let { data } = $props();
    let selectedTags = $state([]);

    // Filter projects by the selected tags
    let filteredProjects = $derived(
		data.projects.filter(project => 
			selectedTags.every(tag => project.tags.includes(tag))
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

		showContent = Array(filteredProjects.length).fill(false);

		let delay = 100;
		filteredProjects.forEach((_, index) => {
			setTimeout(() => {
				showContent[index] = true;
			}, delay);
			delay += 200;
		});
	}

	let showContent = $state(Array(data.projects.length).fill(false));

	let delay = 200;
	data.projects.forEach((_, index) => {
		setTimeout(() => {
			showContent[index] = true;
		}, delay);
		delay += 200;
	});
</script>

<div class="p-8 pt-28">
    <h1 class="text-lg font-semibold" in:fade>Projects</h1>

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

    <!-- Project List -->
    <ul class="mt-4 space-y-4">
        {#each filteredProjects as project, index}
			{#if showContent[index]}
				<li in:fade>
					<a href="/blog/{project.slug}" class="hover:link">
						<h2>{project.title}</h2>
						<p class="text-sm text-base-content/50">{project.date}</p>
					</a>
				</li>
			{/if}
        {/each}
        {#if filteredProjects.length === 0}
            <p class="text-base-content/50" in:fade>No projects found for these tags.</p>
        {/if}
    </ul>
</div>
