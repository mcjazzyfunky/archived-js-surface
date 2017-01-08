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
				presets: ["es2015", "es2016", "es2017"],
                retainLines: true,
                moduleIds: false,
                sourceMaps: true
            },
            dist:  {
                files: [{
                    expand: true,
                    cwd: './',
                    src: ['core/**/*.js*', 'src/main/**/*.js*', 'util/**/*.js'],
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
        browserify: {
            jsSurfaceStandalone: {
                src: 'build/src/main/js-surface-standalone.js',
                dest: 'dist/standalone.js',
                options: {
					alias: {
				    	'js-surface': './build/src/main/js-surface-standalone.js'
					}
                }
            },
            jsSurfaceInferno: {
                src: 'build/src/main/js-surface-inferno.js',
                dest: 'dist/inferno.js',
            	options: {
					alias: {
				    	'js-surface': './build/src/main/js-surface-inferno.js'
					},
            		ignore: ['./node_modules/**']
            	}
            },
            jsSurfaceReactDOM: {
    	        src: 'build/src/main/js-surface-react-dom.js',
                dest: 'dist/react-dom.js',
            	options: {
					alias: {
				    	'js-surface': './build/src/main/js-surface-react-dom.js'
					},
            		ignore: ['./node_modules/**']
            	}
            },
            jsSurfaceReactNative: {
    	        src: 'build/src/main/js-surface-react-native.js',
                dest: 'dist/react-native.js',
            	options: {
					alias: {
				    	'js-surface': './build/src/main/js-surface-react-native.js'
					},
            		ignore: ['./node_modules/**']
            	}
            },
            jsSurfaceReactLite: {
    	        src: 'build/src/main/js-surface-react-lite.js',
                dest: 'dist/react-lite.js',
            	options: {
            		ignore: ['./node_modules/**'],
					alias: {
				    	'js-surface': './build/src/main/js-surface-react-lite.js'
					}
            	}
            },
            jsSurfacePreact: {
    	        src: 'build/src/main/js-surface-preact.js',
                dest: 'dist/preact.js',
            	options: {
            		ignore: ['./node_modules/**'],
					alias: {
				    	'js-surface': './build/src/main/js-surface-preact.js'
					}
            	}
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
            jsSurfaceStandalone: {
                src: ['dist/standalone.js'],
                dest: 'dist/standalone.min.js'
            },
            jsSurfaceInferno: {
                src: ['dist/inferno.js'],
                dest: 'dist/inferno.min.js'
            },
            jsSurfaceReactDOM: {
                src: ['dist/react-dom.js'],
                dest: 'dist/react-dom.min.js'
            },
            jsSurfaceReactNative: {
                src: ['dist/react-native.js'],
                dest: 'dist/react-native.min.js'
            },
            jsSurfaceReactLite: {
                src: ['dist/react-lite.js'],
                dest: 'dist/react-lite.min.js'
            },
            jsSurfacePreact: {
                src: ['dist/preact.js'],
                dest: 'dist/preact.min.js'
            }
        },
        compress: {
            jsSurfaceStandalone: {
                options: {
                    mode: 'gzip',
            		level: 9
                },
                src: ['dist/standalone.min.js'],
                dest: 'dist/standalone.min.js.gz'
            },
            jsSurfaceInferno: {
                options: {
                    mode: 'gzip',
            		level: 9
                },
                src: ['dist/inferno.min.js'],
                dest: 'dist/inferno.min.js.gz'
            },
            jsSurfaceReactDOM: {
                options: {
                    mode: 'gzip',
            		level: 9
                },
                src: ['dist/react-dom.min.js'],
                dest: 'dist/react-dom.min.js.gz'
            },
            jsSurfaceReactNative: {
                options: {
                    mode: 'gzip',
            		level: 9
                },
                src: ['dist/react-native.min.js'],
                dest: 'dist/react-native.min.js.gz'
            },
            jsSurfaceReactLite: {
                options: {
                    mode: 'gzip',
            		level: 9
                },
                src: ['dist/react-lite.min.js'],
                dest: 'dist/react-lite.min.js.gz'
            },
            jsSurfacePreact: {
                options: {
                    mode: 'gzip',
            		level: 9
                },
                src: ['dist/preact.min.js'],
                dest: 'dist/preact.min.js.gz'
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
    grunt.registerTask('dist', ['clean', 'babel', 'browserify', 'uglify', 'compress'/*, 'esdoc'*/]);
    grunt.registerTask('default', ['dist']);
};
