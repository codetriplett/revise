export default function locate (file, path = '') {
	return file(path).then(files => {
		files.sort((a, b) => {
			return a.endsWith('.json') - b.endsWith('.json');
		});

		return Promise.all(files.map(it => {
			const [, ext] = it.match(/(?:\.([^.]*))?$/);
			if (ext === undefined) return locate(file, `${path}/${it}`);
			else if (ext === 'json') return it;
		}).filter(it => it)).then(all => {
			const [, name = ''] = path.match(/(?:\/([^\/]*))?$/);
			return [name, `${path}/`, ...all];
		});
	});
}
