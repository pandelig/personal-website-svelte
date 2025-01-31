<script>
	import PostList from "$lib/components/PostList.svelte";
	
	let { data } = $props();
	
	let postListProps = {
		...data,
		postType: "projects"
	};
</script>

<PostList {...postListProps} />