---
slug: "install-configure-daisyui"
date: "03-02-2024"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 2: Install and Configure DaisyUI"
meta_description: "Learn how to install and configure DaisyUI in your SvelteKit project to create a beautiful, modern UI with TailwindCSS in this article by Pantelis Deligiannidis."
---

<!-- TODO: Add links to the other steps once they are published. -->
1. [Step 1: Set Up the Project](/blog/set-up-sveltekit-website)
2. (You are here) Step 2: Install and Configure DaisyUI
3. [Step 3: Build the Home Page](/blog/build-the-home-page)
4. [Step 4: Build the Blog and Projects Pages](/blog/build-blog-and-projects-pages)
5. [Step 5: Build the Post Content Page](build-post-content-page)
6. [Step 6: Adding Transitions and SEO](#)
7. [Step 7: Deployment on Cloudflare Workers](#)
8. [Step 8: Contact Form with Mailjet](#)

In this step, we'll integrate DaisyUI, a component library for Tailwind CSS, into our SvelteKit project. As we start using Tailwind CSS and DaisyUI classes, you may always refer to the [Recommended Resources](/blog/set-up-sveltekit-website#optional-recommended-resources) to soon realize how easy it is to understand and remember the logic behind the class names.

## Install DaisyUI
To [install DaisyUI](https://daisyui.com/docs/install/), run the following command in your project directory, it will add DaisyUI as a development dependency in your project.:

```bash
npm i -D daisyui@latest
```

## Configure Tailwind to Use DaisyUI
Now, update the `tailwind.config.js` file to include DaisyUI:

```javascript
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

	plugins: [typography, require('daisyui')],

	daisyui: {
		themes: ['lofi'], // Choose any theme or create your own!
	},
};
```

### (Optional) Choosing a Theme
DaisyUI provides many built-in themes that you can use. You can view [all available themes here](https://daisyui.com/docs/themes/). You can [define your own theme](https://daisyui.com/docs/themes/#-4).

For this tutorial, we will use the "lofi" theme, which has a clean, minimalist design with a white background.

## Test DaisyUI Integration
To ensure that DaisyUI is working correctly, let's create a simple test component.

Open `src/routes/+page.svelte` and add the following:

```svelte
<script>
  let count = 0;
</script>

<div class="p-6 flex flex-col items-center justify-center min-h-screen">
  <h1 class="text-3xl font-bold">DaisyUI is Working!</h1>
  <button class="btn btn-primary mt-4" onclick={() => count++}>
    Click me: {count}
  </button>
</div>
```

Start the development server:

```bash
npm run dev -- --open
```

If a browser tab doesn't open automatically, visit `http://localhost:5173`, and you should see a styled button from DaisyUI.

## Wrapping Up Step 2

Great job! You have successfully installed and configured DaisyUI in your SvelteKit project. Now you're ready for [Step 3: Build the Home Page](/blog/build-the-home-page).
<!-- TODO: Add link to the next step once it is published. -->
