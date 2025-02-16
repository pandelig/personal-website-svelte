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
5. (You are here) Step 5: Build the Post Content Page
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

## Configure `mdsvex` Plugins

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
- `rehype-external-links`: add `target="_blank"` and `rel="noopener"` to external links. The `content` option adds an icon after external links, `type` can also be `'element'` or `'comment'`, for `value` this adds an unbreakable space: `'\u00A0↗'`, a simple space before the emoji seems to be getting removed.
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
- The post's title gets its `id` dynamically from the metadata title. We saw how the other headings of our posts get their `id` and in the section below we will see how we make use of heading ids.
- Renders the post's `content` using `{@html content}` to [inject raw HTML](https://svelte.dev/tutorial/svelte/html-tags).
- A button that triggers the `scrollToTop` function when clicked, allowing users to scroll back to the top of the page.
- We have [seen the `postType` functionality before](/blog/build-blog-and-projects-pages#create-post-list-component), as well as the [`page` usage](/blog/build-the-home-page#create-a-contact-form-component) and [how to understand tailwind classes](/blog/set-up-sveltekit-website#optional-recommended-resources). The Svelte [`#each` block should also be familiar by now](/blog/build-the-home-page#create-the-home-page).
- Observe how the posts look without the typography plugin by temporarily removing it from the `svelte.config.js` file. This helps understand its role in styling markdown content.

### Add Floating Table of Contents (TOC)

To enhance the user experience, we add a floating Table of Contents (TOC) that scrolls with the page. This feature is especially useful for long posts, aiding navigation.

`src/lib/components/PostContent.svelte`:
```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  // other imports from earlier

  // scrollToTop function from earlier

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

  // $props from earlier
  const CONTENTS_INDENTS = {
  	h1: 'pl-0',
  	h2: 'pl-4',
  	h3: 'pl-8'
  };

  // ...
  // const formParameters from earlier
  let headings = $state([]);
  let activeHeading = $state();

  $effect(() => {
  	if (
  		headings.length === 0 ||
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
  });

  onMount(() => {
    window.addEventListener('scroll', handleScroll);
  });

  onDestroy(() => {
    return () => {
     	window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div
    class="absolute -right-80 top-0 hidden h-full w-72 p-4 text-secondary xl:block"
    in:fade
>
    <div class="sticky top-24">
        <h2 class="mb-4 font-semibold">Contents</h2>
        <ul>
            {#each headings as heading}
                <li
                    class="mt-1 {CONTENTS_INDENTS[
                        heading.level
                    ]} hover:text-accent {heading.id === activeHeading
                        ? 'text-accent'
                        : 'text-secondary'}"
                >
                    <a href={`#${heading.id}`}>{heading.text}</a>
                </li>
            {/each}
        </ul>
    </div>
</div>

// other html code from earlier
````

- The component uses Svelte's `onMount` and `onDestroy` lifecycle functions to manage scroll event listeners.
- `handleScroll` function updates the `activeHeading` based on the current scroll position, with special handling for when users reach the bottom of the page.
- `CONTENTS_INDENTS` is an object that maps heading levels (h1, h2, h3) to Tailwind padding classes, creating a hierarchical indentation in the TOC.
- `headings` and `activeHeading` variables are reactive, we have discussed this functionality before in ["Create Post List Component" of the previous step](/blog/build-blog-and-projects-pages#create-post-list-component)
- We encounter [`$effect`](https://svelte.dev/tutorial/svelte/effects) for the first time. It is important to understand [what triggers it](https://svelte.dev/docs/svelte/$effect#Understanding-dependencies). In our case it runs when the component mounts or when metadata changes, collecting all h1, h2, and h3 headings from the post content.
- For each heading, it stores:
  - `id`: The heading's ID, which is used to determine the `activeHeading`.
  - `text`: The heading's text content.
  - `level`: The heading type (h1, h2, or h3), which determines the indentation through `CONTENTS_INDENTS`.
  - `offset`: The heading's vertical position from the top, used in `handleScroll()` to determine the `activeHeading`.
- The TOC is positioned absolutely on the right side of the content, only visible on extra-large screens (xl:block). Remember the usage of `relative` in the [parent container](/blog/build-the-home-page#add-a-navbar).

It would be beneficial here to spend some time understanding the code, how indentation is managed, how the colors of the TOC items change, what triggers the `$effect` block, the tailwind classes used etc.

As an advanced note, we have to define the `CONTENTS_INDENTS` object, if we dynamically create the `pl-*` classes in the `class=` attribute, tailwind will not include the required CSS in the built app because it sees no mentions of these classes anywhere in the source files.

## Enhance the Styling

The `src/app.css` file is updated to improve scrolling behavior and add code highlighting style, this is its final form:
```css
@import url(../static/styles/prism-darcula.css);

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

## Wrapping Up Step 5

Awesome work! You’ve successfully built the Post Content Page. In the next step, we’ll add transitions and SEO enhancements to improve the user experience.
