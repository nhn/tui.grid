//Grunt is just JavaScript running in node, after all...
module.exports = function(grunt) {

    // All upfront config goes in a massive nested object.
    grunt.initConfig({
        // You can set arbitrary key-value pairs.
        distFolder: 'dist',
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
                    banner: '(function(){\n',
                    footer: '\n})();'
                },
                // The files to concatenate:
                // Notice the wildcard, which is automatically expanded.
                src: [
                    'src/External/*.js',

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

                    'src/Grid.js',
                    'src/Public.js'
                ],
                // The destination file:
                // Notice the angle-bracketed ERB-like templating,
                // which allows you to reference other properties.
                // This is equivalent to 'dist/main.js'.
                dest: '<%= distFolder %>/Grid.js'
                // You can reference any grunt config property you want.
                // Ex: '<%= concat.options.separator %>' instead of ';'
            },
            css: {
                src: [
                    'css/common.css',
                    'css/Grid.css'
                ],
                dest: '<%= distFolder %>/Grid.css'
            }
        },
        uglify: {
            my_target: {
                files: {
                    '<%= distFolder %>/Grid.min.js' : '<%= distFolder %>/Grid.js'
                }
            }
        },
//        copy: {
//            main: {
//                files: [
//                    {expand: true, flatten: true, src: ['css/*'], dest: '<%= distFolder %>/', filter: 'isFile'}
//                ]
//            }
//        },
        zip: {
            main: {
                src: ['<%= distFolder %>/*'],
                dest: '<%= distFolder %>/Grid.zip'
            }
        }
    }); // The end of grunt.initConfig

    // We've set up each task's configuration.
    // Now actually load the tasks.
    // This will do a lookup similar to node's require() function.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
//    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-zip');

    // Register our own custom task alias.
//    grunt.registerTask('build', ['concat', 'uglify', 'copy', 'zip']);
    grunt.registerTask('build', ['concat', 'uglify', 'zip']);
};
