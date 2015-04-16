//Grunt is just JavaScript running in node, after all...
module.exports = function(grunt) {

    // All upfront config goes in a massive nested object.
    grunt.initConfig({
        // You can set arbitrary key-value pairs.
        distFolder: 'doc/dist',
        libFolder: 'lib',
        sampleFolder: 'samples',
        // You can also set the value of a key as parsed JSON.
        // Allows us to reference properties we declared in package.json.
        pkg: grunt.file.readJSON('package.json'),
        // Grunt tasks are associated with specific properties.
        // these names generally match their npm package name.
        concat: {
            // Specify some options, usually specific to each plugin.

            // 'dist' is what is called a "target."
            // It's a way of specifying different sub-tasks or modes.
            javascript: {
                options: {
                    banner: '/*!grid v<%=pkg.version%> | NHN Entertainment*/\n' +
                    '(function(){\n',
                    footer: '\n})();'
                },
                // The files to concatenate:
                // Notice the wildcard, which is automatically expanded.
                src: [
                    'src/Core/*.js',
                    'src/Data/*.js',

                    'src/Model/Renderer.js',
                    'src/Model/*',

                    'src/View/Layer/Base.js',
                    'src/View/Layer/*.js',

                    'src/View/Layout/Frame.js',
                    'src/View/Layout/*',

                    'src/View/Painter/*',
                    'src/View/Painter/Cell/Base.js',
                    'src/View/Painter/Cell/*',
                    'src/View/Layout/*.js',
                    'src/View/*.js',

                    'src/AddOn/*.js',

                    'src/Core.js',
                    'src/Grid.js'
                ],
                // The destination file:
                // Notice the angle-bracketed ERB-like templating,
                // which allows you to reference other properties.
                // This is equivalent to 'dist/main.js'.
                dest: '<%= distFolder %>/grid.js'
                // You can reference any grunt config property you want.
                // Ex: '<%= concat.options.separator %>' instead of ';'
            },
            css: {
                src: [
                    'css/common.css',
                    'css/grid.css'
                ],
                dest: '<%= distFolder %>/grid.css'
            }
        },
        uglify: {
            my_target: {
                files: {
                    '<%= distFolder %>/grid.min.js' : '<%= distFolder %>/grid.js'
                },
                options: {
                    banner: '/*!grid v<%=pkg.version%> | NHN Entertainment*/',
                    preserveComments: false,
                    sourceMap: true,
                    sourceMapName: '<%= distFolder %>/grid.min.map'
                }
            }
        },
        copy: {
            main: {
                files: [
                    {expand: true, flatten: true, src: ['<%= distFolder %>/*.js', '<%= distFolder %>/*.map', '<%= distFolder %>/*.css'], dest: '', filter: 'isFile'}
                ]
            },
            sample: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '<%= libFolder %>/jquery/jquery.min.js',
                            '<%= libFolder %>/jquery-json/src/jquery.json.js',
                            '<%= libFolder %>/underscore/underscore.js',
                            '<%= libFolder %>/backbone/backbone.js',
                            '<%= libFolder %>/code-snippet/code-snippet.min.js',
                            '<%= libFolder %>/component-pagination/pagination.min.js'
                        ],
                        dest: '<%= sampleFolder %>/js/lib', filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '<%= distFolder %>/*.js'
                        ],
                        dest: '<%= sampleFolder %>/js', filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= distFolder %>/grid.css'],
                        dest: '<%= sampleFolder %>/css', filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: [
                            '<%= distFolder %>/grid.min.js'
                        ],
                        dest: '<%= sampleFolder %>/js', filter: 'isFile'
                    },
                ]
            }
        },
        zip: {
            main: {
                src: ['<%= distFolder %>/*'],
                dest: '<%= distFolder %>/grid.zip'
            }
        }
    }); // The end of grunt.initConfig

    // We've set up each task's configuration.
    // Now actually load the tasks.
    // This will do a lookup similar to node's require() function.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-zip');

    // Register our own custom task alias.
//    grunt.registerTask('build', ['concat', 'uglify', 'copy', 'zip']);
    grunt.registerTask('build', ['concat', 'uglify', 'copy', 'zip']);
};
