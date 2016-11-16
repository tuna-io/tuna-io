module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
        },
        src: ['server/test/*.js'],
      },
    },
    eslint: {
      options: {
        configFile: '.eslintrc.js',
      },
      target: ['*'],
    },
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-go');
  grunt.loadNpmTasks('grunt-eslint');

  grunt.registerTask('test', [
    'mochaTest',
  ]);
  grunt.registerTask('build', [
    'test', 'eslint',
  ]);
};

