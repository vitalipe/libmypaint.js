exports.MyPaintSurface = (function(Api) {


    function _getColor(ctx, x,y, radius) {
        return [1,1,1,1];
    }

    function _drawDab(ctx) {
        console.log("FIXME");
    }

    var MyPaintSurface = function(ctx) {
        this._ctx = ctx;
        this._Api =  new Api(_drawDab.bind(ctx), _getColor.bind(ctx));
    };

    MyPaintSurface.prototype.startStroke = function(brush, x, y) {};
    MyPaintSurface.prototype.strokeAt = function(x, y) {};


    return MyPaintSurface;

})(Api);



