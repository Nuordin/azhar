// Shared text-direction context for the public site.
// `dir` originates per-request from the locale filename (see locales.server.ts) and flows
// through `data.dir`. We expose it via Svelte context (NOT a module-global store) so each
// SSR request keeps its own value. bits-ui floating components don't inherit the DOM `dir`,
// so they read it from here and pass it as their `dir` prop.

import { getContext, setContext } from 'svelte';
import type { Readable } from 'svelte/store';

export type Dir = 'rtl' | 'ltr';

const DIR_KEY = Symbol('dir');

/** يوفّر مخزن الاتجاه للأبناء عبر السياق. يُستدعى مرّة في تخطيط الموقع الجذري. */
export function setDirectionContext(store: Readable<Dir>): void {
	setContext(DIR_KEY, store);
}

/** يقرأ مخزن الاتجاه الحالي. استخدم `$dir` في المكوّن. */
export function getDirection(): Readable<Dir> {
	return getContext(DIR_KEY);
}
