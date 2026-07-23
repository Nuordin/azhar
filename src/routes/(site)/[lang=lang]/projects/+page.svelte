<script lang="ts">
	import { Select } from 'bits-ui';
	import { _ } from 'svelte-i18n';
	import { Search, ChevronDown, Check, X, SlidersHorizontal } from '@lucide/svelte';
	import { fly, fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { DEFAULT_LOCALE, sectionListPath } from '$lib/i18n/config';
	import { getDirection } from '$lib/i18n/direction';

	const dir = getDirection();

	let { data } = $props();

	const lang = $derived(page.params.lang ?? DEFAULT_LOCALE);
	const canonical = $derived(new URL(sectionListPath(lang, 'projects'), page.url.origin).href);
	const alternates = $derived([
		...page.data.availableLanguages.map((l: { code: string }) => ({
			hreflang: l.code,
			href: new URL(sectionListPath(l.code, 'projects'), page.url.origin).href
		})),
		{ hreflang: 'x-default', href: new URL(sectionListPath(DEFAULT_LOCALE, 'projects'), page.url.origin).href }
	]);

	// خيارات المواقع مبنية من قيم قاعدة البيانات (القيمة = معرّف الموقع)
	const cityOptions = $derived([
		{ value: 'all', label: $_('filters.city_all') },
		...data.cities.map((c) => ({ value: String(c.id), label: c.name }))
	]);
	const statusOptions = $derived([
		{ value: 'all', label: $_('filters.status_all') },
		{ value: 'off_plan', label: $_('enums.construction.off_plan') },
		{ value: 'under_construction', label: $_('enums.construction.under_construction') },
		{ value: 'ready', label: $_('enums.construction.ready') }
	]);
	const priceOptions = $derived([
		{ value: 'all', label: $_('filters.price_all') },
		{ value: '0-40000', label: $_('filters.price_lt_40') },
		{ value: '40000-80000', label: $_('filters.price_40_80') },
		{ value: '80000-120000', label: $_('filters.price_80_120') },
		{ value: '120000-', label: $_('filters.price_gt_120') }
	]);
	const sortOptions = $derived([
		{ value: 'all', label: $_('filters.sort_newest') },
		{ value: 'price_asc', label: $_('filters.sort_price_asc') },
		{ value: 'price_desc', label: $_('filters.sort_price_desc') },
		{ value: 'delivery', label: $_('filters.sort_delivery') }
	]);

	let showFilters = $state(false);

	let f = $derived(data.filters);
	let activeCount = $derived([f.city, f.status, f.price].filter((v) => v && v !== 'all').length);

	function setParam(key: string, value: string) {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		if (!value || value === 'all') params.delete(key);
		else params.set(key, value);
		params.delete('page');
		goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	}

	function resetFilters() {
		goto('?', { keepFocus: true, noScroll: true });
	}
</script>

<Seo
	title={$_('projects_page.seo_title')}
	description={$_('projects_page.seo_description')}
	{canonical}
	{alternates}
	ogLocale={`${lang}_OM`} />

<div class="font-aljazeera min-h-screen px-4 md:px-16 lg:px-32 pt-10 pb-28">
	<!-- الترويسة -->
	<header class="max-w-3xl mx-auto text-center mb-10">
		<h1 class="text-4xl md:text-5xl font-black text-secondary-600 mb-3">{$_('projects_page.heading')}</h1>
		<p class="text-lg text-secondary-500">
			{$_('projects_page.intro')}
		</p>
	</header>

	<!-- زر الفلاتر العائم أسفل الشاشة -->
	<button
		onclick={() => (showFilters = true)}
		class="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-primary text-white font-black shadow-lg shadow-primary/30 hover:bg-primary-400 hover:shadow-xl transition-all">
		<SlidersHorizontal class="w-5 h-5" />
		{$_('projects_page.filter_button')}
		{#if activeCount > 0}
			<span
				class="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-white text-primary text-[11px]">
				{activeCount}
			</span>
		{/if}
	</button>

	<!-- لوحة الفلاتر الجانبية -->
	{#if showFilters}
		<button
			transition:fade={{ duration: 200 }}
			onclick={() => (showFilters = false)}
			class="fixed inset-0 z-40 bg-secondary-700/40 backdrop-blur-sm"
			aria-label={$_('common.close_filters')}></button>

		<aside
			transition:fly={{ x: 420, duration: 300 }}
			class="fixed inset-y-0 inset-s-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl font-aljazeera">
			<div class="flex items-center justify-between p-4 border-b border-secondary-600/10">
				<h2 class="text-lg font-black text-secondary-700 inline-flex items-center gap-2">
					<SlidersHorizontal class="w-5 h-5 text-primary" />
					{$_('projects_page.filter_title')}
				</h2>
				<button
					onclick={() => (showFilters = false)}
					class="p-2 rounded-lg text-secondary-500 hover:bg-secondary-100 transition-colors"
					aria-label={$_('common.close')}>
					<X class="w-5 h-5" />
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-4 space-y-4">
				{@render field($_('filters.cities'), cityOptions, f.city, (v) => setParam('city', v))}
				{@render field($_('filters.status'), statusOptions, f.status, (v) => setParam('status', v))}
				{@render field($_('filters.price'), priceOptions, f.price, (v) => setParam('price', v))}
				{@render field($_('filters.sort'), sortOptions, f.sort, (v) => setParam('sort', v))}
			</div>

			<div class="p-4 border-t border-secondary-600/10 flex items-center gap-3">
				<button
					onclick={resetFilters}
					class="flex-1 h-11 rounded-xl border border-secondary-600/20 font-bold text-secondary-600 hover:bg-secondary-100 transition-colors">
					{$_('common.clear_all')}
				</button>
				<button
					onclick={() => (showFilters = false)}
					class="flex-[2] h-11 rounded-xl bg-primary text-white font-black hover:bg-primary-400 transition-colors">
					{$_('common.results_count', { values: { count: data.pagination.totalCount } })}
				</button>
			</div>
		</aside>
	{/if}

	<!-- شبكة المشاريع -->
	{#if data.projects.length > 0}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
			{#each data.projects as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>
	{:else}
		<div class="max-w-md mx-auto text-center py-20">
			<div class="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-200/60 flex items-center justify-center">
				<Search class="w-7 h-7 text-secondary-500" />
			</div>
			<h3 class="text-xl font-bold text-secondary-600 mb-2">{$_('projects_page.empty_title')}</h3>
			<p class="text-secondary-500 mb-4">{$_('projects_page.empty_hint')}</p>
			<button
				onclick={resetFilters}
				class="inline-flex items-center gap-1 px-5 py-2 rounded-xl bg-primary text-secondary-100 font-bold hover:bg-primary-400 transition-colors">
				{$_('projects_page.show_all')}
			</button>
		</div>
	{/if}
</div>

<!-- حقل فلتر مع عنوان داخل اللوحة الجانبية -->
{#snippet field(
	label: string,
	options: { value: string; label: string }[],
	value: string,
	onSelect: (v: string) => void
)}
	<div class="space-y-1.5">
		<span class="block text-sm font-bold text-secondary-600">{label}</span>
		{@render filterSelect(options, value, onSelect)}
	</div>
{/snippet}

<!-- فلتر منسدل باستخدام bits-ui -->
{#snippet filterSelect(options: { value: string; label: string }[], value: string, onSelect: (v: string) => void)}
	{@const current = options.find((o) => o.value === value) ?? options[0]}
	<Select.Root type="single" {value} allowDeselect={false} onValueChange={(v) => onSelect(v || 'all')}>
		<Select.Trigger
			class="flex h-11 w-full items-center justify-between rounded-xl border border-secondary-600/20 bg-secondary-100/60 px-4 text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-primary/40">
			<span class="truncate {value !== 'all' ? 'font-bold text-secondary-700' : 'text-secondary-400'}"
				>{current.label}</span>
			<ChevronDown class="w-4 h-4 text-secondary-400 shrink-0" />
		</Select.Trigger>
		<Select.Portal>
			<Select.Content
				dir={$dir}
				sideOffset={6}
				class="z-[60] max-h-64 w-[var(--bits-select-anchor-width)] overflow-y-auto rounded-xl border border-secondary-600/15 bg-white p-1 shadow-xl">
				<Select.Viewport>
					{#each options as option (option.value)}
						<Select.Item
							value={option.value}
							label={option.label}
							class="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-secondary-700 outline-none data-[highlighted]:bg-secondary-100 data-[selected]:bg-secondary-100/70 data-[selected]:font-bold">
							{#snippet children({ selected })}
								<span>{option.label}</span>
								{#if selected}
									<Check class="w-4 h-4 text-primary" />
								{/if}
							{/snippet}
						</Select.Item>
					{/each}
				</Select.Viewport>
			</Select.Content>
		</Select.Portal>
	</Select.Root>
{/snippet}
