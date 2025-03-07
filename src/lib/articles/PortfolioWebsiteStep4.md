---
slug: "step-4-build-blog-and-projects-pages"
date: "02 Mar 2025"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 4: Build the Blog and Projects Pages"
meta_description: "Learn how to build blog and projects pages with SvelteKit and TailwindCSS in this detailed tutorial by Pantelis Deligiannidis. Create reusable components, implement tag filtering, and handle post metadata effectively."
---

1. [Step 1: Set Up the Project](/blog/set-up-sveltekit-website)
2. [Step 2: Install and Configure DaisyUI](/blog/install-and-configure-daisyui)
3. [Step 3: Build the Home Page](/blog/build-the-home-page)
4. (You are here) Step 4: Build the Blog and Projects Pages
5. [Step 5: Build the Post Content Page](/blog/build-post-content-page)
6. [Step 6: Add Transitions and SEO](/blog/add-transitions-and-seo)
7. [Step 7: Deploy on Cloudflare Workers](/blog/deploy-on-cloudflare-workers)

In this step, we will create the `/blog` and `/projects` pages for our personal website. These pages will display a list of articles and projects, respectively, using metadata from markdown files while offering tag-based filtering. Our approach will be:

- Set up backend logic for fetching content.
  - `src/routes/blog/+page.server.js`
  - `src/routes/projects/+page.server.js`
  - `src/lib/functions/loadMetadataOfPosts.js`
- Integrate the frontend with the backend.
  - `src/routes/blog/+page.svelte`
  - `src/routes/projects/+page.svelte`
  - `src/lib/components/PostList.svelte`

As a reminder, we use the term "post" to refer to both articles and projects.

## Fetch Post Data

If you compare the [`/blog`](https://pandelig.com/blog) and [`/projects`](https://pandelig.com/projects) pages we aim to build, you'll notice that they share a lot of similarities. Both pages display a list of posts with titles, dates, and tags. We can leverage this similarity to create a reusable function that fetches post metadata.

`src/routes/blog/+page.server.js`:

```js
import { loadMetadataOfPosts } from '$lib/functions/loadMetadataOfPosts';

export function load() {
	return loadMetadataOfPosts('articles');
}
```

`src/routes/projects/+page.server.js`:

```js
import { loadMetadataOfPosts } from '$lib/functions/loadMetadataOfPosts';

export function load() {
	return loadMetadataOfPosts('projects');
}
```

`src/lib/functions/loadMetadataOfPosts.js`:

```js
export function loadMetadataOfPosts(type) {
	let postModules;

	if (type === 'articles') {
		postModules = import.meta.glob('/src/lib/articles/*.md', { eager: true });
	} else if (type === 'projects') {
		postModules = import.meta.glob('/src/lib/projects/*.md', { eager: true });
	} else {
		throw new Error(`Unknown type: ${type}`);
	}

	const posts = Object.values(postModules).map(({ metadata }) => ({
		...metadata
	}));

	// Sort posts by date in descending order
	posts.sort((a, b) => new Date(b.date) - new Date(a.date));

	// Extract unique tags for filtering
	const tags = [...new Set(posts.flatMap((post) => post.tags))];

	return { posts, tags };
}
```

- The code is quite similar to [what we needed for the Home page](/blog/build-the-home-page#fetch-articles-and-projects).
- Placing the function under `src/lib/functions` is a personal preference for code organization, same goes for `src/lib/components`, `src/lib/articles`, and `src/lib/projects`. You can structure your project differently, SvelteKit is not opinionated about this. [Read more about the `$lib` alias here](https://svelte.dev/tutorial/kit/lib).

## Display the Posts

Now that we have post data, we need to display it. This time, the 2 files are identical.

`src/routes/blog/+page.svelte`:

```svelte
<script>
	import PostList from '$lib/components/PostList.svelte';

	let { data } = $props();
</script>

<PostList {...data} />
```

`src/routes/projects/+page.svelte`:

```svelte
<script>
	import PostList from '$lib/components/PostList.svelte';

	let { data } = $props();
</script>

<PostList {...data} />
```

- Each file receives post data from its corresponding `+page.server.js` file.
- The data is passed to the `PostList` component. This is the 1st component we will create.

## Create Post List Component

Both pages will use the `PostList.svelte` component to display posts. We will now be [creating our first component in SvelteKit](https://svelte.dev/tutorial/svelte/nested-components), [pass `$props` to it](https://svelte.dev/tutorial/svelte/declaring-props) [using the spread operator](https://svelte.dev/tutorial/svelte/spread-props). This functionality allows us to customize the displayed list, depending on whether it's used under `/blog` or `/projects`.

`src/lib/components/PostList.svelte`:

```svelte
<script>
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
	}
	let { posts, tags } = $props();

	const postType = page.url.pathname.slice(1);
	let selectedTags = $state(
		page.url.searchParams.get('tag') ? [page.url.searchParams.get('tag')] : []
	);

	let filteredPosts = $derived(
		posts.filter((post) => selectedTags.every((tag) => post.tags.includes(tag)))
	);
</script>

<div class="p-8 pt-28">
	<h1 class="text-lg font-semibold">{postType === 'blog' ? 'Blog' : 'Projects'}</h1>

	<!-- Tag Filter -->
	<div class="flex flex-wrap p-2">
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
		{#each filteredPosts as post}
			<li>
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
		{/each}
		{#if filteredPosts.length === 0}
			<p class="text-secondary">No posts found for these tags.</p>
		{/if}
	</ul>
</div>
```

- We also see now, for the 1st time, how reactivity is used in SvelteKit. The `selectedTags` and `filteredPosts` variables are reactive, updating the UI whenever they change.
  - A concise explanation is provided in the interactive tutorial: [`$state`](https://svelte.dev/tutorial/svelte/state) and [`$derived`](https://svelte.dev/tutorial/svelte/derived-state).
  - For a more in depth look, check out the Svelte docs: [`$state`](https://svelte.dev/docs/svelte/$state) and [`$derived`](https://svelte.dev/docs/svelte/$derived).
- Notice how `postType` is used to determine whether the page is a blog or projects page.
- `onclick` is an example of how Svelte handles [event listeners](https://svelte.dev/tutorial/svelte/dom-events). You may come across the `on:click` syntax in other Svelte tutorials, [it is older Svelte syntax](https://svelte.dev/docs/svelte/legacy-on), not Svelte 5.

## Wrapping Up Step 4

You’ve now built the `/blog` and `/projects` pages! In Step 5, we’ll [create the Post Content Page](/blog/build-post-content-page), allowing users to read full articles and project descriptions.
