import expand from './expand';

export default function resolve (composite, get) {
	if (!composite || typeof composite !== 'object') {
		return Promise.resolve(composite);
	} else if (Array.isArray(composite)) {
		return Promise.all(composite.map(it => {
			return resolve(it, get);
		})).then(values => {
			return values.filter(it => it !== undefined);
		});
	}

	return expand(composite, get).then(composite => {
		if (!composite) return;
		const keys = Object.keys(composite);

		return Promise.all(keys.map(key => {
			return resolve(composite[key], get);
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
