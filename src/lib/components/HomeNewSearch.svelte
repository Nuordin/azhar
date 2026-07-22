<script lang="ts">
	import { Popover, ToggleGroup, RadioGroup, Combobox } from 'bits-ui';
	import { _ } from 'svelte-i18n';
	import { MapPin, ChevronDown, Search, Check } from '@lucide/svelte';
	import { getDirection } from '$lib/i18n/direction';

	const dir = getDirection();

	type Option = { value: string; label: string };

	// filter state
	let listingType = $state('sale');
	let status = $state('all');
	let location = $state('');
	let locationSearch = $state('');
	let priceMin = $state('');
	let priceMax = $state('');
	let category = $state<'residential' | 'commercial'>('residential');
	let propertyType = $state('');
	let rooms = $state('');
	let baths = $state('');

	// $derived so labels follow the active language without a reload.
	const listingOptions: Option[] = $derived([
		{ value: 'sale', label: $_('home_search.listing_sale') },
		{ value: 'rent', label: $_('home_search.listing_rent') }
	]);
	const statusOptions: Option[] = $derived([
		{ value: 'all', label: $_('home_search.status_all') },
		{ value: 'construction', label: $_('home_search.status_construction') },
		{ value: 'ready', label: $_('home_search.status_ready') }
	]);
	const residentialTypes: Option[] = $derived(
		['apartment', 'villa', 'townhouse', 'penthouse', 'compound_villa', 'hotel_apartment', 'land', 'floor', 'building'].map(
			(v) => ({ value: v, label: $_(`home_search.residential_types.${v}`) })
		)
	);
	const commercialTypes: Option[] = $derived(
		['office', 'shop', 'warehouse', 'commercial_building', 'commercial_land', 'factory'].map((v) => ({
			value: v,
			label: $_(`home_search.commercial_types.${v}`)
		}))
	);
	const roomOptions: Option[] = $derived([
		{ value: 'studio', label: $_('home_search.studio') },
		...['1', '2', '3', '4', '5+'].map((n) => ({ value: n, label: n }))
	]);
	const bathOptions: Option[] = ['1', '2', '3', '4+'].map((n) => ({ value: n, label: n }));
	// بيانات مواقع مبدئية (placeholder) — ستُستبدل بقيم قاعدة البيانات لاحقاً كما في صفحة المشاريع.
	const locations = [
		'دبي مارينا',
		'وسط مدينة دبي',
		'الخليج التجاري',
		'نخلة جميرا',
		'جميرا بيتش ريزيدنس',
		'البرشاء',
		'ديرة',
		'بر دبي',
		'دبي هيلز استيت',
		'قرية جميرا الدائرية',
		'المدينة الدولية',
		'الفرجان'
	];

	let currentTypes = $derived(category === 'residential' ? residentialTypes : commercialTypes);
	let selectedTypeLabel = $derived(currentTypes.find((t) => t.value === propertyType)?.label ?? '');
	let filteredLocations = $derived.by(() => {
		const q = locationSearch.trim();
		if (!q) return locations;
		return locations.filter((l) => l.includes(q));
	});

	const triggerClass =
		'group w-full flex items-center justify-between gap-2 bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-600 cursor-pointer ring-1 ring-transparent transition hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=open]:ring-2 data-[state=open]:ring-primary data-[state=open]:text-primary';
	const contentClass =
		'z-50 max-w-[85vw] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4';
</script>

