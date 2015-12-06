// utils
function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
};

function bind(func, ctx) {
    return function() { return func.apply(ctx, arguments);}
}

function forEachKeyIn(obj, iteratee) {
    Object.keys(obj || {}).forEach(function(key) { iteratee(key, obj[key])});
}
