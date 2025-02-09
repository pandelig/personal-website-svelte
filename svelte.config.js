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
					content: { type: 'text', value: '↗' } // adds an icon after external links, type can also be 'element' or 'comment', for value this adds an unbreakable space '\u00A0↗'
				}
			]
		]
	}),
	extensions: ['.svelte', '.svx', '.md']
};

export default config;
