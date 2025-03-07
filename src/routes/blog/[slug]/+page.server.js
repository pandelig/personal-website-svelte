import { loadPost } from '$lib/functions/loadPost';

export function load({ params }) {
	return loadPost('articles', params.slug);
}
