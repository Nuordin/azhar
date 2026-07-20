<script lang="ts">
	import { _ } from 'svelte-i18n';
	import BlogCard, { type BlogCardData } from '$lib/components/BlogCard.svelte';

	let { blogs = [] }: { blogs?: BlogCardData[] } = $props();
</script>

{#if blogs.length > 0}
	<div class="px-4 md:px-10 lg:px-16 mt-16 w-full mx-auto">
		<h1 class="text-4xl md:text-5xl font-bold text-secondary-600 text-center lg:text-start w-full mb-4">
			{$_('new_blogs.title')}
		</h1>
		<p class="text-2xl max-w-2xl mx-auto lg:mx-0 mb-8 text-center lg:text-start">{$_('new_blogs.description')}</p>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
			{#each blogs as blog (blog.id)}
				<BlogCard {blog} />
			{/each}
		</div>
		<div class="flex justify-center mt-10">
			<a
				href="/blogs"
				class="px-6 py-2.5 rounded-full border border-secondary-300 text-secondary-600 font-bold hover:bg-secondary-100 transition-colors">
				{$_('blogs.view_all')}
			</a>
		</div>
	</div>
{/if}
