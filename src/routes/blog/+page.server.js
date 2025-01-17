export function load() {
    const articleModules = import.meta.glob('/src/lib/articles/*.md', { eager: true });

    const articles = Object.values(articleModules).map(({ metadata }) => ({
        ...metadata,
        slug: metadata.slug || metadata.title.toLowerCase().replace(/\s+/g, '-'),
    }));

    // Sort articles by date in descending order
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Extract unique tags for filtering
    const tags = [...new Set(articles.flatMap(article => article.tags))];

    return { articles, tags };
}