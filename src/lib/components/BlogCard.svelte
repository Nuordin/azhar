<script lang="ts" module>
	export type BlogCardData = {
		id: number;
		title: string | null;
		excerpt: string | null;
		category: string | null;
		publishedAt: Date | string | null;
		image: string | null;
	};
</script>

<script lang="ts">
	import { CalendarDays, ChevronLeft, ImageOff } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';
	import { slugify } from '$lib/utils';
	import { localizedPath, DEFAULT_LOCALE } from '$lib/i18n/config';

	let { blog }: { blog: BlogCardData } = $props();

	const formatDate = (date: Date | string | null) => {
		if (!date) return '';
		const locale = page.params.lang ?? DEFAULT_LOCALE;
		return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date));
	};

	const href = $derived(localizedPath(page.params.lang ?? DEFAULT_LOCALE, 'blogs', slugify(blog.title ?? ''), blog.id));
</script>

<a
	{href}
	class="w-full max-w-sm border border-gray-700/20 shadow-md p-4 rounded-3xl flex flex-col hover:shadow-lg transition-shadow">
	<div
		class="relative w-full aspect-3/2 rounded-3xl border-stone-600/30 border overflow-hidden flex items-center justify-center">
		{#if blog.image}
			<img src={blog.image} alt={blog.title} class="size-full object-cover" loading="lazy" decoding="async" />
		{:else}
			<div class="flex flex-col items-center justify-center gap-2 text-secondary-400">
				<ImageOff class="w-8 h-8" />
				<span class="text-sm font-bold">{$_('common.no_image')}</span>
			</div>
		{/if}
		{#if blog.category}
			<span class="absolute top-2 right-2 text-sm bg-secondary-200/70 px-2 py-px rounded-full"
				>{$_(`blogs.category.${blog.category}`)}</span>
		{/if}
	</div>
	<div class="mt-4 text-secondary-700/70">
		<h2 class="text-2xl font-bold">{blog.title}</h2>
		<p class="flex gap-2 text-sm items-center">
			<CalendarDays strokeWidth={1.5} size={16} />{formatDate(blog.publishedAt)}
		</p>
	</div>
	<p class="pt-2 text-sm text-secondary-700/70 line-clamp-3">{blog.excerpt}</p>
	<div class="flex gap-2 font-bold mt-auto pt-8 justify-end items-center">
		<div class="flex flex-row gap-2 items-center justify-end text-secondary-500">
			<span class="text-xl font-bold">{$_('blogs.read_more')}</span>
			<ChevronLeft strokeWidth={2} />
		</div>
	</div>
</a>
