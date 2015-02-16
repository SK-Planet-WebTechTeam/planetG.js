
/*jshint node:true */
module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      scripts: {
        files: ['src/**/*.hbs', 'src/**/*.md'],
        tasks: ['default'],
        options: {
          spawn: false,
        },
      },
    },
    assemble: {
      options: {
        layout: 'index.hbs',
        layoutdir: './src/layout/',
        assets: 'res',
        flatten:true,
        collections: [{
          title:'items',
          name: 'items',
          inflection: 'sub-item',
          sortby: 'order',
          sortorder: 'asc',
          index: 'src/layout/index.hbs'
        }]
      },
      items: {
        files: {
          './index': './src/content/**/*.md'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('assemble' );


  // Default task.
  grunt.registerTask('default', ['assemble', 'watch']);
  // grunt.registerTask('dev', ['clean', 'concat', 'uglify', 'watch']);

};
