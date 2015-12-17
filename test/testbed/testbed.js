var InputType = {
    POINTER : "POINTER",
    MOUSE : "MOUSE",
    TOUCH : "TOUCH"
};

function isTouchDevice() { return 'ontouchstart' in window;}



var BrushColorInputView = function(color) {

    var _sliderRed = document.querySelector("#redColorInput");
    var _sliderGreen = document.querySelector("#greenColorInput");
    var _sliderBlue = document.querySelector("#blueColorInput");
    var _hexInput = document.querySelector("#colorHexInput");
    var _colorChangeCallback = _.noop;

    var _color2hex = function(color) {
        function toHex(c) {
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }

        return "#" +
            toHex(color[0]) +
            toHex(color[1]) +
            toHex(color[2]);
    };

    var _onColorChange = _.after(function() {
        var color = [parseInt(_sliderRed.value), parseInt(_sliderGreen.value), parseInt(_sliderBlue.value)];

        _hexInput.value = _color2hex(color);
        _hexInput.style.backgroundColor = _color2hex(color);
        _colorChangeCallback(color);
    }, 3); // ignore the 3 first calls, because Powerange will call them during init...

    // init
    _hexInput.value = _color2hex(color);
    new Powerange(_sliderRed, { callback : _onColorChange, min: 0, max: 255, start: color[0], vertical : true });
    new Powerange(_sliderGreen, {  callback : _onColorChange, min: 0, max: 255, start: color[1], vertical : true });
    new Powerange(_sliderBlue, {  callback : _onColorChange, min: 0, max: 255, start: color[2], vertical : true });

    // public
    this.onColorChange = function(callback) { _colorChangeCallback = callback; };
};


var BrushSelectView = function(brushes, selected) {
    var _element = document.querySelector("#brushSelector");
    var _onBrushSelectCallback = _.noop;

    var _createListDOM = function(element) {
        var optionTemplate = _.template("<option value=<%=index%> id='b<%=index%>'><%=name%></option>");
        var groupTemplate = _.template("<optgroup label='<%=name%>'><%=options%></optgroup>");

        element.innerHTML = _.map(brushes.groups, function(group, name) {
            return groupTemplate({
                name : name,
                options : group.map(optionTemplate).join("")
            });
        }).join("\n");
    };

    var _selectBrush = function(brush) {
        document.querySelector("#b" + brush.index).setAttribute("selected", "selected");
    };


    // init
    _element.onchange = function() {_onBrushSelectCallback(brushes.all[this.value]);};
    _createListDOM(_element);
    _selectBrush(selected);


    // public
    this.onBrushSelect = function(callback) { _onBrushSelectCallback = callback;}
};


var InputTypeSelectView = function(input) {
    var _pointer = document.querySelector("#inputTypePointer");
    var _touch = document.querySelector("#inputTypeTouch");
    var _mouse = document.querySelector("#inputTypeMouse");

    var _inputSelectCallback = _.noop;

    var _setSelectedElement = function(element) {
        [_pointer, _touch, _mouse].map(function(element) { element.classList.remove("btn-success")});
        element.classList.add("btn-success");
    };

    var _selectInput = function(input) {
        if (input === InputType.MOUSE)
            _setSelectedElement(_mouse);

        if (input === InputType.POINTER)
            _setSelectedElement(_pointer);

        if (input === InputType.TOUCH)
            _setSelectedElement(_touch);

    };

    var _willSelectInput = function(input) {
        return function () {
            _selectInput(input);
            _inputSelectCallback(input);
        }
    };

    _mouse.addEventListener("click", _willSelectInput(InputType.MOUSE));
    _pointer.addEventListener("click", _willSelectInput(InputType.POINTER));
    _touch.addEventListener("click", _willSelectInput(InputType.TOUCH));

    _mouse.addEventListener("touchstart", _willSelectInput(InputType.MOUSE));
    _pointer.addEventListener("touchstart", _willSelectInput(InputType.POINTER));
    _touch.addEventListener("touchstart", _willSelectInput(InputType.TOUCH));


    _selectInput(input);


    this.onInputSelect = function(callback) {_inputSelectCallback = callback};
};

var InputParamsView = function(pressure, xtilt, ytilt) {
    var _pressure = document.querySelector("#pressureInput");
    var _xtilt = document.querySelector("#xtiltInput");
    var _ytilt = document.querySelector("#ytiltInput");
    var _inputParamsUpdateCallback = _.noop;

    var _update = _.after(3, function() {
        _inputParamsUpdateCallback(parseFloat(_pressure.value), parseInt(_xtilt.value), parseInt(_ytilt.value));
    });

    new Powerange(_pressure, { callback : _update, decimal: true, min: 0, max: 1, start: pressure, vertical : true });
    new Powerange(_xtilt, { callback : _update, min: 0, max: 180, start: xtilt, vertical : true });
    new Powerange(_ytilt, { callback : _update, min: 0, max: 180, start: ytilt, vertical : true });


    this.onUpdate = function(callback) {_inputParamsUpdateCallback = callback};
};





