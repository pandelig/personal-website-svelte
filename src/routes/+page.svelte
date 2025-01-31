<script>
	import { fade } from 'svelte/transition';
	import ContactForm from '$lib/components/ContactForm.svelte';

	let { data, form } = $props();

	const formParameters = $derived({
		title: 'Get in Touch',
		description: 'Have questions, ideas, or just want to say hi? Don\’t hesitate to reach out!',
		formResponse: form
	});

	let showContent1 = $state(false);
	let showContent2 = $state(false);
	let showContent3 = $state(false);
	let showContent4 = $state(false);

	// Delay the rendering to trigger transitions
	setTimeout(() => {
		showContent1 = true;
	}, 100);

	$effect(() => {
		if (showContent1) {
			setTimeout(() => (showContent2 = true), 200);
		}
		if (showContent2) {
			setTimeout(() => (showContent3 = true), 200);
		}
		if (showContent3) {
			setTimeout(() => (showContent4 = true), 200);
		}
	});
</script>

<svelte:head>
	<title>Pantelis Deligiannidis - Software Engineer - Full Stack Web Development - DevOps</title>
	<meta
		name="description"
		content="Welcome to the personal website of Pantelis Deligiannidis, a software engineer with professional experience in full stack web development and DevOps. Explore articles and projects on web development, DevOps, cloud computing, Linux, and more"
	/>
</svelte:head>

{#if showContent1}
	<div class="flex justify-between gap-4 p-8 pb-2 pt-28" in:fade>
		<h1 class="text-lg font-semibold">Pantelis Deligiannidis</h1>
		<div class="flex justify-center space-x-4">
			<a
				href="https://www.linkedin.com/in/pantelisdelig"
				class="tooltip opacity-50 transition-opacity hover:opacity-100"
				target="_blank"
				data-tip="linkedin"
			>
				<img src="/icons/linkedin.svg" alt="Linkedin" class="h-6 w-6" />
			</a>
			<a
				href="https://github.com/pandelig"
				class="tooltip opacity-50 transition-opacity hover:opacity-100"
				target="_blank"
				data-tip="github"
			>
				<img src="/icons/github.svg" alt="GitHub" class="h-6 w-6" />
			</a>
			<a
				href="https://www.instagram.com/pantelisdelig"
				class="tooltip opacity-50 transition-opacity hover:opacity-100"
				target="_blank"
				data-tip="instagram"
			>
				<img src="/icons/instagram.svg" alt="Instagram" class="h-6 w-6" />
			</a>
			<a
				href="mailto:pandelig@gmail.com"
				class="tooltip opacity-50 transition-opacity hover:opacity-100"
				target="_blank"
				data-tip="email"
			>
				<img src="/icons/email.svg" alt="Email" class="h-6 w-6" />
			</a>
		</div>
	</div>
{/if}

{#if showContent2}
	<p class="mb-8 px-8" in:fade>
		Software Engineer with professional experience in full stack web development and DevOps,
		exploring tech, education, and occasionally random ideas.
	</p>
{/if}

{#if showContent3}
	<div class="p-8 pb-0 pt-0" in:fade>
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
			<section>
				<h2 class="text-lg font-semibold">Articles</h2>
				<ul class="mt-4 space-y-4">
					{#each data.articles as article, index}
						<li in:fade>
							<a href="/blog/{article.slug}" class="hover:link">
								<h2>{article.title}</h2>
								<p class="text-sm text-stone-500">{article.date}</p>
							</a>
						</li>
					{/each}
				</ul>
				<a href="/blog" class="link mt-4 inline-block pl-0">All Articles</a>
			</section>

			<section>
				<h2 class="text-lg font-semibold">Projects</h2>
				<ul class="mt-4 space-y-4">
					{#each data.projects as project, index}
						<li in:fade>
							<a href="/projects/{project.slug}" class="hover:link">
								<h2>{project.title}</h2>
								<p class="text-sm text-stone-500">{project.date}</p>
							</a>
						</li>
					{/each}
				</ul>
				<a href="/projects" class="link mt-4 inline-block pl-0">All Projects</a>
			</section>
		</div>
	</div>
{/if}

{#if showContent4}
	<ContactForm {...formParameters} />
{/if}
