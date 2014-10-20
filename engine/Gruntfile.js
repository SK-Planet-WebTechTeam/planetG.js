module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      'dist/pwge.all.js': [
        'module/pwge/config.js',
        'module/pwge/game.js',
        'module/pwge/canvas.js',
        'module/pwge/boardManager.js',
        'module/pwge/entity.js',
        'module/pwge/input.js',
        'module/pwge/loader.js',
        'module/pwge/renderer.js',
        'module/pwge/runtime.js',
        'module/pwge/sound.js',
        'module/pwge/spriteManager.js',
        'module/pwge/util.js'
      ],
      'dist/util.all.js': [
        'module/util/easing.js',
        'module/util/ObjectPool.js',
        'module/util/PubSub.js'
      ]
    },
    "uglify": {
      options: {
        preserveComments:'some',
        compress: {
          global_defs: {
            "DEBUG": false
          }
        },
        mangle: {
          except: []
        }
      },
      my_target: {
        files: {
          'dist/pwge.min.js': ['dist/pwge.all.js', 'dist/util.all.js']
        }
      }
    },
    shell : {
        jsdoc : {
            command: 'jsdoc module/pwge/*.js module/util/*.js -d doc'
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-shell');

  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify', 'shell:jsdoc']);

};
