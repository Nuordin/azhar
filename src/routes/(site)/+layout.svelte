<script lang="ts">
	import '../layout.css';
	import logo from '$lib/assets/OneWayLogo.svg';
	import { _ } from 'svelte-i18n';
	import Translate from '$lib/components/Icons/Translate.svelte';
	import { Menu } from '@lucide/svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// Create reactive local state via the Svelte 5 $state rune
	let isMenuOpen = $state(false);
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={logo} /></svelte:head>
<header
	class="fixed bg-secondary-100 w-screen top-0 right-0 left-0 z-10 h-16 shadow px-8 flex items-center justify-between">
	<div class="h-10 w-20 flex items-center justify-end">
		<button class="cursor-pointer" onclick={() => (isMenuOpen = true)}>
			<Menu strokeWidth={2} size="28" style="fill-black" />
		</button>
		<img class="size-full" src={logo} alt="OneWay Logo" />
	</div>
	<nav>
		<ul class="hidden">
			<li><a href="/">{$_('header.projects')}</a></li>
			<li><a href="#serveice">{$_('header.services')}</a></li>
			<li><a href="#about">{$_('header.about')}</a></li>
			<li><a href="#blog">{$_('header.blog')}</a></li>
			<li><a href="#contact">{$_('header.contact')}</a></li>
		</ul>
	</nav>
	<div class="flex gap-2 items-center justify-center font-extrabold">
		<div class="flex gap-2 items-center justify-center font-extrabold">
			<span>العربية</span>
			<Translate size="16" style="fill-black" />
		</div>
	</div>
</header>
<Drawer bind:open={isMenuOpen} />
<main class="pt-16 scroll-smooth h-fit">
	{@render children()}
</main>
<Footer />
