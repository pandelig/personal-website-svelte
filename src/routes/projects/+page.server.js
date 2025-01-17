export function load() {
    const projectModules = import.meta.glob('/src/lib/projects/*.md', { eager: true });

    const projects = Object.values(projectModules).map(({ metadata }) => ({
        ...metadata,
        slug: metadata.slug || metadata.title.toLowerCase().replace(/\s+/g, '-'),
    }));

    // Sort projects by date in descending order
    projects.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Extract unique tags for filtering
    const tags = [...new Set(projects.flatMap(project => project.tags))];

    return { projects, tags };
}