module.exports = function (grunt) {
	function merge (path, files, resolve) {
		const regex = /(^|[ \r\n]*)(import[^;]*;[ \r\n]*|export (default )?)/g;

		grunt.file.write(path, files.map(path => {
			const file = grunt.file.read(path).replace(regex, '');
			if (!resolve) return file;
			return resolve(file, path);
		}).join('\n'));
	}

	function direct (name) {
		if (typeof name !== 'object') {
			return `if (typeof define === 'function' && define.amd) {
				define(function () { return ${name}; });
			} else if (typeof module !== 'undefined' && module.exports) {
				module.exports = ${name};
			} else if (typeof window === 'object' && window.document) {
				window.${name} = ${name};
			}`;
		}

		return Object.entries(name).map(([name, imports]) => `
			var ${imports.join(', ')};
			if (typeof module !== 'undefined' && module.exports) {
				var library = require('${name}');
				${imports.map(it => `${it} = library.${it};`).join('')}
			}
		`).join('\n');
	}

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		babel: {
			main: {
				files: {
					'dist/app.min.js': 'dist/app.min.js',
					'dist/revise.min.js': 'dist/revise.min.js'
				}
			}
		},
		uglify: {
			main: {
				options: {
					banner: [
						'/*',
						' <%= pkg.name %>',
						' v<%= pkg.version %>',
						' */'
					].join('')
				},
				files: {
					'dist/app.min.js': 'dist/app.min.js',
					'dist/revise.min.js': 'dist/revise.min.js'
				}
			}
		},
		copy: {
			main: {
				files: [
					{
						expand: true,
						cwd: 'src/',
						src: ['app.css', 'home.css', 'cli.js'],
						dest: 'dist/',
						flatten: true
					}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('before', () => {
		merge('./dist/home.min.js', [
			'./src/home.js',
		]);

		merge('./dist/app.min.js', [
			'./src/arrange.js',
			'./src/buttons.js',
			'./src/extract.js',
			'./src/stringify.js',
			'./src/app.js',
		]);

		merge('./dist/revise.min.js', [
			'./src/expand.js',
			'./src/locate.js',
			'./src/merge.js',
			'./src/resolve.js',
			'./src/index.js'
		]);
	});

	grunt.registerTask('after', function () {
		grunt.file.write('./dist/home.min.js', `(function () {
			${grunt.file.read('./dist/home.min.js')}
			${direct('Home')}
		})();`);

		grunt.file.write('./dist/app.min.js', `(function () {
			${grunt.file.read('./dist/app.min.js')}
			${direct('App')}
		})();`);

		grunt.file.write('./dist/revise.min.js', `(function () {
			${direct({
				fs: ['readFile']
			})}
			${grunt.file.read('./dist/revise.min.js')}
			${direct('revise')}
		})();`);
	});

	grunt.registerTask('default', [
		'before',
		'babel',
		'after',
		'uglify',
		'copy'
	]);
};
