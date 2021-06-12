import merge from './merge';

export default function expand (composite, root, ...chain) {
	if (typeof composite !== 'object' || Array.isArray(composite)) {
		return Promise.resolve();
	} else if (!Object.prototype.hasOwnProperty.call(composite, '')) {
		return Promise.resolve({ ...composite, '': chain.pop() });
	}

	const { '': path, ...props } = composite;

	if (Array.isArray(path)) {
		return Promise.resolve(~path.indexOf(root) ? composite : undefined);
	} else if (~chain.indexOf(path)) {
		return Promise.resolve(composite);
	}

	return fetch(path)
		.then(data => data.json())
		.then(json => expand(json, root, ...chain, path))
		.catch(() => {})
		.then(json => json && merge(json, props));
}
