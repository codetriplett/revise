export default function arrange (sources, key) {
	if (key !== undefined) {
		sources = sources.map(it => {
			if (it && typeof it === 'object') return it[key];
		});
	}

	const object = sources.find(it => it !== undefined);
	const arrayed = Array.isArray(object);
	const values = [...sources];
	const composite = [key, values];
	if (!object || typeof object !== 'object') return composite;
	composite.push(arrayed);

	const keys = sources.map((it, i) => {
		if (!it || typeof it !== 'object' || Array.isArray(it) !== arrayed) {
			sources[i] = arrayed ? [] : {};
			return [];
		}

		values[i] = composite;
		return Object.keys(it);	
	});

	for (const key of new Set([].concat(...keys))) {
		composite.push(arrange(sources, key));
	}

	return composite;
}
