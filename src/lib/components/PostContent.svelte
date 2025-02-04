<script>
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import ContactForm from '$lib/components/ContactForm.svelte';

	function scrollToTop() {
		window.scrollTo({ top: 0 });
	}

	/** Updates active heading based on current scroll position in the document */
	function handleScroll() {
		const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
		const scrollPosition = window.scrollY + 15; // Add some padding

		// Check if the user has scrolled to the bottom
		if (scrollTop + clientHeight >= scrollHeight - 10) {
			activeHeading = headings[headings.length - 1].id;
		} else {
			let current = headings.findLast((h) => scrollPosition >= h.offset);
			activeHeading = current ? current.id : headings[0].id;
		}
	}

	let { metadata, content, formResponse } = $props();

	let contactFormTitle = metadata.post_type === 'blog' ? 'Share Your Thoughts' : 'Project Feedback';
	let contactFormDescription =
		metadata.post_type === 'blog'
			? 'Did this article help you? Got suggestions or feedback? Let me know!'
			: 'Did you find this project helpful or interesting? Share your thoughts!';

	const TOTAL_ELEMENTS_TO_TRANSITION = 6; // 1: dates & tags, 2: title, 3: content, 4: back to top button, 5: contact form, 6: contents
	const formParameters = $derived({
		title: contactFormTitle,
		description: contactFormDescription,
		formResponse
	});
	let delay = 200;
	let contents_indents = {
		h1: 'pl-0',
		h2: 'pl-4',
		h3: 'pl-8'
	};

	let headings = $state([]);
	let activeHeading = $state();
	let showContent = $state(Array(TOTAL_ELEMENTS_TO_TRANSITION).fill(false));

	for (let i = 0; i < TOTAL_ELEMENTS_TO_TRANSITION - 1; i++) {
		setTimeout(() => {
			showContent[i] = true;
		}, delay);
		delay += 200;
	}

	$effect(() => {
		if (
			(showContent[TOTAL_ELEMENTS_TO_TRANSITION - 2] && headings.length === 0) ||
			(headings.length > 0 && headings[0].text !== metadata.title)
		) {
			headings = Array.from(document.querySelectorAll('.prose h1, .prose h2, .prose h3')).map(
				(h) => ({
					id: h.id,
					text: h.innerText,
					level: h.tagName.toLowerCase(),
					offset: h.offsetTop
				})
			);
			handleScroll();

			if (showContent[TOTAL_ELEMENTS_TO_TRANSITION - 1] === false) {
				showContent[TOTAL_ELEMENTS_TO_TRANSITION - 1] = true;
				window.addEventListener('scroll', handleScroll);
			}
		}
	});

	onDestroy(() => {
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.meta_description} />
</svelte:head>

<!-- Remember to always have the last element of showContent be responsible for the Contents div -->
{#if showContent[TOTAL_ELEMENTS_TO_TRANSITION - 1]}
	<div class="absolute -right-80 top-0 hidden h-full w-72 p-4 text-stone-500 xl:block" in:fade>
		<div class="sticky top-24">
			<h2 class="mb-4 font-semibold">Contents</h2>
			<ul>
				{#each headings as heading}
					<li
						class="mt-1 {contents_indents[heading.level]} hover:text-base-content {heading.id ===
						activeHeading
							? 'text-base-content'
							: ''}"
					>
						<a href={`#${heading.id}`}>{heading.text}</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}

<div class="p-8">
	{#if showContent[0]}
		<div class="text-sm text-stone-500" in:fade>
			{metadata.date}
			{#if metadata.date_updated}
				- updated {metadata.date_updated}
			{/if}
		</div>
	{/if}
	<div
		class="prose prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base"
	>
		{#if showContent[0]}
			<div class="flex flex-wrap" in:fade>
				{#each metadata.tags as tag}
					<a
						href={`/${metadata.post_type}?tag=${tag}`}
						class="not-prose p-2 text-stone-500 hover:text-base-content"
					>
						#{tag}
					</a>
				{/each}
			</div>
		{/if}

		{#if showContent[1]}
			<h1 id={metadata.title.toLowerCase().replace(/\s+/g, '-')} in:fade>{metadata.title}</h1>
		{/if}

		{#if showContent[2]}
			<div in:fade>
				<!-- eslint-disable-next-line -->
				{@html content}
			</div>
		{/if}
	</div>
</div>

{#if showContent[3]}
	<div class="p-8 py-0 text-right" in:fade>
		<button onclick={scrollToTop} class="text-base text-stone-500 sm:hover:text-base-content">
			Back to Top
		</button>
	</div>
{/if}

{#if showContent[4]}
	<ContactForm {...formParameters} />
{/if}
