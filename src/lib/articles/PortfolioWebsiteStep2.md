---
slug: 'step-2-install-and-configure-daisyui'
date: '28 Feb 2025'
date_updated: ''
tags: ['tutorial', 'full-stack', 'sveltekit', 'tailwind']
title: 'Personal Website with SvelteKit and TailwindCSS - Step 2: Install and Configure DaisyUI'
meta_description: 'Learn how to install and configure DaisyUI in your SvelteKit project with Pantelis Deligiannidis. A step-by-step guide covering theme selection, custom theming, and integration testing with practical examples.'
---

1. [Step 1: Set Up the Project](/blog/step-1-set-up-sveltekit-website)
2. (You are here) Step 2: Install and Configure DaisyUI
3. [Step 3: Build the Home Page](/blog/step-3-build-the-home-page)
4. [Step 4: Build the Blog and Projects Pages](/blog/step-4-build-blog-and-projects-pages)
5. [Step 5: Build the Post Content Page](/blog/step-5-build-post-content-page)
6. [Step 6: Added Transitions and SEO](/blog/step-6-add-transitions-and-seo)
7. [Step 7: Deploy on Cloudflare Workers](/blog/step-7-deploy-on-cloudflare-workers)

In this step, we'll integrate DaisyUI, a component library for Tailwind CSS, into our SvelteKit project. As we start using Tailwind CSS and DaisyUI classes, you may always refer to the [Recommended Resources](/blog/step-1-set-up-sveltekit-website#optional-recommended-resources) to soon realize how easy it is to understand and remember the logic behind the class names.

## Install DaisyUI

To [install DaisyUI](https://daisyui.com/docs/install/), run the following command in your project directory, it will add DaisyUI as a development dependency in your project.:

```bash
npm i -D daisyui@latest
```

Add daisyUI to `src/app.css`:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';

@plugin "daisyui";
```

### Choose a Theme

DaisyUI provides many built-in themes that you can use. You can view [all available themes here](https://daisyui.com/docs/themes/).

### (Optional) Define a Custom Theme

You can [define your own theme](https://daisyui.com/theme-generator/). For example, `src/app.css`:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/typography';

@plugin "daisyui";
@plugin "daisyui/theme" {
	name: 'lofi';
	default: true;
	prefersdark: false;
	color-scheme: 'light';
	--color-base-100: oklch(100% 0 0);
	--color-base-200: oklch(97% 0 0);
	--color-base-300: oklch(94% 0 0);
	--color-base-content: oklch(0% 0 0);
	--color-primary: oklch(15.906% 0 0);
	--color-primary-content: oklch(100% 0 0);
	--color-secondary: oklch(55% 0.013 58.071);
	--color-secondary-content: oklch(100% 0 0);
	--color-accent: oklch(26.861% 0 0);
	--color-accent-content: oklch(100% 0 0);
	--color-neutral: oklch(0% 0 0);
	--color-neutral-content: oklch(100% 0 0);
	--color-info: oklch(79.54% 0.103 205.9);
	--color-info-content: oklch(15.908% 0.02 205.9);
	--color-success: oklch(90.13% 0.153 164.14);
	--color-success-content: oklch(18.026% 0.03 164.14);
	--color-warning: oklch(88.37% 0.135 79.94);
	--color-warning-content: oklch(17.674% 0.027 79.94);
	--color-error: oklch(78.66% 0.15 28.47);
	--color-error-content: oklch(15.732% 0.03 28.47);
	--radius-selector: 2rem;
	--radius-field: 0.25rem;
	--radius-box: 0.5rem;
	--size-selector: 0.25rem;
	--size-field: 0.25rem;
	--border: 1px;
	--depth: 0;
	--noise: 0;
}
```

This is the configuration I went for.

- Make sure to click the `CSS` button in the Theme Generator when you are done configuring your theme, it will give you the CSS code.
- We will be using `'base-100'` as the background color for our website.
- If you have trouble making the daisyUI theme work, make sure your browser is up to date, `oklch` support was introduced in the major browsers around 2023.

## Test DaisyUI Integration

To ensure that DaisyUI is working correctly, let's create a simple test component.

Open `src/routes/+page.svelte` and add the following:

```svelte
<script>
	let count = 0;
</script>

<div class="flex min-h-screen flex-col items-center justify-center p-6">
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

You should be able to see a styled button from DaisyUI in your browser.

## Wrapping Up Step 2

Great job! You have successfully installed and configured DaisyUI in your SvelteKit project. Now you're ready for [Step 3: Build the Home Page](/blog/step-3-build-the-home-page).
