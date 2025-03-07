---
slug: "step-6-add-transitions-and-seo"
date: "04 Mar 2025"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 6: Add Transitions and SEO"
meta_description: "Learn how to add smooth page transitions and improve SEO in your SvelteKit website with Pantelis Deligiannidis. Step-by-step guide covering fade transitions, staggered animations, and metadata optimization for better search engine visibility."
---

1. [Step 1: Set Up the Project](/blog/step-1-set-up-sveltekit-website)
2. [Step 2: Install and Configure DaisyUI](/blog/step-2-install-and-configure-daisyui)
3. [Step 3: Build the Home Page](/blog/step-3-build-the-home-page)
4. [Step 4: Build the Blog and Projects Pages](/blog/step-4-build-blog-and-projects-pages)
5. [Step 5: Build the Post Content Page](/blog/step-5-build-post-content-page)
6. (You are here) Step 6: Add Transitions and SEO
7. [Step 7: Deploy on Cloudflare Workers](/blog/step-7-deploy-on-cloudflare-workers)

In this step, we will enhance our SvelteKit website by adding transitions to various components and improving SEO by adding metadata tags. We will be updating the following files:

- Transitions:
  - `src/routes/+layout.svelte`
  - `src/routes/+page.svelte`
  - `src/lib/components/PostList.svelte`
  - `src/lib/components/PostContent.svelte`
- SEO:
  - `src/app.html`
  - `src/routes/+page.svelte`
  - `src/lib/components/PostList.svelte`
  - `src/lib/components/PostContent.svelte`

## Add Transitions

We will be using Svelte's built-in `fade` transition.

### Layout File

Regarding `src/routes/+layout.svelte`, we will make the `Home` button appear with a fade effect when navigating away from the home page:

```svelte
<script>
	import { fade } from 'svelte/transition';
	// ...
</script>

// ...
<a href="/" class="inline-block text-secondary hover:text-accent" in:fade> home </a>
<span in:fade> | </span>
// ...
```

We simply added a new import and then used the `fade` transition on 2 elements.

