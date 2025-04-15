<script>
	import PostContent from "$lib/components/PostContent.svelte";
	let { data, form } = $props();

	const postParameters = $derived({
		...data,
		formResponse: form
	});
</script>

<PostContent {...postParameters} />