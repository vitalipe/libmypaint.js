

var Bindings = (function(EmModuleFactory) {


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

        EM_Module.ccall("init", "void", ["number", "number"], [drawDabProxyPtr, colorProxyPtr]);

        return {
            Module : EM_Module,
            stroke_to : EM_Module.cwrap("stroke_to", "void", ["number", "number", "number", "number", "number", "number"]),

            new_brush : EM_Module.cwrap("new_brush"),
            reset_brush : EM_Module.cwrap("reset_brush"),
            set_brush_base_value : EM_Module.cwrap("set_brush_base_value", "void", ["string", "number"]),
            set_brush_mapping_n : EM_Module.cwrap("set_brush_mapping_n", "void", ["string", "string", "number"]),
            set_brush_mapping_point : EM_Module.cwrap("set_brush_mapping_point", "void", ["string", "string", "number", "number", "number"])
        }
    };

})(Module);
