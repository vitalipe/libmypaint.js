var MyPaintCanvasSurface = (function(MyPaintSurface) {


    function getColor(x,y, radius) {

	    var image = this.getImageData(x, y, 1, 1);
        var pixel = image.data;

        pixel[0] /= 255;
        pixel[1] /= 255;
        pixel[2] /= 255;
        pixel[3] /= 255;

        console.log("color", pixel);
        return pixel;
    }

    function drawDab(x,y,radius,r,g,b, opaque,hardness,alpha_eraser, aspect_ratio, angle, lock_alpha, colorize) {
        // todo
    }


    var MyPaintCanvasSurface = function(ctx) {
        ctx = isFunction(ctx.getContext) ? ctx.getContext("2d") : ctx;

        // call parent constructor
        MyPaintSurface.call(this, bind(drawDab, ctx), bind(getColor, ctx));
    };

    MyPaintCanvasSurface.prototype = Object.create(MyPaintSurface.prototype);
    MyPaintCanvasSurface.prototype.constructor = MyPaintCanvasSurface;


    return MyPaintCanvasSurface;

})(MyPaintSurface);
