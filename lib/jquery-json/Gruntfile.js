/*jshint node:true */
module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jscs-checker');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: {
				jshintrc: true
			},
			all: ['*.js', '{src,test}/**/*.js']
		},
		jscs: {
			all: '<%= jshint.all %>'
		},
		connect: {
			qunit: {
				options: {
					hostname: 'localhost',
					port: 9002
				}
			}
		},
		qunit: {
			all: {
				options: {
					urls: [
						'http://localhost:9002/test/index.html?disableNative=true',
						'http://localhost:9002/test/index.html?disableNative=true&distmin=true'
					]
				}
			}
		},
		uglify: {
			all: {
				files: {
					'dist/jquery.json.min.js': ['src/jquery.json.js']
				},
				options: {
					banner: '/*! jQuery JSON plugin v<%= pkg.version %> | github.com/Krinkle/jquery-json */\n'
				}
			}
		},
		watch: {
			files: [
				'.{jscsrc,jshintignore,jshintrc}',
				'<%= jshint.all %>'
			],
			tasks: 'test'
		}
	});

	grunt.registerTask('lint', ['jshint', 'jscs']);
	grunt.registerTask('build', ['lint', 'uglify']);
	grunt.registerTask('test', ['build', 'connect', 'qunit']);
	grunt.registerTask('default', 'test');
};
