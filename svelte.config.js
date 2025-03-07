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
