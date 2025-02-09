---
slug: "building-the-home-page"
date: "04-02-2024"
post_type: "blog"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 3: Building the Home Page"
meta_description: "Learn how to build the home page of your SvelteKit website using Tailwind and DaisyUI for a clean and minimalist design. This tutorial walks through structuring the page with articles, projects, and a contact form."
---
<!-- TODO update meta_description -->

<!-- TODO: Add links to the other steps once they are published. -->
1. [Step 1: Setting Up the Project](/blog/setting-up-sveltekit-website)
2. [Step 2: Installing and Configuring DaisyUI](/blog/installing-configuring-daisyui)
3. (You are here) Building the Home Page
4. [Step 4: Building Blog and Projects Pages](#)
5. [Step 5: Building Post Content Page](#)
6. [Step 6: Adding Transitions and SEO](#)
7. [Step 7: Deployment on Cloudflare Workers](#)
8. [Step 8: Contact Form with Mailjet](#)

In this article we will create the home page of our SvelteKit website. The home page will include our name, social links, a short description, a section for recent articles, another for recent projects, and a contact form.

To minimize back and forth editing, we follow a structured approach:
1. Create dummy files for articles and projects.
2. Build the contact form.
3. Set up backend logic for fetching content.
4. Integrate the frontend with the backend.

In this step you will likely come accross unknown html classes, you can refer to the Tailwind (TW) CSS and DaisyUI documentation as mentioned in the [Recommended Resources](/blog/setting-up-sveltekit-website#optional-recommended-resources). Soon you will realize how easy it is to understand and remember the logic behind the class names.

## Create Dummy Articles and Projects

Our articles and projects will be stored as Markdown (`.md`) files, let's create some sample content. For that purpose, feel free to use your favorite AI assistant, otherwise, you may use the following linked content. Take notice to maintain the frontmatter structure present in the linked content as it will soon become apparent that each key holds a certain significance.

Create the folder `src/lib/content/articles/` and the following files:
- `src/lib/content/articles/Article1.md` - [Article 1 github link](TODO)
- `src/lib/content/articles/Article2.md` - [Article 2 github link](TODO)
- `src/lib/content/articles/Article3.md` - [Article 3 github link](TODO)

Similarly, create `src/lib/content/projects/` and the following files:
- `src/lib/content/projects/Project1.md` - [Project 1 github link](TODO)
- `src/lib/content/projects/Project2.md` - [Project 2 github link](TODO)

### Frontmatter Structure

Example:
```yaml
---
slug: "installing-configuring-daisyui"
date: "03-02-2024"
post_type: "blog"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 2: Installing and Configuring DaisyUI"
meta_description: "Learn how to install and configure DaisyUI in your SvelteKit project..."
---
```
The frontmatter section of each article contains essential metadata that helps organize and identify the content. Here's a breakdown of each field:
- `slug`: A unique identifier used for routing and referencing the article
- `date`: Publication date in "DD-MM-YYYY" format
- `post_type`: Categorizes content as either "blog" or "projects", this is also used for routing
- `date_updated`: Optional field for tracking content revisions
- `tags`: Array of keywords relevant to the article content, used for filtering later on
- `title`: The full title of the article, serves multiple purposes including SEO
- `meta_description`: A concise summary used for SEO meta tags in a later step

## Create a Contact Form Component

We will be reusing the contact form in the end of every article and project so let's create a separate Svelte component.

Create the file `src/lib/components/ContactForm.svelte`:
```svelte
<script>
	import { page } from '$app/state';

	let { title, description, buttonText = 'Send' } = $props();
</script>

<form method="POST" class="mt-8 space-y-2 p-8 pt-0">
	<h2 class="text-lg font-semibold">{title}</h2>
	<p>{description}</p>
	<input type="hidden" name="pageURLPathname" value={page.url.pathname} />
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
		<input
			type="text"
			name="name"
			placeholder="Your Name"
			class="input input-bordered w-full"
			required
		/>
		<input
			type="email"
			name="email"
			placeholder="Your Email"
			class="input input-bordered w-full"
			required
		/>
	</div>
	<textarea
		name="message"
		placeholder="Your Message"
		class="textarea textarea-bordered w-full max-sm:h-32"
		required
	></textarea>
	<div class="flex justify-center">
		<button type="submit" class="btn btn-primary">{buttonText}</button>
	</div>
</form>
```

This form is static for now. We will make it functional in a later step.
- You can read more about `$app/state` in [this part of the excellent SvelteKit interactive tutorial](https://svelte.dev/tutorial/kit/page-state).
- Likewise, in these 3 parts, you can learn more about [`$props` in Svelte](https://svelte.dev/tutorial/svelte/declaring-props). This functionality allows us to customize the form's title, description etc. depending on whether it's used in the home page, articles, or projects.
  - The reason the hidden input exists in the form, is to see which page the form was submitted from.

## Fetch Articles and Projects

Create a `src/routes/+page.server.js` file that will be used for fetching articles and projects dynamically.

```js
export function load() {
	const articleModules = import.meta.glob('/src/lib/articles/*.md', { eager: true });
	const projectModules = import.meta.glob('/src/lib/projects/*.md', { eager: true });

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

This function reads our Markdown files, extracts metadata, and returns them for the homepage.
- The way we import them TODO, write something more about vite's glob import, it is efficient.
- It would be beneficial to study this code, perhaps print out the `articleModules` in the console. We don't use everything contained in the 2 `*Modules` objects as we only need the metadata in this case. Later on, when we reach the individual post pages, we will use these objects fully.
- The sorting and slicing could happen on the client side, but since we only need the 2 most recent articles and projects, why waste the user's bandwidth.

## Create the Home Page

Now, let’s build the home page, update `src/routes/+page.svelte`:
```svelte
<script>
	import ContactForm from '$lib/components/ContactForm.svelte';

	let { data } = $props();

	const formParameters = {
		title: 'Get in Touch',
		description: "If you found a bug in the Matrix or just want to discuss why coffee is better than tea, drop me a line!"
	};
</script>

<div class="flex justify-between gap-4 p-8 pb-2 pt-28">
	<h1 class="text-lg font-semibold">John Doeloper</h1>
	<div class="flex justify-center space-x-4">
		<a
			href="https://www.linkedin.com/in/username"
			class="tooltip opacity-50 transition-opacity hover:opacity-100"
			target="_blank"
			data-tip="linkedin"
		>
			<img src="/icons/linkedin.svg" alt="Linkedin" class="h-6 w-6" />
		</a>
		<a
			href="https://github.com/username"
			class="tooltip opacity-50 transition-opacity hover:opacity-100"
			target="_blank"
			data-tip="github"
		>
			<img src="/icons/github.svg" alt="GitHub" class="h-6 w-6" />
		</a>
		<a
			href="https://www.instagram.com/username"
			class="tooltip opacity-50 transition-opacity hover:opacity-100"
			target="_blank"
			data-tip="instagram"
		>
			<img src="/icons/instagram.svg" alt="Instagram" class="h-6 w-6" />
		</a>
		<a
			href="mailto:developer@example.com"
			class="tooltip opacity-50 transition-opacity hover:opacity-100"
			target="_blank"
			data-tip="email"
		>
			<img src="/icons/email.svg" alt="Email" class="h-6 w-6" />
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
							<p class="text-sm text-stone-500">{article.date}</p>
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
							<p class="text-sm text-stone-500">{project.date}</p>
						</a>
					</li>
				{/each}
			</ul>
			<a href="/projects" class="link mt-4 inline-block pl-0">All Projects</a>
		</section>
	</div>
</div>

<ContactForm {...formParameters} />
```

- Regarding the file path: in SvelteKit, `src/routes/+page.svelte` represents the home page (/) because SvelteKit uses [file-based routing](https://svelte.dev/tutorial/kit/pages). This convention makes the routing structure clear and intuitive by matching the file system structure to the URL structure.
- Notice how we import the `ContactForm` component and pass the `formParameters` to it.
- The `data` object is [passed to the page from the server-side](https://svelte.dev/tutorial/kit/page-data) function `load()`. This is how we access the articles and projects metadata, i.e. the frontmatter data.
  - From the frontmatter data, we are making use of the `title`, `date`, and `slug` fields.
- Regarding the socials icons, you may search for "free social icons" in your favorite search engine. I used [Iconfinder](https://www.iconfinder.com/) with the "Free" filter.
  1. Download the icons as SVG files.
  2. Store them in `static/icons/`.
  Keep in mind that the "static" is not part of the URL path, so you can access the icons directly from the root of your domain.
- Familirize yourself with the [Svelte each block](https://svelte.dev/tutorial/svelte/each-blocks). We will need it again.

## Add a Navbar

Now, let’s create a navigation bar. We want it present in every page of the website so it  will be handled in [a layout file](https://svelte.dev/tutorial/kit/layouts) `src/routes/+layout.svelte`:
```svelte
<script>
	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<nav
	class="sticky top-0 z-10 mx-auto max-w-screen-sm bg-base-100/90 p-8 py-4 text-base text-base-content"
>
	<div class="flex justify-end gap-2">
		{#if page.url.pathname !== '/'}
			<a href="/" class="inline-block text-stone-500 hover:text-base-content"> home </a>
			<span> | </span>
		{/if}
		<a
			href="/blog"
			class="inline-block hover:text-base-content {page.url.pathname === '/blog'
				? 'text-base-content'
				: 'text-stone-500'}"
		>
			blog
		</a>
		<span> | </span>
		<a
			href="/projects"
			class="inline-block hover:text-base-content {page.url.pathname === '/projects'
				? 'text-base-content'
				: 'text-stone-500'}"
		>
			projects
		</a>
	</div>
</nav>

<main class="relative mx-auto max-w-screen-sm bg-base-100 text-base text-base-content">
	{@render children()}
</main>
```

- We have seen `$app/state` [before](/blog/building-the-home-page#create-a-contact-form-component), it is now used to adapt the navbar styles based on the current url pathname. Is also used in combination with the [Svelte `#if` statement](https://svelte.dev/tutorial/svelte/if-blocks) to conditionally render the "home" button.
- Again, you may refer to the [Recommended Resources](/blog/setting-up-sveltekit-website#optional-recommended-resources) for more information on the html classes. For example, the `sticky` and `text-base` are TW classes affecting the navbar positioning and text size while `text-base-content` is a DaisyUI color class.
- Finally, we use the `relative` TW class to enable the usage of `absolute` positioning for the floating "Contents" you see on every post page, aiding with navigation within the post. [*"the element will act as a position reference for absolutely positioned children".*](https://tailwindcss.com/docs/position#relatively-positioning-elements)


## Wrapping Up Step 3

Congratulations on making it this far! You have successfully created the home page of your personal website. You have learned how to structure your content, fetch it dynamically, and display it on the frontend, as well as how to create resuable components in SvelteKit. In the next step, we will [build the `/blog` and `/projects` pages](TODO). Stay tuned!
