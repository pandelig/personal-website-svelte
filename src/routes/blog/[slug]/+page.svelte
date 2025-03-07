<script>
	import PostContent from '$lib/components/PostContent.svelte';
	let { data } = $props();

	const postParameters = $derived({
		...data
	});
</script>

<PostContent {...postParameters} />
