/* Gruntfile for MatchMaster HTML5 project production packging.
 *
 *         Project Dependencies:
 npm install grunt --save-dev
 npm install grunt-contrib-watch --save-dev
 npm install grunt-contrib-imagemin --save-dev
 npm install grunt-contrib-htmlmin --save-dev
 npm install grunt-contrib-concat --save-dev
 npm install time-grunt --save-dev
 npm install grunt-exec --save-dev

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

        /* Copy the minified files to the destination folders so we stay in-sync */
        exec: {
            copymin: {
                command: 'cp distrib/js/MemoryMatch.min.js source/js/MemoryMatch.min.js && cp distrib/js/MemoryMatch.min.js ../../websites/enginesis/public/games/realHousewivesMemoryChallenge/js/MemoryMatch.min.js',
                stdout: true,
                stderr: true
            },
            copyenginesismin: {
                command: 'cp distrib/lib/enginesis.min.js source/lib/enginesis.min.js && cp distrib/lib/enginesis.min.js ../../websites/enginesis/public/games/realHousewivesMemoryChallenge/lib/enginesis.min.js',
                stdout: true,
                stderr: true
            }
        }
    });

    // Tell Grunt we plan to use these plug-ins:
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-exec');

    // Tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['concat', 'uglify', 'exec']);
    grunt.registerTask('release', ['concat', 'uglify', 'imagemin', 'exec']);

};
