# libmypaint.js - [MyPaint brush engine](https://github.com/mypaint/libmypaint) for javaScript

A javascript port (emsctipten) of the awesome libmypaint brush engine :)

[![online demo](docs/preview.gif)](http://46.101.33.40:4242/)

### Play with the [online demo!](http://46.101.33.40:4242/)

***


# Usage:

```javascript
var libmypaint = require("libmypaint"); // libmypaint.js is a UMD module...

var canvas = document.querySelector("#mySurface");
var painter = libmypaint.Painter.fromCanvas(canvas);

//draw a green line :P
painter.setBrush(myBrush).setColor(0,255,0).stroke(100, 100).stroke(200,100);
````

A brush is just a JSON object. see [MyPaint](https://github.com/mypaint/mypaint/tree/master/brushes)  for brush examples. <br>

# Installation:
Download the [**latest build**](dist/libmypaint.release.js) (or the latest [**debug build**](dist/libmypaint.debug.js)). <br>
libmypaint is a UMD module, and can work with CommonJS, AMD, and script tags:
> CommonJS:
```javascript
var libmypaint = require("libmypaint");
```

> RequireJS:
```javascript
require([ "libmypaint"], function(libmypaint){ ... });
```

> Script tag
```html
<script src="libmypaint.js"></script>
<script> console.log(window.libmypaint.INFO); </script>
```

# Code Examples:

### Connecting [Pointer Events](http://www.w3.org/TR/pointerevents/):

```javascript
var canvas = document.querySelector("#mySurface");
var painter = libmypaint.Painter.fromCanvas(canvas);

var _lastTime = 0;
var _rect =  canvas.getBoundingClientRect(); // assume no resize

canvas.addEventListener("pointermove", function(e) {
  var dt = (_lastTime ? e.timeStamp - _lastTime : 0) / 1000;
  var x =  e.pageX - _rect.left;
  var y =  e.pageY - _rect.top;

  _lastTime = e.timeStamp;

  painter.stroke(x, y, dt, e.pressure, e.tiltX, e.tiltY);
});
````
### Connecting Mouse Events:

```javascript
var canvas = document.querySelector("#mySurface");
var painter = libmypaint.Painter.fromCanvas(canvas);

var _lastTime = 0;
var _rect =  canvas.getBoundingClientRect(); // assume no resize

canvas.addEventListener("mousemove", function(e) {
  var dt = (_lastTime ? e.timeStamp - _lastTime : 0) / 1000;
  var x =  e.pageX - _rect.left;
  var y =  e.pageY - _rect.top;

  _lastTime = e.timeStamp;

  if (e.which === 1) // left mouse button is pressed?
    painter.stroke(x,y,dt);
  else
    painter.hover(x, y, dt); // same as stroke() with pressure 0
});
````
### Connecting Touch Events:

```javascript
var canvas = document.querySelector("#mySurface");
var painter = libmypaint.Painter.fromCanvas(canvas);

var _lastTime = 0;
var _touching = false;
var _rect =  canvas.getBoundingClientRect(); // assume no resize

canvas.addEventListener("touchend", function() { _touching = false});
canvas.addEventListener("touchmove", function(e) {
  var dt = (_lastTime ? e.timeStamp - _lastTime : 0) / 1000;
  var x =  e.touches[0].pageX - _rect.left;
  var y =  e.touches[0].pageY - _rect.top;


  if (_touching)
    painter.stroke(x, y, dt);
  else
    painter.newStroke(x, y);


  _lastTime = e.timeStamp;
  _touching = true;
});

````

# Building:

1. make sure you install node, grunt-cli and [emscripten SDK.](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html)
2. update git sub modules, by running: ```` git submodule update --init --recursive````
3. run ````  npm install ````
4. use one of the following build tasks:
````
grunt debug     # clean & build a debug version of the library
grunt release   # clean & build a release version of the library

grunt testbed           # build & run the testbed against the debug version
grunt testbed:release   # build & run the testbed against the release version
````


# API

# \<class\> Painter

Painter is a thin wrapper around **Bindings**, with a simple drawing API that supports method chaining.<br>
It also implements canvas drawing..

Usage:

```javascript
var painter = Painter.fromCanvas(canvas);

painter.setBrush(brush)
       .stroke(0, 100).stroke(100,100).stroke(100,0)
       .hover(400, 400, 0.5).stroke(500, 400);

````

### Painter(bindings)
@param bindings: **Bindings**

Use the constructor directly only if your'e implementing your own drawing logic. <br>
For normal usage, see **Painter.fromCanvas()**

## Static Methods:

### Painter.fromCanvas(canvas)
@param canvas: **HTMLCanvas** or **CanvasRenderingContext2D**

Create a Painter object that can draw to canvas.


## Methods:

### .setBrush(brush)
@param brush: **Object** - a JSON object, with brush settings. <br>
@returns: **this**

Load all brush settings from a given JSON object... <br>
see https://github.com/mypaint/mypaint/tree/master/brushes for brush examples.

**NOTE:** the brush parameter object will **not** be mutated.

### .setColor(r,g,b)
@param r,g,b: **Number** - between 0 and 255, or an Array (e,g [r,g,b]) <br>
@returns: **this**

set current brush color... for example:

```javascript
    painter.setColor(255,0,0).setColor([255,255,0]);
````


**NOTE:** The next call to .setBrush() will reset this value.

### .stroke(x,y, [dt], [pressure], [xtilt], [ytilt])
@param x,y: **Number** - stroke position <br>
@param dt: **Number** - delta time **in seconds** (optional), defaults to: 0.1 <br>
@param pressure: **Number** - pressure between 0 and 1 (optional), defaults to: 0.5 <br>
@param xtilt: **Number** - (optional), defaults to: 0 <br>
@param ytilt: **Number** - (optional), defaults to: 0 <br>
@returns: **this**

ask the brush engine to perform a stroke...

**NOTE:** for best results dt should be calculated from the input event (e.timeStamp).


### .hover(x,y [dt])
@param x,y: **Number** - stroke position <br>
@param dt: **Number** - delta time **in seconds** (optional), defaults to: 0.1 <br>
@returns: **this**

will perform a stroke with 0 pressure. <br>
use this function when you can get hover events from the input system, but can't get pressure (e,g mouse).


### .newStroke(x,y)
@param x,y: **Number** - stroke position <br>
@returns: **this**

resets brush state and renders a "ghost stroke" with pressure 0, and dt of 10 seconds. <br>
use this function **only** when you can't get pressure & hover events from the input system (mobile touch screens etc..).

<br>

# \<class\> Bindings

The low level bindings to libmypaint, each instance holds it's own emsctipten module.
Use this class directly only if you don't want to use the Painter API.


### Bindings(drawDab, getColor)

@param drawDab: **function(x,y,radius, r,g,b,a, hardness, alpha_eraser, aspect_ratio, angle, lock_alpha, colorize)** <br>
@param getColor: **function(x, y, radius)**

getColor() should return an Array with RGBA values ([r,g,b,a]), where each value is between 0 and 1. <br>
drawDab() will be called to draw stuff...

See Painter for an example implementation of getColor() & drawDab() for canvas.

## Methods:

### .stroke_to(x , y, pressure, xtilt, ytilt, dt)

directly maps to the C function **mypaint_brush_stroke_to()**

### .load_brush(brush)

@param brush: **Object** - a JSON object, with brush settings.

will load all brush settings from a given JSON object... <br>
see https://github.com/mypaint/mypaint/tree/master/brushes for brush examples.


### .new_brush()

will destroy current brush & allocate new brush, used during **.load_brush()**


### .reset_brush()

directly maps to the C function **mypaint_brush_reset()**


### .set_brush_base_value(setting_name, value)

@param setting_name: **String** - the string name of setting e,g "color_h", "color_v" etc... <br>
@param value: **Number**

used during .load_brush(), and can be used to set color etc... for example:

```javascript
    my.set_brush_base_value("color_h", 0.0);
    my.set_brush_base_value("color_s", 0.0);
    my.set_brush_base_value("color_v", 1.0);
````

### .set_brush_mapping_n(setting_name, input_name, n)

@param setting_name: **String** - the string name of setting e,g "color_h", "color_v" etc...<br>
@param input_name: **String** - the name of the mapping e,g "pressure"...<br>
@param n: **Number** - number of mapping points.

Used during .load_brush(), and maps to the C function **mypaint_brush_set_mapping_n()**. <br>
Should be called before any **.set_brush_mapping_point()** calls to this mapping...


### .set_brush_mapping_point(setting_name, input_name, index, x, y)

@param setting_name: **String** - the string name of setting e,g "color_h", "color_v" etc...<br>
@param input_name: **String** - the name of the mapping e,g "pressure"...<br>

Used during .load_brush(), and maps to the C function mypaint_brush_set_mapping_point().
