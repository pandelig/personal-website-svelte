---
slug: "build-post-content-page"
date: "06-02-2024"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 5: Build the Post Content Page"
meta_description: "Learn how to build a dynamic post content page in SvelteKit using markdown files, smooth scrolling, and a table of contents."
---
<!-- TODO update meta_description -->
<!-- TODO all frontmatter dates -->

<!-- TODO: Add links to the other steps once they are published. -->
1. [Step 1: Set Up the Project](/blog/set-up-sveltekit-website)
2. [Step 2: Installing and Configuring DaisyUI](/blog/installing-configuring-daisyui)
3. [Step 3: Build the Home Page](/blog/build-the-home-page)
4. [Step 4: Build the Blog and Projects Pages](/blog/build-blog-and-projects-pages)
5. (You are here) Build the Post Content Page
6. [Step 6: Adding Transitions and SEO](#)
7. [Step 7: Deployment on Cloudflare Workers](#)
8. [Step 8: Contact Form with Mailjet](#)

In this step, we will build the Post Content Page, which is responsible for rendering individual blog posts and project descriptions. Our approach:
- Set up backend logic for fetching content.
  - `src/routes/blog/[slug]/+page.server.js`
  - `src/routes/projects/[slug]/+page.server.js`
  - `src/lib/functions/loadPost.js`
- Configure `mdsvex` plugins.
  - `svelte.config.js`
- Integrate the frontend with the backend.
  - `src/routes/blog/[slug]/+page.svelte`
  - `src/routes/projects/[slug]/+page.svelte`
  - `src/lib/components/PostContent.svelte`

As a reminder, we use the term "post" to refer to both articles and projects.

## Fetch Post Data

To load posts dynamically, we use a `+page.server.js` file in both the `/blog/[slug]/` and `/projects/[slug]/` routes. Since the files are nearly identical, we can create a reusable function to fetch the data.

`src/routes/blog/[slug]/+page.server.js`:
```js
import { loadPost } from '$lib/functions/loadPost';

export function load({ params }) {
    return loadPost('articles', params.slug);
}
```
`src/routes/projects/[slug]/+page.server.js`:
```js
import { loadPost } from '$lib/functions/loadPost';

export function load({ params }) {
    return loadPost('projects', params.slug);
}
```
`src/lib/functions/loadPost.js`:
```js
import { error } from '@sveltejs/kit';
import { render } from 'svelte/server';

export function loadPost(type, slug) {
    let postModules;

    if (type === 'articles') {
        postModules = import.meta.glob('/src/lib/articles/*.md', { eager: true });
    } else if (type === 'projects') {
        postModules = import.meta.glob('/src/lib/projects/*.md', { eager: true });
    } else {
        throw error(500, `Unknown post type: ${type}`);
    }

    const post = Object.values(postModules).find(({ metadata }) =>
        metadata.slug === slug
    );

    if (!post) {
        throw error(404, `${type.slice(0, -1)} not found. The following slug doesn't exist: ${slug}`);
    }

    const renderedContent = render(post.default);

    return {
        metadata: post.metadata,
        content: renderedContent.html // Pre-rendered HTML
    };
}
```

- Clearly, the code is quite similar to [what we needed for the Home page](/blog/build-the-home-page#fetch-articles-and-projects) and [for creating the post lists](/blog/build-blog-and-projects-pages#fetch-post-data).
- We return a 404 error if the post doesn't exist.
- We make use of `render()` to convert markdown into HTML before returning it. Try logging `post.default` and `renderedContent` to compare the before and after states for better understanding.

## Configure `mdsvex` plugins

To render markdown content, we are using the `mdsvex` plugin. As mentioned in [its docs](https://mdsvex.pngwn.io/docs#remarkplugins--rehypeplugins), mdsvex allows us to use [`remark`](https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins) and [`rehype`](https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins) plugins to customize the markdown rendering process.

We will be making use of 2 rehype plugins, `svelte.config.js`:
```js
import adapter from '@sveltejs/adapter-cloudflare-workers';
import { mdsvex } from 'mdsvex';
import rehypeSlug from 'rehype-slug';
import rehypeExternalLinks from 'rehype-external-links';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	},
	preprocess: mdsvex({
		extensions: ['.svx', '.md'],
		rehypePlugins: [
			rehypeSlug,
			[
				rehypeExternalLinks,
				{
					target: '_blank',
					rel: ['noopener'], // ['nofollow', 'noopener', 'noreferrer']
					content: { type: 'text', value: '↗' }
				}
			]
		]
	}),
	extensions: ['.svelte', '.svx', '.md']
};

export default config;
```

- `rehype-slug`: add ids to headings.
- `rehype-external-links`: add `target="_blank"` and `rel="noopener"` to external links. The `content` option adds an icon after external links, `type` can also be `'element'` or `'comment'`, for `value` this adds an unbreakable space `'\u00A0↗'`, a simple space before the emoji seems to be getting removed.
- By default, mdsvex does not support markdown files (`.md`), so we add it to the `extensions` array in accordance with the [mdsvex docs](https://mdsvex.pngwn.io/docs#extensions).


## Display Post Content

Article and project pages use the same code to display their content. We create a reusable component as a result.

`src/routes/blog/[slug]/+page.svelte`:

`src/routes/projects/[slug]/+page.svelte`:
```svelte
<script>
	import PostContent from '$lib/components/PostContent.svelte';
	let { data } = $props();

	const postParameters = $derived({
		...data
	});
