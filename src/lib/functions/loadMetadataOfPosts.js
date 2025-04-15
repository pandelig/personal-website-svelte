export function loadMetadataOfPosts(type) {
    let postModules;

    if (type === "articles") {
        postModules = import.meta.glob("/src/lib/articles/*.md", { eager: true });
    } else if (type === "projects") {
        postModules = import.meta.glob("/src/lib/projects/*.md", { eager: true });
    } else {
        throw new Error(`Unknown type: ${type}`);
    }

    const posts = Object.values(postModules).map(({ metadata }) => ({
        ...metadata
    }));

    // Sort posts by date in descending order
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Extract unique tags for filtering
    const tags = [...new Set(posts.flatMap(post => post.tags))];

    return { posts, tags };
}