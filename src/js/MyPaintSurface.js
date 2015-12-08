

var MyPaintSurface = (function(Bindings) {

    var MyPaintSurface = function(drawDab, getColor) {
        this._bindings = new Bindings(drawDab, getColor);
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

        this._bindings.reset_brush();
        return this;
    };

    MyPaintSurface.prototype.newStroke = function(x,y) {
        this._bindings.reset_brush();
        return this.hover(x,y,10);
    }

    MyPaintSurface.prototype.stroke = function(x,y, dt, pressure, xtilt, ytilt) {
        pressure = isNumber(pressure) ? pressure : 0.5;
        xtilt = (xtilt || 0.0);
        ytilt = (ytilt || 0.0);
        dt = (dt || 0.1);

        this._bindings.stroke_to(x,y, pressure, xtilt, ytilt, dt);
        return this;
    }

    MyPaintSurface.prototype.hover = function(x,y, dt) {
        return this.stroke(x,y, dt, 0, 0, 0);
    }


    return MyPaintSurface;


})(Bindings);
