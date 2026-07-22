<script lang="ts">
	import '../../layout.css';
	import logo from '$lib/assets/OneWayLogo.svg';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { toStore } from 'svelte/store';
	import Translate from '$lib/components/Icons/Translate.svelte';
	import { Menu } from '@lucide/svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { DEFAULT_LOCALE, switchLocalePath } from '$lib/i18n/config';
	import { setDirectionContext, type Dir } from '$lib/i18n/direction';

	// Create reactive local state via the Svelte 5 $state rune
	let isMenuOpen = $state(false);
	let isLangOpen = $state(false);
	let { children, data } = $props();

	const lang = $derived(page.params.lang ?? DEFAULT_LOCALE);
	const currentLocale = $derived(data.availableLanguages.find((l) => l.code === lang));
	const otherLocales = $derived(data.availableLanguages.filter((l) => l.code !== lang));

	// Shared direction store — bits-ui components (which don't inherit the DOM `dir`) read it.
	// toStore keeps it reactive to `data.dir` across navigations and correct during SSR.
	const dir = toStore<Dir>(() => data.dir);
	setDirectionContext(dir);

	// Keep the real <html> element in sync on client-side navigation (e.g. language switch);
	// on a full load the hooks already set dir/lang. This is what flips direction without a reload.
	$effect(() => {
		document.documentElement.dir = data.dir;
		document.documentElement.lang = data.locale;
	});

	// Close the language popup after any navigation (backstop for the onclick close).
	afterNavigate(() => (isLangOpen = false));

	// روابط التنقّل لسطح المكتب (مع بادئة اللغة)
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

<svelte:head><link rel="icon" href={logo} /></svelte:head>
<header
	class="fixed bg-secondary-100 w-screen top-0 right-0 left-0 z-10 h-16 shadow px-4 md:px-16 lg:px-32 flex items-center justify-between gap-4">
	<!-- الشعار + زر القائمة (للجوال) -->
	<div class="flex items-center gap-2">
		<button class="cursor-pointer lg:hidden" onclick={() => (isMenuOpen = true)} aria-label={$_('common.menu')}>
			<Menu strokeWidth={2} size="28" />
		</button>
		<a href="/{lang}" class="h-10 w-16 flex items-center">
			<img class="size-full object-contain" src={logo} alt={$_('common.logo_alt')} />
		</a>
	</div>

	<!-- روابط التنقّل (لسطح المكتب) -->
	<nav class="hidden lg:block">
		<ul class="flex items-center gap-8 font-bold text-secondary-700">
			{#each navLinks as link (link.href)}
				<li>
					<a href={link.href} class="hover:text-primary transition-colors">{link.name}</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- مبدّل اللغة -->
	{#if otherLocales.length > 0}
		<details bind:open={isLangOpen} class="relative group">
			<summary
				class="flex gap-2 items-center justify-center font-extrabold cursor-pointer text-secondary-700 hover:text-primary transition-colors list-none [&::-webkit-details-marker]:hidden">
				<span>{currentLocale?.nativeName ?? lang}</span>
				<Translate size="16" style="fill-black" />
			</summary>
			<ul class="absolute end-0 mt-2 min-w-32 rounded-xl bg-white p-2 shadow-lg ring-1 ring-secondary-700/10 z-20">
				{#each otherLocales as loc (loc.code)}
					<li>
						<a
							href={switchLocalePath(page.url.pathname, loc.code) + page.url.search}
							hreflang={loc.code}
							data-sveltekit-preload-data="off"
							onclick={() => (isLangOpen = false)}
							class="block rounded-lg px-3 py-1.5 font-bold text-secondary-700 hover:bg-secondary-100 hover:text-primary transition-colors">
							{loc.nativeName}
						</a>
					</li>
				{/each}
			</ul>
		</details>
	{/if}
</header>
<Drawer bind:open={isMenuOpen} />
<main class="pt-16 scroll-smooth h-fit">
	{@render children()}
</main>
<Footer />
