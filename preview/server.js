require('../dist/revise.min.js')(8080, [
	__dirname
], () => {
	return render('Home Page');
});
