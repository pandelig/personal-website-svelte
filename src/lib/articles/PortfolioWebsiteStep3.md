---
slug: "building-the-home-page"
date: "04-02-2024"
post_type: "blog"
date_updated: ""
tags: ["tutorial", "full-stack", "sveltekit", "tailwind", "daisyui"]
title: "Personal Website with SvelteKit and TailwindCSS - Step 2: Building the Home Page"
meta_description: "Learn how to build a modern home page using SvelteKit, DaisyUI, and Tailwind CSS. This step-by-step guide includes layout creation, styling, and component organization."
---
<!-- TODO update meta_description -->

<!-- TODO: Add links to the other steps once they are published. -->
1. [Step 1: Setting Up the Project](/blog/setting-up-sveltekit-website)
2. [Step 2: Installing and Configuring DaisyUI](/blog/installing-configuring-daisyui)
3. (You are here) Building the Home Page
4. [Step 4: Adding Progressive Loading Effects](#)
5. [Step 5: Creating the Blog Page](#)
6. [Step 6: Creating the Projects Page](#)
7. [Step 7: Configuring HTTPS and Domain Setup](#)
8. [Step 8: Finalizing and Optimizing](#)

In this step, we will create the home page of our SvelteKit project, applying Tailwind CSS and DaisyUI to achieve a clean, minimalist style.

## 1. Creating the Home Page Layout

To begin, open `src/routes/+page.svelte` and replace its content with the following code:

```svelte
<div class="min-h-screen bg-base-100 text-base-content">
  <header class="p-8 text-center">
    <h1 class="text-4xl font-bold">Your Name</h1>
    <p class="mt-2 text-sm">
      <a href="https://linkedin.com/in/yourprofile" class="link">LinkedIn</a> |
      <a href="https://github.com/yourusername" class="link">GitHub</a> |
      <a href="https://instagram.com/yourhandle" class="link">Instagram</a> |
      <a href="mailto:youremail@example.com" class="link">Email</a>
    </p>
  </header>

  <main class="p-8">
    <p class="mb-8 text-center">A short description about yourself goes here.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <section>
        <h2 class="text-2xl font-semibold">Recent Articles</h2>
        <ul class="list-disc list-inside mt-4">
          <li>Article 1 (placeholder)</li>
          <li>Article 2 (placeholder)</li>
        </ul>
        <a href="/blog" class="btn btn-link mt-4">View All Articles</a>
      </section>

      <section>
        <h2 class="text-2xl font-semibold">Recent Projects</h2>
        <ul class="list-disc list-inside mt-4">
          <li>Project 1 (placeholder)</li>
          <li>Project 2 (placeholder)</li>
        </ul>
        <a href="/projects" class="btn btn-link mt-4">View All Projects</a>
      </section>
    </div>

    <ContactForm />
  </main>
</div>
```

This layout consists of:
- A header with your name and social links.
- A description about yourself.
- A two-column section displaying recent articles and projects.
- A contact form (which we will create as a reusable component next).

## 2. (Optional) Adding Icons for Social Links

If you'd like to use icons instead of plain text for social links, you can search for "free social icons" in your favorite search engine. I used [IconFinder](https://www.iconfinder.com/) with the "Free" filter.

### Steps:
1. Download the icons in SVG format.
2. Store them in your project under `my-svelte-app/static/icons/`.
3. Modify the social links section in `+page.svelte` like this:

```svelte
<p class="mt-2 flex justify-center space-x-4">
  <a href="https://linkedin.com/in/yourprofile">
    <img src="/icons/linkedin.svg" alt="LinkedIn" class="w-6 h-6" />
  </a>
  <a href="https://github.com/yourusername">
    <img src="/icons/github.svg" alt="GitHub" class="w-6 h-6" />
  </a>
  <a href="https://instagram.com/yourhandle">
    <img src="/icons/instagram.svg" alt="Instagram" class="w-6 h-6" />
  </a>
  <a href="mailto:youremail@example.com">
    <img src="/icons/email.svg" alt="Email" class="w-6 h-6" />
  </a>
</p>
```

## 3. Creating the Contact Form Component

Since we will reuse the contact form in multiple places, we will create a Svelte component for it.

### Steps:
1. Create a new file:
   `my-svelte-app/src/lib/components/ContactForm.svelte`
2. Add the following code:

```svelte
<script>
  let name = "";
  let email = "";
  let message = "";
</script>

<form class="mt-8 space-y-4">
  <h2 class="text-2xl font-semibold">Contact Me</h2>
  <input bind:value={name} type="text" placeholder="Your Name" class="input input-bordered w-full" />
  <input bind:value={email} type="email" placeholder="Your Email" class="input input-bordered w-full" />
  <textarea bind:value={message} placeholder="Your Message" class="textarea textarea-bordered w-full"></textarea>
  <button class="btn btn-primary">Send</button>
</form>
```

### What’s Next?
- Right now, the form does not send messages yet.
- We will make it functional in a later step of this tutorial.

## 4. Creating the Navigation Bar

Now that the home page is structured, let’s add a navigation bar.

### Steps:
1. Create a `my-svelte-app/src/routes/+layout.svelte` file.
2. Implement your own navbar code inside it.

The navigation bar will help users easily navigate between the home, blog, and projects pages.

## Wrapping Up

Great job! You’ve successfully built the home page of your SvelteKit project.
In the next step, we will enhance the user experience by adding smooth transitions to all views.

[Continue to Step 4: Adding Progressive Loading Effects](#)
