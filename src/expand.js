import merge from './merge';

export default function expand (composite, id, get, ...chain) {
	if (typeof composite !== 'object') {
		return Promise.resolve();
	} else if (Array.isArray(composite)
		|| !Object.prototype.hasOwnProperty.call(composite, '')) {
		return Promise.resolve(composite);
	}

	let { '': path, ...props } = composite;

	if (path === '') {
		return;
	} else if (Array.isArray(path)) {
		return Promise.resolve(id === undefined || ~path.indexOf(id) ? props : undefined);
	} else if (typeof path === 'object') {
		if (id === undefined) return Promise.resolve(props);
		path = path[id];
	}

	if (path === '#') return Promise.resolve(id);
	else if (typeof path !== 'string') return;
	else if (!get) get = path => fetch(path).then(data => data.json());
	const index = path.indexOf('#');
	
	if (~index) {
		id = path.slice(index + 1);
		path = path.slice(0, index);
	}

	if (~chain.indexOf(path)) return Promise.resolve(props);

	return get(path)
		.then(json => expand(json, id, get, ...chain, path))
		.catch(() => {})
		.then(json => json && merge(json, props));
}
