export default function merge (object) {
	if (!object || typeof object !== 'object') {
		return object;
	} else if (Array.isArray(object)) {
		return object.map(merge);
	} else if (!Object.prototype.hasOwnProperty.call(object, '')) {
		const result = {};

		for (const [key, value] of Object.entries(object)) {
			result[key] = merge(value);
		}

		return result;
	}

	const { '': path, ...overrides } = object;
	let promise = Promise.resolve();

	if (path) {
		promise = fetch(`${path.replace(/^(?!\/)/, '/')}.json`)
			.then(data => data.json());
	}

	return promise.then(defaults => {
		return merge({ ...defaults, ...overrides });
	});
}
