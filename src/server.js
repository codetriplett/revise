function render (title, ...content) {
	return render => `<!doctype html>
<html lang="en">
	<head>
		<title>${title}</title>
		<link rel="stylesheet" href="/index.css">
	</head>
	<body>
		<div id="modal"></div>
		${content.map(it => render(it)).join('')}
	</body>
</html>`;
}

require('@triplett/steward')(8080, [
	__dirname,
	'app.js'
], () => {
	return render('Home Page');
})(/^(.+?(\.[^.]*)?)$/, ({ '': body }, url, ext, file) => {
	if (!ext) {
		return render('Revise', { '': 'app.js#App' });
	} else if (ext === '.json') {
		return body ? file(url, body) : file(url);
	}
});