- `in`: The transition will run when the element is added to the DOM.
- `out`: The transition will run when the element is removed from the DOM.
- `transition`: The transition will run when the element is added or removed from the DOM.
- You may also [pass parameters to the transition](https://svelte.dev/docs/svelte/transition#Transition-parameters), such as duration, easing, and delay, e.g., `in:fade={{ duration: 500 }}`.

### Home Page

On the home page, we aim to achieve a staggering effect, meaning to fade in sections one by one. This is one way to do it, soon we will see another way to achieve this effect that is more scalable.

`src/routes/+page.svelte`:

```svelte
<script>
	import { fade } from 'svelte/transition';

	// ...

	let showContent1 = $state(false);
	let showContent2 = $state(false);
	let showContent3 = $state(false);
	let showContent4 = $state(false);

	// Delay the rendering to trigger transitions
	setTimeout(() => {
		showContent1 = true;
	}, 200);

	$effect(() => {
		if (showContent1) {
			setTimeout(() => (showContent2 = true), 200);
		}
		if (showContent2) {
			setTimeout(() => (showContent3 = true), 200);
		}
		if (showContent3) {
			setTimeout(() => (showContent4 = true), 200);
		}
	});
</script>

{#if showContent1}
	<div class="flex justify-between gap-4 p-8 pb-2 pt-28" in:fade>
		<h1 class="text-lg font-semibold">John Doeloper</h1>
		<div class="flex justify-center space-x-4">// ...</div>
	</div>
{/if}

{#if showContent2}
	<p class="mb-8 px-8" in:fade>
    	Code wizard by day, bug creator by night. I turn coffee into code and occasionally make computers do cool things.
	</p>
{/if}

{#if showContent3}
	<div class="p-8 pb-0 pt-0" in:fade>
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
			<section>
				<h2 class="text-lg font-semibold">Articles</h2>
				// ...
				<a href="/blog" class="link mt-4 inline-block pl-0">All Articles</a>
			</section>

			<section>
				<h2 class="text-lg font-semibold">Projects</h2>
				// ...
				<a href="/projects" class="link mt-4 inline-block pl-0">All Projects</a>
			</section>
		</div>
	</div>
{/if}
```

As [we discussed this in a previous step](/blog/step-5-build-post-content-page#add-floating-table-of-contents-toc), a change in a reactive variable triggers the `$effect` block. So when `showContent1` changes to `true`, it triggers a chain of changes to `showContent2`, `showContent3`, and `showContent4`.

You may experiment using `elif` in the `$effect` block to see that since `showContent2` and `showContent3` are not unconditionally evaluated, they don't trigger the `$effect` block when they change. You may also experiment with different `setTimeout` values.

### PostList Component

To achieve the staggering effect here, we will use a more scalable approach, `src/lib/components/PostList.svelte`:

```svelte
<script>
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';

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
		page.url.searchParams.get('tag') ? [page.url.searchParams.get('tag')] : []
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

<div class="p-8 pt-28">
	<h1 class="text-lg font-semibold" in:fade>{postType === 'blog' ? 'Blog' : 'Projects'}</h1>

	<!-- Tag Filter -->
	<div class="flex flex-wrap p-2" in:fade>
		{#each tags as tag}
			<button
				onclick={() => selectTag(tag)}
				class="px-2 {selectedTags.includes(tag)
					? 'text-accent'
					: 'text-secondary'} cursor-pointer sm:hover:text-accent"
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
```

- Notice how the `selectTag` function now resets the `showContent` array to `false` and then re-triggers the staggered fade-in effect.
  - The `showContent` array size depends on the number of posts we will display.
- The title and the tag filter fade in at the same time.
- We see for the first time the use of a nested `#if` block, inside an `#each` block.

### PostContent Component

Similarly, we can fade in blog posts when viewing an article, `src/lib/components/PostContent.svelte`:

```svelte
<script>
	import { fade } from 'svelte/transition';
	import { onDestroy } from 'svelte';
	// other imports

	// scrollToTop function from earlier
	// handleScroll function from earlier

	// $props from earlier
	const TOTAL_ELEMENTS_TO_TRANSITION = 5; // 1: dates & tags, 2: title, 3: content, 4: back to top button, 5: table of contents
	const CONTENTS_INDENTS = {
		h1: 'pl-0',
		h2: 'pl-4',
		h3: 'pl-8'
	};

	const postType = page.url.pathname.split('/')[1];
	let delay = 200;

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

{#if showContent[TOTAL_ELEMENTS_TO_TRANSITION - 1]}
	<div class="absolute -right-80 top-0 hidden h-full w-72 p-4 text-secondary xl:block" in:fade>
		<div class="sticky top-24">// ...</div>
	</div>
{/if}

<div class="p-8">
	{#if showContent[0]}
		<div class="text-sm text-secondary" in:fade>
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
						href={`/${postType}?tag=${tag}`}
						class="not-prose p-2 text-secondary hover:text-accent"
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
				{@html content}
			</div>
		{/if}
	</div>
</div>

{#if showContent[3]}
	<div class="p-8 py-0 text-right" in:fade>
		<button
			onclick={scrollToTop}
			class="cursor-pointer text-base text-secondary sm:hover:text-accent"
		>
			Back to Top
		</button>
	</div>
{/if}
```

- We imported the `fade` transition and removed `onMount` as we don't need it anymore.
- This time the length of the `showContent` array depends on a constant value.
- Notice how the `TOTAL_ELEMENTS_TO_TRANSITION` constant is used in the `$effect` block to check if the back to top button has been rendered.
- It would be beneficial here to understand which element of the `showContent` array corresponds to which element in the DOM.

## SEO Improvements

Search Engine Optimization (SEO) helps search engines understand and rank our pages. Therefore, we will be adding metadata tags to our website.

### Global Metadata

In the `src/app.html` file we will add the metadata tags that are common to all pages. Add an author meta tag and Open Graph (OG) tags.

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="author" content="John Doeloper" />
		<meta property="og:image" content="https://yourdomainname.com/favicon.png" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

- First of all, we notice that the important `charset` and `viewport` meta tags are already present in the file.
- The `favicon` is also set. This file is located in the `static` folder and you are free to replace it, it determines the icon that appears in the browser tab.
- We added an `author` meta tag.
- We added an `og:image` tag. This is an OG tag, OG tags control how your website’s content is displayed when shared on social media platforms like facebook, twitter, linkedin, etc.
  - Optionally, you can add more OG tags like `og:title`, `og:description`, `og:url`, etc. If you don't, they will default to the values of the corresponding meta tags that we will add shortly.
  - After deployment, you may test how your website will look when shared on social media platforms using the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

### Home Page

Add the following code immediately after the `script` tag in `src/routes/+page.svelte`:

```svelte
<script>
	// ...
</script>

<svelte:head>
	<title>John Doeloper</title>
	<meta
		name="description"
		content="Welcome to the digital playground of John Doeloper, where bugs are features and coffee is the primary food group. Expect witty commits, occasional semicolon rants, and code that mostly works on my machine™"
	/>
</svelte:head>
```

`svelte:head`: This is how Svelte allows for [inserting metadata tags in the `head` of the document](https://svelte.dev/docs/svelte/svelte-head).

### PostList Component

Similarly for `src/lib/components/PostList.svelte`:

```svelte
<script>
	// ...
</script>

<svelte:head>
	<title>{postType === 'blog' ? 'Blog' : 'Projects'} - John Doeloper</title>
	<meta
		name="description"
		content="Dive into a collection of {postType === 'blog'
			? 'sleep-deprived thoughts'
			: 'weekend projects'} about turning coffee into code, debugging adventures, and that one time I fixed a production issue by turning it off and on again."
	/>
</svelte:head>
```

### PostContent Component

And for `src/lib/components/PostContent.svelte`:

```svelte
<script>
	// ...
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.meta_description} />
</svelte:head>
```

## (Optional) Interesting Notes

- Initially, instead of using `secondary` color to get the gray color [defined in my custom DaisyUI theme](/blog/step-2-install-and-configure-daisyui#optional-define-a-custom-theme), I used `opacity-50` to get the same effect. That was up until I saw the deployed website getting warnings about low contrast in [PageSpeed Insights](https://pagespeed.web.dev/).
- On [Step 3: Build the Home Page](/blog/step-3-build-the-home-page), you might have wondered, why do we choose to place the article's title in the frontmatter key value pairs instead of _just after it_, as `# This is a title`. I hope by now it is clear, that the `"title"` frontmatter key serves us in many ways:
  1. Displayed as the post title in the rendered post.
  2. Used for SEO metadata in the `svelte:head` of all posts.
  3. Used to list posts in the home page.
  4. Used to list posts in `/blog` and `/projects` pages.
  5. The `$effect` block in `PostContent.svelte` relies on it to update the table of contents, when navigating from one post to another.

## Wrapping Up Step 6

Congratulations! You've come a long way, your website now has transitions and SEO-friendly metadata. In the next step, we will [deploy our website to Cloudflare Workers](/blog/step-7-deploy-on-cloudflare-workers).
