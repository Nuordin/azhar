<script lang="ts">
	import CountUp from './CountUp.svelte';

	type Props = { number: string; title: string; delay?: number };
	let { number, title, delay = 0 }: Props = $props();

	let node: HTMLDivElement;
	let visible = $state(false);

	$effect(() => {
		if (!node) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					visible = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.4 }
		);
		observer.observe(node);
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={node}
	style="transition-delay: {delay}ms"
	class="flex flex-col items-center justify-center gap-4 p-4 shadow-md rounded-2xl border-gray-400/20 border text-center transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/40 {visible
		? 'opacity-100 translate-y-0'
		: 'opacity-0 translate-y-4'}">
	<CountUp value={number} class="text-4xl font-inter" />
	<span class="font-black">{title}</span>
</div>
