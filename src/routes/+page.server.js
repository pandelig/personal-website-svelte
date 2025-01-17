export function load() {
    const articleModules = import.meta.glob('/src/lib/articles/*.md', { eager: true });
    const projectModules = import.meta.glob('/src/lib/projects/*.md', { eager: true });

    // Load and sort articles
    const articles = Object.values(articleModules)
        .map(({ metadata }) => ({
            ...metadata,
            slug: metadata.slug || metadata.title.toLowerCase().replace(/\s+/g, '-'),
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2); // Get 2 most recent articles

    // Load and sort projects
    const projects = Object.values(projectModules)
        .map(({ metadata }) => ({
            ...metadata,
            slug: metadata.slug || metadata.title.toLowerCase().replace(/\s+/g, '-'),
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2); // Get 2 most recent projects

    return { articles, projects };
}