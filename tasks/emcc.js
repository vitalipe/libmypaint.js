var path = require("path");
var shell = require('shelljs');
var _ = require('lodash');


module.exports = function(grunt) {

    const defaults = {
        "compiler" : "emcc",
        "main" : "main.c",
        "bin" : "a.out",
        "flags" : [],
        "libs" : [],
        "optimization" : "O0",
        "options" : {},

        "wrapper" : {
            head :  undefined,
            tail :  undefined
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

    var task = function() {
        var cmd = [];
        var config = _.defaults(this.data, defaults);

        cmd.push(config.compiler);
        cmd.push(config.main);
        cmd.push(config.libs.map(function(lib) { return "-I " + lib }).join(" "));
        cmd.push("-o " + config.bin);
        cmd.push("-" + config.optimization);

        if (config.wrapper.head) cmd.push("--pre-js " + config.wrapper.head);
        if (config.wrapper.tail) cmd.push("--post-js " + config.wrapper.tail);

        cmd.push(parseOptions(config.options || {}));

        exec(cmd.join(" "), "failed to compile...")
    };

    // register
    grunt.registerMultiTask("emcc", task);
};