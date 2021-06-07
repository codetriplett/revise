import { readFile } from 'fs';

function render (title, ...content) {
	return render => `<!doctype html>
<html lang="en">
	<head>
		<title>${title}</title>
		<link rel="stylesheet" href="/app.css">
		<script src="/app.min.js"></script>
	</head>
	<body>
		${content.map(it => render(it)).join('')}
	</body>
</html>`;
}

function respond (url) {
	return new Promise(resolve => {
		readFile(url, 'utf8', (err, file) => {
			resolve(err ? undefined : file);
		});
	});
}

export default function revise (port, directory, resolve) {
	require('@triplett/steward')(port, [
		directory
	], () => {
		return render('Home Page');
	})(/^(.+?(\.[^.]*)?)$/, (props, url, ext, file) => {
		if (!ext) {
			return render('Revise', { '': '#App' });
		} else if (ext === '.json') {
			if (resolve) return resolve(url, props, file);
			const { '': body } = props;
			return body ? file(url, body) : file(url)
		}

		return respond(`${__dirname}/${url}`);
	});
}
