---
slug: "building-blog-and-projects-pages"
date: "05-02-2024"
post_type: "blog"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 4: Building Blog and Projects Pages"
meta_description: "Learn how to create blog and project listing pages in SvelteKit using markdown files and server-side data loading."
---
<!-- TODO update meta_description -->
<!-- TODO all frontmatter dates -->

<!-- TODO: Add links to the other steps once they are published. -->
1. [Step 1: Setting Up the Project](/blog/setting-up-sveltekit-website)
2. [Step 2: Installing and Configuring DaisyUI](/blog/installing-configuring-daisyui)
3. [Step 3: Building the Home Page](/blog/building-the-home-page)
4. (You are here) Building Blog and Projects Pages
5. [Step 5: Building Post Content Page](#)
6. [Step 6: Adding Transitions and SEO](#)
7. [Step 7: Deployment on Cloudflare Workers](#)
8. [Step 8: Contact Form with Mailjet](#)

In this step, we will create the `/blog` and `/projects` pages for our personal website. These pages will display a list of articles and projects, respectively, using metadata from markdown files while offering tag-based filtering. Similarly to Step 3, we will first create the server-side logic to fetch post metadata and then build the Svelte pages and component to display the posts.

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
`src/lib/functions/loadMetadataOfPosts.js`
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
    const tags = [...new Set(posts.flatMap(post => post.tags))];

    return { posts, tags };
}
```

- The code is quite similar to [what we needed for the Home page](/blog/building-the-home-page#fetch-articles-and-projects).
- Placing the function under `src/lib/functions` is a personal preference for code organization, same goes for `src/lib/components`, `src/lib/articles`, and `src/lib/projects`. You can structure your project differently, SvelteKit is not opinionated about this. [Read more about the `$lib` alias here](https://svelte.dev/tutorial/kit/lib).

## Displaying the Posts

Now that we have post data, we need to display it. Just like the `+page.server.js` files, the `+page.svelte` files are nearly identical.

`src/routes/blog/+page.svelte`:
```svelte
<script>
	import PostList from "$lib/components/PostList.svelte";

	let { data } = $props();
</script>

<PostList {...data} />
```
`src/routes/projects/+page.svelte`:
```svelte
<script>
	import PostList from "$lib/components/PostList.svelte";

	let { data } = $props();
</script>

<PostList {...data} />
```

- Each file receives post data from its corresponding `+page.server.js` file.
- The data is passed to the `PostList` component. This is the 2nd component we will create, the 1st being the [ContactForm from Step 3](http://localhost:5173/blog/building-the-home-page#create-a-contact-form-component).

## Post List Component

Both pages use the `PostList.svelte` component to display posts. By now, we should have a clear understanding of how to [create and use components in SvelteKit](https://svelte.dev/tutorial/svelte/nested-components) as well as [how to pass `$props` using the spread operator](https://svelte.dev/tutorial/svelte/spread-props).

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
					: 'text-secondary'} sm:hover:text-accent"
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
					<p class="text-sm text-secondary">{post.date}</p>
				</a>
			</li>
		{/each}
		{#if filteredPosts.length === 0}
			<p class="text-secondary">No posts found for these tags.</p>
		{/if}
	</ul>
</div>
```

- We see now, for the 1st time, how reactivity is used in SvelteKit. The `selectedTags` and `filteredPosts` variables are reactive, updating the UI whenever they change.
  - A concise explanation is provided in the interactive tutorial: [`$state`](https://svelte.dev/tutorial/svelte/state) and [`$derived`](https://svelte.dev/tutorial/svelte/derived-state).
  - For a more in depth look, check out the Svelte docs: [`$state`](https://svelte.dev/docs/svelte/$state) and [`$derived`](https://svelte.dev/docs/svelte/$derived).
- Notice how `postType` is used to determine whether the page is a blog or projects page.
- `onclick` is an example of how Svelte handles [event listeners](https://svelte.dev/tutorial/svelte/dom-events). You may come accross the `on:click` syntax in other Svelte tutorials, [it is older Svelte syntax](https://svelte.dev/docs/svelte/legacy-on), not Svelte 5.

## Wrapping Up Step 4

You’ve now built the `/blog` and `/projects` pages! In Step 5, we’ll [create the Post Content Page](TODO), allowing users to read full articles and project descriptions.