<div class="w-full max-w-5xl mx-auto px-4 mt-8" role="search">
	<div class="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-7">
		<!-- Row 1: listing type · location -->
		<div class="flex flex-col md:flex-row gap-3 md:items-stretch mb-3">
			{@render segmented(listingOptions, listingType, (v) => (listingType = v))}

			<Combobox.Root
				type="single"
				bind:value={location}
				onOpenChange={(o) => {
					if (o) locationSearch = '';
				}}>
				<div
					class="group relative flex-1 bg-gray-100 rounded-xl ring-1 ring-transparent transition focus-within:ring-2 focus-within:ring-primary">
					<MapPin
						size={18}
						class="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary" />
					<Combobox.Input
						placeholder={$_('home_search.location_placeholder')}
						oninput={(e) => (locationSearch = e.currentTarget.value)}
						class="w-full bg-transparent outline-none border-none focus:ring-0 rounded-xl ps-4 pe-10 py-3 text-sm text-gray-700 placeholder:text-gray-400 text-start" />
				</div>
				<Combobox.Portal>
					<Combobox.Content dir={$dir}
						sideOffset={8}
						class="z-50 w-[var(--bits-floating-anchor-width)] max-h-64 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-2">
						<Combobox.Viewport>
							{#each filteredLocations as loc (loc)}
								<Combobox.Item
									value={loc}
									label={loc}
									class="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer text-gray-600 transition data-[highlighted]:bg-primary-100/50 data-[selected]:text-primary data-[selected]:font-bold">
									{#snippet children({ selected })}
										<span class="truncate">{loc}</span>
										{#if selected}
											<Check size={16} class="text-primary shrink-0" />
										{/if}
									{/snippet}
								</Combobox.Item>
							{:else}
								<div class="px-3 py-4 text-sm text-gray-400 text-center">{$_('home_search.no_results')}</div>
							{/each}
						</Combobox.Viewport>
					</Combobox.Content>
				</Combobox.Portal>
			</Combobox.Root>
		</div>

		<!-- Row 2: status · type · rooms · price (2×2 grid on mobile, row on md+) -->
		<div class="grid grid-cols-2 md:flex md:flex-row gap-3 md:items-stretch">
			{@render segmented(statusOptions, status, (v) => (status = v))}

			<!-- property type dropdown -->
			<Popover.Root>
				<div class="relative flex-1">
					<Popover.Trigger class={triggerClass}>
						<span class="truncate">{selectedTypeLabel || $_('home_search.property_type_default')}</span>
						<ChevronDown
							size={18}
							class="text-gray-400 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
					</Popover.Trigger>
				</div>
				<Popover.Portal>
					<Popover.Content dir={$dir} side="bottom" align="start" sideOffset={8} class="{contentClass} w-[22rem]">
						<div class="flex border-b border-gray-200 mb-4">
							{@render tab('residential', $_('home_search.tab_residential'))}
							{@render tab('commercial', $_('home_search.tab_commercial'))}
						</div>
						<RadioGroup.Root dir={$dir} bind:value={propertyType} class="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto ps-1">
							{#each currentTypes as t (t.value)}
								<RadioGroup.Item
									value={t.value}
									class="flex items-center justify-between gap-2 px-4 py-2.5 rounded-full border text-sm w-full cursor-pointer transition border-gray-200 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary-100/60 data-[state=checked]:text-primary">
									{#snippet children({ checked })}
										<span class="text-gray-600 truncate">{t.label}</span>
										<span
											class="size-4 rounded-full border flex items-center justify-center shrink-0 {checked
												? 'border-primary'
												: 'border-gray-300'}">
											{#if checked}
												<span class="size-2 rounded-full bg-primary"></span>
											{/if}
										</span>
									{/snippet}
								</RadioGroup.Item>
							{/each}
						</RadioGroup.Root>
						{@render panelFooter(() => (propertyType = ''))}
					</Popover.Content>
				</Popover.Portal>
			</Popover.Root>

			<!-- rooms & baths dropdown -->
			<Popover.Root>
				<div class="relative flex-1">
					<Popover.Trigger class={triggerClass}>
						<span class="truncate">{$_('home_search.rooms_baths_trigger')}</span>
						<ChevronDown
							size={18}
							class="text-gray-400 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
					</Popover.Trigger>
				</div>
				<Popover.Portal>
					<Popover.Content dir={$dir} side="bottom" align="start" sideOffset={8} class="{contentClass} w-80">
						<p class="text-sm font-bold mb-2 text-gray-700">{$_('home_search.rooms_label')}</p>
						<RadioGroup.Root dir={$dir} bind:value={rooms} class="flex flex-wrap gap-2">
							{#each roomOptions as r (r.value)}
								{@render chip(r)}
							{/each}
						</RadioGroup.Root>
						<p class="text-sm font-bold mt-4 mb-2 text-gray-700">{$_('home_search.baths_label')}</p>
						<RadioGroup.Root dir={$dir} bind:value={baths} class="flex flex-wrap gap-2">
							{#each bathOptions as b (b.value)}
								{@render chip(b)}
							{/each}
						</RadioGroup.Root>
						{@render panelFooter(() => {
							rooms = '';
							baths = '';
						})}
					</Popover.Content>
				</Popover.Portal>
			</Popover.Root>

			<!-- price dropdown -->
			<Popover.Root>
				<div class="relative flex-1">
					<Popover.Trigger class={triggerClass}>
						<span class="truncate">{$_('home_search.price_trigger')}</span>
						<ChevronDown
							size={18}
							class="text-gray-400 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
					</Popover.Trigger>
				</div>
				<Popover.Portal>
					<Popover.Content dir={$dir} side="bottom" align="start" sideOffset={8} class="{contentClass} w-80">
						<div class="grid grid-cols-2 gap-3">
							<div>
								<label class="text-xs text-gray-400 mb-1 block text-start" for="price-min"
									>{$_('home_search.price_min_label')}</label>
								<input
									id="price-min"
									type="number"
									bind:value={priceMin}
									placeholder={$_('home_search.price_min_placeholder')}
									class="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none text-start placeholder:text-gray-400 ring-1 ring-transparent transition focus:ring-2 focus:ring-primary" />
							</div>
							<div>
								<label class="text-xs text-gray-400 mb-1 block text-start" for="price-max"
									>{$_('home_search.price_max_label')}</label>
								<input
									id="price-max"
									type="number"
									bind:value={priceMax}
									placeholder={$_('home_search.price_max_placeholder')}
									class="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none text-start placeholder:text-gray-400 ring-1 ring-transparent transition focus:ring-2 focus:ring-primary" />
							</div>
						</div>
						{@render panelFooter(() => {
							priceMin = '';
							priceMax = '';
						})}
					</Popover.Content>
				</Popover.Portal>
			</Popover.Root>

			<!-- Submit: full-width bottom row on mobile, left of the filters on md+ -->
			<button
				type="button"
				class="col-span-2 w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary-400 text-white font-bold text-sm transition cursor-pointer shadow-sm shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
				<Search size={18} />
				{$_('home_search.search')}
			</button>
		</div>
	</div>
</div>

{#snippet segmented(options: Option[], current: string, onSelect: (v: string) => void)}
	<ToggleGroup.Root
		dir={$dir}
		type="single"
		value={current}
		onValueChange={(v) => v && onSelect(v as string)}
		class="flex bg-gray-100 rounded-xl p-1 gap-1 shrink-0 min-w-0 overflow-x-auto">
		{#each options as opt (opt.value)}
			<ToggleGroup.Item
				value={opt.value}
				class="px-4 py-2 rounded-lg text-sm whitespace-nowrap transition cursor-pointer text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=on]:bg-primary-100 data-[state=on]:text-primary data-[state=on]:font-bold">
				{opt.label}
			</ToggleGroup.Item>
		{/each}
	</ToggleGroup.Root>
{/snippet}

{#snippet tab(value: 'residential' | 'commercial', label: string)}
	<button
		type="button"
		onclick={() => (category = value)}
		class="flex-1 pb-2 text-sm cursor-pointer transition focus-visible:outline-none hover:text-primary/70 {category ===
		value
			? 'text-primary font-bold border-b-2 border-primary'
			: 'text-gray-400'}">
		{label}
	</button>
{/snippet}

{#snippet chip(option: Option)}
	<RadioGroup.Item
		value={option.value}
		class="px-4 py-2 rounded-full border text-sm cursor-pointer transition border-gray-200 text-gray-600 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary-100/60 data-[state=checked]:text-primary data-[state=checked]:font-bold">
		{option.label}
	</RadioGroup.Item>
{/snippet}

{#snippet panelFooter(onReset: () => void)}
	<div class="flex gap-3 mt-4">
		<button
			type="button"
			onclick={onReset}
			class="flex-1 py-2.5 rounded-xl border border-primary text-primary font-bold text-sm cursor-pointer transition hover:bg-primary-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
			{$_('home_search.reset')}
		</button>
		<Popover.Close
			class="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-400 text-white font-bold text-sm cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
			{$_('home_search.done')}
		</Popover.Close>
	</div>
{/snippet}
