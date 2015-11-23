

var Api = (function(EmModuleFactory) {

    var EM_Module = EmModuleFactory();

    return {
        test :  EM_Module.cwrap("ping", "number", ["number"])
    };

})(Module);