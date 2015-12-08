
var Painter = (function(Bindings) {

    var canvasRenderer = {
        getColor : function(x,y, radius) {
            var image = this.getImageData(x, y, 1, 1);
            var pixel = image.data;

            pixel[0] /= 255;
            pixel[1] /= 255;
            pixel[2] /= 255;
            pixel[3] /= 255;

            return pixel;
        },

        drawDab : function(x,y,radius,r,g,b, a, hardness, alpha_eraser, aspect_ratio, angle, lock_alpha, colorize) {
            console.log("dab");
        }
    }


    var Painter = function(bindings) {
        this._bindings = bindings;
    };

    // static
    Painter.fromCanvas = function(ctx) {
        ctx = isFunction(ctx.getContext) ? ctx.getContext("2d") : ctx;
        return new Painter(new Bindings(bind(canvasRenderer.drawDab, ctx),  bind(canvasRenderer.getColor, ctx)));
    };

    Painter.prototype.setBrush = function(brush) {
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

    Painter.prototype.newStroke = function(x,y) {
        this._bindings.reset_brush();
        return this.hover(x,y,10);
    }

    Painter.prototype.stroke = function(x,y, dt, pressure, xtilt, ytilt) {
        pressure = isNumber(pressure) ? pressure : 0.5;
        xtilt = (xtilt || 0.0);
        ytilt = (ytilt || 0.0);
        dt = (dt || 0.1);

        this._bindings.stroke_to(x,y, pressure, xtilt, ytilt, dt);
        return this;
    }

    Painter.prototype.hover = function(x,y, dt) {
        return this.stroke(x,y, dt, 0, 0, 0);
    }

    return Painter;

})(Bindings);
