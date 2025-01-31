import { loadPost } from '$lib/functions/loadPost';
import { handleContactForm } from '$lib/functions/handleContactForm.js';

export function load({ params }) {
    return loadPost('projects', params.slug);
}

export const actions = {
    default: async ({ request, platform }) => {
        return await handleContactForm({ request, platform });
    }
};