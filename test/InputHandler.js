/*
* This Class abstracts input event management, and will
* send us normalized coordinates & delta times
*/
var InputHandler = function(element) {

    // private
    var _onDrawStart = function() {};
    var _onDrawAt = function() {};
    var _onDrawEnd = function() {};

    var _state = null;
    var _rect = element.getBoundingClientRect();

    var _lastX = 0;
    var _lastY = 0;
    var _lastTime = null;

    var isTouchEvent = function(evt) {
        return (evt.type === "touchmove"
        || evt.type === "touchstart"
        || evt.type === "touchend");
    };

    var invokeCallback = function(callback, evt) {
        var x, y;
        var dt = (_lastTime ? evt.timeStamp - _lastTime : 0) / 1000;

        if (isTouchEvent(evt)) {
            if (evt.type !== "touchend") {
                x = evt.touches[0].pageX - _rect.left;
                y = evt.touches[0].pageY - _rect.top;
            }
            else { // touchend events don't have position info...
                x = _lastX;
                y = _lastY;
            }
        }
        else { // mouse event
            x = evt.pageX - _rect.left;
            y = evt.pageY - _rect.top;
        }

        _lastTime = evt.timeStamp;
        _lastX = x;
        _lastY = y;

        callback(x,y,dt);
    };

    var changeState = function(state, callback, evt) {
        _state = state;
        invokeCallback(callback, evt);
    }

    var WaitingState = function(e) {
        if (!isTouchEvent(e) && e.which != 1) // accept only left clicks
            return;

        if (e.type !== "mousedown" && e.type !== "touchstart")
            return;

        changeState(DrawingState, _onDrawStart, e);
    };

    var DrawingState = function(e) {
        if (!isTouchEvent(e) && e.which != 1) // accept only left clicks
            return;

        if (e.type === "mouseup" || e.type === "mouseout" || e.type === "touchend")
            changeState(WaitingState, _onDrawEnd, e);


        if (e.type === "mousemove" || e.type === "touchmove")
            changeState(DrawingState, _onDrawAt, e);
    };

    var handleInputEvent = function(e) { return _state(e)};

    // mouse events
    element.addEventListener("mouseup", handleInputEvent);
    element.addEventListener("mouseout", handleInputEvent);
    element.addEventListener("mousemove", handleInputEvent);
    element.addEventListener("mousedown", handleInputEvent);

    // touch events
    element.addEventListener("touchstart", handleInputEvent);
    element.addEventListener("touchmove", handleInputEvent);
    element.addEventListener("touchend", handleInputEvent);

    _state = WaitingState;

    // public
    this.onDrawStart = function(handler) { _onDrawStart = handler; };
    this.onDrawAt = function(handler) { _onDrawAt = handler; };
    this.onDrawEnd = function(handler) {_onDrawEnd = handler; };

};
