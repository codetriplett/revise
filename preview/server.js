const regex = /^(layout|component)(\/(?:stage|test))?\/(.+)\.json$/;

const map = {
	layout: {
		product: 'main'
	},
	component: {}
};

require('../dist/revise.min.js')(8080, [
	__dirname
], () => {
	return render('Home Page');
})(regex, ({ '': body }, type, env = '', name, file) => {
	const url = `${type}${env}/${map[type][name] || name}.json`;
	return body ? file(url, body.file) : file(url);
});
