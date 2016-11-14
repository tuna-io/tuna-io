module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['server/test/*.js']
      }
    }

    // eslint: {
    //   target: ['client/src/moudles/*.js']
    // }
    // go: {
    //   options: {
    //     GOPATH: ["./server/"]
    //   },

    //   myapp: {
    //     output: "app",
    //     src: ["main.go"]
    //   }
    // }
    // uglify: {
    //   options: {
    //     banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
    //   },
    //   build: {
    //     src: 'src/<%= pkg.name %>.js',
    //     dest: 'build/<%= pkg.name %>.min.js'
    //   }
    // }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-go');
  grunt.loadNpmTasks('grunt-eslint');

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  // grunt.registerTask('dev', [
  //   'go'
  // ]);

  // grunt.registerTask('lint', [
  //   'eslint'
  // ]);
};