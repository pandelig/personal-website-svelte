---
slug: "personal-website-with-sveltekit-and-tailwindcss"
date: "05 Mar 2025"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind", "cloudflare-workers"]
title: "Personal Website with SvelteKit and TailwindCSS"
meta_description: "Explore Pantelis Deligiannidis's personal website project built with SvelteKit and Tailwind CSS. Features a blog, portfolio, and comprehensive tutorial series for building fast, SEO-friendly web applications with a modern tech stack."
---

[GitHub Repository](https://github.com/pandelig/personal-website-svelte)

This is my personal website project built using SvelteKit and Tailwind CSS, designed for speed, minimalism, and SEO-friendliness.
It serves as my blog and portfolio.

## Branch Structure

- `main` → The live version of my personal website.
- `develop` → A branch for experimenting with new features.
- `tutorial` → The outcome of my step-by-step tutorial series.

## Tutorial Series

If you'd like to build a similar website and familiarize yourself with Svelte(Kit) and TailwindCSS, follow my step-by-step guide:

1. [Step 1: Set Up the Project](/blog/step-1-set-up-sveltekit-website)
2. [Step 2: Install and Configure DaisyUI](/blog/step-2-install-and-configure-daisyui)
3. [Step 3: Build the Home Page](/blog/step-3-build-the-home-page)
4. [Step 4: Build the Blog and Projects Pages](/blog/step-4-build-blog-and-projects-pages)
5. [Step 5: Build the Post Content Page](/blog/step-5-build-post-content-page)
6. [Step 6: Add Transitions and SEO](/blog/step-6-add-transitions-and-seo)
7. [Step 7: Deploy on Cloudflare Workers](/blog/step-7-deploy-on-cloudflare-workers)

## Features

- Fast, Accessible and SEO-Friendly - 100/100 score on [PageSpeed Insights](https://pagespeed.web.dev/).
- Tailwind CSS – Minimal, clean, and responsive styling.
- UI Animations – Leveraging SvelteKit’s built-in transitions.
- Client-Side Routing (CSR) – Once the website loads, navigation happens instantly with fewer server requests.
- Tag Filtering – Posts (blog articles and projects) can be filtered by tags.
- Markdown Support – Posts are simple `.md` files.

## Installation & Running Locally

Clone the repository, install dependencies, and start the development server:

```bash
git clone https://github.com/pandelig/personal-website-svelte.git
cd personal-website-svelte
npm install
npm run dev
```

You can find all the `npm` commands in `package.json`.

## Acknowledgments

The theme of this website was inspired by:

- [Mark Horn's AstroNano theme](https://astro.build/themes/details/astronano/) ([repo](https://github.com/markhorn-dev/astro-nano?tab=readme-ov-file))
- [Paco Coursey's personal website](https://paco.me/)

Also a special thanks to the [Svelte Discord server](https://discord.com/invite/svelte) and of course, the open-source community, as many open-source tools were used to build this website.

## License

[MIT](https://github.com/pandelig/personal-website-svelte/blob/main/LICENSE)
