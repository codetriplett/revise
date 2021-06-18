import { readFile } from 'fs';
import resolve from './resolve';

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

export default function revise (...params) {
	const chain = [];

	function append (...params) {
		if (typeof params[0] !== 'number') {
			chain.push(params);
			return append;
		}

		const [port, files, callback] = params;

		if (!chain.length) {
			chain.push([/^(.+)$/, (props, url, file) => {
				if (url.endsWith('.json')) {
					const { '': body } = props;
					return body ? file(url, body.file) : file(url);
				}
			}]);
		}

		return chain.reduce((server, params) => {
			return server(...params);
		}, require('@triplett/steward')(port, files, (...params) => {
			const [{ post, put, get, id }, file] = params;
			if (post || put) return render('Revise', { '': '#App' });
			else if (!get) return callback ? callback(...params) : undefined;
	
			return file(get).then(data => {
				const json = JSON.parse(data);
	
				return resolve(json, id, path => {
					return file(path).then(data => JSON.parse(data));
				});
			});
		}))(/^(.+\.(?:js|css))$/, (props, url) => {
			if (url === 'app.min.js'|| url === 'app.css') {
				return respond(`${__dirname}/${url}`);
			}
		});
	}

	return append(...params);
}
