<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import logo from '$lib/assets/OneWayLogo.svg';
	// Define props using Svelte 5 runes
	// $bindable() allows the parent to open/close this drawer dynamically
	let { open = $bindable(false) } = $props();

	// روابط التنقّل
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

{#if open}
	<button
		transition:fade={{ duration: 200 }}
		onclick={() => (open = false)}
		class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
		aria-label="Close drawer">
	</button>

	<div
		transition:fly={{ x: 300, duration: 300 }}
		class="fixed inset-y-0 inset-s-0 z-50 w-full max-w-3xs bg-secondary-100/50 p-6 text-slate-100 shadow-2xl flex flex-col justify-between">
		<div>
			<nav class="mt-8 space-y-2 font-bold">
				<div class="flex items-center justify-start px-4 mb-8">
					<img class="size-20" src={logo} alt="OneWay Logo" />
				</div>
				{#each navLinks as link (link.href)}
					{#if link.href == '/'}
						<a
							href={link.href}
							onclick={() => (open = false)}
							class="flex items-center px-4 py-3 text-lg rounded-xl text-secondary-700 hover:bg-slate-800 hover:text-white transition-all duration-200">
							{link.name}
						</a>
					{:else}
						<a
							href={link.href}
							onclick={() => (open = false)}
							class="flex items-center px-4 py-3 text-lg rounded-xl text-secondary-700 hover:bg-slate-800 hover:text-white transition-all duration-200">
							{link.name}
						</a>
					{/if}
				{/each}
			</nav>
		</div>
	</div>
{/if}
