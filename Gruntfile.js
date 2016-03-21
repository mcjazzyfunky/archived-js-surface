module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: {
                src: ["build/*", "dist/v<%= pkg.version %>"],
            }
        },
        babel: {
            options: {
                modules: 'common',
                retainLines: true,
                moduleIds: false,
                sourceMaps: true
            },
            dist:  {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.js*'],
                    dest: 'build/src',
                    ext: '.js'
                }]
            }
        },
        esdoc : {
            dist : {
                options: {
                    source: 'src/main',
                    destination: 'dist/v<%= pkg.version %>/docs/api',
                    //undocumentIdentifier: false,
                    //unexportIdentifier: true,
                    includeSource: true,
                    //autoPrivate: false,
                    title: 'js-bling'
                }
            }
        },
        browserify: {
            dist: {
                //extend: true,
                //src: ['build/src/**/*.js'],
                src: 'build/src/js-bling.js',
                dest: 'dist/v<%= pkg.version %>/js-bling-<%= pkg.version %>.js'
            }
        },
        uglify: {
            options: {
                ASCIIOnly: true,
                banner: '/*\n'
                        + ' <%= pkg.name %> v<%= pkg.version %> - '
                        + '<%= grunt.template.today("yyyy-mm-dd") %>\n'
                        + ' Homepage: <%= pkg.homepage %>\n'
                        + ' Licencse: New BSD License\n'
                        + '*/\n'
            },
            js: {
                src: ['dist/v<%= pkg.version %>/js-bling-<%= pkg.version %>.js'],
                dest: 'dist/v<%= pkg.version %>/js-bling-<%= pkg.version %>.js'
            }
        },
        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                src: ['dist/v<%= pkg.version %>/js-bling-<%= pkg.version %>.js'],
                dest: 'dist/v<%= pkg.version %>/js-bling-<%= pkg.version %>.js.gz'
            }
        },
       asciidoctor: [{
           options: {
               cwd: 'doc'
           },
           files: {
             'dist/v<%= pkg.version %>/docs': ['*.adoc'],
           },
         }],
        watch: {
            js: {
                options: {
                    spawn: true,
                },
                files: ['src/**/*.js', 'Gruntfile.js',],
                //tasks: ['compile', 'mochaTest']
                tasks: ['dist']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-watch');
    //grunt.loadNpmTasks('grunt-asciidoctor');
    grunt.loadNpmTasks('grunt-esdoc');

    grunt.registerTask('compile', ['babel']);
    grunt.registerTask('test', ['babel', 'mochaTest']);
    grunt.registerTask('dist', ['clean', 'babel', 'browserify',  /* 'uglify', 'compress',*/ 'esdoc',]);
    grunt.registerTask('default', ['dist']);
};
