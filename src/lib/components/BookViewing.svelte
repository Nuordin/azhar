<script lang="ts">
	import { Select } from 'bits-ui';
	import { _ } from 'svelte-i18n';
	import { CalendarDays, ChevronDown, Check, X } from '@lucide/svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import Whatsapp from '$lib/components/Icons/Whatsapp.svelte';
	import { whatsappLink } from '$lib/config';

	type Props = {
		open: boolean;
		title?: string | null;
	};
	let { open = $bindable(false), title = '' }: Props = $props();

	const today = new Date().toISOString().split('T')[0];

	let date = $state('');
	let hour = $state('');
	let minute = $state('');
	let period = $state('');

	// الساعات والدقائق أرقام، لا تحتاج ترجمة
	const hourOptions = Array.from({ length: 12 }, (_ignored, i) => {
		const h = String(i + 1);
		return { value: h, label: h };
	});
	const minuteOptions = Array.from({ length: 12 }, (_ignored, i) => {
		const m = String(i * 5).padStart(2, '0');
		return { value: m, label: m };
	});
	// خيارات ص/م قابلة للترجمة
	const periodOptions = $derived([
		{ value: 'am', label: $_('booking.am') },
		{ value: 'pm', label: $_('booking.pm') }
	]);

	let canSend = $derived(!!date && !!hour && !!minute && !!period);

	function reset() {
		date = '';
		hour = '';
		minute = '';
		period = '';
	}

	function cancel() {
		open = false;
		reset();
	}

	function send() {
		if (!canSend) return;
		const periodLabel = period === 'am' ? $_('booking.am_full') : $_('booking.pm_full');
		const dateLabel = new Date(date).toLocaleDateString('ar-OM', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
		const name = title ? `«${title}»` : $_('booking.fallback_name');
		const message = $_('booking.message', {
			values: { name, date: dateLabel, time: `${hour}:${minute} ${periodLabel}` }
		});
		window.open(whatsappLink(message), '_blank', 'noopener,noreferrer');
		open = false;
		reset();
	}
</script>

<Sheet bind:isOpen={open} class="h-auto max-h-[90vh] pb-6">
	<div dir="rtl" class="flex flex-col gap-5 p-6">
		<!-- الترويسة -->
		<div class="flex items-start justify-between">
			<div>
				<h2 class="text-xl font-black text-secondary-700">{$_('booking.title')}</h2>
				<p class="text-sm text-secondary-500 mt-1">{$_('booking.subtitle')}</p>
			</div>
			<button
				onclick={cancel}
				class="p-2 rounded-full text-secondary-500 hover:bg-secondary-200/60 transition-colors"
				aria-label={$_('booking.cancel')}>
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- اختيار التاريخ -->
		<div class="space-y-1.5">
			<span class="block text-sm font-bold text-secondary-600">{$_('booking.date_label')}</span>
			<div class="relative">
				<CalendarDays
					class="w-5 h-5 text-secondary-400 absolute top-1/2 -translate-y-1/2 start-4 pointer-events-none" />
				<input
					type="date"
					min={today}
					bind:value={date}
					class="h-12 w-full rounded-xl border border-secondary-600/20 bg-secondary-100/60 ps-12 pe-4 text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary/40" />
			</div>
		</div>

		<!-- اختيار الوقت -->
		<div class="space-y-1.5">
			<span class="block text-sm font-bold text-secondary-600">{$_('booking.time_label')}</span>
			<div class="grid grid-cols-3 gap-3">
				{@render timeSelect(hourOptions, hour, $_('booking.hour'), (v) => (hour = v))}
				{@render timeSelect(minuteOptions, minute, $_('booking.minute'), (v) => (minute = v))}
				{@render timeSelect(periodOptions, period, $_('booking.period'), (v) => (period = v))}
			</div>
		</div>

		<!-- زر الإرسال عبر واتساب -->
		<button
			onclick={send}
			disabled={!canSend}
			class="mt-1 h-13 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-green-500 to-green-600 text-white font-black shadow-lg shadow-green-600/25 transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
			{$_('booking.submit')}
			<Whatsapp size={20} />
		</button>

		<button
			onclick={cancel}
			class="mx-auto text-sm font-bold text-secondary-500 hover:text-secondary-700 transition-colors">
			{$_('booking.cancel')}
		</button>
	</div>
</Sheet>

{#snippet timeSelect(
	options: { value: string; label: string }[],
	value: string,
	placeholder: string,
	onSelect: (v: string) => void
)}
	{@const current = options.find((o) => o.value === value)}
	<Select.Root type="single" {value} onValueChange={(v) => onSelect(v ?? '')}>
		<Select.Trigger
			class="flex h-12 w-full items-center justify-between rounded-xl border border-secondary-600/20 bg-secondary-100/60 px-3 text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary/40 data-[state=open]:ring-2 data-[state=open]:ring-primary/40">
			<ChevronDown class="w-4 h-4 text-secondary-400 shrink-0" />
			<span class="truncate font-inter {value ? 'font-bold text-secondary-700' : 'text-secondary-400'}">
				{current ? current.label : placeholder}
			</span>
		</Select.Trigger>
		<Select.Portal>
			<Select.Content
				sideOffset={6}
				class="z-[70] max-h-56 w-[var(--bits-select-anchor-width)] overflow-y-auto rounded-xl border border-secondary-600/15 bg-white p-1 shadow-xl">
				<Select.Viewport>
					{#each options as option (option.value)}
						<Select.Item
							value={option.value}
							label={option.label}
							class="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-secondary-700 outline-none data-[highlighted]:bg-secondary-100 data-[selected]:bg-secondary-100/70 data-[selected]:font-bold">
							{#snippet children({ selected })}
								<span class="font-inter">{option.label}</span>
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
