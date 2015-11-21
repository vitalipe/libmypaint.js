var path = require("path");
var shell = require('shelljs');


module.exports = function(grunt) {

    var C_CONFIG = {
        "COMPILER" : "emcc",
        "MAIN" : path.join("src", "native", "main.c"),
        "BIN" : path.join("bin", "lib.js"),
        "FLAGS" : ["-Wall"],
        "LIBS" : [path.join("src", "native", "libmypaint")],
        "OPTIONS" : {
            "EXPORTED_FUNCTIONS" : "\"['_main']\"",
            "NO_EXIT_RUNTIME" : "1",
            "RESERVED_FUNCTION_POINTERS" : "2"
        }
    };
    
    var exec = function(cmd, failError) {
        var result = shell.exec(cmd, {silent: false});

        if (result.code !== 0)
            grunt.fail.fatal(failError);
    };

    var parseOptions = function(options) {
        return Object.keys(options).map(function(option) { 
            return "-s " + option + "=" + options[option] 
        }).join(" ");
    };

    var tasks = {
        "build-libmypaint" : function() {
            var cmd = [];
            var options = parseOptions(C_CONFIG.OPTIONS);

            cmd.push(C_CONFIG.COMPILER);
            cmd.push(C_CONFIG.MAIN);
            cmd.push(C_CONFIG.LIBS.map(function(lib) { return "-I " + lib }).join(" "));
            cmd.push("-o " + C_CONFIG.BIN);
            cmd.push(options);

            exec(cmd.join(" "), "failed to compile...")
        }
    };


    grunt.registerTask("build", tasks["build-libmypaint"]);
};