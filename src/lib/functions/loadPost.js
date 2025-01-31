import { error } from '@sveltejs/kit';
import { render } from 'svelte/server';

export function loadPost(type, slug) {
    let postModules;

    if (type === 'articles') {
        postModules = import.meta.glob('/src/lib/articles/*.md', { eager: true });
    } else if (type === 'projects') {
        postModules = import.meta.glob('/src/lib/projects/*.md', { eager: true });
    } else {
        throw error(500, `Unknown post type: ${type}`);
    }

    const post = Object.values(postModules).find(({ metadata }) => 
        metadata.slug === slug
    );

    if (!post) {
        throw error(404, `${type.slice(0, -1)} not found. The following slug doesn't exist: ${slug}`);
    }

    const renderedContent = render(post.default);

    return {
        metadata: post.metadata,
        content: renderedContent.html // Pre-rendered HTML
    };
}