import { loadMetadataOfPosts } from "$lib/functions/loadMetadataOfPosts";

export function load() {
    return loadMetadataOfPosts("articles");
}