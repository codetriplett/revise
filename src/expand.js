import merge from './merge';

export default function expand (composite, ...chain) {
	if (typeof composite !== 'object' || Array.isArray(composite)) {
		return Promise.resolve();
	} else if (!Object.prototype.hasOwnProperty.call(composite, '')) {
		return Promise.resolve(composite);
	}

	const { '': path, ...props } = composite;
	if (~chain.indexOf(path)) return Promise.resolve(props);

	return fetch(path)
		.then(data => data.json())
		.then(json => expand(json, ...chain, path))
		.catch(() => {})
		.then(json => json && merge(json, props));
}
