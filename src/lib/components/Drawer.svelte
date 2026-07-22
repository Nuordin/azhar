<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';
	import logo from '$lib/assets/OneWayLogo.svg';
	import { DEFAULT_LOCALE } from '$lib/i18n/config';
	import { getDirection } from '$lib/i18n/direction';
	// Define props using Svelte 5 runes
	// $bindable() allows the parent to open/close this drawer dynamically
	let { open = $bindable(false) } = $props();

	const lang = $derived(page.params.lang ?? DEFAULT_LOCALE);

	const dir = getDirection();
	// روابط التنقّل (مع بادئة اللغة)
	const navLinks = $derived([
		{ name: $_('header.home'), href: `/${lang}` },
		{ name: $_('header.projects'), href: `/${lang}/projects` },
		{ name: $_('header.units'), href: `/${lang}/units` },
		{ name: $_('header.blog'), href: `/${lang}/blogs` },
		{ name: $_('header.services'), href: `/${lang}#serveice` },
		{ name: $_('header.about'), href: `/${lang}#about` },
		{ name: $_('header.contact'), href: `/${lang}#contact` }
	]);
</script>

{#if open}
	<button
		transition:fade={{ duration: 200 }}
		onclick={() => (open = false)}
		class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
		aria-label={$_('common.close')}>
	</button>

	<div
		transition:fly={{ x: $dir === 'rtl' ? 300 : -300, duration: 300 }}
		class="fixed inset-y-0 inset-s-0 z-50 w-full max-w-3xs bg-secondary-100/50 p-6 text-slate-100 shadow-2xl flex flex-col justify-between">
		<div>
			<nav class="mt-8 space-y-2 font-bold">
				<div class="flex items-center justify-start px-4 mb-8">
					<img class="size-20" src={logo} alt={$_('common.logo_alt')} />
				</div>
				{#each navLinks as link (link.href)}
					<a
						href={link.href}
						onclick={() => (open = false)}
						class="flex items-center px-4 py-3 text-lg rounded-xl text-secondary-700 hover:bg-slate-800 hover:text-white transition-all duration-200">
						{link.name}
					</a>
				{/each}
			</nav>
		</div>
	</div>
{/if}
