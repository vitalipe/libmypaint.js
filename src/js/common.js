// utils
function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
}

function isNumber(value) {
    return (typeof value === "number");
}

function bind(func, ctx) {
    return function() { return func.apply(ctx, arguments);}
}

function forEachKeyIn(obj, iteratee) {
    Object.keys(obj || {}).forEach(function(key) { iteratee(key, obj[key])});
}

function rgb2hsv () {
    var rr, gg, bb,
    r = arguments[0] / 255,
    g = arguments[1] / 255,
    b = arguments[2] / 255,
    h, s,
    v = Math.max(r, g, b),
    diff = v - Math.min(r, g, b),
    diffc = function(c){
        return (v - c) / 6 / diff + 1 / 2;
    };

    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        }else if (g === v) {
            h = (1 / 3) + rr - bb;
        }else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: h,
        s: s,
        v: v
    };
}