</script>

<PostContent {...postParameters} />
```
`src/lib/components/PostContent.svelte`:
```svelte
<script>
	import { page } from '$app/state';
	import ContactForm from '$lib/components/ContactForm.svelte';

	function scrollToTop() {
		window.scrollTo({ top: 0 });
	}

	let { metadata, content } = $props();

	const postType = page.url.pathname.split('/')[1];
	const contactFormTitle = postType === 'blog' ? 'Share Your Thoughts' : 'Project Feedback';
	const contactFormDescription =
		postType === 'blog'
			? 'Did this article help you? Got suggestions or feedback? Let me know!'
			: 'Did you find this project helpful or interesting? Share your thoughts!';
	const formParameters = {
		title: contactFormTitle,
		description: contactFormDescription,
	};
</script>

<div class="p-8">
	<div class="text-sm text-secondary">
		{metadata.date}
		{#if metadata.date_updated}
			- updated {metadata.date_updated}
		{/if}
	</div>
	<div
		class="prose prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base"
	>
		<div class="flex flex-wrap">
			{#each metadata.tags as tag}
				<a
					href={`/${postType}?tag=${tag}`}
					class="not-prose p-2 text-secondary hover:text-accent"
				>
					#{tag}
				</a>
			{/each}
		</div>

		<h1 id={metadata.title.toLowerCase().replace(/\s+/g, '-')}>{metadata.title}</h1>

		<div>
			{@html content}
		</div>
	</div>
</div>

<div class="p-8 py-0 text-right">
	<button onclick={scrollToTop} class="text-base text-secondary sm:hover:text-accent">
		Back to Top
	</button>
</div>

<ContactForm {...formParameters} />
```

- We import the ContactForm component we created during [Step 3: Build the Home Page](/blog/build-the-home-page#create-a-contact-form-component) and pass the form parameters as props.
- We display the post's `date` and, if available, the `date_updated`.
- Notice how the rendered tags associated with the post are clickable links that lead to `/blog` or `/projects` and filter posts by the selected tag.
- The html `prose-*` classes are available from the [tailwind typography plugin](https://github.com/tailwindlabs/tailwindcss-typography).
- The post's title gets its `id` dynamically from the metadata title. We will see how the other titles of our posts get their `id` and how we make use of title's ids in the section below.
- Renders the post's `content` using `{@html content}` to [inject raw HTML](https://svelte.dev/tutorial/svelte/html-tags).
- A button that triggers the `scrollToTop` function when clicked, allowing users to scroll back to the top of the page.
- We have [seen the `postType` functionality before](/blog/build-blog-and-projects-pages#create-post-list-component), as well as the [`page` usage](/blog/build-the-home-page#create-a-contact-form-component) and [how to understand tailwind classes](/blog/set-up-sveltekit-website#optional-recommended-resources). The Svelte [`#each` block should also be familiar by now](/blog/build-the-home-page#create-the-home-page).

## Enhance the Styling

The `src/app.css` file is updated to improve scrolling behavior and add code highlighting styles:
```css
@import url(../static/styles/prism-atom-dark.css);

@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

html {
	scroll-behavior: smooth;
}

.prose h1 {
	scroll-margin-top: 200px;
}

.prose h2,
.prose h3 {
	scroll-margin-top: 60px;
}
```

- You may have noticed that even though typography makes the text look good, it does nothing for the code blocks. Luckily, mdsvex uses [PrismJS](https://prismjs.com/) for syntax highlighting.
  - Simply search for "prismjs themes" and download the CSS file of your choice, e.g. [prism themes](https://github.com/PrismJS/prism-themes)
  - Place the CSS file in `static/styles/` and import it in `app.css`. [Helpful article from Alex](https://www.alexandersix.com/posts/syntax-highlighting-with-sveltekit).
- `scroll-behavior: smooth;`: Enables smooth scrolling when clicking on table of contents links.
- `scroll-margin-top`: Ensures headings don’t get covered by the sticky navbar.

You can experiment with different `app.css` configurations while running `npm run dev` to see the changes in real-time.

## Customizing Code Blocks

You can change the PrismJS theme by importing a different CSS file:
```css
@import url(../static/styles/prism-atom-dark.css);
```
To use a different theme:
1. Browse [PrismJS themes](https://prismjs.com/)
2. Download your favorite theme
3. Replace `prism-atom-dark.css` with the new theme file

## Optional: Experiment with Tailwind

Try removing the `typography` plugin in `tailwind.config.js`:
```js
// Remove this from tailwind.config.js
require('@tailwindcss/typography')
```
Observe how your posts look without it—this helps understand its role in styling markdown content.

## Wrapping Up Step 5

Awesome work! You’ve successfully built the Post Content Page. In the next step, we’ll add transitions and SEO enhancements to improve the user experience.
