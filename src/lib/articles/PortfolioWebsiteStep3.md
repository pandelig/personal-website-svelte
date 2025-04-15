---
slug: "portfolio-website-step-3-build-the-home-page"
date: "01 Mar 2025"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 3: Build the Home Page"
meta_description: "Learn how to build a dynamic home page for your personal website with Pantelis Deligiannidis. This detailed tutorial covers creating content structures, implementing server-side data fetching, and building a responsive UI with SvelteKit and TailwindCSS."
---

1. [Step 1: Set Up the Project](/blog/portfolio-website-step-1-set-up-sveltekit-website)
2. [Step 2: Install and Configure DaisyUI](/blog/portfolio-website-step-2-install-and-configure-daisyui)
3. (You are here) Step 3: Build the Home Page
4. [Step 4: Build the Blog and Projects Pages](/blog/portfolio-website-step-4-build-blog-and-projects-pages)
5. [Step 5: Build the Post Content Page](/blog/portfolio-website-step-5-build-post-content-page)
6. [Step 6: Added Transitions and SEO](/blog/portfolio-website-step-6-add-transitions-and-seo)
7. [Step 7: Deploy on Cloudflare Workers](/blog/portfolio-website-step-7-deploy-on-cloudflare-workers)

In this article we will create the home page of our SvelteKit website. The home page will include our name, social links, a short description, a section for recent articles, and another for recent projects.

To minimize back and forth editing, we follow a structured approach:

- Create dummy files for articles and projects.
  - `src/lib/articles/*.md`
  - `src/lib/projects/*.md`
- Configure `mdsvex`.
  - `svelte.config.js`
- Set up backend logic for fetching content.
  - `src/routes/+page.server.js`
- Integrate the frontend with the backend.
  - `src/routes/+page.svelte`
  - `src/routes/+layout.svelte`

