

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
            stroke_at : EM_Module.cwrap("stroke_at", "void", ["number", "number", "number"])
        }
    }


    var MyPaintSurface = function(drawDab, getColor) {
        this._bindings = setupEmscriptenBindings(drawDab, getColor);
        this._lastStroke = null;
    };

    MyPaintSurface.prototype.setBrush = function(brush) {
        // noop

        return this;
    };

    MyPaintSurface.prototype.newStroke = function(x,y) {
        this._lastStroke = Date.now();
        this._bindings.new_stroke();
        this._bindings.stroke_at(x,y, 1);

        return this;
    }

    MyPaintSurface.prototype.strokeAt = function(x,y, dt) {
        var now = Date.now();
        this._bindings.stroke_at(x,y, 0.1);
        this._lastStroke = now;

        return this;
    }

    return MyPaintSurface;


})(Module);
