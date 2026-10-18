module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    // JSHint task configuration
    jshint: {
      // Define which files to lint
      files: ['Gruntfile.js', '*.js', 'test/**/*.js'],
      
      // Configure JSHint options
      options: {
        esversion: 9,      // Target ECMAScript 6 (change based on your project)
        node: true,        // Enable Node.js global variables (process, require, etc.)
        browser: false,    // Disable browser globals if this is purely a Node app
        undef: true,       // Warn when variables are used before being defined
        unused: false,     // Warn when variables are defined but never used
        
        // Optional: Reference an external configuration file (.jshintrc) instead
        // jshintrc: true 
      }
    }
  });

  // Load the plugin that provides the "jshint" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Register the default task to run jshint.
  grunt.registerTask('default', ['jshint']);

};
