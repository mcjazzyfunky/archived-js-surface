module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: {
                src: ["build/*", "dist/*"],
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
                    cwd: './',
                    src: ['core/**/*.js*', 'packages/**/*.js*', 'util/**/*.js'],
                    dest: 'build/',
                    ext: '.js'
                }]
            }
        },
        /*
        esdoc : {
            dist : {
                options: {
                    source: 'src/main',
                    destination: 'dist/v<%= pkg.version %>/docs/api',
                    //undocumentIdentifier: false,
                    //unexportIdentifier: true,
                    includeSource: true,
                    //autoPrivate: false,
                    title: 'js-surface'
                }
            }
        },
        */
        webpack: {
			jsSurface: {
    			entry: "./build/packages/js-surface.js",
    			output: {
        			path: "dist/",
    				filename: "js-surface.js"
    			}
    		},
			jsSurfaceInferno: {
    			entry: "./build/packages/js-surface-inferno.js",
    			output: {
        			path: "dist/",
    				filename: "js-surface-inferno.js"
    			}
    		},
			jsSurfaceReactDOM: {
    			entry: "./build/packages/js-surface-react-dom.js",
    			output: {
        			path: "dist/",
    				filename: "js-surface-react-dom.js"
    			}
    		},
			jsSurfaceReactNative: {
    			entry: "./build/packages/js-surface-native.js",
    			output: {
        			path: "dist/",
    				filename: "js-surface-react-native.js"
    			}
    		}
    	},
        browserify: {
            jsSurface: {
                src: 'build/packages/js-surface.js',
                dest: 'dist/v<%= pkg.version %>/js-surface-<%= pkg.version %>.js'
            },
            jsSurfaceInferno: {
    	        src: 'build/packages/js-surface-react.js',
                dest: 'dist/v<%= pkg.version %>/js-surface-react-<%= pkg.version %>.js'
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
            jsSurface: {
                src: ['dist/js-surface.js'],
                dest: 'dist/js-surface.min.js'
            },
            jsSurfaceInferno: {
                src: ['dist/js-surface-inferno.js'],
                dest: 'dist/js-surface-inferno.min.js'
            },
            jsSurfaceReactDOM: {
                src: ['dist/js-surface-react-dom.js'],
                dest: 'dist/js-surface-react-dom.min.js'
            },
            jsSurfaceReactNative: {
                src: ['dist/js-surface-react-dom.js'],
                dest: 'dist/js-surface-react-native.min.js'
            }
        },
        compress: {
            jsSurface: {
                options: {
                    mode: 'gzip'
                },
                src: ['dist/js-surface.min.js'],
                dest: 'dist/js-surface.min.js.gz'
            },
            jsSurfaceInferno: {
                options: {
                    mode: 'gzip'
                },
                src: ['dist/js-surface-inferno.min.js'],
                dest: 'dist/js-surface-inferno.min.js.gz'
            },
            jsSurfaceReactDOM: {
                options: {
                    mode: 'gzip'
                },
                src: ['dist/js-surface-react-dom.min.js'],
                dest: 'dist/js-surface-react-dom.min.js.gz'
            },
            jsSurfaceReactNative: {
                options: {
                    mode: 'gzip'
                },
                src: ['dist/js-surface-react-native.min.js'],
                dest: 'dist/js-surface-react-native.min.js.gz'
            },
        },
       asciidoctor: [{
           options: {
               cwd: 'doc'
           },
           files: {
             'dist/docs': ['*.adoc'],
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
    grunt.loadNpmTasks('grunt-webpack');

    grunt.registerTask('compile', ['babel']);
    grunt.registerTask('test', ['babel', 'mochaTest']);
    grunt.registerTask('dist', ['clean', 'babel', 'webpack',  'uglify', 'compress'/*, 'esdoc'*/]);
    grunt.registerTask('default', ['dist']);
};
