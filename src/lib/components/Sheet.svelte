<script>
	import { fade, fly } from 'svelte/transition';
	let { isOpen = $bindable(false), children } = $props();

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
			class="fixed bottom-0 left-0 right-0 z-40 h-[60vh] w-full overflow-hidden rounded-t-4xl bg-secondary-100"
			transition:fly={{ y: '100%', duration: 300 }}>
			{@render children?.()}
		</div>
	</div>
{/if}

<!-- <Tabs.Root value="outbound" class="h-[50vh]">
	<Tabs.List class="grid w-full grid-cols-2 gap-1 p-1 text-sm shadow-sm rounded-lg px-4">
		<Tabs.Trigger
			value="outbound"
			class="bg-transparent h-8 flex items-center justify-center rounded-lg font-bold data-[state=active]:ring-2 data-[state=active]:ring-primary-100 data-[state=active]:bg-primary-300 data-[state=active]:text-primary-100">
			سكني</Tabs.Trigger>
		<Tabs.Trigger
			value="inbound"
			class="bg-transparent h-8 flex items-center justify-center rounded-lg font-bold data-[state=active]:ring-2 data-[state=active]:ring-primary-100 data-[state=active]:bg-primary-300 data-[state=active]:text-primary-100"
			>تجاري</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="outbound" class="select-none overflow-y-scroll h-[50vh] flex flex-col">
	</Tabs.Content>
	<Tabs.Content value="inbound" class="select-none overflow-y-scroll h-[50vh] flex flex-col">
	</Tabs.Content>
</Tabs.Root> -->
