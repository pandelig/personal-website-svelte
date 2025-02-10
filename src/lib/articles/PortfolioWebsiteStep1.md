---
slug: "setting-up-sveltekit-website"
date: "02-02-2024"
post_type: "blog"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind", "cloudflare-workers"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 1: Setting Up the Project"
meta_description: "Learn how to set up a personal website using SvelteKit and TailwindCSS in this comprehensive tutorial by Pantelis Deligiannidis. Step-by-step guide for project initialization and configuration."
---

<!-- TODO: Add links to the other steps once they are published. -->
1. (You are here) Step 1: Setting Up the Project
2. [Step 2: Installing and Configuring DaisyUI](/blog/installing-configuring-daisyui)
3. [Step 3: Building the Home Page](/blog/building-the-home-page)
4. [Step 4: Building Blog and Projects Pages](/blog/building-blog-and-projects-pages)
5. [Step 5: Post Content Pages](#)
6. [Step 6: Transitions and SEO](#)
7. [Step 7: Deployment on Cloudflare Workers](#)
8. [Step 8: Contact Form Functionality](#)

## Why SvelteKit and TailwindCSS?

In the evolving landscape of web development, we are constantly seeking tools that combine performance and [developer satisfaction](https://survey.stackoverflow.co/2024/technology#1-web-frameworks-and-technologies). [SvelteKit](https://svelte.dev/), a modern full stack framework, stands out by offering a unique approach where components are compiled into highly efficient JavaScript at build time, resulting in lightweight and fast-running applications. Its simple syntax makes it exceptionally beginner-friendly.

[TailwindCSS](https://tailwindcss.com/) enables rapid development through class-based styling, while its component library [DaisyUI](https://daisyui.com/) extends this functionality by providing a collection of ready-to-use components that maintain consistency with Tailwind's philosophy.

To make the development more enjoyable, it is recommended to install the appropriate extensions on your code editor.
- For [VSCode](https://code.visualstudio.com/): [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode), [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss).
- For [Zed](https://zed.dev/): [Svelte](https://zed.dev/extensions?query=svelte), [Tailwind CSS support is built into Zed](https://zed.dev/docs/languages/tailwindcss).

## What to Expect

By the end of this tutorial, you will have a fully functional and deployed personal portfolio website running on Cloudflare Workers. The website will:

- Host and display your articles and projects
- Include a tag filtering system for articles and projects
- Feature a working contact form
- Be fully SEO-optimized ([PageSpeed Insights](https://pagespeed.web.dev/): 100 on everything - Performance, Accessibility, Best Practices, SEO)
- Require no database

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

## Starting the Project

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

- "forms" plugin is not necessary since TailwindCSS's form styling utilities have been proven to be sufficient.
- Do not let the questions here overwhelm you. You can always add or remove these features later.

### (Optional) Finalizing the Setup
Once your project is created, run the following commands to create a git repository and start the development server:
```bash
cd my-svelte-app
git init && git add -A && git commit -m "Initial commit"
npm run dev -- --open
```

## Wrapping Up Step 1

Congratulations on completing the first step of building your portfolio website! You've successfully set up your development environment with SvelteKit and TailwindCSS.

In the next step, we'll dive into [installing and configuring DaisyUI](/blog/installing-configuring-daisyui).
