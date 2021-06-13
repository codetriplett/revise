export default function stringify (composite, indentation = '') {
	const [, sources,, arrayed, ...content] = composite;
	const strings = Array(sources.length).fill('');
	let index = sources.findIndex(it => it === composite);

	if (index === -1 || arrayed === undefined) {
		index = sources.findIndex(it => {
			return it !== undefined && typeof it !== 'object'
		});

		if (index !== -1) strings[index] = JSON.stringify(sources[index]);
		return strings;
	}

	indentation += '\t';

	for (const it of content) {
		const [key] = it;

		for (const [i, string] of stringify(it, indentation).entries()) {
			if (/^[^\n]/.test(string)) {
				if (!arrayed) string = `"${key}": ${string}`;
				string = `${indentation}${string},`;
			}

			strings[i] += `\n${string}`;
		}
	}

	return strings.map((string, i) => {
		string = `${string.replace(/,(?=\s*$)/, '')}\n`;
		if (i !== index) return string;
		string += indentation.slice(1);
		return arrayed ? `[${string}]` : `{${string}}`;
	});
}
