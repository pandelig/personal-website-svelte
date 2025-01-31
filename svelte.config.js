import adapter from '@sveltejs/adapter-cloudflare-workers';
import { mdsvex } from 'mdsvex';
import rehypeSlug from 'rehype-slug';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	},
	preprocess: mdsvex({
		extensions: ['.svx', '.md'],
		rehypePlugins: [rehypeSlug]
	}),
	extensions: ['.svelte', '.svx', '.md']
};

export default config;