

module.exports = function(grunt) {


    grunt.initConfig({
        "emcc" : {
            libmypaint : {
                main : "src/native/main.c",
                bin : "bin/libmypaint.js",
                flags : ["-Wall"],
                libs : ["src/native/libmypaint"],
                "options" : {
                    "EXPORTED_FUNCTIONS" : "\"['_main']\"",
                    "NO_EXIT_RUNTIME" : "1",
                    "RESERVED_FUNCTION_POINTERS" : "1"
                },

                "wrapper" : {
                    head :  "bin/_header",
                    tail :  "bin/_footer"
                }
            }
        },

        clean : ["bin/*", "!bin/.gitkeep"],

        concat : {
            header : {
                src: ["src/_UMD/_header"],
                dest: "bin/_header"
            },

            footer : {
                src: ["src/js/libmypaint.js", "src/_UMD/_footer"],
                dest: "bin/_footer"
            }
        }
    });


    // load
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.task.loadTasks("./tasks");


    // register
    grunt.registerTask("build", ["clean", "concat:header", "concat:footer", "emcc:libmypaint"]);
};