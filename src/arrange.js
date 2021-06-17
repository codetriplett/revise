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
			if (key && (i < 2 || it !== undefined) && it !== sources[0]) {
				states[i] = it;
			}
		}

		return composite;
	}

	let keys = sources.map((it, i) => {
		if (it && typeof it === 'object') {
			const keys = Object.keys(it);
			return arrayed ? keys.filter(it => it && !isNaN(it)) : keys;
		}

		values[i] = it;
		sources[i] = undefined;
		return [];
	});
	
	keys = new Set([].concat(...keys));
	composite.push(arrayed);

	for (const key of keys) {
		const subcomposite = arrange(sources, key);
		const [subkey, subsources, substates] = subcomposite;
		const subobject = subsources[index];

		for (const [i, state] of substates.entries()) {
			if (subkey && state !== subcomposite) states[i] = backup[i + 1];
		}

		for (const [i, source] of subcomposite[1].entries()) {
			if (i === index || source === subcomposite
				|| source !== undefined && source !== subobject) {
				values[i] = composite;
			}
		}

		composite.push(subcomposite);
	}

	if (!keys.size) {
		Object.assign(values, backup);

		if (values[2] === undefined) {
			if (values[0]) states[1] = backup[2];
			if (values[3]) states[2] = backup[3];
		}
	}

	return composite;
}
