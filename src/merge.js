export default function merge (defaults, overrides = defaults) {
	if (!overrides || typeof overrides !== 'object') {
		return overrides;
	} else if (Array.isArray(overrides)) {
		if (!Array.isArray(defaults)) defaults = [];

		return overrides
			.map((it, i) => merge(defaults[i], it))
			.filter(it => it !== undefined);
	}

	const keys = Object.keys(overrides);
	if (!keys.length) return;
	keys.unshift(...Object.keys(defaults));
	const composite = {};

	for (const key of [...new Set(keys)]) {
		const value = merge(defaults[key], overrides[key]);
		if (value !== undefined) composite[key] = value;
	}

	return composite;
}