You will likely come across unknown html classes, you can refer to the Tailwind (TW) CSS and DaisyUI documentation as mentioned in the [Recommended Resources](/blog/portfolio-website-step-1-set-up-sveltekit-website#optional-recommended-resources).

## Create Dummy Articles and Projects

Our articles and projects will be stored as Markdown (`.md`) files, let's create some sample content. For that purpose, feel free to use your favorite AI assistant, otherwise, you may use the following linked content. Take notice to maintain the frontmatter structure present in the linked content as it will soon become apparent that each key holds a certain significance.

Create the folder `src/lib/articles/` and the following files:

- `src/lib/articles/Article1.md` - [Article 1 github link](https://github.com/pandelig/personal-website-svelte/blob/tutorial/src/lib/articles/Article1.md)
- `src/lib/articles/Article2.md` - [Article 2 github link](https://github.com/pandelig/personal-website-svelte/blob/tutorial/src/lib/articles/Article2.md)
- `src/lib/articles/Article3.md` - [Article 3 github link](https://github.com/pandelig/personal-website-svelte/blob/tutorial/src/lib/articles/Article3.md)

Similarly, create `src/lib/projects/` and the following files:

- `src/lib/projects/Project1.md` - [Project 1 github link](https://github.com/pandelig/personal-website-svelte/blob/tutorial/src/lib/projects/Project1.md)
- `src/lib/projects/Project2.md` - [Project 2 github link](https://github.com/pandelig/personal-website-svelte/blob/tutorial/src/lib/projects/Project2.md)

### Frontmatter Structure

Example:

```yaml
---
slug: "portfolio-website-step-2-install-and-configure-daisyui"
date: "28 Feb 2025"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 2: Install and Configure DaisyUI"
meta_description: "Learn how to install and configure DaisyUI in your SvelteKit project..."
---
```

The frontmatter section of each article contains essential metadata that helps organize and identify the content. Here's a breakdown of each field:

- `slug`: A unique identifier used for routing and referencing the article.
- `date`: Publication date in RFC 2822 format: `"DD MMM YYYY"`.
- `date_updated`: Optional field for tracking content revisions.
- `tags`: Array of keywords relevant to the article content, used for filtering later on.
- `title`: The full title of the article, serves multiple purposes including SEO.
- `meta_description`: A concise summary used for SEO meta tags in a later step.

## Configure `mdsvex`

To read the markdown metadata of each file, we are using the `mdsvex` plugin. It is not configured to support `.md` files by default, which is why we need to update our `svelte.config.js` file:

```js
import { mdsvex } from "mdsvex";
import adapter from "@sveltejs/adapter-cloudflare-workers";

/** @type {import("@sveltejs/kit").Config} */
const config = {
	kit: {
		adapter: adapter()
	},

	preprocess: [
		mdsvex({
			extensions: [".svx", ".md"]
		})
	],
	extensions: [".svelte", ".svx", ".md"]
};

export default config;
```

Our changes [follow the docs](https://mdsvex.pngwn.io/docs#extensions).

## Fetch Articles and Projects

Create a `src/routes/+page.server.js` file that will be used for fetching articles and projects dynamically.

```js
export function load() {
	const articleModules = import.meta.glob("/src/lib/articles/*.md", { eager: true });
	const projectModules = import.meta.glob("/src/lib/projects/*.md", { eager: true });

	// Load and sort articles
	const articles = Object.values(articleModules)
		.map(({ metadata }) => ({
			...metadata
		}))
		.sort((a, b) => new Date(b.date) - new Date(a.date))
		.slice(0, 2); // Get 2 most recent articles

	// Load and sort projects
	const projects = Object.values(projectModules)
		.map(({ metadata }) => ({
			...metadata
		}))
		.sort((a, b) => new Date(b.date) - new Date(a.date))
		.slice(0, 2); // Get 2 most recent projects

	return { articles, projects };
}
```

This function reads our Markdown files, extracts metadata, and returns them to the homepage. As you probably expect by reading the file's name, this code runs on the [server side](https://svelte.dev/tutorial/kit/page-data).

- `import.meta.glob` is a built-in feature in Vite (and by extension SvelteKit) that makes handling file imports in bulk efficient and straightforward. The `eager: true` option means the imports are resolved during build time, allowing us to directly access their `metadata`.
- It would be beneficial to study this code, perhaps print out the `articleModules` in the console. We don't use everything contained in the 2 `*Modules` objects as we only need the metadata in this case. Later on, when we create the individual post content pages, we will use these objects fully.
- The sorting and slicing could happen on the client side, but since we only need the 2 most recent articles and projects, why waste the user's bandwidth.

## Create the Home Page

Now, let’s build the home page, update `src/routes/+page.svelte`:

```svelte
<script>
	let { data } = $props();
</script>

<div class="flex justify-between gap-4 p-8 pb-2 pt-28">
	<h1 class="text-lg font-semibold">John Doeloper</h1>
	<div class="flex justify-center space-x-4">
		<a
			href="https://www.linkedin.com/in/username"
			class="text-secondary hover:text-accent"
			target="_blank"
		>
			linkedin
		</a>
		<a
			href="https://github.com/username"
			class="text-secondary hover:text-accent"
			target="_blank"
		>
			github
		</a>
		<a
			href="https://www.instagram.com/username"
			class="text-secondary hover:text-accent"
			target="_blank"
		>
			instagram
		</a>
		<a
			href="mailto:developer@example.com"
			class="text-secondary hover:text-accent"
			target="_blank"
		>
			email
		</a>
	</div>
</div>

<p class="mb-8 px-8">
	Code wizard by day, bug creator by night. I turn coffee into code and occasionally make computers do cool things.
</p>

<div class="p-8 pb-0 pt-0">
	<div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
		<section>
			<h2 class="text-lg font-semibold">Articles</h2>
			<ul class="mt-4 space-y-4">
				{#each data.articles as article}
					<li>
						<a href="/blog/{article.slug}" class="hover:link">
							<h2>{article.title}</h2>
							<p class="text-sm text-secondary">
								{article.date}
								{#if article.date_updated}
									- updated {article.date_updated}
								{/if}
							</p>
						</a>
					</li>
				{/each}
			</ul>
			<a href="/blog" class="link mt-4 inline-block pl-0">All Articles</a>
		</section>

		<section>
			<h2 class="text-lg font-semibold">Projects</h2>
			<ul class="mt-4 space-y-4">
				{#each data.projects as project}
					<li>
						<a href="/projects/{project.slug}" class="hover:link">
							<h2>{project.title}</h2>
							<p class="text-sm text-secondary">
								{project.date}
								{#if project.date_updated}
									- updated {project.date_updated}
								{/if}
							</p>
						</a>
					</li>
				{/each}
			</ul>
			<a href="/projects" class="link mt-4 inline-block pl-0">All Projects</a>
		</section>
	</div>
</div>
```

- Regarding the file path: in SvelteKit, `src/routes/+page.svelte` represents the home page (`/`) because SvelteKit uses [file-based routing](https://svelte.dev/tutorial/kit/pages). This convention makes the routing structure clear and intuitive by matching the file system structure to the URL structure.
- The `data` object is [passed to the page from the server-side](https://svelte.dev/tutorial/kit/page-data) function `load()`. This is how we access the articles and projects metadata, i.e. the frontmatter data.
  - From the frontmatter data, we are making use of the `title`, `date`, and `slug` fields.
- Familiarize yourself with the [Svelte each block](https://svelte.dev/tutorial/svelte/each-blocks). We will need it again.

### (Optional) Add Socials Icons

If you want to add social icons to your home page, you can either use SVG icons as files or inline them directly in the HTML. Here's how to use SVG files:

```html
<a
	href="https://www.linkedin.com/in/username"
	class="text-secondary hover:text-accent tooltip"
	target="_blank"
	data-tip="linkedin"
>
	<img src="/socials/linkedin.svg" alt="Linkedin" class="w-6 h-6" />
</a>
```

Regarding the socials icons, you may search for "free social icons" in your favorite search engine. I used [Iconfinder](https://www.iconfinder.com/) with the "Free" filter.

  1. Download the icons as SVG files.
  2. Store them in `static/socials/`.

Keep in mind that the "static" is not part of the URL path, so you can access the icons directly from the root of your domain.

Alternatively, here's how to use them inline:

```html
<a
	href="https://www.linkedin.com/in/username"
	class="tooltip text-secondary hover:text-accent"
	target="_blank"
	data-tip="linkedin"
	aria-label="Visit my LinkedIn profile"
>
	<svg class="h-6 w-6 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
		<g data-name="in linkedin portfolio social media" id="in_linkedin_portfolio_social_media">
			<path
				d="M6.5,3A3.5,3.5,0,1,0,10,6.5,3.5,3.5,0,0,0,6.5,3Zm0,5A1.5,1.5,0,1,1,8,6.5,1.5,1.5,0,0,1,6.5,8Z"
			/>
			<path
				d="M9,11H4a1,1,0,0,0,0,2H8V27H5V16a1,1,0,0,0-2,0V28a1,1,0,0,0,1,1H9a1,1,0,0,0,1-1V12A1,1,0,0,0,9,11Z"
			/>
			<path
				d="M27.34,12.68A5.94,5.94,0,0,0,23,11H22a7.84,7.84,0,0,0-4,.89A1,1,0,0,0,17,11H12a1,1,0,0,0-1,1V28a1,1,0,0,0,1,1h5a1,1,0,0,0,1-1V19a2,2,0,0,1,4,0v9a1,1,0,0,0,1,1h5a1,1,0,0,0,1-1V17A5.9,5.9,0,0,0,27.34,12.68ZM27,27H24V19a4,4,0,0,0-8,0v8H13V13h3v1a1,1,0,0,0,.62.92,1,1,0,0,0,1.09-.21c.95-1,1.7-1.71,4.29-1.71h1a4,4,0,0,1,2.92,1.09A4,4,0,0,1,27,17Z"
			/>
		</g>
	</svg>
</a>
```

This is the option I went for, since it allows for easy color customization based on the secondary color we have set in [the previous step](/blog/portfolio-website-step-2-install-and-configure-daisyui).
To get the SVG code, download the SVG file and open it in a text editor. Copy the contents and paste them in your `src/routes/+page.svelte` file. Notice how:

- We removed the `<?xml version="1.0" ?>` tag, it's primarily used when the SVG is a standalone file to indicate that it's an XML document.
- We removed the `<title />` tag. It's used for accessibility purposes, but in this case, the added `aria-label` attribute on the `<a>` tag serves the same purpose.
- We added classes to the SVG elements to apply Tailwind CSS classes for styling.

## Add a Navbar

Now, let’s create a navigation bar. We want it present in every page of the website so it will be handled in [the layout file](https://svelte.dev/tutorial/kit/layouts) `src/routes/+layout.svelte`:

```svelte
<script>
	import "../app.css";
	import { page } from "$app/state";

	let { children } = $props();
</script>

<nav
	class="sticky top-0 z-10 mx-auto max-w-screen-sm bg-base-100/90 p-8 py-4 text-base text-secondary"
>
	<div class="flex justify-end gap-2">
		{#if page.url.pathname !== "/"}
			<a href="/" class="inline-block text-secondary hover:text-accent"> home </a>
			<span> | </span>
		{/if}
		<a
			href="/blog"
			class="inline-block hover:text-accent {page.url.pathname === '/blog'
				? 'text-accent'
				: 'text-secondary'}"
		>
			blog
		</a>
		<span> | </span>
		<a
			href="/projects"
			class="inline-block hover:text-accent {page.url.pathname === '/projects'
				? 'text-accent'
				: 'text-secondary'}"
		>
			projects
		</a>
	</div>
</nav>

<main class="relative mx-auto max-w-screen-sm bg-base-100 text-base text-primary">
	{@render children()}
</main>
```

- You can read more about `$app/state` in [this part of the excellent SvelteKit interactive tutorial](https://svelte.dev/tutorial/kit/page-state).
  - It is used to adapt the navbar styles based on the current url pathname. Is also used in combination with the [Svelte `#if` statement](https://svelte.dev/tutorial/svelte/if-blocks) to conditionally render the "home" button.
- Again, you may refer to the [Recommended Resources](/blog/portfolio-website-step-1-set-up-sveltekit-website#optional-recommended-resources) for more information on the html classes. For example, the `sticky` and `text-base` are TW classes affecting the navbar positioning and text size while `text-primary` is a DaisyUI color class.
- Finally, we use the `relative` TW class to enable the usage of `absolute` positioning for the floating "Contents" you see on every post page, aiding with navigation within the post. [_"the element will act as a position reference for absolutely positioned children"._](https://tailwindcss.com/docs/position#relatively-positioning-elements)

## Wrapping Up Step 3

Congratulations on making it this far! You have successfully created the home page of your personal website. You have learned how to structure your content, fetch it dynamically, and display it on the frontend. In the next step, we will [build the `/blog` and `/projects` pages](/blog/portfolio-website-step-4-build-blog-and-projects-pages). Stay tuned!
