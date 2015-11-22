
var _id = 0;




var MyPaintSurface = function(canvas) {
    this._id = ++_id;
    this._ctx = canvas.getContext("2d");
};

MyPaintSurface.prototype.startStroke = function(brush, x, y) {};
MyPaintSurface.prototype.strokeAt = function(x, y) {};



// export
exports.MyPaintSurface = MyPaintSurface;