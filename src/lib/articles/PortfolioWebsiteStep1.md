---
slug: "set-up-sveltekit-website"
date: "27 Feb 2025"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind", "cloudflare-workers"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 1: Set Up the Project"
meta_description: "Learn how to build a personal website with Pantelis Deligiannidis using SvelteKit and TailwindCSS. This comprehensive guide covers project setup, development environment configuration, and foundational concepts for creating a modern web portfolio."
---

1. (You are here) Step 1: Set Up the Project
2. [Step 2: Install and Configure DaisyUI](/blog/install-and-configure-daisyui)
3. [Step 3: Build the Home Page](/blog/build-the-home-page)
4. [Step 4: Build the Blog and Projects Pages](/blog/build-blog-and-projects-pages)
5. [Step 5: Build the Post Content Page](/blog/build-post-content-page)
6. [Step 6: Add Transitions and SEO](/blog/add-transitions-and-seo)
7. [Step 7: Deploy on Cloudflare Workers](/blog/deploy-on-cloudflare-workers)

## Why SvelteKit and TailwindCSS?

In the evolving landscape of web development, we are constantly seeking tools that combine performance and [developer satisfaction](https://2024.stateofjs.com/en-US/libraries/#tier_list). [SvelteKit](https://svelte.dev/), a modern full stack framework, stands out by offering a unique approach where components are compiled into highly efficient JavaScript at build time, resulting in lightweight and fast-running applications. Its simple syntax makes it exceptionally beginner-friendly. We will be using Svelte 5.

[TailwindCSS](https://tailwindcss.com/) enables rapid development through class-based styling, while its component library [DaisyUI](https://daisyui.com/) extends this functionality by providing a collection of ready-to-use components that maintain consistency with Tailwind's philosophy. We will be using the versions `v4.0.0` and `v5.0.0` respectively.

To make the development more enjoyable, it is recommended to install the appropriate extensions on your code editor.
- For [VSCode](https://code.visualstudio.com/): [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode), [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss).
- For [Zed](https://zed.dev/): [Svelte](https://zed.dev/extensions?query=svelte), [Tailwind CSS support is built into Zed](https://zed.dev/docs/languages/tailwindcss).

## What to Expect

By the end of this tutorial, you will have a fully functional and deployed personal portfolio website running on Cloudflare Workers. The website will:

- Host and display your articles and projects
- Include a tag filtering system for articles and projects
- Be fully SEO-optimized ([PageSpeed Insights](https://pagespeed.web.dev/): 100 on everything - Performance, Accessibility, Best Practices, SEO)
- Require no database
- Look like the website you are browsing right now. The theme of the website was inspired by [Mark Horn's AstroNano theme](https://astro.build/themes/details/astronano/) ([repo](https://github.com/markhorn-dev/astro-nano?tab=readme-ov-file)) and [Paco Coursey's personal website](https://paco.me/). They just seemed amazing to me.

Basic knowledge of HTML and JavaScript is advised. Almost no CSS.

## External Links and Optional Sections

1. Throughout this tutorial, you will encounter links to external resources, primarily official documentation. Following them is completely optional and intended only for those aiming to deepen their understanding.
2. Some sections will be marked as **(Optional)**. These can be skipped without affecting the core functionality of the website.
3. Since articles and projects have a lot in common when it comes to implementation, I will be using the term "post" when I want to refer to both articles and projects.

## (Optional) Recommended Resources

It's beneficial to keep the following documentation tabs open for quick reference while following this tutorial:

- [DaisyUI Docs](https://daisyui.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
  - [Tailwind Playground](https://play.tailwindcss.com/)
- [Svelte Docs](https://svelte.dev/docs/svelte)
- [SvelteKit Docs](https://svelte.dev/docs/kit)

Additionally, if you plan to experiment beyond the scope of this tutorial, consider joining the [Svelte Discord server](https://discord.com/invite/svelte) to ask questions and get help from the community. Keep in mind that your favorite AI assistant is probably not up to date with Svelte 5.0 yet!

## Create the Project

You have at least two options for setting up your project: using [Cloudflare Workers](https://developers.cloudflare.com/workers/frameworks/framework-guides/svelte/) or a [standard SvelteKit installation](https://svelte.dev/docs/kit/creating-a-project). I have chosen to deploy on Cloudflare Workers, if you have a different preference feel free to do your own thing when we reach the deployment Step of the tutorial.

Before everything, make sure you have [Node.js](https://nodejs.org/en/download/) installed on your machine.

### Option 1: Cloudflare Workers (Recommended)
Run the following command:
```bash
npm create cloudflare@latest my-svelte-app -- --framework=svelte --experimental
```

### Option 2: Standard SvelteKit Setup
If you prefer more flexibility with deployment, use the following commands:
```bash
npx sv create my-svelte-app
cd my-app
npm install
npm run dev
```

### Setup Questions
Regardless of the method chosen, you will be prompted to configure your project. Here are my selections:

```text
Which template would you like?
- SvelteKit minimal

Add type checking with Typescript?
- No
  *This tutorial uses JavaScript.*

Project created

What would you like to add to your project? (use arrow keys / space bar)
- prettier, eslint, tailwindcss, sveltekit-adapter, mdsvex
  *Code formatters (optional), CSS framework, deployment adapter, and markdown processor for SvelteKit.*

tailwindcss: Which plugins would you like to add?
- typography
  *Necessary for post content readability.*

sveltekit-adapter: Which SvelteKit adapter would you like to use?
- cloudflare-workers

Which package manager do you want to install dependencies with?
- npm
```

Do not let the questions overwhelm you. You can always add or remove these features later.
- *Do you want to use git for version control?*, choose `Yes`.
- *Do you want to deploy your application?*, choose `No`

### Run the Development Server
Once your project is created, start the development server:
```bash
cd my-svelte-app
npm run dev -- --open
```

If everything is set up correctly, you should see your new SvelteKit app running in your browser.

## Wrapping Up Step 1

Congratulations on completing the first step of building your portfolio website! You've successfully set up your development environment with SvelteKit and TailwindCSS.

In the next step, we'll dive into [installing and configuring DaisyUI](/blog/install-and-configure-daisyui).
