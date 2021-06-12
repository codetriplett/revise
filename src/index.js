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

export default function revise (port, [directory, ...files], home) {
	return require('@triplett/steward')(port, [
		directory,
		...files
	], home)(/^(.+?(\.[^.]*)?)$/, (props, url, ext, file) => {
		if (!ext) {
			return render('Revise', { '': '#App' });
		} else if (ext === '.json') {
			const { '': body } = props;
			return body ? file(url, body.file) : file(url);
		}

		return respond(`${__dirname}/${url}`);
	});
}
