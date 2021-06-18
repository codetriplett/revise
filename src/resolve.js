import expand from './expand';

export default function resolve (composite, id, get) {
	if (!composite || typeof composite !== 'object') {
		return Promise.resolve(composite);
	} else if (Array.isArray(composite)) {
		return Promise.all(composite.map(it => {
			return resolve(it, id, get);
		})).then(values => {
			return values.filter(it => it !== undefined);
		});
	}

	return expand(composite, id, get).then(composite => {
		if (!composite) return;
		const keys = Object.keys(composite);

		return Promise.all(keys.map(key => {
			return resolve(composite[key], id, get);
		})).then(values => {
			const composite = {};

			for (const [i, key] of keys.entries()) {
				const value = values[i];
				if (value !== undefined) composite[key] = value;
			}

			return composite;
		});
	});
}
