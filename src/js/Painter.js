
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

        createFill : function(ctx, radius, hardness, r,g,b,a) {
            var fill;

            if (hardness >= 1)
                return "rgba(" + r + "," + g + "," + b + "," + a + ")";

            fill = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            fill.addColorStop(hardness, "rgba(" + r + "," + g + "," + b + "," + a + ")");
            fill.addColorStop(1, "rgba(" + r + "," + g + "," + b + ",0)");

            return fill;
        },

        /* taken form https://github.com/yapcheahshen/brushlib.js by Yap Cheah Shen :)  */
        drawDab : function(x,y,radius,r,g,b, a, hardness, alpha_eraser, aspect_ratio, angle, lock_alpha, colorize) {
            if (a === 0)
                return;

            r = Math.floor(r*256);
            g = Math.floor(g*256);
            b = Math.floor(b*256);
            hardness = Math.max(hardness, 0);

            var height = (radius*2 / aspect_ratio) / 2;
            var width = (radius * 2*1.3) / 2;
            var fill = canvasRenderer.createFill(this, radius, hardness, r,g,b,a);

            this.save();
            this.beginPath();


            // HACK: eraser hack
            if ( alpha_eraser == 0)
                this.globalCompositeOperation = "destination-out";

            this.translate(x, y);
            this.rotate(90 + angle );
            this.moveTo(0,  - height);
            this.bezierCurveTo(width,  - height, width,  height, 0 , height);
            this.bezierCurveTo( - width,  height, - width,  - height,  0 ,  - height);
            this.fillStyle = fill;
            this.fill();

            this.closePath();
            this.restore();
        }
    };

    var Painter = function(bindings) {
        this._bindings = bindings;
    };

    // static
    Painter.fromCanvas = function(ctx) {
        ctx = isFunction(ctx.getContext) ? ctx.getContext("2d") : ctx;
        return new Painter(new Bindings(bind(canvasRenderer.drawDab, ctx),  bind(canvasRenderer.getColor, ctx)));
    };

    Painter.prototype.setBrush = function(brush) {
        this._bindings.load_brush(brush);
        return this;
    };

    Painter.prototype.setColor = function(r,g,b) {
        var hsv = rgb2hsv(r,g,b);

        this._bindings.set_brush_base_value("color_h", hsv.h);
        this._bindings.set_brush_base_value("color_s", hsv.s);
        this._bindings.set_brush_base_value("color_v", hsv.v);

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

        this._bindings.stroke_to(x,y, pressure, 0, ytilt, dt);
        return this;
    }

    Painter.prototype.hover = function(x,y, dt) {
        return this.stroke(x,y, dt, 0, 0, 0);
    }

    return Painter;

})(Bindings);
