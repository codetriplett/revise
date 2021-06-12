export default function extract (composite, index, object) {
	const [, sources, arrayed, ...content] = composite;
	const value = sources[index];
	if (value === undefined) return object;
	else if (value !== composite) return value;
	else if (!object) object = {};
	const result = Object.assign(arrayed ? [] : {}, object);

	for (const composite of content) {
		const [key] = composite;
		result[key] = extract(composite, key ? index : 0, object[key]);
	}

	return result;
}
