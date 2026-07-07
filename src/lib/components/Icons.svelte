<script lang="ts" module>
	import type { Component } from 'svelte';
	import {
		UtensilsCrossed,
		Dumbbell,
		Bike,
		TreePine,
		WavesHorizontal,
		TowerControl,
		Handbag,
		Parasol,
		Footprints,
		ShieldCheck,
		Baby,
		CircleParking,
		type LucideProps
	} from '@lucide/svelte';

	const iconMap: Record<string, Component<LucideProps, object, ''>> = {
		UtensilsCrossed: UtensilsCrossed,
		Dumbbell: Dumbbell,
		Bike: Bike,
		TreePine: TreePine,
		WavesHorizontal: WavesHorizontal,
		TowerControl: TowerControl,
		Handbag: Handbag,
		Parasol: Parasol,
		Footprints: Footprints,
		ShieldCheck: ShieldCheck,
		Baby: Baby,
		CircleParking: CircleParking
	};
</script>

<script lang="ts">
	let { iconName, stroke }: { iconName: string; stroke?: number } = $props();

	const DynamicIcon = $derived(iconMap[iconName]);
</script>

{#if DynamicIcon}
	<DynamicIcon size={24} strokeWidth={stroke ?? 1.5} />
{:else}
	<div class="fallback-icon">?</div>
{/if}

<style>
	.fallback-icon {
		width: 24px;
		height: 24px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: #f3f4f6;
		border-radius: 4px;
		color: #9ca3af;
		font-size: 12px;
	}
</style>
