<script lang="ts">
	import { Check } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let { value = 0 }: { value?: number } = $props();

	const steps = [0, 25, 50, 75, 100] as const;
	const clamped = $derived(Math.max(0, Math.min(100, Math.round(value))));

	// أعلى مرحلة تم بلوغها (المرحلة الحالية)
	const activeStep = $derived([...steps].reverse().find((s) => clamped >= s) ?? 0);

	// نسبة تعبئة المقطع الواقع بين المرحلة الحالية والتالية
	const segmentFill = (step: number) => {
		if (clamped <= step) return 0;
		if (clamped >= step + 25) return 100;
		return ((clamped - step) / 25) * 100;
	};
</script>

<div class="w-full">
	<div class="flex items-center font-inter text-xs">
		{#each steps as step (step)}
			{@const reached = clamped >= step}
			<div
				class={cn(
					'flex size-10 shrink-0 items-center justify-center rounded-full font-bold transition-all duration-500',
					reached
						? 'bg-secondary-700 text-white shadow-md shadow-secondary-700/30'
						: 'bg-white text-secondary-400 ring-2 ring-inset ring-secondary-200'
				)}>
				{#if reached && step !== activeStep}
					<Check class="size-4" strokeWidth={3} />
				{:else}
					{step}
				{/if}
			</div>

			{#if step !== 100}
				<div class="mx-0.5 h-2 grow overflow-hidden rounded-full bg-secondary-200">
					<div
						class="h-full rounded-full bg-secondary-700 transition-all duration-700 ease-out"
						style="width: {segmentFill(step)}%">
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>
