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

	// روابط التنقّل لسطح المكتب
	const navLinks = $derived([
		{ name: $_('header.home'), href: '/' },
		{ name: $_('header.projects'), href: '/projects' },
		{ name: $_('header.units'), href: '/units' },
		{ name: $_('header.blog'), href: '/blogs' },
		{ name: $_('header.services'), href: '/#serveice' },
		{ name: $_('header.about'), href: '/#about' },
		{ name: $_('header.contact'), href: '/#contact' }
	]);
</script>

<svelte:head><link rel="icon" href={logo} /></svelte:head>
<header
	dir="rtl"
	class="fixed bg-secondary-100 w-screen top-0 right-0 left-0 z-10 h-16 shadow px-4 md:px-16 lg:px-32 flex items-center justify-between gap-4">
	<!-- الشعار + زر القائمة (للجوال) -->
	<div class="flex items-center gap-2">
		<button class="cursor-pointer lg:hidden" onclick={() => (isMenuOpen = true)} aria-label="القائمة">
			<Menu strokeWidth={2} size="28" />
		</button>
		<a href="/" class="h-10 w-16 flex items-center">
			<img class="size-full object-contain" src={logo} alt="OneWay Logo" />
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
	<button
		class="flex gap-2 items-center justify-center font-extrabold cursor-pointer text-secondary-700 hover:text-primary transition-colors">
		<span>العربية</span>
		<Translate size="16" style="fill-black" />
	</button>
</header>
<Drawer bind:open={isMenuOpen} />
<main class="pt-16 scroll-smooth h-fit">
	{@render children()}
</main>
<Footer />
