

var Api = (function(EmModuleFactory) {



    var createGetColorProxy = function(EM_Module, getColor) {

        return function(x, y, radius, r_ptr, g_ptr, b_ptr, a_ptr) {
            var result = getColor(x,y,radius);

            EM_Module.setValue(r_ptr, result[0], "float");
            EM_Module.setValue(g_ptr, result[1], "float");
            EM_Module.setValue(b_ptr, result[2], "float");
            EM_Module.setValue(a_ptr, result[3], "float");
        };
    };


    return function(drawDab, getColor) {
        var EM_Module = EmModuleFactory();

        var colorProxyPtr = EM_Module.Runtime.addFunction(createGetColorProxy(EM_Module, getColor));
        var drawDabProxyPtr = EM_Module.Runtime.addFunction(drawDab);

        EM_Module.ccall("register_callbacks", "void", ["number", "number"], [drawDabProxyPtr, colorProxyPtr]);
    };

})(Module);