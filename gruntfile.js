

module.exports = function(grunt) {


    grunt.initConfig({
        "emcc" : {
            libmypaint : {
                main : "src/native/main.c",
                bin : "bin/lib.js",
                flags : ["-Wall"],
                libs : ["src/native/libmypaint"],
                optimization : "O0",
                "options" : {
                    "EXPORTED_FUNCTIONS" : "\"['_main','_register_callbacks']\"",
                    "NO_EXIT_RUNTIME" : "1",
                    "RESERVED_FUNCTION_POINTERS" : "2",
                    "NO_FILESYSTEM" : "1",
                    "MODULARIZE" : "1"
                }
            }
        },

        clean : ["bin/*", "!bin/.gitkeep"],

        concat : {

            js : {
                src: ["src/js/Api.js", "src/js/MyPaintSurface.js"],
                dest: "bin/wrapper.js"
            },

            umd : {
                src: ["src/_UMD/_header", "bin/lib.js", "bin/wrapper.js", "src/_UMD/_footer"],
                dest: "bin/libmypaint.js"
            }
        }
    });


    // load
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.task.loadTasks("./tasks");


    // register
    grunt.registerTask("build", ["clean", "emcc:libmypaint", "concat:js", "concat:umd"]);
};