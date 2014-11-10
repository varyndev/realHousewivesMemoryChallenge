/* Gruntfile for Real Housewives Memory Challenge HTML5 project production packging.
 *
 *         Project Dependencies:
 npm install grunt --save-dev
 npm install grunt-contrib-clean --save-dev
 npm install grunt-contrib-watch --save-dev
 npm install grunt-contrib-imagemin --save-dev
 npm install grunt-contrib-htmlmin --save-dev
 npm install grunt-contrib-concat --save-dev
 npm install time-grunt --save-dev
 npm install grunt-exec --save-dev

 * Real Housewives Memory Challenge workflow:
 *   (if release) clean the distrib folder
 *   copyin from Enginesis game work area to source folder
 *   (if release) copy the source folder to the distrib folder
 *   concat + uglify the JS
 *   (if release) imagemin the images into the distrib folder
 *   copy the minified source files from distrib folder to game work area
 *   (if release) build distribution package
 */

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            lib: {
                src: [
                    'source/lib/enginesis.js',
                    'source/lib/ShareHelper.js'
                ],
                dest: 'source/lib/enginesis.min.js'
            },
            dist: {
                src: [
                    'source/js/AchievementItem.js',
                    'source/js/AnimationHandler.js',
                    'source/js/AwardsPopup.js',
                    'source/js/ChallengeIntroduction.js',
                    'source/js/CreditsPopup.js',
                    'source/js/GameComplete.js',
                    'source/js/GameGUI.js',
                    'source/js/GameOptions.js',
                    'source/js/GameResults.js',
                    'source/js/GUIButton.js',
                    'source/js/InfoPopup.js',
                    'source/js/LevelButton.js',
                    'source/js/LevelIntroduction.js',
                    'source/js/MainMenu.js',
                    'source/js/MessagePopup.js',
                    'source/js/Nemesis.js',
                    'source/js/SharePopup.js',
                    'source/js/AdPopup.js',
                    'source/js/UserData.js'
                ],
                dest: 'source/js/MemoryMatch.min.js'
            }
        },

        uglify: {
            lib: {
                src: 'source/lib/enginesis.min.js',
                dest: 'distrib/lib/enginesis.min.js'
            },
            build: {
                src: 'source/js/MemoryMatch.min.js',
                dest: 'distrib/js/MemoryMatch.min.js'
            }
        },

        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'source/assets',
                    src: ['**/*.{png,jpg}'],
                    dest: 'distrib/assets'
                }]
            }
        },

        watch: {
            files: ['source/js/*.js', 'source/assets/*.png', 'source/assets/*.jpg'],
            tasks: 'default'
        },

        /* Clean out the distrib folder so we make sure we get a clean copy of everything */
        clean: {
			release: ["distrib/js", "distrib/lib", "distrib/assets", "distrib/images", "distrib/*.html", "distrib/*.appcache"]
		},

        exec: {
        	/* Make a distribution package */
			package: {
				command: 'sh ./package.sh',
				stdout: true,
				stderr: true
			},
        	/* Copy files from the development area into the build area */
			copyin: {
				command: 'sh ./copyin.sh',
				stdout: true,
				stderr: true
			},
			/* Copy the build files into the distribution holding area */
            copydistrib: {
                command: 'rsync -av source/ distrib',
                stdout: true,
                stderr: true
            },
            /* After minify, copy the minified game files to the destination folders so we stay in-sync */
            copymin: {
                command: 'cp distrib/js/MemoryMatch.min.js source/js/MemoryMatch.min.js && cp distrib/js/MemoryMatch.min.js ../../websites/enginesis/public/games/RealHousewivesMemoryChallenge/js/MemoryMatch.min.js',
                stdout: true,
                stderr: true
            },
            /* After minify, copy the minified library files to the destination folders so we stay in-sync */
            copyenginesismin: {
                command: 'cp distrib/lib/enginesis.min.js source/lib/enginesis.min.js && cp distrib/lib/enginesis.min.js ../../websites/enginesis/public/games/RealHousewivesMemoryChallenge/lib/enginesis.min.js',
                stdout: true,
                stderr: true
            }
        }
    });

    // Tell Grunt we plan to use these plug-ins:
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-exec');

    // Run grunt default (or just grunt) to update the build area and minify the code for release testing
    // Run grunt release to update the build area, minify, optimize images, and package a distribution
    grunt.registerTask('default', ['exec:copyin', 'concat', 'uglify', 'exec:copymin', 'exec:copyenginesismin']);
    grunt.registerTask('release', ['clean:release', 'exec:copyin', 'exec:copydistrib', 'concat', 'uglify', 'imagemin', 'exec:copymin', 'exec:copyenginesismin', 'exec:package']);

};
