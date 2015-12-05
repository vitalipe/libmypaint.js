// utils
function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
};

function bind(func, ctx) {
    return function() { return func.apply(ctx, arguments);}
}
