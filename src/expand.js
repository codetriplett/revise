import merge from './merge';

export default function expand (composite, id, get, ...chain) {
	if (typeof composite !== 'object' || Array.isArray(composite)) {
		return Promise.resolve();
	} else if (!Object.prototype.hasOwnProperty.call(composite, '')) {
		return Promise.resolve(composite);
	}

	let { '': path, ...props } = composite;

	if (typeof path === 'string') {
		const index = path.indexOf('#');
		
		if (~index) {
			id = path.slice(index + 1);
			path = path.slice(0, index);
		}

		if (path === '' || ~chain.indexOf(path)) return Promise.resolve(props);
	}

	if (Array.isArray(path)) {
		return Promise.resolve(id === undefined || ~path.indexOf(id) ? props : undefined);
	} else if (!get) {
		get = path => fetch(path).then(data => data.json());
	}

	return get(path)
		.then(json => expand(json, id, get, ...chain, path))
		.catch(() => {})
		.then(json => json && merge(json, props));
}
