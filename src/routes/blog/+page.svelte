<script>
	import PostList from "$lib/components/PostList.svelte";
	
	let { data } = $props();
	
	let postListProps = {
		...data,
		postType: "blog"
	};
</script>

<PostList {...postListProps} />