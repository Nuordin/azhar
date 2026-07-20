<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';
	import { CalendarDays } from '@lucide/svelte';
	import BlogCard from '$lib/components/BlogCard.svelte';
	import ContactUs from '$lib/components/ContactUs.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { SITE_NAME } from '$lib/config';
	import { slugify, truncateForMeta } from '$lib/utils';

	let { data } = $props();

	let showContact = $state(false);

	const title = $derived(data.translation?.title ?? SITE_NAME);
	const description = $derived(truncateForMeta(data.translation?.excerpt ?? ''));
	const canonical = $derived(new URL(`/blogs/${encodeURIComponent(slugify(title))}-${data.blog.id}`, page.url.origin).href);
	const cover = $derived(data.media.find((m) => m.type === 'image') ?? null);
	const coverUrl = $derived(cover ? new URL(cover.url, page.url.origin).href : undefined);

	const formatDate = (date: Date | string | null) => {
		if (!date) return '';
		return new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(date));
	};

	const jsonLd = $derived([
		{
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: title,
			...(description ? { description } : {}),
			...(coverUrl ? { image: coverUrl } : {}),
			...(data.blog.publishedAt ? { datePublished: new Date(data.blog.publishedAt).toISOString() } : {}),
			dateModified: new Date(data.blog.updatedAt).toISOString(),
			author: { '@type': 'Organization', name: SITE_NAME },
			mainEntityOfPage: canonical
		},
		{
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'الرئيسية', item: new URL('/', page.url.origin).href },
				{ '@type': 'ListItem', position: 2, name: 'المدونة', item: new URL('/blogs', page.url.origin).href },
				{ '@type': 'ListItem', position: 3, name: title, item: canonical }
			]
		}
	]);
</script>

<Seo {title} {description} {canonical} ogImage={coverUrl} ogType="article" {jsonLd} />

<div dir="rtl" class="font-aljazeera min-h-screen px-4 md:px-16 lg:px-32 pt-10 pb-28">
	<article class="max-w-3xl mx-auto">
		{#if cover}
			<img
				src={cover.url}
				alt={title}
				class="w-full aspect-video object-cover rounded-3xl border border-stone-600/30 mb-8"
				decoding="async" />
		{/if}

		{#if data.blog.category}
			<span class="inline-block text-sm bg-secondary-200/70 px-3 py-1 rounded-full mb-4">
				{$_(`blogs.category.${data.blog.category}`)}
			</span>
		{/if}

		<h1 class="text-3xl md:text-5xl font-black text-secondary-600 mb-4">{title}</h1>

		{#if data.blog.publishedAt}
			<p class="flex gap-2 items-center text-sm text-secondary-500 mb-6">
				<CalendarDays strokeWidth={1.5} size={16} />
				{formatDate(data.blog.publishedAt)}
			</p>
		{/if}

		{#if data.translation?.excerpt}
			<p class="text-xl text-secondary-500 mb-8">{data.translation.excerpt}</p>
		{/if}

		<!-- محتوى المقال: HTML مُعقَّم على الخادم عبر renderMarkdown -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="prose prose-lg max-w-none text-secondary-700">{@html data.contentHtml}</div>
	</article>

	<div class="max-w-3xl mx-auto mt-12 flex justify-center">
		<button
			class="py-2 px-10 text-primary border border-primary font-bold rounded-xl"
			onclick={() => (showContact = true)}>
			تواصل معنا
		</button>
	</div>

	{#if data.related.length > 0}
		<section class="max-w-6xl mx-auto mt-20">
			<h2 class="text-3xl md:text-4xl font-bold text-secondary-600 mb-8">{$_('blogs.related')}</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
				{#each data.related as relatedBlog (relatedBlog.id)}
					<BlogCard blog={relatedBlog} />
				{/each}
			</div>
		</section>
	{/if}
</div>

<ContactUs bind:open={showContact} title={data.translation?.title} />
