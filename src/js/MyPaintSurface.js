

var MyPaintSurface = (function(EmModuleFactory) {


    var createGetColorProxy = function(EM_Module, getColor) {
        return function(x, y, radius, r_ptr, g_ptr, b_ptr, a_ptr) {
            var result = getColor(x,y,radius);

            EM_Module.setValue(r_ptr, result[0], "float");
            EM_Module.setValue(g_ptr, result[1], "float");
            EM_Module.setValue(b_ptr, result[2], "float");
            EM_Module.setValue(a_ptr, result[3], "float");
        };
    };

    var setupEmscriptenBindings = function(drawDab, getColor) {
        var EM_Module = EmModuleFactory();

        var colorProxyPtr = EM_Module.Runtime.addFunction(createGetColorProxy(EM_Module, getColor));
        var drawDabProxyPtr = EM_Module.Runtime.addFunction(drawDab);

        EM_Module.ccall("init", "void", ["number", "number"], [drawDabProxyPtr, colorProxyPtr]);

        return {
            EM_Module : EM_Module,

            new_stroke : EM_Module.cwrap("new_stroke"),
            stroke_at : EM_Module.cwrap("stroke_at", "void", ["number", "number", "number", "number", "number", "number"]),

            new_brush : EM_Module.cwrap("new_brush"),
            set_brush_base_value : EM_Module.cwrap("set_brush_base_value", "void", ["string", "number"]),
            set_brush_mapping_n : EM_Module.cwrap("set_brush_mapping_n", "void", ["string", "string", "number"]),
            set_brush_mapping_point : EM_Module.cwrap("set_brush_mapping_point", "void", ["string", "string", "number", "number", "number"])
        }
    }


    var MyPaintSurface = function(drawDab, getColor) {
        this._bindings = setupEmscriptenBindings(drawDab, getColor);
    };

    MyPaintSurface.prototype.setBrush = function(brush) {
        var bindings = this._bindings;
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

        return this.newStroke();
    };

    MyPaintSurface.prototype.newStroke = function() {
        this._bindings.new_stroke();
        return this;
    }

    MyPaintSurface.prototype.stroke = function(x,y, dt, pressure, xtilt, ytilt) {
        pressure = (pressure || 0.4);
        xtilt = (xtilt || 0.0);
        ytilt = (ytilt || 0.0);
        dt = (dt || 0.1);

        this._bindings.stroke_at(x,y, pressure, xtilt, ytilt, dt);
        return this;
    }

    return MyPaintSurface;


})(Module);
