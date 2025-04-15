---
slug: "portfolio-website-step-7-deploy-on-cloudflare-workers"
date: "05 Mar 2025"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "cloudflare-workers"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 7: Deploy on Cloudflare Workers"
meta_description: "Learn how to deploy your SvelteKit website on Cloudflare Workers with Pantelis Deligiannidis. Step-by-step guide covering account setup, domain configuration, and deployment using wrangler CLI."
---

1. [Step 1: Set Up the Project](/blog/portfolio-website-step-1-set-up-sveltekit-website)
2. [Step 2: Install and Configure DaisyUI](/blog/portfolio-website-step-2-install-and-configure-daisyui)
3. [Step 3: Build the Home Page](/blog/portfolio-website-step-3-build-the-home-page)
4. [Step 4: Build the Blog and Projects Pages](/blog/portfolio-website-step-4-build-blog-and-projects-pages)
5. [Step 5: Build the Post Content Page](/blog/portfolio-website-step-5-build-post-content-page)
6. [Step 6: Add Transitions and SEO](/blog/portfolio-website-step-6-add-transitions-and-seo)
7. (You are here) Step 7: Deploy on Cloudflare Workers

In this step, we will deploy our SvelteKit website on Cloudflare Workers. Why Cloudflare? It seemed to me, they offer a slightly more generous free tier compared to other providers, and the deployment process was pretty straightforward.

## Create a Cloudflare Account

First, you need a Cloudflare account. If you don’t have one, sign up at [Cloudflare](https://dash.cloudflare.com/sign-up).

## Buy a Domain Name

You can either:

- Buy a domain from Cloudflare: The easiest method, with direct integration.
- Use an external domain: Follow [Cloudflare's guide](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/) to point it to Cloudflare. Specifically, the "Provider-specific instructions" will probably be helpful.

## Configure Cloudflare Workers

We need to configure our Worker for deployment. In your project root, update the `wrangler.json` file:

```json
{
	"$schema": "node_modules/wrangler/config-schema.json",
	"name": "my-svelte-app",
	"main": ".svelte-kit/cloudflare/_worker.js",
	"compatibility_date": "2025-03-03",
	"observability": {
		"enabled": true
	},
	"site": {
		"bucket": ".svelte-kit/cloudflare"
	},
	"routes": [
		{
			"pattern": "yourdomainname.com",
			"custom_domain": true
		},
		{
			"pattern": "www.yourdomainname.com",
			"custom_domain": true
		}
	],
	"preview_urls": true,
	"workers_dev": true
}
```

This file tells `wrangler`, the Cloudflare CLI tool, how to deploy your app. You may [refer to the official docs to understand each key and value](https://developers.cloudflare.com/workers/wrangler/configuration/#inheritable-keys).

The `custom_domain: true` configuration automatically handles DNS routing through Cloudflare's system, eliminating the need to manually create DNS records. Keep in mind that Cloudflare Workers don't have a static IP address since they run on Cloudflare's distributed edge network. If you prefer managing DNS records manually, use a CNAME record pointing to your worker's `worker.dev` domain instead of an A record, as this better accommodates the dynamic nature of Workers.

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

```bash
> Using @sveltejs/adapter-cloudflare-workers
error during build:
Error: You must specify site.bucket in wrangler.json. Consult https://developers.cloudflare.com/workers/platform/sites/configuration
```

So, we opt for Workers Sites, as it is also mentioned in the [basic configuration](https://svelte.dev/docs/kit/adapter-cloudflare-workers#Basic-Configuration) of SvelteKit.

## Deploy with Cloudflare Workers

To deploy, as mentioned in the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/frameworks/framework-guides/svelte/), run:

```bash
npm run deploy
```

At this point, your SvelteKit site should be live on Cloudflare Workers!

## Test Website Performance

After deployment, test your site's performance using PageSpeed Insights:

[PageSpeed Insights](https://pagespeed.web.dev/)

Check for improvements and optimize accordingly.

## (Optional) Document the Components

Svelte(kit) offers [a way to add docstrings](https://svelte.dev/docs/svelte/faq#How-do-I-document-my-components) to our components. This way, when we mouse over an imported component in our code editor, our comment will be displayed. For example, `src/lib/components/PostList.svelte`:

```svelte
<!-- @component Displays a filterable list of posts (blog or project articles) with tags and animated transitions -->
<script>
    // ...
</script>
```

`src/lib/components/PostContent.svelte`:

```svelte
<!-- @component Displays a post (blog or project article) with interactive tags, a back to top button, and a table of contents -->
<script>
    // ...
</script>
```

## Next Steps

[Repository with final code](https://github.com/pandelig/personal-website-svelte/tree/tutorial)

Congratulations! You have successfully developed and deployed your SvelteKit website on Cloudflare! What's next?

Here are some ideas for improving your SvelteKit site further:

- Implement a Contact Form.
- Implement search functionality for posts.
- Improved Tags: Add a tag count number next to each tag.
- Switch to `.svx` files instead of `.md` for posts if you would like to [*use Svelte components in your markdown, or markdown in your Svelte components.*](https://mdsvex.pngwn.io/docs).
- Add dark theme support.
- Shiki code highlighting for markdown, it offers more features than PrismJS.
- Try to also deploy on Cloudflare Pages.

Would you like to see any of these become a part of the tutorial? Let me know.

## Final Words

For me, all this was a personal bet that I am happy to finally see through. All I knew when I started this project was that I wanted a personal website to share my thoughts. Eventually, after a successful deployment, I decided to write this tutorial as a way to give back to the community and to help others who might be in a similar situation. I hope you found it helpful and that you are now ready to take on the world with your new personal website! If you have any questions or feedback, feel free to reach out using the contact form below or directly by [email](mailto:pandelig@gmail.com). I would love to hear from you!