var DrawController = (function() {

    var MouseInputHandler = function(canvas, painter, pressure, xtilt, ytilt) {
        var _rect =  canvas.getBoundingClientRect(); // assume no resize
        var _lastTime = 0;

        var _onMouseMove = function(e) {
            var dt = (_lastTime ? e.timeStamp - _lastTime : 0) / 1000;
            var x =  e.pageX - _rect.left;
            var y =  e.pageY - _rect.top;

            _lastTime = e.timeStamp;

            if (e.which === 1) // left mouse button is pressed?
                painter.stroke(x,y,dt, pressure, xtilt, ytilt);
            else
                painter.hover(x, y, dt); // same as stroke() with pressure 0
        };

        canvas.addEventListener("mousemove", _onMouseMove);


        // public
        this.destroy = canvas.removeEventListener.bind(canvas, "mousemove", _onMouseMove);
        this.shouldBeUpdated = _.negate(_.isEqual.bind(_,
            {
                inputMethod : InputType.MOUSE,
                pressure : pressure,
                xtilt : xtilt,
                ytilt : ytilt}
        ));
    };


    var PointerInputHandler = function(canvas, painter) {
        var _rect =  canvas.getBoundingClientRect(); // assume no resize
        var _lastTime = 0;

        var _onPointerMove = function(e) {
            var dt = (_lastTime ? e.timeStamp - _lastTime : 0) / 1000;
            var x =  e.pageX - _rect.left;
            var y =  e.pageY - _rect.top;

            _lastTime = e.timeStamp;
            painter.stroke(x, y, dt, e.pressure, e.tiltX, e.tiltY);
        };

        canvas.addEventListener("pointermove", _onPointerMove);

        // public
        this.destroy = canvas.removeEventListener.bind(canvas, "pointermove", _onPointerMove);
        this.shouldBeUpdated = function(params) { return params.inputMethod !== InputType.POINTER};

    };


    var TouchInputHandler = function(canvas, painter, pressure, xtilt, ytilt) {
        var _rect =  canvas.getBoundingClientRect(); // assume no resize
        var _lastTime = 0;
        var _touching = false;

        var _onTouchEnd = function() {_touching = false};
        var _onTouchMove = function(e) {
            var dt = (_lastTime ? e.timeStamp - _lastTime : 0) / 1000;
            var x =  e.touches[0].pageX - _rect.left;
            var y =  e.touches[0].pageY - _rect.top;

            if (_touching)
                painter.stroke(x, y, dt, pressure, xtilt, ytilt);
            else
                painter.newStroke(x, y);


            _lastTime = e.timeStamp;
            _touching = true;
        };

        canvas.addEventListener("touchmove", _onTouchMove);
        canvas.addEventListener("touchend", _onTouchEnd);

        // public
        this.destroy = function() {
            canvas.removeEventListener("touchmove", _onTouchMove);
            canvas.removeEventListener("touchend", _onTouchEnd);
        };

        this.shouldBeUpdated = _.negate(_.isEqual.bind(_,
            {
                inputMethod : InputType.TOUCH,
                pressure : pressure,
                xtilt : xtilt,
                ytilt : ytilt}
        ));
    };

    var InputHandlerFactory = function(canvas, painter) {

        var _create = function(state) {
            var Factory = null;

            if (state.inputMethod === InputType.MOUSE)
                Factory = MouseInputHandler;

            if (state.inputMethod === InputType.TOUCH)
                Factory = TouchInputHandler;

            if (state.inputMethod === InputType.POINTER)
                Factory = PointerInputHandler;

            return new Factory(canvas, painter, state.pressure, state.xtilt, state.ytilt);
        };

        var _destroyAndCreateNew = function(state, other) {
            other.destroy();
            return _create(state);
        };

        var _lazyCreate = function(state, other) {
           if (other.shouldBeUpdated(_.pick(state, "inputMethod", "pressure", "xtilt", "ytilt")))
               return _destroyAndCreateNew(state, other);
           else
               return other;
        };

        this.create = _create;
        this.lazyCreate = _lazyCreate;
    };

    return function(painter, canvas, initialState) {

        var _handlerFactory  = new InputHandlerFactory(canvas, painter);
        var _handler = _handlerFactory.create(initialState);

        var _update = function(state) {
            _handler = _handlerFactory.lazyCreate(state, _handler);
            painter.setBrush(state.brush).setColor(state.color);
        };

        _update(initialState);

        this.update = _update;
    };

})();





var App = function() {

    var _state = {
        color : [255,215,0],
        brush : brushes.all[25],
        inputMethod : isTouchDevice() ? InputType.TOUCH : InputType.MOUSE,
        pressure : 0.5,
        xtilt : 0,
        ytilt : 0
    };

    var canvas = document.querySelector("#surface");
    var painter = libmypaint.Painter.fromCanvas(canvas);
    var drawController = new DrawController(painter, canvas, _state);

    var _brushSelectView = new BrushSelectView(brushes, _state.brush);
    var _colorView = new BrushColorInputView(_state.color);

    var _inputSelectView = new InputTypeSelectView(_state.inputMethod);
    var _inputParamsView = new InputParamsView(_state.pressure, _state.xtilt, _state.ytilt);



    _brushSelectView.onBrushSelect(function(brush) {
        _state.brush = brush;
        drawController.update(_state);
    });

    _colorView.onColorChange(function(color) {
       _state.color = color;
        drawController.update(_state);
    });

    _inputSelectView.onInputSelect(function(input) {
        _state.inputMethod = input;
        drawController.update(_state);
    });

    _inputParamsView.onUpdate(function(pressure, xtilt, ytilt) {
        _.extend(_state, {pressure : pressure, xtilt : xtilt, ytilt : ytilt});
        drawController.update(_state);
    });


    drawController.update(_state);

    this.painter = painter;
    this.state = _state;
};



var app = new App();
