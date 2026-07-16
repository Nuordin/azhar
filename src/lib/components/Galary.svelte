<script lang="ts">
	import { fade } from 'svelte/transition';
	type atrr = {
		open: boolean;
		images: string[];
		selected: string;
	};
	let { open = $bindable(false), images = [], selected = $bindable(images[0]) }: atrr = $props();

	function close() {
		open = false;
	}

	// Svelte 5 effect to lock body scrolling
	$effect(() => {
		if (open) {
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

{#if open}
	<div class="fixed inset-0 z-30 bg-secondary-700/70 backdrop-blur-[2px] px-2 py-32">
		<div class="w-full overflow-clip flex flex-col justify-around h-full items-end">
			<div class="w-full h-100 flex justify-center items-center">
				<img src={selected} alt="" class="w-full object-cover" />
			</div>
			<div class="w-full flex gap-4 overflow-x-auto relative p-4">
				{#each images as image (image)}
					<button class="h-24 shrink-0 object-cover" onclick={() => (selected = image)} transition:fade>
						<img src={image} alt="" class="w-full h-full" />
					</button>
				{/each}
			</div>
			<button onclick={close} class="absolute bottom-16 left-0 right-0 flex items-center justify-center">
				<span class="bg-primary rounded-lg font-bold text-secondary-100 py-2 px-16"> إغلاق </span>
			</button>
		</div>
	</div>
{/if}
