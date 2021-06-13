export default function arrange (sources, key) {
	if (key !== undefined) {
		sources = sources.map(it => {
			if (it && typeof it === 'object') return it[key];
		});
	}

	const { length } = sources;
	const index = sources.findIndex(it => it !== undefined);
	const object = sources[index];
	const arrayed = Array.isArray(object);
	const values = Array(length).fill(undefined);
	const composite = [key, values];
	const states = Array(length - 1).fill(composite);
	const backup = [...sources];
	composite.push(states);

	if (!object || typeof object !== 'object') {
		Object.assign(values, sources);

		for (const [i, it] of sources.slice(1).entries()) {
			if (it !== sources[0]) states[i] = it;
		}

		return composite;
	}

	composite.push(arrayed);

	const keys = sources.map((it, i) => {
		if (it && typeof it === 'object' && Array.isArray(it) === arrayed) {
			return Object.keys(it);
		}

		values[i] = it;
		sources[i] = undefined;
		return [];
	});

	for (const key of new Set([].concat(...keys))) {
		const subcomposite = arrange(sources, key);
		const [subkey, subsources, substates] = subcomposite;
		const subobject = subsources[index];

		for (const [i, state] of substates.entries()) {
			if (subkey && state !== subcomposite) states[i] = backup[i + 1];
		}

		for (const [i, source] of subcomposite[1].entries()) {
			if (i === index || source !== undefined && source !== subobject) {
				values[i] = composite;
			}
		}

		composite.push(subcomposite);
	}

	return composite;
}
