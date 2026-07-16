<script>
	import { cn } from '$lib/utils';
	import { fade, fly } from 'svelte/transition';
	let { isOpen = $bindable(false), class: className = '', children } = $props();

	function closeSheet() {
		isOpen = false;
	}

	// Svelte 5 effect to lock body scrolling
	$effect(() => {
		if (isOpen) {
			// Prevent scrolling on the body
			document.body.classList.add('overflow-hidden');
		} else {
			// Restore scrolling
			document.body.classList.remove('overflow-hidden');
		}

		// Cleanup function: runs when the component is destroyed
		// Ensures we never accidentally leave the body locked
		return () => {
			document.body.classList.remove('overflow-hidden');
		};
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 z-20">
		<button
			class="fixed inset-0 z-30 bg-secondary-700/50 backdrop-blur-[2px]"
			aria-label="Close sheet"
			transition:fade={{ duration: 200 }}
			onclick={closeSheet}>
		</button>

		<div
			class={cn(
				'fixed bottom-0 left-0 right-0 z-40 h-[60vh] w-full overflow-hidden rounded-t-xl bg-secondary-100',
				className
			)}
			transition:fly={{ y: '100%', duration: 300 }}>
			{@render children?.()}
		</div>
	</div>
{/if}
