var shell = require('shelljs');
var _ = require('lodash');


module.exports = function(grunt) {

    const defaults = {
        "version-file" : "src/native/libmypaint/SConscript",
        "version-var-name" : "brushlib_version",
        "version" : "UNKNOWN",
        "dest" : "bin/info",
        "export-name" : "INFO"

    };

    var exec = function(cmd, failError) {
        var result = shell.exec(cmd, {silent: true});

        if (result.code !== 0)
            grunt.fail.fatal(failError);

        return result.output;
    };

    var fetchLibMyPaintVersion = function(config) {
        var cmd = [];

        cmd.push("grep -m1");
        cmd.push(config["version-var-name"]);
        cmd.push(config["version-file"]);
        cmd.push("| cut -f2 -d'=' | tr -d \"[:space:]'\"");

        cmd = cmd.join(" ");

        return exec(cmd, "failed to get libmypaint version!");
    };

    var fetchLibMyPaintCommitID = function() {
        var cmd = 'git submodule status | grep -E -o  "[0-9a-f]{40}" | tr -d "\\n" ';
        return exec(cmd, "failed to get libmypaint commid hash!");
    };

    var fetchCommitID = function() {
        var countDirtyFilesCmd = 'git status -s | grep -c " M "';
        var getCommitHashCmd = 'git rev-parse HEAD | grep -E -o  "[0-9a-f]{40}" | tr -d "\\n" ';

        var dirtyCount = parseInt(exec(countDirtyFilesCmd, "failed to get git status!"));
        var hash = exec(getCommitHashCmd, "failed to get git commit hash!");

        return hash + (dirtyCount > 0 ? "*" : "");
    };

    var task = function() {
        var config = this.options();

        config = _.defaults(config, defaults);
        config = _.extend(config, this.data);

        var info = {
            build : config.build,
            libmypaint_version : fetchLibMyPaintVersion(config),
            libmypaint_commit_id : fetchLibMyPaintCommitID(),
            version : config.version,
            commit_id : fetchCommitID(),
            build_time : Date.now()
        };

        grunt.file.write(config.dest, "var " + config["export-name"] + "=" + JSON.stringify(info));
    };

    // register
    grunt.registerMultiTask("info", task);
};
