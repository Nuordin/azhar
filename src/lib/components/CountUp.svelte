<script lang="ts">
	type Props = { value: string; class?: string };
	let { value, class: className = '' }: Props = $props();

	// Split "500+", "+500", "١٥٠+" etc. into prefix / digits / suffix so we can
	// animate just the numeric run and keep the original digit script intact.
	const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
	const parsed = $derived.by(() => {
		const usesArabic = /[٠-٩]/.test(value);
		const normalized = value.replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)));
		const match = normalized.match(/^(\D*)(\d+)(\D*)$/);
		return {
			usesArabic,
			prefix: match?.[1] ?? '',
			suffix: match ? (match[3] ?? '') : '',
			target: match ? Number(match[2]) : 0,
			canCount: !!match
		};
	});

	const toDisplayDigits = (n: number) =>
		parsed.usesArabic ? String(n).replace(/\d/g, (d) => arabicDigits[Number(d)]) : String(n);

	let current = $state(0);
	let node: HTMLSpanElement;
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

	$effect(() => {
		if (!visible || !parsed.canCount) return;
		const target = parsed.target;
		const duration = 1500;
		let start: number | undefined;
		let frame: number;
		const step = (t: number) => {
			if (start === undefined) start = t;
			const progress = Math.min((t - start) / duration, 1);
			// easeOutExpo for a snappy settle
			const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
			current = Math.round(eased * target);
			if (progress < 1) frame = requestAnimationFrame(step);
		};
		frame = requestAnimationFrame(step);
		return () => cancelAnimationFrame(frame);
	});

	const display = $derived(parsed.canCount ? parsed.prefix + toDisplayDigits(current) + parsed.suffix : value);
</script>

<span bind:this={node} class={className}>{display}</span>
