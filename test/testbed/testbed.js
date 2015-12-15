


var BrushColorInputView = function(color) {
    new Powerange(document.querySelector("#redColorInput"), { min: 0, max: 255, start: color[0], vertical : true });
    new Powerange(document.querySelector("#greenColorInput"), { min: 0, max: 255, start: color[1], vertical : true });
    new Powerange(document.querySelector("#blueColorInput"), { min: 0, max: 255, start: color[2], vertical : true });
};


var BrushSelectView = function() {

};

var InputTypeSelectView = function() {

};

var InputParamsView = function(pressure, xtilt, ytilt) {
    new Powerange(document.querySelector("#pressureInput"), { min: 0, max: 1, start: pressure, vertical : true });
    new Powerange(document.querySelector("#xtiltInput"), { min: 0, max: 180, start: xtilt, vertical : true });
    new Powerange(document.querySelector("#ytiltInput"), { min: 0, max: 180, start: ytilt, vertical : true });
};


var InputType = {
    POINTER : "POINTER",
    MOUSE : "MOUSE",
    TOUCH : "TOUCH"
};

var App = function() {

    var _state = {
        color : [128,42,100],
        brush : null,
        inputMethod : InputType.POINTER,
        pressure : 0.5,
        xtilt : 0,
        ytilt : 0
    };

    var _brushSelectView = new BrushSelectView(_state.brush);
    var _colorView = new BrushColorInputView(_state.color);

    var _inputSelectView = new InputTypeSelectView(_state.inputMethod);
    var _inputParamsView = new InputParamsView(_state.pressure, _state.xtilt, _state.ytilt);
};




new App();
