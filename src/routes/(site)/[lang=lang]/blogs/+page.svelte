<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { DEFAULT_LOCALE, sectionListPath } from '$lib/i18n/config';

	let { data } = $props();

	const lang = $derived(page.params.lang ?? DEFAULT_LOCALE);
	const canonical = $derived(new URL(sectionListPath(lang, 'blogs'), page.url.origin).href);
	const alternates = $derived([
		...page.data.availableLanguages.map((l: { code: string }) => ({
			hreflang: l.code,
			href: new URL(sectionListPath(l.code, 'blogs'), page.url.origin).href
		})),
		{ hreflang: 'x-default', href: new URL(sectionListPath(DEFAULT_LOCALE, 'blogs'), page.url.origin).href }
	]);

	function categoryHref(category: string | null) {
		const base = sectionListPath(lang, 'blogs');
		return category ? `${base}?category=${category}` : base;
	}
</script>

<Seo
	title={$_('blogs_page.seo_title')}
	description={$_('blogs_page.seo_description')}
	{canonical}
	{alternates}
	ogLocale={`${lang}_OM`} />

<div class="font-aljazeera min-h-screen px-4 md:px-16 lg:px-32 pt-10 pb-28">
	<!-- الترويسة -->
	<header class="max-w-3xl mx-auto text-center mb-10">
		<h1 class="text-4xl md:text-5xl font-black text-secondary-600 mb-3">{$_('blogs.title')}</h1>
		<p class="text-lg text-secondary-500">{$_('blogs.description')}</p>
	</header>

	<!-- تصفية حسب التصنيف -->
	<nav class="flex flex-wrap justify-center gap-2 mb-10" aria-label={$_('blogs_page.categories_aria')}>
		<a
			href={categoryHref(null)}
			class="px-4 py-1.5 rounded-full border text-sm transition-colors {!data.category
				? 'bg-secondary-600 text-white border-secondary-600'
				: 'border-secondary-300 text-secondary-600 hover:bg-secondary-100'}">
			{$_('blogs.all')}
		</a>
		{#each data.categories as category (category)}
			<a
				href={categoryHref(category)}
				class="px-4 py-1.5 rounded-full border text-sm transition-colors {data.category === category
					? 'bg-secondary-600 text-white border-secondary-600'
					: 'border-secondary-300 text-secondary-600 hover:bg-secondary-100'}">
				{$_(`blogs.category.${category}`)}
			</a>
		{/each}
	</nav>

	{#if data.blogs.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
			{#each data.blogs as blog (blog.id)}
				<BlogCard {blog} />
			{/each}
		</div>

		{#if data.pagination.totalPages > 1}
			<nav class="flex justify-center items-center gap-4 mt-12" aria-label={$_('blogs_page.pagination_aria')}>
				{#if data.pagination.currentPage > 1}
					<a
						href="{sectionListPath(lang, 'blogs')}?page={data.pagination.currentPage - 1}{data.category ? `&category=${data.category}` : ''}"
						class="px-4 py-2 rounded-lg border border-secondary-300 text-secondary-600 hover:bg-secondary-100">
						{$_('blogs_page.previous')}
					</a>
				{/if}
				<span class="text-sm text-secondary-500">
					{$_('blogs_page.page_of', { values: { current: data.pagination.currentPage, total: data.pagination.totalPages } })}
				</span>
				{#if data.pagination.currentPage < data.pagination.totalPages}
					<a
						href="{sectionListPath(lang, 'blogs')}?page={data.pagination.currentPage + 1}{data.category ? `&category=${data.category}` : ''}"
						class="px-4 py-2 rounded-lg border border-secondary-300 text-secondary-600 hover:bg-secondary-100">
						{$_('blogs_page.next')}
					</a>
				{/if}
			</nav>
		{/if}
	{:else}
		<p class="text-center text-lg text-secondary-500 py-20">{$_('blogs.empty')}</p>
	{/if}
</div>
