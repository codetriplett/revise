import expand from './expand';

export default function resolve (composite, root) {
	if (!composite || typeof composite !== 'object') {
		return Promise.resolve(composite);
	} else if (Array.isArray(composite)) {
		return Promise.all(composite.map(it => {
			return resolve(it, root);
		})).then(values => {
			return values.filter(it => it !== undefined);
		});
	}

	return expand(composite, root).then(composite => {
		if (!composite) return;
		const { '': path, ...props } = composite;
		const keys = Object.keys(props);

		return Promise.all(keys.map(key => {
			return resolve(props[key], path);
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
