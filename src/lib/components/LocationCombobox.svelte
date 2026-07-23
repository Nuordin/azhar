<script lang="ts">
	import { Combobox } from 'bits-ui';
	import { Check, ChevronsUpDown, MapPin } from '@lucide/svelte';
	import { getDirection } from '$lib/i18n/direction';

	type LocationOption = { id: number; name: string | null; type?: string | null };

	let {
		locations = [],
		value = $bindable(''),
		placeholder = 'اختر الموقع',
		noneLabel = '',
		showType = false,
		excludeId = null
	}: {
		locations?: LocationOption[];
		value?: string;
		placeholder?: string;
		/** إن مُرِّر، يُضاف خيار "بدون" بالقيمة none في الأعلى */
		noneLabel?: string;
		/** إلحاق نوع الموقع باللافتة (محافظة/ولاية/...) */
		showType?: boolean;
		/** استبعاد موقع من القائمة (منع التبعية الذاتية) */
		excludeId?: number | null;
	} = $props();

	const dir = getDirection();
	let search = $state('');

	const typeLabels: Record<string, string> = {
		governorate: 'محافظة',
		wilayat: 'ولاية',
		city: 'مدينة',
		district: 'حي / منطقة'
	};

	let items = $derived(
		locations
			.filter((l) => l.id !== excludeId)
			.map((l) => ({
				value: String(l.id),
				label: (l.name ?? '') + (showType && l.type ? ` — ${typeLabels[l.type] ?? l.type}` : '')
			}))
	);

	let filtered = $derived.by(() => {
		const q = search.trim();
		if (!q) return items;
		return items.filter((i) => i.label.includes(q));
	});

	// لافتة الاختيار الحالي الفعلي (فارغة إن لم يُختَر شيء صالح)
	let selectedLabel = $derived(
		noneLabel && value === 'none' ? noneLabel : (items.find((i) => i.value === value)?.label ?? '')
	);

	// عند الإغلاق نُعيد بناء الحقل ليعرض الاختيار الفعلي فقط؛ أي نص مُدخل بلا اختيار صالح يُمحى
	let remountKey = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);
</script>

{#key remountKey}
	<Combobox.Root
		type="single"
		bind:value
		onOpenChange={(o) => {
			search = '';
			if (o) {
				// الفتح: امسح الحقل ليبدأ المستخدم بحثاً جديداً مباشرة
				if (inputEl) inputEl.value = '';
			} else {
				// الإغلاق: أعِد بناء الحقل على أساس الاختيار الفعلي (يمحو النص غير المطابق)
				remountKey++;
			}
		}}>
		<div
			class="group relative w-full rounded-md border border-input bg-transparent ring-offset-background transition focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
			<MapPin size={16} class="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
			<Combobox.Input
				bind:ref={inputEl}
				defaultValue={selectedLabel}
				{placeholder}
				oninput={(e) => (search = e.currentTarget.value)}
				class="h-10 w-full bg-transparent px-3 pe-9 text-sm text-right outline-none placeholder:text-muted-foreground" />
			<Combobox.Trigger
				class="pointer-events-none absolute start-2 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50">
				<ChevronsUpDown size={16} />
			</Combobox.Trigger>
		</div>

		<Combobox.Portal>
			<Combobox.Content
				dir={$dir}
				sideOffset={6}
				class="dark z-50 w-[var(--bits-floating-anchor-width)] max-h-64 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
				<Combobox.Viewport>
					{#if noneLabel}
						<Combobox.Item
							value="none"
							label={noneLabel}
							class="flex items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm cursor-pointer text-muted-foreground outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-selected:font-semibold">
							{#snippet children({ selected })}
								<span class="truncate">{noneLabel}</span>
								{#if selected}
									<Check size={16} class="shrink-0" />
								{/if}
							{/snippet}
						</Combobox.Item>
					{/if}
					{#each filtered as opt (opt.value)}
						<Combobox.Item
							value={opt.value}
							label={opt.label}
							class="flex items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm cursor-pointer outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-selected:font-semibold">
							{#snippet children({ selected })}
								<span class="truncate">{opt.label}</span>
								{#if selected}
									<Check size={16} class="shrink-0" />
								{/if}
							{/snippet}
						</Combobox.Item>
					{:else}
						<div class="px-3 py-4 text-sm text-muted-foreground text-center">لا توجد نتائج</div>
					{/each}
				</Combobox.Viewport>
			</Combobox.Content>
		</Combobox.Portal>
	</Combobox.Root>
{/key}
