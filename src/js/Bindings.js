

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

    var loadBrush = function(brush) {
        var bindings = this;
        var settings = brush.settings;

        bindings.new_brush();

        forEachKeyIn(settings, function(settingName, setting) {
            bindings.set_brush_base_value(settingName, (setting.base_value || 0.0));

            forEachKeyIn(setting.inputs, function(inputName, input) {
                bindings.set_brush_mapping_n(settingName, inputName, (input.length));

                input.forEach(function(point, index) {
                    bindings.set_brush_mapping_point(settingName, inputName, index, point[0], point[1]);
                });
            });
        });

        bindings.reset_brush();
    };

    return function(drawDab, getColor) {
        var EM_Module = EmModuleFactory();

        var colorProxyPtr = EM_Module.Runtime.addFunction(createGetColorProxy(EM_Module, getColor));
        var drawDabProxyPtr = EM_Module.Runtime.addFunction(drawDab);

        EM_Module.ccall("init", "void", ["number", "number"], [drawDabProxyPtr, colorProxyPtr]);

        this.Module = EM_Module;
        this.stroke_to = EM_Module.cwrap("stroke_to", "void",
            ["number", "number", "number", "number", "number", "number"]);

        this.load_brush = bind(loadBrush, this);
        this.new_brush = EM_Module.cwrap("new_brush");
        this.reset_brush = EM_Module.cwrap("reset_brush");

        // Using the slower ccall() method, because cwrap() has a weird bug on FF when using strings :(
        this.set_brush_base_value = function(name, value) {
            EM_Module.ccall("set_brush_base_value", "void", ["string", "number"], [name, value]);
        };

        this.set_brush_mapping_n = function(name, mapping, n) {
            EM_Module.ccall("set_brush_mapping_n", "void", ["string", "string", "number"], [name, mapping, n]);
        };

        this.set_brush_mapping_point = function(name, mapping, index, x,y) {
            EM_Module.ccall("set_brush_mapping_point", "void",
                ["string", "string", "number", "number", "number"], [name, mapping, index, x,y]);
        }
    };

})(Module);
