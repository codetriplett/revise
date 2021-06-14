import merge from './merge';

export default function expand (composite, get, ...chain) {
	if (typeof composite !== 'object' || Array.isArray(composite)) {
		return Promise.resolve();
	} else if (!Object.prototype.hasOwnProperty.call(composite, '')) {
		return Promise.resolve(composite);
	}

	const { '': path, ...props } = composite;
	if (path === '' || ~chain.indexOf(path)) return Promise.resolve(props);
	else if (!get) get = path => fetch(path).then(data => data.json());

	return get(path)
		.then(json => expand(json, get, ...chain, path))
		.catch(() => {})
		.then(json => json && merge(json, props))
}
