---
slug: "deploy-on-cloudflare-workers"
date: "08-02-2024"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "cloudflare-workers"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 7: Deploy on Cloudflare Workers"
meta_description: "Learn how to deploy your SvelteKit website on Cloudflare Workers, configure wrangler.json, and optimize for performance."
---
<!-- TODO update meta_description -->
<!-- TODO all frontmatter dates -->

1. [Step 1: Set Up the Project](/blog/set-up-sveltekit-website)
2. [Step 2: Install and Configure DaisyUI](/blog/install-and-configure-daisyui)
3. [Step 3: Build the Home Page](/blog/build-the-home-page)
4. [Step 4: Build the Blog and Projects Pages](/blog/build-blog-and-projects-pages)
5. [Step 5: Build the Post Content Page](/blog/build-post-content-page)
6. [Step 6: Add Transitions and SEO](/blog/add-transitions-and-seo)
7. (You are here) Step 7: Deploy on Cloudflare Workers

In this step, we will deploy our SvelteKit website on Cloudflare Workers. Why Cloudflare? It seemed to me, they offer a more generous free tier compared to other providers, and the deployment process was pretty straightforward.

## Create a Cloudflare Account

First, you need a Cloudflare account. If you don’t have one, sign up at [Cloudflare](https://dash.cloudflare.com/sign-up). Once signed in, navigate to Workers & Pages to access the deployment settings.

## Buy a Domain Name

If you already own a domain, you can either:

- Buy a domain from Cloudflare: The easiest method, with direct integration.
- Use an external domain: Follow [Cloudflare's guide](https://developers.cloudflare.com/dns/zone-setups/full-setup/) to point it to Cloudflare.

After adding your domain, go to DNS Settings and ensure it is properly configured.

### Configure the Records

<!-- TODO -->

## Configure Cloudflare Workers

We need to set up Cloudflare Workers for deployment. In your project root, update the `wrangler.json` file:

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-svelte-app",
  "main": ".svelte-kit/cloudflare/_worker.js",
  "compatibility_date": "2025-01-26",
  "observability": {
    "enabled": true
  },
  "site": {
    "bucket": ".svelte-kit/cloudflare"
  },
  "routes": [
    {
      "pattern": "pandelig.com/*",
      "zone_name": "pandelig.com"
    },
    {
      "pattern": "www.pandelig.com/*",
      "zone_name": "pandelig.com"
    }
  ],
  "preview_urls": false,
  "workers_dev": false
}
```
<!-- TODO: Explanations e.g. sites vs assets -->

This file tells `wrangler`, the Cloudflare CLI tool, how to deploy your app.

### (Optional) Workers Sites vs Workers Static Assets

In the Cloudflare [official docs of Workers Sites](https://developers.cloudflare.com/workers/configuration/sites/), there is the following message:

> Use Workers Static Assets Instead. You should use Workers Static Assets to host full-stack applications instead of Workers Sites. Do not use Workers Sites for new projects.

Yet, if we attempt to replace:

```json
"site": {
  "bucket": ".svelte-kit/cloudflare"
},
```

with the [Workers Static Assets configuration](https://developers.cloudflare.com/workers/static-assets/) and run `npm run preview` we get the following error:

```
> Using @sveltejs/adapter-cloudflare-workers
error during build:
Error: You must specify site.bucket in wrangler.json. Consult https://developers.cloudflare.com/workers/platform/sites/configuration
```

So, we opt for Workers Sites.

## Deploy with Cloudflare Workers

To deploy, install the Cloudflare CLI:

```sh
npm install -g wrangler
```

Then log in:

```sh
wrangler login
```

Now, deploy your app:

```sh
wrangler deploy
```

At this point, your SvelteKit site should be live on Cloudflare Workers!

## Test Website Performance

After deployment, test your site's performance using PageSpeed Insights:

[PageSpeed Insights](https://pagespeed.web.dev/)

Check for improvements and optimize accordingly.

## (Optional) Document the Components

Svelte(kit) offers [a way to add docstrings](https://svelte.dev/docs/svelte/faq#How-do-I-document-my-components) to our components. This way, when we mouse over an imported component in our code editor, our comment will be displayed. For example, `src/lib/components/PostContent.svelte`:

```svelte
<!-- @component Displays a post (blog or project article) with interactive tags, a back to top button, and a table of contents -->
<script>
  // ...
</script>
```

`src/lib/components/PostList.svelte`:
```svelte
<!-- @component Displays a filterable list of posts (blog or project articles) with tags and animated transitions -->
<script>
  // ...
</script>
```

## Next Steps

Congratulations! You have successfully developed and deployed your SvelteKit website on Cloudflare! What's next? A lot!

Here are some ideas for improving your SvelteKit site further:

- Implement a Contact Form
- Search Functionality: Enable article search
- Improved Tags: Add tag counts
- Fix Mailjet Spam Warning
- Switch to `.svx` Files instead of `.md` for articles
- Night Mode: Add dark theme support
- Shiki Code Highlighting for markdown
- SEO Improvements: Open Graph tags, sitemaps, structured data
- Cloudflare Pages Deployment for better asset handling

Would you like to see any of these become a part of the tutorial? Let me know.

## Final Words

For me, all this was a personal bet that I am happy to finally see through. All I knew when I started this journey was that I wanted a personal website that I could use to share my thoughts and projects. After realizing the necessity of javascript, I religiously went though the [Modern Javascript Tutorial](https://javascript.info/) docs to feel comfortable with the language. Then came the question, what framework to use? After making attempts with the popular ones, I was lucky to discover Svelte(Kit) from a YouTube comment, which, funnily enough, was declaring it as a bad choice. The [Interactive Tutorial](TODO) was a blast and I was hooked. TailwindCSS was also new to me, but easy to learn and fun to work with. Next was the deployment, I ended up with Cloudflare Workers and soon found myself reading through the docs. Finally, after a successful deployment, I decided to write this tutorial as a way to give back to the community and to help others who might be in the same position as me. I hope you found it helpful and that you are now ready to take on the world with your new personal website. If you have any questions or feedback, feel free to reach out to me using the contact form below or directly by [email](TODO). I would love to hear from you!
<!-- TODO: make final words more concise, keep the long explanations for the project post -->
