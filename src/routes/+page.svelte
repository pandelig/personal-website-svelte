<script>
	import { fade } from 'svelte/transition';
	import ContactForm from '$lib/components/ContactForm.svelte';

	let { data, form } = $props();

	const formParameters = $derived({
		title: 'Get in Touch',
		description: "Have questions, ideas, or just want to say hi? Don't hesitate to reach out!",
		formResponse: form
	});

	let showContent1 = $state(false);
	let showContent2 = $state(false);
	let showContent3 = $state(false);
	let showContent4 = $state(false);

	// Delay the rendering to trigger transitions
	setTimeout(() => {
		showContent1 = true;
	}, 200);

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
	<title>Pantelis Deligiannidis</title>
	<meta
		name="description"
		content="Welcome to the personal website of Pantelis Deligiannidis, a Software Engineer with experience in full stack Web Development and DevOps. Explore articles and projects on Web Development, DevOps, Cloud Computing, Linux, and more"
	/>
</svelte:head>

{#if showContent1}
	<div class="flex justify-between gap-4 p-8 pb-2 pt-28" in:fade>
		<h1 class="text-lg font-semibold">Pantelis Deligiannidis</h1>
		<div class="flex justify-center space-x-4">
			<a
				href="https://www.linkedin.com/in/pantelisdelig"
				class="tooltip text-secondary hover:text-accent"
				target="_blank"
				data-tip="linkedin"
				aria-label="Visit my LinkedIn profile"
			>
				<svg class="h-6 w-6 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
					<g data-name="in linkedin portfolio social media" id="in_linkedin_portfolio_social_media">
						<path
							d="M6.5,3A3.5,3.5,0,1,0,10,6.5,3.5,3.5,0,0,0,6.5,3Zm0,5A1.5,1.5,0,1,1,8,6.5,1.5,1.5,0,0,1,6.5,8Z"
						/>
						<path
							d="M9,11H4a1,1,0,0,0,0,2H8V27H5V16a1,1,0,0,0-2,0V28a1,1,0,0,0,1,1H9a1,1,0,0,0,1-1V12A1,1,0,0,0,9,11Z"
						/>
						<path
							d="M27.34,12.68A5.94,5.94,0,0,0,23,11H22a7.84,7.84,0,0,0-4,.89A1,1,0,0,0,17,11H12a1,1,0,0,0-1,1V28a1,1,0,0,0,1,1h5a1,1,0,0,0,1-1V19a2,2,0,0,1,4,0v9a1,1,0,0,0,1,1h5a1,1,0,0,0,1-1V17A5.9,5.9,0,0,0,27.34,12.68ZM27,27H24V19a4,4,0,0,0-8,0v8H13V13h3v1a1,1,0,0,0,.62.92,1,1,0,0,0,1.09-.21c.95-1,1.7-1.71,4.29-1.71h1a4,4,0,0,1,2.92,1.09A4,4,0,0,1,27,17Z"
						/>
					</g>
				</svg>
			</a>
			<a
				href="https://github.com/pandelig"
				class="tooltip text-secondary hover:text-accent"
				target="_blank"
				data-tip="github"
				aria-label="Visit my GitHub profile"
			>
				<svg class="h-6 w-6 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
					><g data-name="github coding dev developer" id="github_coding_dev_developer"
						><path
							d="M16,3a13,13,0,0,0-3.46,25.53,1,1,0,1,0,.53-1.92,11,11,0,1,1,7-.4,15.85,15.85,0,0,0-.3-3.92A6.27,6.27,0,0,0,24.68,16a6.42,6.42,0,0,0-1.05-3.87,7.09,7.09,0,0,0-.4-3.36,1,1,0,0,0-1.1-.67,8,8,0,0,0-3.37,1.28A11.35,11.35,0,0,0,16,9a13.09,13.09,0,0,0-3,.43A5.74,5.74,0,0,0,9.62,8.25a1,1,0,0,0-1,.66,7.06,7.06,0,0,0-.37,3.19A7.15,7.15,0,0,0,7.2,16a6.66,6.66,0,0,0,5,6.28,7.43,7.43,0,0,0-.15.79c-1,.06-1.58-.55-2.32-1.48a3.45,3.45,0,0,0-1.94-1.53,1,1,0,0,0-1.15.76A1,1,0,0,0,7.35,22c.16,0,.55.52.77.81a4.74,4.74,0,0,0,3.75,2.25,4.83,4.83,0,0,0,1.3-.18h0a1,1,0,0,0,.29-.14l0,0a.72.72,0,0,0,.18-.21.34.34,0,0,0,.08-.09.85.85,0,0,0,.06-.17,1.52,1.52,0,0,0,.06-.2v0a4.11,4.11,0,0,1,.46-1.91,1,1,0,0,0-.76-1.65A4.6,4.6,0,0,1,9.2,16a4.84,4.84,0,0,1,.87-3,1,1,0,0,0,.24-.83,5,5,0,0,1,0-1.85,3.59,3.59,0,0,1,1.74.92,1,1,0,0,0,1,.23A12.49,12.49,0,0,1,16,11a9.91,9.91,0,0,1,2.65.43,1,1,0,0,0,1-.18,5,5,0,0,1,2-1,4.11,4.11,0,0,1,0,1.91,1.05,1.05,0,0,0,.32,1A4,4,0,0,1,22.68,16a4.29,4.29,0,0,1-4.41,4.46,1,1,0,0,0-.94.65,1,1,0,0,0,.28,1.11c.59.51.5,4,.47,5.36a1,1,0,0,0,.38.81,1,1,0,0,0,.62.21,1.07,1.07,0,0,0,.25,0A13,13,0,0,0,16,3Z"
						/></g
					></svg
				>
			</a>
			<a
				href="https://www.instagram.com/pantelisdelig"
				class="tooltip text-secondary hover:text-accent"
				target="_blank"
				data-tip="instagram"
				aria-label="Visit my Instagram profile"
			>
				<svg
					class="h-6 w-6 fill-current"
					enable-background="new 0 0 56.693 56.693"
					height="56.693px"
					id="Layer_1"
					version="1.1"
					viewBox="0 0 56.693 56.693"
					width="56.693px"
					xml:space="preserve"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					><path
						d="M43.414,4.831H13c-5.283,0-9.581,4.297-9.581,9.58v10.12v20.295c0,5.283,4.298,9.58,9.581,9.58h30.415  c5.283,0,9.58-4.297,9.58-9.58V24.53v-10.12C52.994,9.127,48.697,4.831,43.414,4.831z M46.162,10.544l1.096-0.004v1.091v7.312  l-8.375,0.027l-0.029-8.402L46.162,10.544z M21.131,24.53c1.588-2.197,4.164-3.638,7.076-3.638s5.488,1.441,7.074,3.638  c1.033,1.434,1.652,3.188,1.652,5.088c0,4.811-3.918,8.725-8.727,8.725c-4.812,0-8.726-3.914-8.726-8.725  C19.481,27.718,20.098,25.964,21.131,24.53z M48.164,44.825c0,2.621-2.131,4.75-4.75,4.75H13c-2.62,0-4.751-2.129-4.751-4.75V24.53  h7.4c-0.639,1.572-0.998,3.289-0.998,5.088c0,7.473,6.08,13.557,13.556,13.557c7.475,0,13.555-6.084,13.555-13.557  c0-1.799-0.361-3.516-1-5.088h7.402V44.825z"
					/></svg
				>
			</a>
			<a
				href="mailto:pandelig@gmail.com"
				class="tooltip text-secondary hover:text-accent"
				target="_blank"
				data-tip="email"
				aria-label="Send me an email"
			>
				<svg class="h-6 w-6 fill-current" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
					><g data-name="mail email e-mail letter" id="mail_email_e-mail_letter"
						><path
							d="M28,13a1,1,0,0,0-1,1v8a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V14a1,1,0,0,0-2,0v8a3,3,0,0,0,.88,2.12A3,3,0,0,0,6,25H26a3,3,0,0,0,2.12-.88A3,3,0,0,0,29,22V14A1,1,0,0,0,28,13Z"
						/><path
							d="M15.4,18.8a1,1,0,0,0,1.2,0L28.41,9.94a1,1,0,0,0,.3-1.23,3.06,3.06,0,0,0-.59-.83A3,3,0,0,0,26,7H6a3,3,0,0,0-2.12.88,3.06,3.06,0,0,0-.59.83,1,1,0,0,0,.3,1.23ZM6,9H26a.9.9,0,0,1,.28,0L16,16.75,5.72,9A.9.9,0,0,1,6,9Z"
						/></g
					></svg
				>
			</a>
		</div>
	</div>
{/if}

{#if showContent2}
	<p class="mb-8 px-8" in:fade>
		Software Engineer with experience in full stack web development and DevOps, exploring tech,
		education, and occasionally random ideas.
	</p>
{/if}

{#if showContent3}
	<div class="p-8 pb-0 pt-0" in:fade>
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
			<section>
				<h2 class="text-lg font-semibold">Articles</h2>
				<ul class="mt-4 space-y-4">
					{#each data.articles as article}
						<li>
							<a href="/blog/{article.slug}" class="hover:link">
								<h2>{article.title}</h2>
								<p class="text-sm text-secondary">
									{article.date}
									{#if article.date_updated}
										- updated {article.date_updated}
									{/if}
								</p>
							</a>
						</li>
					{/each}
				</ul>
				<a href="/blog" class="link mt-4 inline-block pl-0">All Articles</a>
			</section>

			<section>
				<h2 class="text-lg font-semibold">Projects</h2>
				<ul class="mt-4 space-y-4">
					{#each data.projects as project}
						<li>
							<a href="/projects/{project.slug}" class="hover:link">
								<h2>{project.title}</h2>
								<p class="text-sm text-secondary">
									{project.date}
									{#if project.date_updated}
										- updated {project.date_updated}
									{/if}
								</p>
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
