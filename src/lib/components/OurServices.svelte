<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { Handshake, KeyRound, TrendingUp, Building2 } from '@lucide/svelte';

	type Service = {
		id: string;
		key: string;
		icon: typeof Handshake;
	};

	const services: Service[] = [
		{ id: '01', key: 's1', icon: Handshake },
		{ id: '02', key: 's2', icon: KeyRound },
		{ id: '03', key: 's3', icon: TrendingUp },
		{ id: '04', key: 's4', icon: Building2 }
	];
</script>

<div class="px-4 md:px-16 lg:px-32 mt-24 w-full mx-auto" id="serveice">
	<h1 class="text-4xl md:text-5xl font-bold text-secondary-600 text-center lg:text-start w-full mb-4">
		{$_('our_services.title')}
	</h1>
	<p class="text-2xl max-w-2xl mx-auto lg:mx-0 mb-8 text-center lg:text-start">{$_('our_services.description')}</p>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
		{#each services as item (item.id)}
			{@render service(item)}
		{/each}
	</div>
</div>

{#snippet service(service: Service)}
	<div
		class="group w-full h-full flex flex-col border border-gray-700/20 shadow-md p-8 rounded-3xl transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-2 hover:border-primary/40">
		<div
			class="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary text-secondary-100 mb-6 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6">
			<service.icon size={32} strokeWidth={1.5} />
		</div>
		<h1 class="text-2xl font-bold mb-2">{$_(`our_services.items.${service.key}.title`)}</h1>
		<p class="text-secondary-700/80">
			{$_(`our_services.items.${service.key}.description`)}
		</p>
	</div>
{/snippet}
