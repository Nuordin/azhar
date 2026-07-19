<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { X } from '@lucide/svelte';
	import Sheet from '$lib/components/Sheet.svelte';
	import Whatsapp from '$lib/components/Icons/Whatsapp.svelte';
	import { whatsappLink } from '$lib/config';

	type Props = {
		open: boolean;
		title?: string | null;
	};
	let { open = $bindable(false), title = '' }: Props = $props();

	function contact() {
		const name = title ? `«${title}»` : $_('contact.fallback_name');
		const message = $_('contact.message', { values: { name } });
		window.open(whatsappLink(message), '_blank', 'noopener,noreferrer');
		open = false;
	}
</script>

<Sheet bind:isOpen={open} class="h-auto max-h-[90vh] pb-6">
	<div dir="rtl" class="flex flex-col gap-5 p-6">
		<!-- الترويسة -->
		<div class="flex items-start justify-between">
			<div>
				<h2 class="text-xl font-black text-secondary-700">{$_('contact.title')}</h2>
				<p class="text-sm text-secondary-500 mt-1">{$_('contact.subtitle')}</p>
			</div>
			<button
				onclick={() => (open = false)}
				class="p-2 rounded-full text-secondary-500 hover:bg-secondary-200/60 transition-colors"
				aria-label={$_('contact.cancel')}>
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- زر المحادثة عبر واتساب -->
		<button
			onclick={contact}
			class="h-13 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-green-500 to-green-600 text-white font-black shadow-lg shadow-green-600/25 transition-all hover:from-green-600 hover:to-green-700">
			{$_('contact.whatsapp')}
			<Whatsapp size={20} />
		</button>

		<button
			onclick={() => (open = false)}
			class="mx-auto text-sm font-bold text-secondary-500 hover:text-secondary-700 transition-colors">
			{$_('contact.cancel')}
		</button>
	</div>
</Sheet>
