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
		if (typeof composite !== 'object') return composite;
		const keys = Object.keys(composite);

		return Promise.all(keys.map(key => {
			return resolve(composite[key], id, get);
		})).then(values => {
			const result = Array.isArray(composite) ? [] : {};

			for (const [i, key] of keys.entries()) {
				const value = values[i];
				if (value !== undefined) result[key] = value;
			}

			return result;
		});
	});
}
