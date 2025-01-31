<script>
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	let { title, description, buttonText = 'Send', formResponse } = $props();
</script>

<form method="POST" class="mt-8 space-y-2 p-8 pt-0" in:fade use:enhance>
	<h2 class="text-lg font-semibold">{title}</h2>
	<p>{description}</p>
	<input type="hidden" name="pageURLPathname" value={page.url.pathname} />
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<input
			type="text"
			name="name"
			placeholder="Your Name"
			class="input input-bordered w-full"
			required
		/>
		<input
			type="email"
			name="email"
			placeholder="Your Email"
			class="input input-bordered w-full"
			required
		/>
	</div>
	<textarea
		name="message"
		placeholder="Your Message"
		class="textarea textarea-bordered w-full"
		required
	></textarea>
	<div class="flex justify-center">
		<button type="submit" class="btn btn-primary active:animate-bounce">{buttonText}</button>
	</div>
	{#if formResponse?.message}
		<div class="mt-4 text-center" in:fade>
			{formResponse.message} {formResponse.success ? '😎' : '😥'}
		</div>
	{/if}
</form>
