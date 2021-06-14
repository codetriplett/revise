export default function merge (defaults, overrides = defaults) {
	const arrayed = Array.isArray(defaults);

	if (!overrides || typeof overrides !== 'object') {
		return overrides;
	} else if (Array.isArray(overrides)) {
		if (!arrayed) defaults = [];

		return overrides
			.map((it, i) => merge(defaults[i], it))
			.filter(it => it !== undefined);
	}

	if (overrides[''] === '') return;
	let keys = Object.keys(overrides);
	if (arrayed) keys = keys.filter(it => it && !isNaN(it));
	keys.unshift(...Object.keys(defaults));
	const composite = arrayed ? [] : {};

	for (const key of [...new Set(keys)]) {
		const value = merge(defaults[key], overrides[key]);
		if (value !== undefined) composite[key] = value;
	}

	return composite;
}
