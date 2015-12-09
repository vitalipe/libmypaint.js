

module.exports = function(grunt) {


    grunt.initConfig({
        "emcc" : {
            options : {
                main : "src/native/main.c",
                flags : ["-Wall"],
                libs : ["src/native/libmypaint"],

                options : {
                    "EXPORTED_FUNCTIONS" : "\"['_init', '_stroke_to', '_reset_brush', '_set_brush_base_value', '_set_brush_mapping_n', '_set_brush_mapping_point', '_new_brush']\"",
                    "NO_EXIT_RUNTIME" : "1",
                    "RESERVED_FUNCTION_POINTERS" : "2",
                    "NO_FILESYSTEM" : "1",
                    "MODULARIZE" : "1",
                    "NO_BROWSER" : "1"
                }
            },

            debug : {
                optimization : "O0",
                bin : "bin/lib.debug.js",
            },

            release : {
                optimization : "O3",
                args : ["--memory-init-file 0"],
                bin : "bin/lib.release.js"
            }

        },

        clean : ["bin/*", "!bin/.gitkeep"],

        concat : {

            "js-wrapper" : {
                src: ["src/js/common.js", "src/js/Bindings.js", "src/js/Painter.js", "src/js/_exports.js"],
                dest: "bin/wrapper.js"
            },

            "umd-debug" : {
                    src: ["src/_UMD/_header", "bin/lib.debug.js", "bin/wrapper.js", "src/_UMD/_footer"],
                    dest: "bin/libmypaint.debug.js"
            },

            "umd-release" : {
                    src: ["src/_UMD/_header", "bin/lib.release.js", "bin/wrapper.js", "src/_UMD/_footer"],
                    dest: "bin/libmypaint.release.js"
            },

            "brushes" : {
                options : {
                    banner : "/* generated with 'grunt build-brushes' */ \n\n var brushes = [",
                    footer : "]",
                    separator : " , "
                },
                src : ["test/brushes/*/*.myb"],
                dest : "test/brushes/all-brushes.js"
            }
        }
    });


    // load
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.task.loadTasks("./tasks");

    // register
    grunt.registerTask("debug", ["emcc:debug", "concat:js-wrapper", "concat:umd-debug"]);
    grunt.registerTask("release", ["emcc:release", "concat:js-wrapper", "concat:umd-release"]);
    grunt.registerTask("build", ["clean", "debug"]);
    grunt.registerTask("build-brushes", ["concat:brushes"]);
};
