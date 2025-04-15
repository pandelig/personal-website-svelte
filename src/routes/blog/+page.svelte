<script>
	import PostList from "$lib/components/PostList.svelte";

	let { data } = $props();
</script>

<PostList {...data} />
