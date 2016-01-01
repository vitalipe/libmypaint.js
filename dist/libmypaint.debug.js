(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports);
    } else {
        // Browser globals
        factory((root.libmypaint = {}));
    }
}(this, function (exports) {
"use strict";

var INFO={"build":"DEBUG","libmypaint_version":"1.1","libmypaint_commit_id":"60369db01ca225e715f087df44be6a5525995936","version":"0.1.1","commit_id":"7437956c554d224862bfd190d71df3551a961b2d","build_time":1451679275063}
var Module = function(Module) {
  Module = Module || {};

// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_WEB = typeof window === 'object';
// Three configurations we can be running in:
// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
// 2) We could be the application main() thread proxied to worker. (with Emscripten -s PROXY_TO_WORKER=1) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function' && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) {
    var ret = Module['read'](filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
  };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  if (!Module['thisProgram']) {
    if (process['argv'].length > 1) {
      Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
    } else {
      Module['thisProgram'] = 'unknown-program';
    }
  }

  Module['arguments'] = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  Module['inspect'] = function () { return '[Emscripten Module object]'; };
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    var data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WORKER) {
    Module['load'] = importScripts;
  }

  if (typeof Module['setWindowTitle'] === 'undefined') {
    Module['setWindowTitle'] = function(title) { document.title = title };
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
if (!Module['thisProgram']) {
  Module['thisProgram'] = './this.program';
}

// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in: 
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at: 
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  STACK_ALIGN: 16,
  prepVararg: function (ptr, type) {
    if (type === 'double' || type === 'i64') {
      // move so the load is aligned
      if (ptr & 7) {
        assert((ptr & 7) === 4);
        ptr += 4;
      }
    } else {
      assert((ptr & 3) === 0);
    }
    return ptr;
  },
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      assert(sig.length == 1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [null,null],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[sig]) {
      Runtime.funcWrappers[sig] = {};
    }
    var sigCache = Runtime.funcWrappers[sig];
    if (!sigCache[func]) {
      sigCache[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return sigCache[func];
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+15)&-16);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+15)&-16); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+15)&-16); if (DYNAMICTOP >= TOTAL_MEMORY) { var success = enlargeMemory(); if (!success) { DYNAMICTOP = ret;  return 0; } }; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 16))*(quantum ? quantum : 16); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}



Module["Runtime"] = Runtime;



//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  if (!func) {
    try {
      func = eval('_' + ident); // explicit lookup
    } catch(e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

var cwrap, ccall;
(function(){
  var JSfuncs = {
    // Helpers for cwrap -- it can't refer to Runtime directly because it might
    // be renamed by closure, instead it calls JSfuncs['stackSave'].body to find
    // out what the minified function name is.
    'stackSave': function() {
      Runtime.stackSave()
    },
    'stackRestore': function() {
      Runtime.stackRestore()
    },
    // type conversion from js to c
    'arrayToC' : function(arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    'stringToC' : function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        ret = Runtime.stackAlloc((str.length << 2) + 1);
        writeStringToMemory(str, ret);
      }
      return ret;
    }
  };
  // For fast lookup of conversion functions
  var toC = {'string' : JSfuncs['stringToC'], 'array' : JSfuncs['arrayToC']};

  // C calling interface. 
  ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    assert(returnType !== 'array', 'Return type should not be "array".');
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = Runtime.stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    if ((!opts || !opts.async) && typeof EmterpreterAsync === 'object') {
      assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling ccall');
    }
    if (opts && opts.async) assert(!returnType, 'async ccalls cannot return values');
    if (returnType === 'string') ret = Pointer_stringify(ret);
    if (stack !== 0) {
      if (opts && opts.async) {
        EmterpreterAsync.asyncFinalizers.push(function() {
          Runtime.stackRestore(stack);
        });
        return;
      }
      Runtime.stackRestore(stack);
    }
    return ret;
  }

  var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    // Match the body and the return value of a javascript function source
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return {arguments : parsed[0], body : parsed[1], returnValue: parsed[2]}
  }
  var JSsource = {};
  for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
      // Elements of toCsource are arrays of three items:
      // the code, and the return value
      JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
  }

  
  cwrap = function cwrap(ident, returnType, argTypes) {
    argTypes = argTypes || [];
    var cfunc = getCFunc(ident);
    // When the function takes numbers and returns a number, we can just return
    // the original function
    var numericArgs = argTypes.every(function(type){ return type === 'number'});
    var numericRet = (returnType !== 'string');
    if ( numericRet && numericArgs) {
      return cfunc;
    }
    // Creation of the arguments list (["$1","$2",...,"$nargs"])
    var argNames = argTypes.map(function(x,i){return '$'+i});
    var funcstr = "(function(" + argNames.join(',') + ") {";
    var nargs = argTypes.length;
    if (!numericArgs) {
      // Generate the code needed to convert the arguments from javascript
      // values to pointers
      funcstr += 'var stack = ' + JSsource['stackSave'].body + ';';
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i], type = argTypes[i];
        if (type === 'number') continue;
        var convertCode = JSsource[type + 'ToC']; // [code, return]
        funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
        funcstr += convertCode.body + ';';
        funcstr += arg + '=' + convertCode.returnValue + ';';
      }
    }

    // When the code is compressed, the name of cfunc is not literally 'cfunc' anymore
    var cfuncname = parseJSFunc(function(){return cfunc}).returnValue;
    // Call the function
    funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
    if (!numericRet) { // Return type can only by 'string' or 'number'
      // Convert the result to a string
      var strgfy = parseJSFunc(function(){return Pointer_stringify}).returnValue;
      funcstr += 'ret = ' + strgfy + '(ret);';
    }
    funcstr += "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }";
    if (!numericArgs) {
      // If we had a stack, restore it
      funcstr += JSsource['stackRestore'].body.replace('()', '(stack)') + ';';
    }
    funcstr += 'return ret})';
    return eval(funcstr);
  };
})();
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;

function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module["setValue"] = setValue;


function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module["getValue"] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
Module["ALLOC_STACK"] = ALLOC_STACK;
Module["ALLOC_STATIC"] = ALLOC_STATIC;
Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
Module["ALLOC_NONE"] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module["allocate"] = allocate;

// Allocate memory during any stage of startup - static memory early on, dynamic memory later, malloc when ready
function getMemory(size) {
  if (!staticSealed) return Runtime.staticAlloc(size);
  if ((typeof _sbrk !== 'undefined' && !_sbrk.called) || !runtimeInitialized) return Runtime.dynamicAlloc(size);
  return _malloc(size);
}
Module["getMemory"] = getMemory;

function Pointer_stringify(ptr, /* optional */ length) {
  if (length === 0 || !ptr) return '';
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = 0;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    hasUtf |= t;
    if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (hasUtf < 128) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  return Module['UTF8ToString'](ptr);
}
Module["Pointer_stringify"] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAP8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}
Module["AsciiToString"] = AsciiToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}
Module["stringToAscii"] = stringToAscii;

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

function UTF8ArrayToString(u8Array, idx) {
  var u0, u1, u2, u3, u4, u5;

  var str = '';
  while (1) {
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    u0 = u8Array[idx++];
    if (!u0) return str;
    if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
    u1 = u8Array[idx++] & 63;
    if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
    u2 = u8Array[idx++] & 63;
    if ((u0 & 0xF0) == 0xE0) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      u3 = u8Array[idx++] & 63;
      if ((u0 & 0xF8) == 0xF0) {
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3;
      } else {
        u4 = u8Array[idx++] & 63;
        if ((u0 & 0xFC) == 0xF8) {
          u0 = ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4;
        } else {
          u5 = u8Array[idx++] & 63;
          u0 = ((u0 & 1) << 30) | (u1 << 24) | (u2 << 18) | (u3 << 12) | (u4 << 6) | u5;
        }
      }
    }
    if (u0 < 0x10000) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    }
  }
}
Module["UTF8ArrayToString"] = UTF8ArrayToString;

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function UTF8ToString(ptr) {
  return UTF8ArrayToString(HEAPU8,ptr);
}
Module["UTF8ToString"] = UTF8ToString;

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outU8Array: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null 
//                    terminator, i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      outU8Array[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      outU8Array[outIdx++] = 0xC0 | (u >> 6);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      outU8Array[outIdx++] = 0xE0 | (u >> 12);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0x1FFFFF) {
      if (outIdx + 3 >= endIdx) break;
      outU8Array[outIdx++] = 0xF0 | (u >> 18);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0x3FFFFFF) {
      if (outIdx + 4 >= endIdx) break;
      outU8Array[outIdx++] = 0xF8 | (u >> 24);
      outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 5 >= endIdx) break;
      outU8Array[outIdx++] = 0xFC | (u >> 30);
      outU8Array[outIdx++] = 0x80 | ((u >> 24) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  outU8Array[outIdx] = 0;
  return outIdx - startIdx;
}
Module["stringToUTF8Array"] = stringToUTF8Array;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}
Module["stringToUTF8"] = stringToUTF8;

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) {
      ++len;
    } else if (u <= 0x7FF) {
      len += 2;
    } else if (u <= 0xFFFF) {
      len += 3;
    } else if (u <= 0x1FFFFF) {
      len += 4;
    } else if (u <= 0x3FFFFFF) {
      len += 5;
    } else {
      len += 6;
    }
  }
  return len;
}
Module["lengthBytesUTF8"] = lengthBytesUTF8;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module["UTF16ToString"] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null 
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)]=codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)]=0;
  return outPtr - startPtr;
}
Module["stringToUTF16"] = stringToUTF16;

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}
Module["lengthBytesUTF16"] = lengthBytesUTF16;

function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module["UTF32ToString"] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null 
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)]=codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)]=0;
  return outPtr - startPtr;
}
Module["stringToUTF32"] = stringToUTF32;

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}
Module["lengthBytesUTF32"] = lengthBytesUTF32;

function demangle(func) {
  var hasLibcxxabi = !!Module['___cxa_demangle'];
  if (hasLibcxxabi) {
    try {
      var buf = _malloc(func.length);
      writeStringToMemory(func.substr(1), buf);
      var status = _malloc(4);
      var ret = Module['___cxa_demangle'](buf, 0, 0, status);
      if (getValue(status, 'i32') === 0 && ret) {
        return Pointer_stringify(ret);
      }
      // otherwise, libcxxabi failed, we can try ours which may return a partial result
    } catch(e) {
      // failure when using libcxxabi, we can try ours which may return a partial result
    } finally {
      if (buf) _free(buf);
      if (status) _free(status);
      if (ret) _free(ret);
    }
  }
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  var parsed = func;
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    parsed = parse();
  } catch(e) {
    parsed += '?';
  }
  if (parsed.indexOf('?') >= 0 && !hasLibcxxabi) {
    Runtime.warnOnce('warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
  }
  return parsed;
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch(e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  return demangleAll(jsStackTrace());
}
Module["stackTrace"] = stackTrace;

// Memory management

var PAGE_SIZE = 4096;

function alignMemoryPage(x) {
  if (x % 4096 > 0) {
    x += (4096 - (x % 4096));
  }
  return x;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk


function abortOnCannotGrowMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ');
}

function enlargeMemory() {
  abortOnCannotGrowMemory();
}


var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;

var totalMemory = 64*1024;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be compliant with the asm.js spec (and given that TOTAL_STACK=' + TOTAL_STACK + ')');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer;



buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);


// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['buffer'] = buffer;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;
var runtimeExited = false;


function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module["addOnPreRun"] = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module["addOnInit"] = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module["addOnPreMain"] = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module["addOnExit"] = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module["addOnPostRun"] = addOnPostRun;

// Tools


function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}
Module["intArrayFromString"] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module["intArrayToString"] = intArrayToString;

function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))>>0)]=chr;
    i = i + 1;
  }
}
Module["writeStringToMemory"] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[((buffer++)>>0)]=array[i];
  }
}
Module["writeArrayToMemory"] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[((buffer++)>>0)]=str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)]=0;
}
Module["writeAsciiToMemory"] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}


// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


if (!Math['clz32']) Math['clz32'] = function(x) {
  x = x >>> 0;
  for (var i = 0; i < 32; i++) {
    if (x & (1 << (31 - i))) return i;
  }
  return 32;
};
Math.clz32 = Math['clz32']

var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
  return id;
}

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module["addRunDependency"] = addRunDependency;

function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module["removeRunDependency"] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data



var memoryInitializer = null;



// === Body ===

var ASM_CONSTS = [];




STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 16608;
  /* global initializers */  __ATINIT__.push();
  

/* memory initializer */ allocate([0,0,0,0,0,0,240,191,0,0,0,0,0,0,240,191,238,12,0,0,245,12,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,0,64,253,12,0,0,76,13,0,0,92,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,109,13,0,0,141,14,0,0,158,14,0,0,1,0,0,0,0,0,0,0,102,102,102,63,0,0,0,64,176,14,0,0,196,16,0,0,215,16,0,0,0,0,0,0,0,0,0,192,0,0,0,64,0,0,192,64,222,16,0,0,40,17,0,0,49,17,0,0,0,0,0,0,0,0,0,0,205,204,76,63,0,0,128,63,58,17,0,0,187,17,0,0,201,17,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,160,64,215,17,0,0,226,18,0,0,248,18,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,192,64,14,19,0,0,136,19,0,0,159,19,0,0,1,0,0,0,0,0,0,0,0,0,0,64,0,0,192,64,182,19,0,0,9,20,0,0,25,20,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,160,66,41,20,0,0,103,20,0,0,120,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,63,137,20,0,0,189,21,0,0,205,21,0,0,0,0,0,0,0,0,0,0,10,215,35,61,205,204,76,62,223,21,0,0,100,22,0,0,116,22,0,0,0,0,0,0,0,0,0,0,205,204,76,63,0,0,64,64,135,22,0,0,201,22,0,0,214,22,0,0,1,0,0,0,0,0,0,193,0,0,128,64,0,0,0,65,231,22,0,0,26,24,0,0,39,24,0,0,1,0,0,0,0,0,0,193,0,0,128,64,0,0,0,65,57,24,0,0,100,24,0,0,117,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,65,124,24,0,0,30,25,0,0,46,25,0,0,0,0,0,0,0,0,64,192,0,0,0,0,0,0,64,64,62,25,0,0,191,25,0,0,216,25,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,112,65,239,25,0,0,50,26,0,0,64,26,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,32,65,87,26,0,0,237,26,0,0,3,27,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,65,25,27,0,0,135,27,0,0,150,27,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,64,65,165,27,0,0,53,28,0,0,61,28,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,61,28,0,0,71,28,0,0,79,28,0,0,1,0,0,0,0,0,0,191,0,0,0,0,0,0,192,63,79,28,0,0,96,28,0,0,104,28,0,0,1,0,0,0,0,0,0,191,0,0,0,0,0,0,192,63,116,28,0,0,152,28,0,0,166,28,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,177,28,0,0,181,29,0,0,196,29,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,64,213,29,0,0,72,30,0,0,87,30,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,64,116,30,0,0,208,30,0,0,227,30,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,64,253,30,0,0,103,31,0,0,118,31,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,64,143,31,0,0,35,32,0,0,54,32,0,0,0,0,0,0,0,0,0,192,0,0,0,0,0,0,0,64,80,32,0,0,222,32,0,0,229,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,236,32,0,0,216,33,0,0,230,33,0,0,0,0,0,0,0,0,0,0,0,0,0,63,0,0,128,63,244,33,0,0,11,35,0,0,29,35,0,0,0,0,0,0,205,204,204,191,0,0,0,0,205,204,204,63,43,35,0,0,31,36,0,0,38,36,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,45,36,0,0,169,36,0,0,186,36,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,63,203,36,0,0,89,37,0,0,117,37,0,0,0,0,0,0,0,0,128,191,0,0,128,64,0,0,224,64,133,37,0,0,11,38,0,0,27,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,65,44,38,0,0,30,39,0,0,43,39,0,0,0,0,0,0,0,0,160,192,0,0,0,0,0,0,160,64,56,39,0,0,185,40,0,0,207,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,65,227,40,0,0,195,41,0,0,216,41,0,0,0,0,0,0,0,0,128,63,0,0,128,63,0,0,32,65,238,41,0,0,108,42,0,0,129,42,0,0,0,0,0,0,0,0,0,0,0,0,180,66,0,0,52,67,151,42,0,0,17,43,0,0,34,43,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,32,65,51,43,0,0,148,43,0,0,159,43,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,170,43,0,0,99,44,0,0,108,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,117,44,0,0,240,44,0,0,254,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,12,45,0,0,102,45,0,0,120,45,0,0,1,0,0,0,102,102,230,191,0,0,0,0,102,102,230,63,134,45,0,0,227,45,0,0,0,0,0,0,0,0,0,0,205,204,204,62,0,0,128,63,255,255,127,127,236,45,0,0,245,45,0,0,188,46,0,0,255,255,127,127,0,0,0,0,0,0,0,63,0,0,128,64,255,255,127,127,195,46,0,0,206,46,0,0,145,47,0,0,255,255,127,127,0,0,0,0,0,0,0,63,0,0,128,64,255,255,127,127,152,47,0,0,164,47,0,0,251,47,0,0,0,0,0,0,0,0,0,0,0,0,0,63,0,0,128,63,0,0,128,63,2,48,0,0,9,48,0,0,93,48,0,0,0,0,0,0,0,0,0,0,0,0,0,63,0,0,128,63,0,0,128,63,100,48,0,0,107,48,0,0,55,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,52,67,0,0,52,67,65,49,0,0,75,49,0,0,198,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,180,66,0,0,180,66,215,49,0,0,227,49,0,0,79,50,0,0,0,0,52,195,0,0,52,195,0,0,0,0,0,0,52,67,0,0,52,67,94,50,0,0,104,50,0,0,6,51,0,0,255,255,127,127,0,0,0,192,0,0,0,0,0,0,0,64,255,255,127,127,13,51,0,0,20,51,0,0,0,0,0,0,0,0,0,0,96,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,8,0,0,0,206,58,0,0,0,4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,105,110,112,117,116,32,62,61,32,48,32,38,38,32,105,110,112,117,116,32,60,32,115,101,108,102,45,62,105,110,112,117,116,115,0,115,114,99,47,110,97,116,105,118,101,47,108,105,98,109,121,112,97,105,110,116,47,109,97,112,112,105,110,103,46,99,0,109,97,112,112,105,110,103,95,115,101,116,95,110,0,110,32,62,61,32,48,32,38,38,32,110,32,60,61,32,56,0,110,32,33,61,32,49,0,115,101,108,102,45,62,105,110,112,117,116,115,95,117,115,101,100,32,62,61,32,48,0,115,101,108,102,45,62,105,110,112,117,116,115,95,117,115,101,100,32,60,61,32,115,101,108,102,45,62,105,110,112,117,116,115,0,109,97,112,112,105,110,103,95,115,101,116,95,112,111,105,110,116,0,105,110,100,101,120,32,62,61,32,48,32,38,38,32,105,110,100,101,120,32,60,32,56,0,105,110,100,101,120,32,60,32,112,45,62,110,0,120,32,62,61,32,112,45,62,120,118,97,108,117,101,115,91,105,110,100,101,120,45,49,93,0,105,100,32,62,61,32,48,32,38,38,32,105,100,32,60,32,77,89,80,65,73,78,84,95,66,82,85,83,72,95,83,69,84,84,73,78,71,83,95,67,79,85,78,84,0,115,114,99,47,110,97,116,105,118,101,47,108,105,98,109,121,112,97,105,110,116,47,109,121,112,97,105,110,116,45,98,114,117,115,104,46,99,0,109,121,112,97,105,110,116,95,98,114,117,115,104,95,115,101,116,95,98,97,115,101,95,118,97,108,117,101,0,109,121,112,97,105,110,116,95,98,114,117,115,104,95,115,101,116,95,109,97,112,112,105,110,103,95,110,0,109,121,112,97,105,110,116,95,98,114,117,115,104,95,115,101,116,95,109,97,112,112,105,110,103,95,112,111,105,110,116,0,84,105,109,101,32,105,115,32,114,117,110,110,105,110,103,32,98,97,99,107,119,97,114,100,115,33,10,0,112,114,101,115,115,61,37,32,52,46,51,102,44,32,115,112,101,101,100,49,61,37,32,52,46,52,102,9,115,112,101,101,100,50,61,37,32,52,46,52,102,9,115,116,114,111,107,101,61,37,32,52,46,51,102,9,99,117,115,116,111,109,61,37,32,52,46,51,102,10,0,105,115,102,105,110,105,116,101,40,120,116,105,108,116,41,32,38,38,32,105,115,102,105,110,105,116,101,40,121,116,105,108,116,41,0,109,121,112,97,105,110,116,95,98,114,117,115,104,95,115,116,114,111,107,101,95,116,111,0,105,115,102,105,110,105,116,101,40,116,105,108,116,95,97,115,99,101,110,115,105,111,110,41,0,105,115,102,105,110,105,116,101,40,116,105,108,116,95,100,101,99,108,105,110,97,116,105,111,110,41,0,87,97,114,110,105,110,103,58,32,105,103,110,111,114,105,110,103,32,98,114,117,115,104,58,58,115,116,114,111,107,101,95,116,111,32,119,105,116,104,32,105,110,115,97,110,101,32,105,110,112,117,116,115,32,40,120,32,61,32,37,102,44,32,121,32,61,32,37,102,41,10,0,120,32,60,32,49,101,56,32,38,38,32,121,32,60,32,49,101,56,32,38,38,32,120,32,62,32,45,49,101,56,32,38,38,32,121,32,62,32,45,49,101,56,0,84,105,109,101,32,106,117,109,112,101,100,32,98,97,99,107,119,97,114,100,115,32,98,121,32,100,116,105,109,101,61,37,102,32,115,101,99,111,110,100,115,33,10,0,105,100,32,60,32,77,89,80,65,73,78,84,95,66,82,85,83,72,95,83,69,84,84,73,78,71,83,95,67,79,85,78,84,0,115,114,99,47,110,97,116,105,118,101,47,108,105,98,109,121,112,97,105,110,116,47,109,121,112,97,105,110,116,45,98,114,117,115,104,45,115,101,116,116,105,110,103,115,46,99,0,109,121,112,97,105,110,116,95,98,114,117,115,104,95,115,101,116,116,105,110,103,95,105,110,102,111,0,105,100,32,60,32,77,89,80,65,73,78,84,95,66,82,85,83,72,95,73,78,80,85,84,83,95,67,79,85,78,84,0,109,121,112,97,105,110,116,95,98,114,117,115,104,95,105,110,112,117,116,95,105,110,102,111,0,115,101,108,102,45,62,100,114,97,119,95,100,97,98,0,115,114,99,47,110,97,116,105,118,101,47,108,105,98,109,121,112,97,105,110,116,47,109,121,112,97,105,110,116,45,115,117,114,102,97,99,101,46,99,0,109,121,112,97,105,110,116,95,115,117,114,102,97,99,101,95,100,114,97,119,95,100,97,98,0,115,101,108,102,45,62,103,101,116,95,99,111,108,111,114,0,109,121,112,97,105,110,116,95,115,117,114,102,97,99,101,95,103,101,116,95,99,111,108,111,114,0,111,112,97,113,117,101,0,79,112,97,99,105,116,121,0,48,32,109,101,97,110,115,32,98,114,117,115,104,32,105,115,32,116,114,97,110,115,112,97,114,101,110,116,44,32,49,32,102,117,108,108,121,32,118,105,115,105,98,108,101,10,40,97,108,115,111,32,107,110,111,119,110,32,97,115,32,97,108,112,104,97,32,111,114,32,111,112,97,99,105,116,121,41,0,111,112,97,113,117,101,95,109,117,108,116,105,112,108,121,0,79,112,97,99,105,116,121,32,109,117,108,116,105,112,108,121,0,84,104,105,115,32,103,101,116,115,32,109,117,108,116,105,112,108,105,101,100,32,119,105,116,104,32,111,112,97,113,117,101,46,32,89,111,117,32,115,104,111,117,108,100,32,111,110,108,121,32,99,104,97,110,103,101,32,116,104,101,32,112,114,101,115,115,117,114,101,32,105,110,112,117,116,32,111,102,32,116,104,105,115,32,115,101,116,116,105,110,103,46,32,85,115,101,32,39,111,112,97,113,117,101,39,32,105,110,115,116,101,97,100,32,116,111,32,109,97,107,101,32,111,112,97,99,105,116,121,32,100,101,112,101,110,100,32,111,110,32,115,112,101,101,100,46,10,84,104,105,115,32,115,101,116,116,105,110,103,32,105,115,32,114,101,115,112,111,110,115,105,98,108,101,32,116,111,32,115,116,111,112,32,112,97,105,110,116,105,110,103,32,119,104,101,110,32,116,104,101,114,101,32,105,115,32,122,101,114,111,32,112,114,101,115,115,117,114,101,46,32,84,104,105,115,32,105,115,32,106,117,115,116,32,97,32,99,111,110,118,101,110,116,105,111,110,44,32,116,104,101,32,98,101,104,97,118,105,111,117,114,32,105,115,32,105,100,101,110,116,105,99,97,108,32,116,111,32,39,111,112,97,113,117,101,39,46,0,111,112,97,113,117,101,95,108,105,110,101,97,114,105,122,101,0,79,112,97,99,105,116,121,32,108,105,110,101,97,114,105,122,101,0,67,111,114,114,101,99,116,32,116,104,101,32,110,111,110,108,105,110,101,97,114,105,116,121,32,105,110,116,114,111,100,117,99,101,100,32,98,121,32,98,108,101,110,100,105,110,103,32,109,117,108,116,105,112,108,101,32,100,97,98,115,32,111,110,32,116,111,112,32,111,102,32,101,97,99,104,32,111,116,104,101,114,46,32,84,104,105,115,32,99,111,114,114,101,99,116,105,111,110,32,115,104,111,117,108,100,32,103,101,116,32,121,111,117,32,97,32,108,105,110,101,97,114,32,40,34,110,97,116,117,114,97,108,34,41,32,112,114,101,115,115,117,114,101,32,114,101,115,112,111,110,115,101,32,119,104,101,110,32,112,114,101,115,115,117,114,101,32,105,115,32,109,97,112,112,101,100,32,116,111,32,111,112,97,113,117,101,95,109,117,108,116,105,112,108,121,44,32,97,115,32,105,116,32,105,115,32,117,115,117,97,108,108,121,32,100,111,110,101,46,32,48,46,57,32,105,115,32,103,111,111,100,32,102,111,114,32,115,116,97,110,100,97,114,100,32,115,116,114,111,107,101,115,44,32,115,101,116,32,105,116,32,115,109,97,108,108,101,114,32,105,102,32,121,111,117,114,32,98,114,117,115,104,32,115,99,97,116,116,101,114,115,32,97,32,108,111,116,44,32,111,114,32,104,105,103,104,101,114,32,105,102,32,121,111,117,32,117,115,101,32,100,97,98,115,95,112,101,114,95,115,101,99,111,110,100,46,10,48,46,48,32,116,104,101,32,111,112,97,113,117,101,32,118,97,108,117,101,32,97,98,111,118,101,32,105,115,32,102,111,114,32,116,104,101,32,105,110,100,105,118,105,100,117,97,108,32,100,97,98,115,10,49,46,48,32,116,104,101,32,111,112,97,113,117,101,32,118,97,108,117,101,32,97,98,111,118,101,32,105,115,32,102,111,114,32,116,104,101,32,102,105,110,97,108,32,98,114,117,115,104,32,115,116,114,111,107,101,44,32,97,115,115,117,109,105,110,103,32,101,97,99,104,32,112,105,120,101,108,32,103,101,116,115,32,40,100,97,98,115,95,112,101,114,95,114,97,100,105,117,115,42,50,41,32,98,114,117,115,104,100,97,98,115,32,111,110,32,97,118,101,114,97,103,101,32,100,117,114,105,110,103,32,97,32,115,116,114,111,107,101,0,114,97,100,105,117,115,95,108,111,103,97,114,105,116,104,109,105,99,0,82,97,100,105,117,115,0,66,97,115,105,99,32,98,114,117,115,104,32,114,97,100,105,117,115,32,40,108,111,103,97,114,105,116,104,109,105,99,41,10,32,48,46,55,32,109,101,97,110,115,32,50,32,112,105,120,101,108,115,10,32,51,46,48,32,109,101,97,110,115,32,50,48,32,112,105,120,101,108,115,0,104,97,114,100,110,101,115,115,0,72,97,114,100,110,101,115,115,0,72,97,114,100,32,98,114,117,115,104,45,99,105,114,99,108,101,32,98,111,114,100,101,114,115,32,40,115,101,116,116,105,110,103,32,116,111,32,122,101,114,111,32,119,105,108,108,32,100,114,97,119,32,110,111,116,104,105,110,103,41,46,32,84,111,32,114,101,97,99,104,32,116,104,101,32,109,97,120,105,109,117,109,32,104,97,114,100,110,101,115,115,44,32,121,111,117,32,110,101,101,100,32,116,111,32,100,105,115,97,98,108,101,32,80,105,120,101,108,32,102,101,97,116,104,101,114,46,0,97,110,116,105,95,97,108,105,97,115,105,110,103,0,80,105,120,101,108,32,102,101,97,116,104,101,114,0,84,104,105,115,32,115,101,116,116,105,110,103,32,100,101,99,114,101,97,115,101,115,32,116,104,101,32,104,97,114,100,110,101,115,115,32,119,104,101,110,32,110,101,99,101,115,115,97,114,121,32,116,111,32,112,114,101,118,101,110,116,32,97,32,112,105,120,101,108,32,115,116,97,105,114,99,97,115,101,32,101,102,102,101,99,116,32,40,97,108,105,97,115,105,110,103,41,32,98,121,32,109,97,107,105,110,103,32,116,104,101,32,100,97,98,32,109,111,114,101,32,98,108,117,114,114,101,100,46,10,32,48,46,48,32,100,105,115,97,98,108,101,32,40,102,111,114,32,118,101,114,121,32,115,116,114,111,110,103,32,101,114,97,115,101,114,115,32,97,110,100,32,112,105,120,101,108,32,98,114,117,115,104,101,115,41,10,32,49,46,48,32,98,108,117,114,32,111,110,101,32,112,105,120,101,108,32,40,103,111,111,100,32,118,97,108,117,101,41,10,32,53,46,48,32,110,111,116,97,98,108,101,32,98,108,117,114,44,32,116,104,105,110,32,115,116,114,111,107,101,115,32,119,105,108,108,32,100,105,115,97,112,112,101,97,114,0,100,97,98,115,95,112,101,114,95,98,97,115,105,99,95,114,97,100,105,117,115,0,68,97,98,115,32,112,101,114,32,98,97,115,105,99,32,114,97,100,105,117,115,0,72,111,119,32,109,97,110,121,32,100,97,98,115,32,116,111,32,100,114,97,119,32,119,104,105,108,101,32,116,104,101,32,112,111,105,110,116,101,114,32,109,111,118,101,115,32,97,32,100,105,115,116,97,110,99,101,32,111,102,32,111,110,101,32,98,114,117,115,104,32,114,97,100,105,117,115,32,40,109,111,114,101,32,112,114,101,99,105,115,101,58,32,116,104,101,32,98,97,115,101,32,118,97,108,117,101,32,111,102,32,116,104,101,32,114,97,100,105,117,115,41,0,100,97,98,115,95,112,101,114,95,97,99,116,117,97,108,95,114,97,100,105,117,115,0,68,97,98,115,32,112,101,114,32,97,99,116,117,97,108,32,114,97,100,105,117,115,0,83,97,109,101,32,97,115,32,97,98,111,118,101,44,32,98,117,116,32,116,104,101,32,114,97,100,105,117,115,32,97,99,116,117,97,108,108,121,32,100,114,97,119,110,32,105,115,32,117,115,101,100,44,32,119,104,105,99,104,32,99,97,110,32,99,104,97,110,103,101,32,100,121,110,97,109,105,99,97,108,108,121,0,100,97,98,115,95,112,101,114,95,115,101,99,111,110,100,0,68,97,98,115,32,112,101,114,32,115,101,99,111,110,100,0,68,97,98,115,32,116,111,32,100,114,97,119,32,101,97,99,104,32,115,101,99,111,110,100,44,32,110,111,32,109,97,116,116,101,114,32,104,111,119,32,102,97,114,32,116,104,101,32,112,111,105,110,116,101,114,32,109,111,118,101,115,0,114,97,100,105,117,115,95,98,121,95,114,97,110,100,111,109,0,82,97,100,105,117,115,32,98,121,32,114,97,110,100,111,109,0,65,108,116,101,114,32,116,104,101,32,114,97,100,105,117,115,32,114,97,110,100,111,109,108,121,32,101,97,99,104,32,100,97,98,46,32,89,111,117,32,99,97,110,32,97,108,115,111,32,100,111,32,116,104,105,115,32,119,105,116,104,32,116,104,101,32,98,121,95,114,97,110,100,111,109,32,105,110,112,117,116,32,111,110,32,116,104,101,32,114,97,100,105,117,115,32,115,101,116,116,105,110,103,46,32,73,102,32,121,111,117,32,100,111,32,105,116,32,104,101,114,101,44,32,116,104,101,114,101,32,97,114,101,32,116,119,111,32,100,105,102,102,101,114,101,110,99,101,115,58,10,49,41,32,116,104,101,32,111,112,97,113,117,101,32,118,97,108,117,101,32,119,105,108,108,32,98,101,32,99,111,114,114,101,99,116,101,100,32,115,117,99,104,32,116,104,97,116,32,97,32,98,105,103,45,114,97,100,105,117,115,32,100,97,98,115,32,105,115,32,109,111,114,101,32,116,114,97,110,115,112,97,114,101,110,116,10,50,41,32,105,116,32,119,105,108,108,32,110,111,116,32,99,104,97,110,103,101,32,116,104,101,32,97,99,116,117,97,108,32,114,97,100,105,117,115,32,115,101,101,110,32,98,121,32,100,97,98,115,95,112,101,114,95,97,99,116,117,97,108,95,114,97,100,105,117,115,0,115,112,101,101,100,49,95,115,108,111,119,110,101,115,115,0,70,105,110,101,32,115,112,101,101,100,32,102,105,108,116,101,114,0,72,111,119,32,115,108,111,119,32,116,104,101,32,105,110,112,117,116,32,102,105,110,101,32,115,112,101,101,100,32,105,115,32,102,111,108,108,111,119,105,110,103,32,116,104,101,32,114,101,97,108,32,115,112,101,101,100,10,48,46,48,32,99,104,97,110,103,101,32,105,109,109,101,100,105,97,116,101,108,121,32,97,115,32,121,111,117,114,32,115,112,101,101,100,32,99,104,97,110,103,101,115,32,40,110,111,116,32,114,101,99,111,109,109,101,110,100,101,100,44,32,98,117,116,32,116,114,121,32,105,116,41,0,115,112,101,101,100,50,95,115,108,111,119,110,101,115,115,0,71,114,111,115,115,32,115,112,101,101,100,32,102,105,108,116,101,114,0,83,97,109,101,32,97,115,32,39,102,105,110,101,32,115,112,101,101,100,32,102,105,108,116,101,114,39,44,32,98,117,116,32,110,111,116,101,32,116,104,97,116,32,116,104,101,32,114,97,110,103,101,32,105,115,32,100,105,102,102,101,114,101,110,116,0,115,112,101,101,100,49,95,103,97,109,109,97,0,70,105,110,101,32,115,112,101,101,100,32,103,97,109,109,97,0,84,104,105,115,32,99,104,97,110,103,101,115,32,116,104,101,32,114,101,97,99,116,105,111,110,32,111,102,32,116,104,101,32,39,102,105,110,101,32,115,112,101,101,100,39,32,105,110,112,117,116,32,116,111,32,101,120,116,114,101,109,101,32,112,104,121,115,105,99,97,108,32,115,112,101,101,100,46,32,89,111,117,32,119,105,108,108,32,115,101,101,32,116,104,101,32,100,105,102,102,101,114,101,110,99,101,32,98,101,115,116,32,105,102,32,39,102,105,110,101,32,115,112,101,101,100,39,32,105,115,32,109,97,112,112,101,100,32,116,111,32,116,104,101,32,114,97,100,105,117,115,46,10,45,56,46,48,32,118,101,114,121,32,102,97,115,116,32,115,112,101,101,100,32,100,111,101,115,32,110,111,116,32,105,110,99,114,101,97,115,101,32,39,102,105,110,101,32,115,112,101,101,100,39,32,109,117,99,104,32,109,111,114,101,10,43,56,46,48,32,118,101,114,121,32,102,97,115,116,32,115,112,101,101,100,32,105,110,99,114,101,97,115,101,115,32,39,102,105,110,101,32,115,112,101,101,100,39,32,97,32,108,111,116,10,70,111,114,32,118,101,114,121,32,115,108,111,119,32,115,112,101,101,100,32,116,104,101,32,111,112,112,111,115,105,116,101,32,104,97,112,112,101,110,115,46,0,115,112,101,101,100,50,95,103,97,109,109,97,0,71,114,111,115,115,32,115,112,101,101,100,32,103,97,109,109,97,0,83,97,109,101,32,97,115,32,39,102,105,110,101,32,115,112,101,101,100,32,103,97,109,109,97,39,32,102,111,114,32,103,114,111,115,115,32,115,112,101,101,100,0,111,102,102,115,101,116,95,98,121,95,114,97,110,100,111,109,0,74,105,116,116,101,114,0,65,100,100,32,97,32,114,97,110,100,111,109,32,111,102,102,115,101,116,32,116,111,32,116,104,101,32,112,111,115,105,116,105,111,110,32,119,104,101,114,101,32,101,97,99,104,32,100,97,98,32,105,115,32,100,114,97,119,110,10,32,48,46,48,32,100,105,115,97,98,108,101,100,10,32,49,46,48,32,115,116,97,110,100,97,114,100,32,100,101,118,105,97,116,105,111,110,32,105,115,32,111,110,101,32,98,97,115,105,99,32,114,97,100,105,117,115,32,97,119,97,121,10,60,48,46,48,32,110,101,103,97,116,105,118,101,32,118,97,108,117,101,115,32,112,114,111,100,117,99,101,32,110,111,32,106,105,116,116,101,114,0,111,102,102,115,101,116,95,98,121,95,115,112,101,101,100,0,79,102,102,115,101,116,32,98,121,32,115,112,101,101,100,0,67,104,97,110,103,101,32,112,111,115,105,116,105,111,110,32,100,101,112,101,110,100,105,110,103,32,111,110,32,112,111,105,110,116,101,114,32,115,112,101,101,100,10,61,32,48,32,100,105,115,97,98,108,101,10,62,32,48,32,100,114,97,119,32,119,104,101,114,101,32,116,104,101,32,112,111,105,110,116,101,114,32,109,111,118,101,115,32,116,111,10,60,32,48,32,100,114,97,119,32,119,104,101,114,101,32,116,104,101,32,112,111,105,110,116,101,114,32,99,111,109,101,115,32,102,114,111,109,0,111,102,102,115,101,116,95,98,121,95,115,112,101,101,100,95,115,108,111,119,110,101,115,115,0,79,102,102,115,101,116,32,98,121,32,115,112,101,101,100,32,102,105,108,116,101,114,0,72,111,119,32,115,108,111,119,32,116,104,101,32,111,102,102,115,101,116,32,103,111,101,115,32,98,97,99,107,32,116,111,32,122,101,114,111,32,119,104,101,110,32,116,104,101,32,99,117,114,115,111,114,32,115,116,111,112,115,32,109,111,118,105,110,103,0,115,108,111,119,95,116,114,97,99,107,105,110,103,0,83,108,111,119,32,112,111,115,105,116,105,111,110,32,116,114,97,99,107,105,110,103,0,83,108,111,119,100,111,119,110,32,112,111,105,110,116,101,114,32,116,114,97,99,107,105,110,103,32,115,112,101,101,100,46,32,48,32,100,105,115,97,98,108,101,115,32,105,116,44,32,104,105,103,104,101,114,32,118,97,108,117,101,115,32,114,101,109,111,118,101,32,109,111,114,101,32,106,105,116,116,101,114,32,105,110,32,99,117,114,115,111,114,32,109,111,118,101,109,101,110,116,115,46,32,85,115,101,102,117,108,32,102,111,114,32,100,114,97,119,105,110,103,32,115,109,111,111,116,104,44,32,99,111,109,105,99,45,108,105,107,101,32,111,117,116,108,105,110,101,115,46,0,115,108,111,119,95,116,114,97,99,107,105,110,103,95,112,101,114,95,100,97,98,0,83,108,111,119,32,116,114,97,99,107,105,110,103,32,112,101,114,32,100,97,98,0,83,105,109,105,108,97,114,32,97,115,32,97,98,111,118,101,32,98,117,116,32,97,116,32,98,114,117,115,104,100,97,98,32,108,101,118,101,108,32,40,105,103,110,111,114,105,110,103,32,104,111,119,32,109,117,99,104,32,116,105,109,101,32,104,97,115,32,112,97,115,115,101,100,32,105,102,32,98,114,117,115,104,100,97,98,115,32,100,111,32,110,111,116,32,100,101,112,101,110,100,32,111,110,32,116,105,109,101,41,0,116,114,97,99,107,105,110,103,95,110,111,105,115,101,0,84,114,97,99,107,105,110,103,32,110,111,105,115,101,0,65,100,100,32,114,97,110,100,111,109,110,101,115,115,32,116,111,32,116,104,101,32,109,111,117,115,101,32,112,111,105,110,116,101,114,59,32,116,104,105,115,32,117,115,117,97,108,108,121,32,103,101,110,101,114,97,116,101,115,32,109,97,110,121,32,115,109,97,108,108,32,108,105,110,101,115,32,105,110,32,114,97,110,100,111,109,32,100,105,114,101,99,116,105,111,110,115,59,32,109,97,121,98,101,32,116,114,121,32,116,104,105,115,32,116,111,103,101,116,104,101,114,32,119,105,116,104,32,39,115,108,111,119,32,116,114,97,99,107,105,110,103,39,0,99,111,108,111,114,95,104,0,67,111,108,111,114,32,104,117,101,0,99,111,108,111,114,95,115,0,67,111,108,111,114,32,115,97,116,117,114,97,116,105,111,110,0,99,111,108,111,114,95,118,0,67,111,108,111,114,32,118,97,108,117,101,0,67,111,108,111,114,32,118,97,108,117,101,32,40,98,114,105,103,104,116,110,101,115,115,44,32,105,110,116,101,110,115,105,116,121,41,0,114,101,115,116,111,114,101,95,99,111,108,111,114,0,83,97,118,101,32,99,111,108,111,114,0,87,104,101,110,32,115,101,108,101,99,116,105,110,103,32,97,32,98,114,117,115,104,44,32,116,104,101,32,99,111,108,111,114,32,99,97,110,32,98,101,32,114,101,115,116,111,114,101,100,32,116,111,32,116,104,101,32,99,111,108,111,114,32,116,104,97,116,32,116,104,101,32,98,114,117,115,104,32,119,97,115,32,115,97,118,101,100,32,119,105,116,104,46,10,32,48,46,48,32,100,111,32,110,111,116,32,109,111,100,105,102,121,32,116,104,101,32,97,99,116,105,118,101,32,99,111,108,111,114,32,119,104,101,110,32,115,101,108,101,99,116,105,110,103,32,116,104,105,115,32,98,114,117,115,104,10,32,48,46,53,32,99,104,97,110,103,101,32,97,99,116,105,118,101,32,99,111,108,111,114,32,116,111,119,97,114,100,115,32,98,114,117,115,104,32,99,111,108,111,114,10,32,49,46,48,32,115,101,116,32,116,104,101,32,97,99,116,105,118,101,32,99,111,108,111,114,32,116,111,32,116,104,101,32,98,114,117,115,104,32,99,111,108,111,114,32,119,104,101,110,32,115,101,108,101,99,116,101,100,0,99,104,97,110,103,101,95,99,111,108,111,114,95,104,0,67,104,97,110,103,101,32,99,111,108,111,114,32,104,117,101,0,67,104,97,110,103,101,32,99,111,108,111,114,32,104,117,101,46,10,45,48,46,49,32,115,109,97,108,108,32,99,108,111,99,107,119,105,115,101,32,99,111,108,111,114,32,104,117,101,32,115,104,105,102,116,10,32,48,46,48,32,100,105,115,97,98,108,101,10,32,48,46,53,32,99,111,117,110,116,101,114,99,108,111,99,107,119,105,115,101,32,104,117,101,32,115,104,105,102,116,32,98,121,32,49,56,48,32,100,101,103,114,101,101,115,0,99,104,97,110,103,101,95,99,111,108,111,114,95,108,0,67,104,97,110,103,101,32,99,111,108,111,114,32,108,105,103,104,116,110,101,115,115,32,40,72,83,76,41,0,67,104,97,110,103,101,32,116,104,101,32,99,111,108,111,114,32,108,105,103,104,116,110,101,115,115,32,117,115,105,110,103,32,116,104,101,32,72,83,76,32,99,111,108,111,114,32,109,111,100,101,108,46,10,45,49,46,48,32,98,108,97,99,107,101,114,10,32,48,46,48,32,100,105,115,97,98,108,101,10,32,49,46,48,32,119,104,105,116,101,114,0,99,104,97,110,103,101,95,99,111,108,111,114,95,104,115,108,95,115,0,67,104,97,110,103,101,32,99,111,108,111,114,32,115,97,116,117,114,46,32,40,72,83,76,41,0,67,104,97,110,103,101,32,116,104,101,32,99,111,108,111,114,32,115,97,116,117,114,97,116,105,111,110,32,117,115,105,110,103,32,116,104,101,32,72,83,76,32,99,111,108,111,114,32,109,111,100,101,108,46,10,45,49,46,48,32,109,111,114,101,32,103,114,97,121,105,115,104,10,32,48,46,48,32,100,105,115,97,98,108,101,10,32,49,46,48,32,109,111,114,101,32,115,97,116,117,114,97,116,101,100,0,99,104,97,110,103,101,95,99,111,108,111,114,95,118,0,67,104,97,110,103,101,32,99,111,108,111,114,32,118,97,108,117,101,32,40,72,83,86,41,0,67,104,97,110,103,101,32,116,104,101,32,99,111,108,111,114,32,118,97,108,117,101,32,40,98,114,105,103,104,116,110,101,115,115,44,32,105,110,116,101,110,115,105,116,121,41,32,117,115,105,110,103,32,116,104,101,32,72,83,86,32,99,111,108,111,114,32,109,111,100,101,108,46,32,72,83,86,32,99,104,97,110,103,101,115,32,97,114,101,32,97,112,112,108,105,101,100,32,98,101,102,111,114,101,32,72,83,76,46,10,45,49,46,48,32,100,97,114,107,101,114,10,32,48,46,48,32,100,105,115,97,98,108,101,10,32,49,46,48,32,98,114,105,103,104,101,114,0,99,104,97,110,103,101,95,99,111,108,111,114,95,104,115,118,95,115,0,67,104,97,110,103,101,32,99,111,108,111,114,32,115,97,116,117,114,46,32,40,72,83,86,41,0,67,104,97,110,103,101,32,116,104,101,32,99,111,108,111,114,32,115,97,116,117,114,97,116,105,111,110,32,117,115,105,110,103,32,116,104,101,32,72,83,86,32,99,111,108,111,114,32,109,111,100,101,108,46,32,72,83,86,32,99,104,97,110,103,101,115,32,97,114,101,32,97,112,112,108,105,101,100,32,98,101,102,111,114,101,32,72,83,76,46,10,45,49,46,48,32,109,111,114,101,32,103,114,97,121,105,115,104,10,32,48,46,48,32,100,105,115,97,98,108,101,10,32,49,46,48,32,109,111,114,101,32,115,97,116,117,114,97,116,101,100,0,115,109,117,100,103,101,0,83,109,117,100,103,101,0,80,97,105,110,116,32,119,105,116,104,32,116,104,101,32,115,109,117,100,103,101,32,99,111,108,111,114,32,105,110,115,116,101,97,100,32,111,102,32,116,104,101,32,98,114,117,115,104,32,99,111,108,111,114,46,32,84,104,101,32,115,109,117,100,103,101,32,99,111,108,111,114,32,105,115,32,115,108,111,119,108,121,32,99,104,97,110,103,101,100,32,116,111,32,116,104,101,32,99,111,108,111,114,32,121,111,117,32,97,114,101,32,112,97,105,110,116,105,110,103,32,111,110,46,10,32,48,46,48,32,100,111,32,110,111,116,32,117,115,101,32,116,104,101,32,115,109,117,100,103,101,32,99,111,108,111,114,10,32,48,46,53,32,109,105,120,32,116,104,101,32,115,109,117,100,103,101,32,99,111,108,111,114,32,119,105,116,104,32,116,104,101,32,98,114,117,115,104,32,99,111,108,111,114,10,32,49,46,48,32,117,115,101,32,111,110,108,121,32,116,104,101,32,115,109,117,100,103,101,32,99,111,108,111,114,0,115,109,117,100,103,101,95,108,101,110,103,116,104,0,83,109,117,100,103,101,32,108,101,110,103,116,104,0,84,104,105,115,32,99,111,110,116,114,111,108,115,32,104,111,119,32,102,97,115,116,32,116,104,101,32,115,109,117,100,103,101,32,99,111,108,111,114,32,98,101,99,111,109,101,115,32,116,104,101,32,99,111,108,111,114,32,121,111,117,32,97,114,101,32,112,97,105,110,116,105,110,103,32,111,110,46,10,48,46,48,32,105,109,109,101,100,105,97,116,101,108,121,32,117,112,100,97,116,101,32,116,104,101,32,115,109,117,100,103,101,32,99,111,108,111,114,32,40,114,101,113,117,105,114,101,115,32,109,111,114,101,32,67,80,85,32,99,121,99,108,101,115,32,98,101,99,97,117,115,101,32,111,102,32,116,104,101,32,102,114,101,113,117,101,110,116,32,99,111,108,111,114,32,99,104,101,99,107,115,41,10,48,46,53,32,99,104,97,110,103,101,32,116,104,101,32,115,109,117,100,103,101,32,99,111,108,111,114,32,115,116,101,97,100,105,108,121,32,116,111,119,97,114,100,115,32,116,104,101,32,99,97,110,118,97,115,32,99,111,108,111,114,10,49,46,48,32,110,101,118,101,114,32,99,104,97,110,103,101,32,116,104,101,32,115,109,117,100,103,101,32,99,111,108,111,114,0,115,109,117,100,103,101,95,114,97,100,105,117,115,95,108,111,103,0,83,109,117,100,103,101,32,114,97,100,105,117,115,0,84,104,105,115,32,109,111,100,105,102,105,101,115,32,116,104,101,32,114,97,100,105,117,115,32,111,102,32,116,104,101,32,99,105,114,99,108,101,32,119,104,101,114,101,32,99,111,108,111,114,32,105,115,32,112,105,99,107,101,100,32,117,112,32,102,111,114,32,115,109,117,100,103,105,110,103,46,10,32,48,46,48,32,117,115,101,32,116,104,101,32,98,114,117,115,104,32,114,97,100,105,117,115,10,45,48,46,55,32,104,97,108,102,32,116,104,101,32,98,114,117,115,104,32,114,97,100,105,117,115,32,40,102,97,115,116,44,32,98,117,116,32,110,111,116,32,97,108,119,97,121,115,32,105,110,116,117,105,116,105,118,101,41,10,43,48,46,55,32,116,119,105,99,101,32,116,104,101,32,98,114,117,115,104,32,114,97,100,105,117,115,10,43,49,46,54,32,102,105,118,101,32,116,105,109,101,115,32,116,104,101,32,98,114,117,115,104,32,114,97,100,105,117,115,32,40,115,108,111,119,32,112,101,114,102,111,114,109,97,110,99,101,41,0,101,114,97,115,101,114,0,69,114,97,115,101,114,0,104,111,119,32,109,117,99,104,32,116,104,105,115,32,116,111,111,108,32,98,101,104,97,118,101,115,32,108,105,107,101,32,97,110,32,101,114,97,115,101,114,10,32,48,46,48,32,110,111,114,109,97,108,32,112,97,105,110,116,105,110,103,10,32,49,46,48,32,115,116,97,110,100,97,114,100,32,101,114,97,115,101,114,10,32,48,46,53,32,112,105,120,101,108,115,32,103,111,32,116,111,119,97,114,100,115,32,53,48,37,32,116,114,97,110,115,112,97,114,101,110,99,121,0,115,116,114,111,107,101,95,116,104,114,101,115,104,111,108,100,0,83,116,114,111,107,101,32,116,104,114,101,115,104,111,108,100,0,72,111,119,32,109,117,99,104,32,112,114,101,115,115,117,114,101,32,105,115,32,110,101,101,100,101,100,32,116,111,32,115,116,97,114,116,32,97,32,115,116,114,111,107,101,46,32,84,104,105,115,32,97,102,102,101,99,116,115,32,116,104,101,32,115,116,114,111,107,101,32,105,110,112,117,116,32,111,110,108,121,46,32,77,121,80,97,105,110,116,32,100,111,101,115,32,110,111,116,32,110,101,101,100,32,97,32,109,105,110,105,109,117,109,32,112,114,101,115,115,117,114,101,32,116,111,32,115,116,97,114,116,32,100,114,97,119,105,110,103,46,0,115,116,114,111,107,101,95,100,117,114,97,116,105,111,110,95,108,111,103,97,114,105,116,104,109,105,99,0,83,116,114,111,107,101,32,100,117,114,97,116,105,111,110,0,72,111,119,32,102,97,114,32,121,111,117,32,104,97,118,101,32,116,111,32,109,111,118,101,32,117,110,116,105,108,32,116,104,101,32,115,116,114,111,107,101,32,105,110,112,117,116,32,114,101,97,99,104,101,115,32,49,46,48,46,32,84,104,105,115,32,118,97,108,117,101,32,105,115,32,108,111,103,97,114,105,116,104,109,105,99,32,40,110,101,103,97,116,105,118,101,32,118,97,108,117,101,115,32,119,105,108,108,32,110,111,116,32,105,110,118,101,114,116,32,116,104,101,32,112,114,111,99,101,115,115,41,46,0,115,116,114,111,107,101,95,104,111,108,100,116,105,109,101,0,83,116,114,111,107,101,32,104,111,108,100,32,116,105,109,101,0,84,104,105,115,32,100,101,102,105,110,101,115,32,104,111,119,32,108,111,110,103,32,116,104,101,32,115,116,114,111,107,101,32,105,110,112,117,116,32,115,116,97,121,115,32,97,116,32,49,46,48,46,32,65,102,116,101,114,32,116,104,97,116,32,105,116,32,119,105,108,108,32,114,101,115,101,116,32,116,111,32,48,46,48,32,97,110,100,32,115,116,97,114,116,32,103,114,111,119,105,110,103,32,97,103,97,105,110,44,32,101,118,101,110,32,105,102,32,116,104,101,32,115,116,114,111,107,101,32,105,115,32,110,111,116,32,121,101,116,32,102,105,110,105,115,104,101,100,46,10,50,46,48,32,109,101,97,110,115,32,116,119,105,99,101,32,97,115,32,108,111,110,103,32,97,115,32,105,116,32,116,97,107,101,115,32,116,111,32,103,111,32,102,114,111,109,32,48,46,48,32,116,111,32,49,46,48,10,57,46,57,32,111,114,32,104,105,103,104,101,114,32,115,116,97,110,100,115,32,102,111,114,32,105,110,102,105,110,105,116,101,0,99,117,115,116,111,109,95,105,110,112,117,116,0,67,117,115,116,111,109,32,105,110,112,117,116,0,83,101,116,32,116,104,101,32,99,117,115,116,111,109,32,105,110,112,117,116,32,116,111,32,116,104,105,115,32,118,97,108,117,101,46,32,73,102,32,105,116,32,105,115,32,115,108,111,119,101,100,32,100,111,119,110,44,32,109,111,118,101,32,105,116,32,116,111,119,97,114,100,115,32,116,104,105,115,32,118,97,108,117,101,32,40,115,101,101,32,98,101,108,111,119,41,46,32,84,104,101,32,105,100,101,97,32,105,115,32,116,104,97,116,32,121,111,117,32,109,97,107,101,32,116,104,105,115,32,105,110,112,117,116,32,100,101,112,101,110,100,32,111,110,32,97,32,109,105,120,116,117,114,101,32,111,102,32,112,114,101,115,115,117,114,101,47,115,112,101,101,100,47,119,104,97,116,101,118,101,114,44,32,97,110,100,32,116,104,101,110,32,109,97,107,101,32,111,116,104,101,114,32,115,101,116,116,105], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([110,103,115,32,100,101,112,101,110,100,32,111,110,32,116,104,105,115,32,39,99,117,115,116,111,109,32,105,110,112,117,116,39,32,105,110,115,116,101,97,100,32,111,102,32,114,101,112,101,97,116,105,110,103,32,116,104,105,115,32,99,111,109,98,105,110,97,116,105,111,110,32,101,118,101,114,121,119,104,101,114,101,32,121,111,117,32,110,101,101,100,32,105,116,46,10,73,102,32,121,111,117,32,109,97,107,101,32,105,116,32,99,104,97,110,103,101,32,39,98,121,32,114,97,110,100,111,109,39,32,121,111,117,32,99,97,110,32,103,101,110,101,114,97,116,101,32,97,32,115,108,111,119,32,40,115,109,111,111,116,104,41,32,114,97,110,100,111,109,32,105,110,112,117,116,46,0,99,117,115,116,111,109,95,105,110,112,117,116,95,115,108,111,119,110,101,115,115,0,67,117,115,116,111,109,32,105,110,112,117,116,32,102,105,108,116,101,114,0,72,111,119,32,115,108,111,119,32,116,104,101,32,99,117,115,116,111,109,32,105,110,112,117,116,32,97,99,116,117,97,108,108,121,32,102,111,108,108,111,119,115,32,116,104,101,32,100,101,115,105,114,101,100,32,118,97,108,117,101,32,40,116,104,101,32,111,110,101,32,97,98,111,118,101,41,46,32,84,104,105,115,32,104,97,112,112,101,110,115,32,97,116,32,98,114,117,115,104,100,97,98,32,108,101,118,101,108,32,40,105,103,110,111,114,105,110,103,32,104,111,119,32,109,117,99,104,32,116,105,109,101,32,104,97,115,32,112,97,115,115,101,100,44,32,105,102,32,98,114,117,115,104,100,97,98,115,32,100,111,32,110,111,116,32,100,101,112,101,110,100,32,111,110,32,116,105,109,101,41,46,10,48,46,48,32,110,111,32,115,108,111,119,100,111,119,110,32,40,99,104,97,110,103,101,115,32,97,112,112,108,121,32,105,110,115,116,97,110,116,108,121,41,0,101,108,108,105,112,116,105,99,97,108,95,100,97,98,95,114,97,116,105,111,0,69,108,108,105,112,116,105,99,97,108,32,100,97,98,58,32,114,97,116,105,111,0,65,115,112,101,99,116,32,114,97,116,105,111,32,111,102,32,116,104,101,32,100,97,98,115,59,32,109,117,115,116,32,98,101,32,62,61,32,49,46,48,44,32,119,104,101,114,101,32,49,46,48,32,109,101,97,110,115,32,97,32,112,101,114,102,101,99,116,108,121,32,114,111,117,110,100,32,100,97,98,46,32,84,79,68,79,58,32,108,105,110,101,97,114,105,122,101,63,32,115,116,97,114,116,32,97,116,32,48,46,48,32,109,97,121,98,101,44,32,111,114,32,108,111,103,63,0,101,108,108,105,112,116,105,99,97,108,95,100,97,98,95,97,110,103,108,101,0,69,108,108,105,112,116,105,99,97,108,32,100,97,98,58,32,97,110,103,108,101,0,65,110,103,108,101,32,98,121,32,119,104,105,99,104,32,101,108,108,105,112,116,105,99,97,108,32,100,97,98,115,32,97,114,101,32,116,105,108,116,101,100,10,32,48,46,48,32,104,111,114,105,122,111,110,116,97,108,32,100,97,98,115,10,32,52,53,46,48,32,52,53,32,100,101,103,114,101,101,115,44,32,116,117,114,110,101,100,32,99,108,111,99,107,119,105,115,101,10,32,49,56,48,46,48,32,104,111,114,105,122,111,110,116,97,108,32,97,103,97,105,110,0,100,105,114,101,99,116,105,111,110,95,102,105,108,116,101,114,0,68,105,114,101,99,116,105,111,110,32,102,105,108,116,101,114,0,65,32,108,111,119,32,118,97,108,117,101,32,119,105,108,108,32,109,97,107,101,32,116,104,101,32,100,105,114,101,99,116,105,111,110,32,105,110,112,117,116,32,97,100,97,112,116,32,109,111,114,101,32,113,117,105,99,107,108,121,44,32,97,32,104,105,103,104,32,118,97,108,117,101,32,119,105,108,108,32,109,97,107,101,32,105,116,32,115,109,111,111,116,104,101,114,0,108,111,99,107,95,97,108,112,104,97,0,76,111,99,107,32,97,108,112,104,97,0,68,111,32,110,111,116,32,109,111,100,105,102,121,32,116,104,101,32,97,108,112,104,97,32,99,104,97,110,110,101,108,32,111,102,32,116,104,101,32,108,97,121,101,114,32,40,112,97,105,110,116,32,111,110,108,121,32,119,104,101,114,101,32,116,104,101,114,101,32,105,115,32,112,97,105,110,116,32,97,108,114,101,97,100,121,41,10,32,48,46,48,32,110,111,114,109,97,108,32,112,97,105,110,116,105,110,103,10,32,48,46,53,32,104,97,108,102,32,111,102,32,116,104,101,32,112,97,105,110,116,32,103,101,116,115,32,97,112,112,108,105,101,100,32,110,111,114,109,97,108,108,121,10,32,49,46,48,32,97,108,112,104,97,32,99,104,97,110,110,101,108,32,102,117,108,108,121,32,108,111,99,107,101,100,0,99,111,108,111,114,105,122,101,0,67,111,108,111,114,105,122,101,0,67,111,108,111,114,105,122,101,32,116,104,101,32,116,97,114,103,101,116,32,108,97,121,101,114,44,32,115,101,116,116,105,110,103,32,105,116,115,32,104,117,101,32,97,110,100,32,115,97,116,117,114,97,116,105,111,110,32,102,114,111,109,32,116,104,101,32,97,99,116,105,118,101,32,98,114,117,115,104,32,99,111,108,111,114,32,119,104,105,108,101,32,114,101,116,97,105,110,105,110,103,32,105,116,115,32,118,97,108,117,101,32,97,110,100,32,97,108,112,104,97,46,0,115,110,97,112,95,116,111,95,112,105,120,101,108,0,83,110,97,112,32,116,111,32,112,105,120,101,108,0,83,110,97,112,32,98,114,117,115,104,32,100,97,98,39,115,32,99,101,110,116,101,114,32,97,110,100,32,105,116,115,32,114,97,100,105,117,115,32,116,111,32,112,105,120,101,108,115,46,32,83,101,116,32,116,104,105,115,32,116,111,32,49,46,48,32,102,111,114,32,97,32,116,104,105,110,32,112,105,120,101,108,32,98,114,117,115,104,46,0,112,114,101,115,115,117,114,101,95,103,97,105,110,95,108,111,103,0,80,114,101,115,115,117,114,101,32,103,97,105,110,0,84,104,105,115,32,99,104,97,110,103,101,115,32,104,111,119,32,104,97,114,100,32,121,111,117,32,104,97,118,101,32,116,111,32,112,114,101,115,115,46,32,73,116,32,109,117,108,116,105,112,108,105,101,115,32,116,97,98,108,101,116,32,112,114,101,115,115,117,114,101,32,98,121,32,97,32,99,111,110,115,116,97,110,116,32,102,97,99,116,111,114,46,0,112,114,101,115,115,117,114,101,0,80,114,101,115,115,117,114,101,0,84,104,101,32,112,114,101,115,115,117,114,101,32,114,101,112,111,114,116,101,100,32,98,121,32,116,104,101,32,116,97,98,108,101,116,46,32,85,115,117,97,108,108,121,32,98,101,116,119,101,101,110,32,48,46,48,32,97,110,100,32,49,46,48,44,32,98,117,116,32,105,116,32,109,97,121,32,103,101,116,32,108,97,114,103,101,114,32,119,104,101,110,32,97,32,112,114,101,115,115,117,114,101,32,103,97,105,110,32,105,115,32,117,115,101,100,46,32,73,102,32,121,111,117,32,117,115,101,32,116,104,101,32,109,111,117,115,101,44,32,105,116,32,119,105,108,108,32,98,101,32,48,46,53,32,119,104,101,110,32,97,32,98,117,116,116,111,110,32,105,115,32,112,114,101,115,115,101,100,32,97,110,100,32,48,46,48,32,111,116,104,101,114,119,105,115,101,46,0,115,112,101,101,100,49,0,70,105,110,101,32,115,112,101,101,100,0,72,111,119,32,102,97,115,116,32,121,111,117,32,99,117,114,114,101,110,116,108,121,32,109,111,118,101,46,32,84,104,105,115,32,99,97,110,32,99,104,97,110,103,101,32,118,101,114,121,32,113,117,105,99,107,108,121,46,32,84,114,121,32,39,112,114,105,110,116,32,105,110,112,117,116,32,118,97,108,117,101,115,39,32,102,114,111,109,32,116,104,101,32,39,104,101,108,112,39,32,109,101,110,117,32,116,111,32,103,101,116,32,97,32,102,101,101,108,105,110,103,32,102,111,114,32,116,104,101,32,114,97,110,103,101,59,32,110,101,103,97,116,105,118,101,32,118,97,108,117,101,115,32,97,114,101,32,114,97,114,101,32,98,117,116,32,112,111,115,115,105,98,108,101,32,102,111,114,32,118,101,114,121,32,108,111,119,32,115,112,101,101,100,46,0,115,112,101,101,100,50,0,71,114,111,115,115,32,115,112,101,101,100,0,83,97,109,101,32,97,115,32,102,105,110,101,32,115,112,101,101,100,44,32,98,117,116,32,99,104,97,110,103,101,115,32,115,108,111,119,101,114,46,32,65,108,115,111,32,108,111,111,107,32,97,116,32,116,104,101,32,39,103,114,111,115,115,32,115,112,101,101,100,32,102,105,108,116,101,114,39,32,115,101,116,116,105,110,103,46,0,114,97,110,100,111,109,0,82,97,110,100,111,109,0,70,97,115,116,32,114,97,110,100,111,109,32,110,111,105,115,101,44,32,99,104,97,110,103,105,110,103,32,97,116,32,101,97,99,104,32,101,118,97,108,117,97,116,105,111,110,46,32,69,118,101,110,108,121,32,100,105,115,116,114,105,98,117,116,101,100,32,98,101,116,119,101,101,110,32,48,32,97,110,100,32,49,46,0,115,116,114,111,107,101,0,83,116,114,111,107,101,0,84,104,105,115,32,105,110,112,117,116,32,115,108,111,119,108,121,32,103,111,101,115,32,102,114,111,109,32,122,101,114,111,32,116,111,32,111,110,101,32,119,104,105,108,101,32,121,111,117,32,100,114,97,119,32,97,32,115,116,114,111,107,101,46,32,73,116,32,99,97,110,32,97,108,115,111,32,98,101,32,99,111,110,102,105,103,117,114,101,100,32,116,111,32,106,117,109,112,32,98,97,99,107,32,116,111,32,122,101,114,111,32,112,101,114,105,111,100,105,99,97,108,108,121,32,119,104,105,108,101,32,121,111,117,32,109,111,118,101,46,32,76,111,111,107,32,97,116,32,116,104,101,32,39,115,116,114,111,107,101,32,100,117,114,97,116,105,111,110,39,32,97,110,100,32,39,115,116,114,111,107,101,32,104,111,108,100,32,116,105,109,101,39,32,115,101,116,116,105,110,103,115,46,0,100,105,114,101,99,116,105,111,110,0,68,105,114,101,99,116,105,111,110,0,84,104,101,32,97,110,103,108,101,32,111,102,32,116,104,101,32,115,116,114,111,107,101,44,32,105,110,32,100,101,103,114,101,101,115,46,32,84,104,101,32,118,97,108,117,101,32,119,105,108,108,32,115,116,97,121,32,98,101,116,119,101,101,110,32,48,46,48,32,97,110,100,32,49,56,48,46,48,44,32,101,102,102,101,99,116,105,118,101,108,121,32,105,103,110,111,114,105,110,103,32,116,117,114,110,115,32,111,102,32,49,56,48,32,100,101,103,114,101,101,115,46,0,116,105,108,116,95,100,101,99,108,105,110,97,116,105,111,110,0,68,101,99,108,105,110,97,116,105,111,110,0,68,101,99,108,105,110,97,116,105,111,110,32,111,102,32,115,116,121,108,117,115,32,116,105,108,116,46,32,48,32,119,104,101,110,32,115,116,121,108,117,115,32,105,115,32,112,97,114,97,108,108,101,108,32,116,111,32,116,97,98,108,101,116,32,97,110,100,32,57,48,46,48,32,119,104,101,110,32,105,116,39,115,32,112,101,114,112,101,110,100,105,99,117,108,97,114,32,116,111,32,116,97,98,108,101,116,46,0,116,105,108,116,95,97,115,99,101,110,115,105,111,110,0,65,115,99,101,110,115,105,111,110,0,82,105,103,104,116,32,97,115,99,101,110,115,105,111,110,32,111,102,32,115,116,121,108,117,115,32,116,105,108,116,46,32,48,32,119,104,101,110,32,115,116,121,108,117,115,32,119,111,114,107,105,110,103,32,101,110,100,32,112,111,105,110,116,115,32,116,111,32,121,111,117,44,32,43,57,48,32,119,104,101,110,32,114,111,116,97,116,101,100,32,57,48,32,100,101,103,114,101,101,115,32,99,108,111,99,107,119,105,115,101,44,32,45,57,48,32,119,104,101,110,32,114,111,116,97,116,101,100,32,57,48,32,100,101,103,114,101,101,115,32,99,111,117,110,116,101,114,99,108,111,99,107,119,105,115,101,46,0,99,117,115,116,111,109,0,67,117,115,116,111,109,0,84,104,105,115,32,105,115,32,97,32,117,115,101,114,32,100,101,102,105,110,101,100,32,105,110,112,117,116,46,32,76,111,111,107,32,97,116,32,116,104,101,32,39,99,117,115,116,111,109,32,105,110,112,117,116,39,32,115,101,116,116,105,110,103,32,102,111,114,32,100,101,116,97,105,108,115,46,0,84,33,34,25,13,1,2,3,17,75,28,12,16,4,11,29,18,30,39,104,110,111,112,113,98,32,5,6,15,19,20,21,26,8,22,7,40,36,23,24,9,10,14,27,31,37,35,131,130,125,38,42,43,60,61,62,63,67,71,74,77,88,89,90,91,92,93,94,95,96,97,99,100,101,102,103,105,106,107,108,114,115,116,121,122,123,124,0,73,108,108,101,103,97,108,32,98,121,116,101,32,115,101,113,117,101,110,99,101,0,68,111,109,97,105,110,32,101,114,114,111,114,0,82,101,115,117,108,116,32,110,111,116,32,114,101,112,114,101,115,101,110,116,97,98,108,101,0,78,111,116,32,97,32,116,116,121,0,80,101,114,109,105,115,115,105,111,110,32,100,101,110,105,101,100,0,79,112,101,114,97,116,105,111,110,32,110,111,116,32,112,101,114,109,105,116,116,101,100,0,78,111,32,115,117,99,104,32,102,105,108,101,32,111,114,32,100,105,114,101,99,116,111,114,121,0,78,111,32,115,117,99,104,32,112,114,111,99,101,115,115,0,70,105,108,101,32,101,120,105,115,116,115,0,86,97,108,117,101,32,116,111,111,32,108,97,114,103,101,32,102,111,114,32,100,97,116,97,32,116,121,112,101,0,78,111,32,115,112,97,99,101,32,108,101,102,116,32,111,110,32,100,101,118,105,99,101,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,82,101,115,111,117,114,99,101,32,98,117,115,121,0,73,110,116,101,114,114,117,112,116,101,100,32,115,121,115,116,101,109,32,99,97,108,108,0,82,101,115,111,117,114,99,101,32,116,101,109,112,111,114,97,114,105,108,121,32,117,110,97,118,97,105,108,97,98,108,101,0,73,110,118,97,108,105,100,32,115,101,101,107,0,67,114,111,115,115,45,100,101,118,105,99,101,32,108,105,110,107,0,82,101,97,100,45,111,110,108,121,32,102,105,108,101,32,115,121,115,116,101,109,0,68,105,114,101,99,116,111,114,121,32,110,111,116,32,101,109,112,116,121,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,112,101,101,114,0,79,112,101,114,97,116,105,111,110,32,116,105,109,101,100,32,111,117,116,0,67,111,110,110,101,99,116,105,111,110,32,114,101,102,117,115,101,100,0,72,111,115,116,32,105,115,32,100,111,119,110,0,72,111,115,116,32,105,115,32,117,110,114,101,97,99,104,97,98,108,101,0,65,100,100,114,101,115,115,32,105,110,32,117,115,101,0,66,114,111,107,101,110,32,112,105,112,101,0,73,47,79,32,101,114,114,111,114,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,32,111,114,32,97,100,100,114,101,115,115,0,66,108,111,99,107,32,100,101,118,105,99,101,32,114,101,113,117,105,114,101,100,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,0,78,111,116,32,97,32,100,105,114,101,99,116,111,114,121,0,73,115,32,97,32,100,105,114,101,99,116,111,114,121,0,84,101,120,116,32,102,105,108,101,32,98,117,115,121,0,69,120,101,99,32,102,111,114,109,97,116,32,101,114,114,111,114,0,73,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,0,65,114,103,117,109,101,110,116,32,108,105,115,116,32,116,111,111,32,108,111,110,103,0,83,121,109,98,111,108,105,99,32,108,105,110,107,32,108,111,111,112,0,70,105,108,101,110,97,109,101,32,116,111,111,32,108,111,110,103,0,84,111,111,32,109,97,110,121,32,111,112,101,110,32,102,105,108,101,115,32,105,110,32,115,121,115,116,101,109,0,78,111,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,115,32,97,118,97,105,108,97,98,108,101,0,66,97,100,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,0,78,111,32,99,104,105,108,100,32,112,114,111,99,101,115,115,0,66,97,100,32,97,100,100,114,101,115,115,0,70,105,108,101,32,116,111,111,32,108,97,114,103,101,0,84,111,111,32,109,97,110,121,32,108,105,110,107,115,0,78,111,32,108,111,99,107,115,32,97,118,97,105,108,97,98,108,101,0,82,101,115,111,117,114,99,101,32,100,101,97,100,108,111,99,107,32,119,111,117,108,100,32,111,99,99,117,114,0,83,116,97,116,101,32,110,111,116,32,114,101,99,111,118,101,114,97,98,108,101,0,80,114,101,118,105,111,117,115,32,111,119,110,101,114,32,100,105,101,100,0,79,112,101,114,97,116,105,111,110,32,99,97,110,99,101,108,101,100,0,70,117,110,99,116,105,111,110,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,78,111,32,109,101,115,115,97,103,101,32,111,102,32,100,101,115,105,114,101,100,32,116,121,112,101,0,73,100,101,110,116,105,102,105,101,114,32,114,101,109,111,118,101,100,0,68,101,118,105,99,101,32,110,111,116,32,97,32,115,116,114,101,97,109,0,78,111,32,100,97,116,97,32,97,118,97,105,108,97,98,108,101,0,68,101,118,105,99,101,32,116,105,109,101,111,117,116,0,79,117,116,32,111,102,32,115,116,114,101,97,109,115,32,114,101,115,111,117,114,99,101,115,0,76,105,110,107,32,104,97,115,32,98,101,101,110,32,115,101,118,101,114,101,100,0,80,114,111,116,111,99,111,108,32,101,114,114,111,114,0,66,97,100,32,109,101,115,115,97,103,101,0,70,105,108,101,32,100,101,115,99,114,105,112,116,111,114,32,105,110,32,98,97,100,32,115,116,97,116,101,0,78,111,116,32,97,32,115,111,99,107,101,116,0,68,101,115,116,105,110,97,116,105,111,110,32,97,100,100,114,101,115,115,32,114,101,113,117,105,114,101,100,0,77,101,115,115,97,103,101,32,116,111,111,32,108,97,114,103,101,0,80,114,111,116,111,99,111,108,32,119,114,111,110,103,32,116,121,112,101,32,102,111,114,32,115,111,99,107,101,116,0,80,114,111,116,111,99,111,108,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,80,114,111,116,111,99,111,108,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,83,111,99,107,101,116,32,116,121,112,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,78,111,116,32,115,117,112,112,111,114,116,101,100,0,80,114,111,116,111,99,111,108,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,65,100,100,114,101,115,115,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,98,121,32,112,114,111,116,111,99,111,108,0,65,100,100,114,101,115,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,78,101,116,119,111,114,107,32,105,115,32,100,111,119,110,0,78,101,116,119,111,114,107,32,117,110,114,101,97,99,104,97,98,108,101,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,110,101,116,119,111,114,107,0,67,111,110,110,101,99,116,105,111,110,32,97,98,111,114,116,101,100,0,78,111,32,98,117,102,102,101,114,32,115,112,97,99,101,32,97,118,97,105,108,97,98,108,101,0,83,111,99,107,101,116,32,105,115,32,99,111,110,110,101,99,116,101,100,0,83,111,99,107,101,116,32,110,111,116,32,99,111,110,110,101,99,116,101,100,0,67,97,110,110,111,116,32,115,101,110,100,32,97,102,116,101,114,32,115,111,99,107,101,116,32,115,104,117,116,100,111,119,110,0,79,112,101,114,97,116,105,111,110,32,97,108,114,101,97,100,121,32,105,110,32,112,114,111,103,114,101,115,115,0,79,112,101,114,97,116,105,111,110,32,105,110,32,112,114,111,103,114,101,115,115,0,83,116,97,108,101,32,102,105,108,101,32,104,97,110,100,108,101,0,82,101,109,111,116,101,32,73,47,79,32,101,114,114,111,114,0,81,117,111,116,97,32,101,120,99,101,101,100,101,100,0,78,111,32,109,101,100,105,117,109,32,102,111,117,110,100,0,87,114,111,110,103,32,109,101,100,105,117,109,32,116,121,112,101,0,78,111,32,101,114,114,111,114,32,105,110,102,111,114,109,97,116,105,111,110], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+10240);
/* memory initializer */ allocate([17,0,10,0,17,17,17,0,0,0,0,5,0,0,0,0,0,0,9,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,15,10,17,17,17,3,10,7,0,1,19,9,11,11,0,0,9,6,11,0,0,11,0,6,17,0,0,0,17,17,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,10,10,17,17,17,0,10,0,0,2,0,9,11,0,0,0,9,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,4,13,0,0,0,0,9,14,0,0,0,0,0,14,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,15,0,0,0,0,9,16,0,0,0,0,0,16,0,0,16,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,10,0,0,0,0,9,11,0,0,0,0,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,45,43,32,32,32,48,88,48,120,0,40,110,117,108,108,41,0,45,48,88,43,48,88,32,48,88,45,48,120,43,48,120,32,48,120,0,105,110,102,0,73,78,70,0,110,97,110,0,78,65,78,0,46,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+16070);





/* no memory initializer */
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}

// {{PRE_LIBRARY}}


   
  Module["_i64Subtract"] = _i64Subtract;

  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }

   
  Module["_memset"] = _memset;

  var _BDtoILow=true;

   
  Module["_bitshift64Shl"] = _bitshift64Shl;

  function _abort() {
      Module['abort']();
    }

  var _sqrtf=Math_sqrt;

   
  Module["_i64Add"] = _i64Add;

  var _floor=Math_floor;

  var _sqrt=Math_sqrt;

  var _llvm_pow_f32=Math_pow;

  
  var SYSCALLS={varargs:0,get:function (varargs) {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function () {
        var ret = Pointer_stringify(SYSCALLS.get());
        return ret;
      },get64:function () {
        var low = SYSCALLS.get(), high = SYSCALLS.get();
        if (low >= 0) assert(high === 0);
        else assert(high === -1);
        return low;
      },getZero:function () {
        assert(SYSCALLS.get() === 0);
      }};function ___syscall6(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // close
      var stream = SYSCALLS.getStreamFromFD();
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  var _atan2f=Math_atan2;

  function ___syscall54(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // ioctl
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  
  function ___setErrNo(value) {
      if (Module['___errno_location']) HEAP32[((Module['___errno_location']())>>2)]=value;
      else Module.printErr('failed to set errno from JS');
      return value;
    }
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 85: return totalMemory / PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 79:
          return 0;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: {
          if (typeof navigator === 'object') return navigator['hardwareConcurrency'] || 1;
          return 1;
        }
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

   
  Module["_bitshift64Lshr"] = _bitshift64Lshr;

  var _BDtoIHigh=true;

  function _pthread_cleanup_push(routine, arg) {
      __ATEXIT__.push(function() { Runtime.dynCall('vi', routine, [arg]) })
      _pthread_cleanup_push.level = __ATEXIT__.length;
    }

  function _pthread_cleanup_pop() {
      assert(_pthread_cleanup_push.level == __ATEXIT__.length, 'cannot pop if something else added meanwhile!');
      __ATEXIT__.pop();
      _pthread_cleanup_push.level = __ATEXIT__.length;
    }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  var _log=Math_log;

  var _cos=Math_cos;

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) {
        var success = self.alloc(bytes);
        if (!success) return -1 >>> 0; // sbrk failure code
      }
      return ret;  // Previous break location.
    }

  var _BItoD=true;

  var _sin=Math_sin;

  var _atan2=Math_atan2;

  var _exp=Math_exp;

  function _time(ptr) {
      var ret = (Date.now()/1000)|0;
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function _pthread_self() {
      //FIXME: assumes only a single thread
      return 0;
    }

  function ___syscall140(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // llseek
      var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
      var offset = offset_low;
      assert(offset_high === 0);
      FS.llseek(stream, offset, whence);
      HEAP32[((result)>>2)]=stream.position;
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall146(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // writev
      // hack to support printf in NO_FILESYSTEM
      var stream = SYSCALLS.get(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
      var ret = 0;
      if (!___syscall146.buffer) ___syscall146.buffer = [];
      var buffer = ___syscall146.buffer;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAP32[(((iov)+(i*8))>>2)];
        var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
        for (var j = 0; j < len; j++) {
          var curr = HEAPU8[ptr+j];
          if (curr === 0 || curr === 10) {
            Module['print'](UTF8ArrayToString(buffer, 0));
            buffer.length = 0;
          } else {
            buffer.push(curr);
          }
        }
        ret += len;
      }
      return ret;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  var _expf=Math_exp;
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + TOTAL_STACK;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);


function nullFunc_iiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vdddiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'vdddiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vidddiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'vidddiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vi(x) { Module["printErr"]("Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_ii(x) { Module["printErr"]("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iddddddddddddd(x) { Module["printErr"]("Invalid function pointer called with signature 'iddddddddddddd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiddddddddddddd(x) { Module["printErr"]("Invalid function pointer called with signature 'iiddddddddddddd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function jsCall_iiii(index,a1,a2,a3) {
    return Runtime.functionPointers[index](a1,a2,a3);
}

function invoke_vdddiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_vdddiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function jsCall_vdddiiii(index,a1,a2,a3,a4,a5,a6,a7) {
    Runtime.functionPointers[index](a1,a2,a3,a4,a5,a6,a7);
}

function invoke_vidddiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_vidddiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function jsCall_vidddiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
    Runtime.functionPointers[index](a1,a2,a3,a4,a5,a6,a7,a8);
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function jsCall_vi(index,a1) {
    Runtime.functionPointers[index](a1);
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function jsCall_ii(index,a1) {
    return Runtime.functionPointers[index](a1);
}

function invoke_iddddddddddddd(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13) {
  try {
    return Module["dynCall_iddddddddddddd"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function jsCall_iddddddddddddd(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13) {
    return Runtime.functionPointers[index](a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13);
}

function invoke_iiddddddddddddd(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14) {
  try {
    return Module["dynCall_iiddddddddddddd"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function jsCall_iiddddddddddddd(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14) {
    return Runtime.functionPointers[index](a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14);
}

Module.asmGlobalArg = { "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array, "NaN": NaN, "Infinity": Infinity };

Module.asmLibraryArg = { "abort": abort, "assert": assert, "nullFunc_iiii": nullFunc_iiii, "nullFunc_vdddiiii": nullFunc_vdddiiii, "nullFunc_vidddiiii": nullFunc_vidddiiii, "nullFunc_vi": nullFunc_vi, "nullFunc_ii": nullFunc_ii, "nullFunc_iddddddddddddd": nullFunc_iddddddddddddd, "nullFunc_iiddddddddddddd": nullFunc_iiddddddddddddd, "invoke_iiii": invoke_iiii, "jsCall_iiii": jsCall_iiii, "invoke_vdddiiii": invoke_vdddiiii, "jsCall_vdddiiii": jsCall_vdddiiii, "invoke_vidddiiii": invoke_vidddiiii, "jsCall_vidddiiii": jsCall_vidddiiii, "invoke_vi": invoke_vi, "jsCall_vi": jsCall_vi, "invoke_ii": invoke_ii, "jsCall_ii": jsCall_ii, "invoke_iddddddddddddd": invoke_iddddddddddddd, "jsCall_iddddddddddddd": jsCall_iddddddddddddd, "invoke_iiddddddddddddd": invoke_iiddddddddddddd, "jsCall_iiddddddddddddd": jsCall_iiddddddddddddd, "_pthread_cleanup_pop": _pthread_cleanup_pop, "_sin": _sin, "_exp": _exp, "_sqrtf": _sqrtf, "___syscall6": ___syscall6, "_atan2": _atan2, "___assert_fail": ___assert_fail, "_atan2f": _atan2f, "_floor": _floor, "___setErrNo": ___setErrNo, "_sbrk": _sbrk, "_llvm_pow_f32": _llvm_pow_f32, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_sysconf": _sysconf, "_cos": _cos, "_pthread_self": _pthread_self, "_sqrt": _sqrt, "___syscall54": ___syscall54, "_log": _log, "_expf": _expf, "_abort": _abort, "_pthread_cleanup_push": _pthread_cleanup_push, "_time": _time, "___syscall140": ___syscall140, "___syscall146": ___syscall146, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8 };
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'almost asm';
  
  
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);


  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var cttz_i8=env.cttz_i8|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = global.NaN, inf = global.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;

  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var Math_min=global.Math.min;
  var Math_clz32=global.Math.clz32;
  var abort=env.abort;
  var assert=env.assert;
  var nullFunc_iiii=env.nullFunc_iiii;
  var nullFunc_vdddiiii=env.nullFunc_vdddiiii;
  var nullFunc_vidddiiii=env.nullFunc_vidddiiii;
  var nullFunc_vi=env.nullFunc_vi;
  var nullFunc_ii=env.nullFunc_ii;
  var nullFunc_iddddddddddddd=env.nullFunc_iddddddddddddd;
  var nullFunc_iiddddddddddddd=env.nullFunc_iiddddddddddddd;
  var invoke_iiii=env.invoke_iiii;
  var jsCall_iiii=env.jsCall_iiii;
  var invoke_vdddiiii=env.invoke_vdddiiii;
  var jsCall_vdddiiii=env.jsCall_vdddiiii;
  var invoke_vidddiiii=env.invoke_vidddiiii;
  var jsCall_vidddiiii=env.jsCall_vidddiiii;
  var invoke_vi=env.invoke_vi;
  var jsCall_vi=env.jsCall_vi;
  var invoke_ii=env.invoke_ii;
  var jsCall_ii=env.jsCall_ii;
  var invoke_iddddddddddddd=env.invoke_iddddddddddddd;
  var jsCall_iddddddddddddd=env.jsCall_iddddddddddddd;
  var invoke_iiddddddddddddd=env.invoke_iiddddddddddddd;
  var jsCall_iiddddddddddddd=env.jsCall_iiddddddddddddd;
  var _pthread_cleanup_pop=env._pthread_cleanup_pop;
  var _sin=env._sin;
  var _exp=env._exp;
  var _sqrtf=env._sqrtf;
  var ___syscall6=env.___syscall6;
  var _atan2=env._atan2;
  var ___assert_fail=env.___assert_fail;
  var _atan2f=env._atan2f;
  var _floor=env._floor;
  var ___setErrNo=env.___setErrNo;
  var _sbrk=env._sbrk;
  var _llvm_pow_f32=env._llvm_pow_f32;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _sysconf=env._sysconf;
  var _cos=env._cos;
  var _pthread_self=env._pthread_self;
  var _sqrt=env._sqrt;
  var ___syscall54=env.___syscall54;
  var _log=env._log;
  var _expf=env._expf;
  var _abort=env._abort;
  var _pthread_cleanup_push=env._pthread_cleanup_push;
  var _time=env._time;
  var ___syscall140=env.___syscall140;
  var ___syscall146=env.___syscall146;
  var tempFloat = 0.0;

// EMSCRIPTEN_START_FUNCS
function stackAlloc(size) {
  size = size|0;
  var ret = 0;
  ret = STACKTOP;
  STACKTOP = (STACKTOP + size)|0;
  STACKTOP = (STACKTOP + 15)&-16;
if ((STACKTOP|0) >= (STACK_MAX|0)) abort();

  return ret|0;
}
function stackSave() {
  return STACKTOP|0;
}
function stackRestore(top) {
  top = top|0;
  STACKTOP = top;
}
function establishStackSpace(stackBase, stackMax) {
  stackBase = stackBase|0;
  stackMax = stackMax|0;
  STACKTOP = stackBase;
  STACK_MAX = stackMax;
}

function setThrew(threw, value) {
  threw = threw|0;
  value = value|0;
  if ((__THREW__|0) == 0) {
    __THREW__ = threw;
    threwValue = value;
  }
}
function copyTempFloat(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
  HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
  HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
  HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
}
function copyTempDouble(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
  HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
  HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
  HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
  HEAP8[tempDoublePtr+4>>0] = HEAP8[ptr+4>>0];
  HEAP8[tempDoublePtr+5>>0] = HEAP8[ptr+5>>0];
  HEAP8[tempDoublePtr+6>>0] = HEAP8[ptr+6>>0];
  HEAP8[tempDoublePtr+7>>0] = HEAP8[ptr+7>>0];
}

function setTempRet0(value) {
  value = value|0;
  tempRet0 = value;
}
function getTempRet0() {
  return tempRet0|0;
}

function _mapping_new($inputs_) {
 $inputs_ = $inputs_|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, $self = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $inputs_;
 $1 = (_malloc(16)|0);
 $self = $1;
 $2 = $0;
 $3 = $self;
 $4 = ((($3)) + 4|0);
 HEAP32[$4>>2] = $2;
 $5 = $self;
 $6 = ((($5)) + 4|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = ($7*68)|0;
 $9 = (_malloc($8)|0);
 $10 = $self;
 $11 = ((($10)) + 8|0);
 HEAP32[$11>>2] = $9;
 $i = 0;
 $i = 0;
 while(1) {
  $12 = $i;
  $13 = $self;
  $14 = ((($13)) + 4|0);
  $15 = HEAP32[$14>>2]|0;
  $16 = ($12|0)<($15|0);
  if (!($16)) {
   break;
  }
  $17 = $i;
  $18 = $self;
  $19 = ((($18)) + 8|0);
  $20 = HEAP32[$19>>2]|0;
  $21 = (($20) + (($17*68)|0)|0);
  $22 = ((($21)) + 64|0);
  HEAP32[$22>>2] = 0;
  $23 = $i;
  $24 = (($23) + 1)|0;
  $i = $24;
 }
 $25 = $self;
 $26 = ((($25)) + 12|0);
 HEAP32[$26>>2] = 0;
 $27 = $self;
 HEAPF32[$27>>2] = 0.0;
 $28 = $self;
 STACKTOP = sp;return ($28|0);
}
function _mapping_free($self) {
 $self = $self|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $0;
 $2 = ((($1)) + 8|0);
 $3 = HEAP32[$2>>2]|0;
 _free($3);
 $4 = $0;
 _free($4);
 STACKTOP = sp;return;
}
function _mapping_get_base_value($self) {
 $self = $self|0;
 var $0 = 0, $1 = 0, $2 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $0;
 $2 = +HEAPF32[$1>>2];
 STACKTOP = sp;return (+$2);
}
function _mapping_set_base_value($self,$value) {
 $self = $self|0;
 $value = +$value;
 var $0 = 0, $1 = 0.0, $2 = 0.0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $value;
 $2 = $1;
 $3 = $0;
 HEAPF32[$3>>2] = $2;
 STACKTOP = sp;return;
}
function _mapping_set_n($self,$input,$n) {
 $self = $self|0;
 $input = $input|0;
 $n = $n|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $p = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $input;
 $2 = $n;
 $3 = $1;
 $4 = ($3|0)>=(0);
 if (!($4)) {
  ___assert_fail((2240|0),(2275|0),82,(2307|0));
  // unreachable;
 }
 $5 = $1;
 $6 = $0;
 $7 = ((($6)) + 4|0);
 $8 = HEAP32[$7>>2]|0;
 $9 = ($5|0)<($8|0);
 if (!($9)) {
  ___assert_fail((2240|0),(2275|0),82,(2307|0));
  // unreachable;
 }
 $10 = $2;
 $11 = ($10|0)>=(0);
 $12 = $2;
 $13 = ($12|0)<=(8);
 $or$cond = $11 & $13;
 if (!($or$cond)) {
  ___assert_fail((2321|0),(2275|0),83,(2307|0));
  // unreachable;
 }
 $14 = $2;
 $15 = ($14|0)!=(1);
 if (!($15)) {
  ___assert_fail((2338|0),(2275|0),84,(2307|0));
  // unreachable;
 }
 $16 = $0;
 $17 = ((($16)) + 8|0);
 $18 = HEAP32[$17>>2]|0;
 $19 = $1;
 $20 = (($18) + (($19*68)|0)|0);
 $p = $20;
 $21 = $2;
 $22 = ($21|0)!=(0);
 if ($22) {
  $23 = $p;
  $24 = ((($23)) + 64|0);
  $25 = HEAP32[$24>>2]|0;
  $26 = ($25|0)==(0);
  if ($26) {
   $27 = $0;
   $28 = ((($27)) + 12|0);
   $29 = HEAP32[$28>>2]|0;
   $30 = (($29) + 1)|0;
   HEAP32[$28>>2] = $30;
  }
 }
 $31 = $2;
 $32 = ($31|0)==(0);
 if ($32) {
  $33 = $p;
  $34 = ((($33)) + 64|0);
  $35 = HEAP32[$34>>2]|0;
  $36 = ($35|0)!=(0);
  if ($36) {
   $37 = $0;
   $38 = ((($37)) + 12|0);
   $39 = HEAP32[$38>>2]|0;
   $40 = (($39) + -1)|0;
   HEAP32[$38>>2] = $40;
  }
 }
 $41 = $0;
 $42 = ((($41)) + 12|0);
 $43 = HEAP32[$42>>2]|0;
 $44 = ($43|0)>=(0);
 if (!($44)) {
  ___assert_fail((2345|0),(2275|0),89,(2307|0));
  // unreachable;
 }
 $45 = $0;
 $46 = ((($45)) + 12|0);
 $47 = HEAP32[$46>>2]|0;
 $48 = $0;
 $49 = ((($48)) + 4|0);
 $50 = HEAP32[$49>>2]|0;
 $51 = ($47|0)<=($50|0);
 if ($51) {
  $52 = $2;
  $53 = $p;
  $54 = ((($53)) + 64|0);
  HEAP32[$54>>2] = $52;
  STACKTOP = sp;return;
 } else {
  ___assert_fail((2368|0),(2275|0),90,(2307|0));
  // unreachable;
 }
}
function _mapping_set_point($self,$input,$index,$x,$y) {
 $self = $self|0;
 $input = $input|0;
 $index = $index|0;
 $x = +$x;
 $y = +$y;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0.0, $29 = 0, $3 = 0.0, $30 = 0, $31 = 0, $32 = 0, $33 = 0.0, $34 = 0, $35 = 0.0, $36 = 0, $37 = 0, $38 = 0, $39 = 0.0, $4 = 0.0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $p = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $input;
 $2 = $index;
 $3 = $x;
 $4 = $y;
 $5 = $1;
 $6 = ($5|0)>=(0);
 if (!($6)) {
  ___assert_fail((2240|0),(2275|0),105,(2402|0));
  // unreachable;
 }
 $7 = $1;
 $8 = $0;
 $9 = ((($8)) + 4|0);
 $10 = HEAP32[$9>>2]|0;
 $11 = ($7|0)<($10|0);
 if (!($11)) {
  ___assert_fail((2240|0),(2275|0),105,(2402|0));
  // unreachable;
 }
 $12 = $2;
 $13 = ($12|0)>=(0);
 $14 = $2;
 $15 = ($14|0)<(8);
 $or$cond = $13 & $15;
 if (!($or$cond)) {
  ___assert_fail((2420|0),(2275|0),106,(2402|0));
  // unreachable;
 }
 $16 = $0;
 $17 = ((($16)) + 8|0);
 $18 = HEAP32[$17>>2]|0;
 $19 = $1;
 $20 = (($18) + (($19*68)|0)|0);
 $p = $20;
 $21 = $2;
 $22 = $p;
 $23 = ((($22)) + 64|0);
 $24 = HEAP32[$23>>2]|0;
 $25 = ($21|0)<($24|0);
 if (!($25)) {
  ___assert_fail((2444|0),(2275|0),108,(2402|0));
  // unreachable;
 }
 $26 = $2;
 $27 = ($26|0)>(0);
 if (!($27)) {
  $35 = $3;
  $36 = $2;
  $37 = $p;
  $38 = (($37) + ($36<<2)|0);
  HEAPF32[$38>>2] = $35;
  $39 = $4;
  $40 = $2;
  $41 = $p;
  $42 = ((($41)) + 32|0);
  $43 = (($42) + ($40<<2)|0);
  HEAPF32[$43>>2] = $39;
  STACKTOP = sp;return;
 }
 $28 = $3;
 $29 = $2;
 $30 = (($29) - 1)|0;
 $31 = $p;
 $32 = (($31) + ($30<<2)|0);
 $33 = +HEAPF32[$32>>2];
 $34 = $28 >= $33;
 if (!($34)) {
  ___assert_fail((2457|0),(2275|0),111,(2402|0));
  // unreachable;
 }
 $35 = $3;
 $36 = $2;
 $37 = $p;
 $38 = (($37) + ($36<<2)|0);
 HEAPF32[$38>>2] = $35;
 $39 = $4;
 $40 = $2;
 $41 = $p;
 $42 = ((($41)) + 32|0);
 $43 = (($42) + ($40<<2)|0);
 HEAPF32[$43>>2] = $39;
 STACKTOP = sp;return;
}
function _mapping_is_constant($self) {
 $self = $self|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $0;
 $2 = ((($1)) + 12|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = ($3|0)==(0);
 $5 = $4&1;
 STACKTOP = sp;return ($5|0);
}
function _mapping_calculate($self,$data) {
 $self = $self|0;
 $data = $data|0;
 var $0 = 0.0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0.0, $28 = 0, $29 = 0.0, $3 = 0, $30 = 0, $31 = 0, $32 = 0.0, $33 = 0, $34 = 0, $35 = 0.0, $36 = 0, $37 = 0, $38 = 0, $39 = 0.0, $4 = 0.0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0.0, $46 = 0.0, $47 = 0, $48 = 0.0, $49 = 0.0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0.0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0.0, $59 = 0, $6 = 0, $60 = 0, $61 = 0.0, $62 = 0.0;
 var $63 = 0, $64 = 0.0, $65 = 0.0, $66 = 0.0, $67 = 0.0, $68 = 0.0, $69 = 0.0, $7 = 0, $70 = 0.0, $71 = 0.0, $72 = 0.0, $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0.0, $8 = 0, $80 = 0.0;
 var $81 = 0.0, $82 = 0.0, $83 = 0, $84 = 0, $85 = 0.0, $86 = 0.0, $9 = 0.0, $i = 0, $j = 0, $p = 0, $result = 0.0, $x = 0.0, $x0 = 0.0, $x1 = 0.0, $y = 0.0, $y0 = 0.0, $y1 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $1 = $self;
 $2 = $data;
 $3 = $1;
 $4 = +HEAPF32[$3>>2];
 $result = $4;
 $5 = $1;
 $6 = ((($5)) + 12|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = ($7|0)==(0);
 if ($8) {
  $9 = $result;
  $0 = $9;
  $86 = $0;
  STACKTOP = sp;return (+$86);
 }
 $j = 0;
 while(1) {
  $10 = $j;
  $11 = $1;
  $12 = ((($11)) + 4|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = ($10|0)<($13|0);
  if (!($14)) {
   break;
  }
  $15 = $1;
  $16 = ((($15)) + 8|0);
  $17 = HEAP32[$16>>2]|0;
  $18 = $j;
  $19 = (($17) + (($18*68)|0)|0);
  $p = $19;
  $20 = $p;
  $21 = ((($20)) + 64|0);
  $22 = HEAP32[$21>>2]|0;
  $23 = ($22|0)!=(0);
  if ($23) {
   $24 = $j;
   $25 = $2;
   $26 = (($25) + ($24<<2)|0);
   $27 = +HEAPF32[$26>>2];
   $x = $27;
   $28 = $p;
   $29 = +HEAPF32[$28>>2];
   $x0 = $29;
   $30 = $p;
   $31 = ((($30)) + 32|0);
   $32 = +HEAPF32[$31>>2];
   $y0 = $32;
   $33 = $p;
   $34 = ((($33)) + 4|0);
   $35 = +HEAPF32[$34>>2];
   $x1 = $35;
   $36 = $p;
   $37 = ((($36)) + 32|0);
   $38 = ((($37)) + 4|0);
   $39 = +HEAPF32[$38>>2];
   $y1 = $39;
   $i = 2;
   while(1) {
    $40 = $i;
    $41 = $p;
    $42 = ((($41)) + 64|0);
    $43 = HEAP32[$42>>2]|0;
    $44 = ($40|0)<($43|0);
    if (!($44)) {
     break;
    }
    $45 = $x;
    $46 = $x1;
    $47 = $45 > $46;
    if (!($47)) {
     break;
    }
    $48 = $x1;
    $x0 = $48;
    $49 = $y1;
    $y0 = $49;
    $50 = $i;
    $51 = $p;
    $52 = (($51) + ($50<<2)|0);
    $53 = +HEAPF32[$52>>2];
    $x1 = $53;
    $54 = $i;
    $55 = $p;
    $56 = ((($55)) + 32|0);
    $57 = (($56) + ($54<<2)|0);
    $58 = +HEAPF32[$57>>2];
    $y1 = $58;
    $59 = $i;
    $60 = (($59) + 1)|0;
    $i = $60;
   }
   $61 = $x0;
   $62 = $x1;
   $63 = $61 == $62;
   if ($63) {
    $64 = $y0;
    $y = $64;
   } else {
    $65 = $y1;
    $66 = $x;
    $67 = $x0;
    $68 = $66 - $67;
    $69 = $65 * $68;
    $70 = $y0;
    $71 = $x1;
    $72 = $x;
    $73 = $71 - $72;
    $74 = $70 * $73;
    $75 = $69 + $74;
    $76 = $x1;
    $77 = $x0;
    $78 = $76 - $77;
    $79 = $75 / $78;
    $y = $79;
   }
   $80 = $y;
   $81 = $result;
   $82 = $81 + $80;
   $result = $82;
  }
  $83 = $j;
  $84 = (($83) + 1)|0;
  $j = $84;
 }
 $85 = $result;
 $0 = $85;
 $86 = $0;
 STACKTOP = sp;return (+$86);
}
function _rand_gauss($rng) {
 $rng = $rng|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0.0, $20 = 0.0, $3 = 0.0, $4 = 0.0, $5 = 0, $6 = 0.0, $7 = 0.0, $8 = 0.0;
 var $9 = 0, $sum = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $rng;
 $sum = 0.0;
 $1 = $0;
 $2 = (+_rng_double_next($1));
 $3 = $sum;
 $4 = $3 + $2;
 $sum = $4;
 $5 = $0;
 $6 = (+_rng_double_next($5));
 $7 = $sum;
 $8 = $7 + $6;
 $sum = $8;
 $9 = $0;
 $10 = (+_rng_double_next($9));
 $11 = $sum;
 $12 = $11 + $10;
 $sum = $12;
 $13 = $0;
 $14 = (+_rng_double_next($13));
 $15 = $sum;
 $16 = $15 + $14;
 $sum = $16;
 $17 = $sum;
 $18 = $17 * 1.7320508075700001;
 $19 = $18 - 3.4641016151400001;
 $20 = $19;
 STACKTOP = sp;return (+$20);
}
function _rng_double_next($self) {
 $self = $self|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $2 = 0, $3 = 0, $4 = 0.0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $0;
 $2 = ((($1)) + 232|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = +HEAPF64[$3>>3];
 $5 = $4 >= 0.0;
 $6 = $0;
 if ($5) {
  $7 = ((($6)) + 232|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ((($8)) + 8|0);
  HEAP32[$7>>2] = $9;
  $10 = +HEAPF64[$8>>3];
  $12 = $10;
  STACKTOP = sp;return (+$12);
 } else {
  $11 = (+_rng_double_cycle($6));
  $12 = $11;
  STACKTOP = sp;return (+$12);
 }
 return +(0.0);
}
function _rgb_to_hsv_float($r_,$g_,$b_) {
 $r_ = $r_|0;
 $g_ = $g_|0;
 $b_ = $b_|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $100 = 0, $101 = 0.0, $102 = 0.0, $103 = 0.0, $104 = 0.0, $105 = 0.0, $106 = 0.0, $107 = 0.0, $108 = 0.0, $109 = 0.0, $11 = 0, $110 = 0, $111 = 0.0, $112 = 0.0, $113 = 0.0, $114 = 0.0, $115 = 0.0;
 var $116 = 0.0, $117 = 0.0, $118 = 0.0, $119 = 0.0, $12 = 0.0, $120 = 0.0, $121 = 0.0, $122 = 0.0, $123 = 0.0, $124 = 0, $125 = 0.0, $126 = 0, $127 = 0.0, $128 = 0, $13 = 0.0, $14 = 0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0;
 var $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0, $22 = 0, $23 = 0.0, $24 = 0.0, $25 = 0, $26 = 0.0, $27 = 0.0, $28 = 0.0, $29 = 0.0, $3 = 0, $30 = 0.0, $31 = 0.0, $32 = 0.0, $33 = 0, $34 = 0.0, $35 = 0.0, $36 = 0;
 var $37 = 0.0, $38 = 0.0, $39 = 0.0, $4 = 0.0, $40 = 0.0, $41 = 0.0, $42 = 0.0, $43 = 0.0, $44 = 0, $45 = 0.0, $46 = 0.0, $47 = 0, $48 = 0.0, $49 = 0.0, $5 = 0, $50 = 0.0, $51 = 0.0, $52 = 0.0, $53 = 0, $54 = 0.0;
 var $55 = 0.0, $56 = 0.0, $57 = 0.0, $58 = 0.0, $59 = 0.0, $6 = 0.0, $60 = 0, $61 = 0.0, $62 = 0.0, $63 = 0, $64 = 0.0, $65 = 0.0, $66 = 0.0, $67 = 0.0, $68 = 0.0, $69 = 0, $7 = 0, $70 = 0.0, $71 = 0.0, $72 = 0.0;
 var $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0.0, $8 = 0.0, $80 = 0, $81 = 0.0, $82 = 0.0, $83 = 0.0, $84 = 0.0, $85 = 0.0, $86 = 0, $87 = 0.0, $88 = 0.0, $89 = 0.0, $9 = 0.0, $90 = 0.0;
 var $91 = 0.0, $92 = 0.0, $93 = 0.0, $94 = 0, $95 = 0.0, $96 = 0.0, $97 = 0.0, $98 = 0.0, $99 = 0.0, $b = 0.0, $delta = 0.0, $g = 0.0, $h = 0.0, $max = 0.0, $min = 0.0, $r = 0.0, $s = 0.0, $v = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $r_;
 $1 = $g_;
 $2 = $b_;
 $h = 0.0;
 $3 = $0;
 $4 = +HEAPF32[$3>>2];
 $r = $4;
 $5 = $1;
 $6 = +HEAPF32[$5>>2];
 $g = $6;
 $7 = $2;
 $8 = +HEAPF32[$7>>2];
 $b = $8;
 $9 = $r;
 $10 = $9;
 $11 = $10 > 1.0;
 if ($11) {
  $19 = 1.0;
 } else {
  $12 = $r;
  $13 = $12;
  $14 = $13 < 0.0;
  $15 = $r;
  $16 = $15;
  $17 = $14 ? 0.0 : $16;
  $19 = $17;
 }
 $18 = $19;
 $r = $18;
 $20 = $g;
 $21 = $20;
 $22 = $21 > 1.0;
 if ($22) {
  $30 = 1.0;
 } else {
  $23 = $g;
  $24 = $23;
  $25 = $24 < 0.0;
  $26 = $g;
  $27 = $26;
  $28 = $25 ? 0.0 : $27;
  $30 = $28;
 }
 $29 = $30;
 $g = $29;
 $31 = $b;
 $32 = $31;
 $33 = $32 > 1.0;
 if ($33) {
  $41 = 1.0;
 } else {
  $34 = $b;
  $35 = $34;
  $36 = $35 < 0.0;
  $37 = $b;
  $38 = $37;
  $39 = $36 ? 0.0 : $38;
  $41 = $39;
 }
 $40 = $41;
 $b = $40;
 $42 = $r;
 $43 = $g;
 $44 = $42 > $43;
 if ($44) {
  $45 = $r;
  $46 = $b;
  $47 = $45 > $46;
  $48 = $r;
  $49 = $b;
  $50 = $47 ? $48 : $49;
  $57 = $50;
 } else {
  $51 = $g;
  $52 = $b;
  $53 = $51 > $52;
  $54 = $g;
  $55 = $b;
  $56 = $53 ? $54 : $55;
  $57 = $56;
 }
 $max = $57;
 $58 = $r;
 $59 = $g;
 $60 = $58 < $59;
 if ($60) {
  $61 = $r;
  $62 = $b;
  $63 = $61 < $62;
  $64 = $r;
  $65 = $b;
  $66 = $63 ? $64 : $65;
  $73 = $66;
 } else {
  $67 = $g;
  $68 = $b;
  $69 = $67 < $68;
  $70 = $g;
  $71 = $b;
  $72 = $69 ? $70 : $71;
  $73 = $72;
 }
 $min = $73;
 $74 = $max;
 $v = $74;
 $75 = $max;
 $76 = $min;
 $77 = $75 - $76;
 $delta = $77;
 $78 = $delta;
 $79 = $78;
 $80 = $79 > 1.0E-4;
 if (!($80)) {
  $s = 0.0;
  $h = 0.0;
  $123 = $h;
  $124 = $0;
  HEAPF32[$124>>2] = $123;
  $125 = $s;
  $126 = $1;
  HEAPF32[$126>>2] = $125;
  $127 = $v;
  $128 = $2;
  HEAPF32[$128>>2] = $127;
  STACKTOP = sp;return;
 }
 $81 = $delta;
 $82 = $max;
 $83 = $81 / $82;
 $s = $83;
 $84 = $r;
 $85 = $max;
 $86 = $84 == $85;
 $87 = $g;
 do {
  if ($86) {
   $88 = $b;
   $89 = $87 - $88;
   $90 = $delta;
   $91 = $89 / $90;
   $h = $91;
   $92 = $h;
   $93 = $92;
   $94 = $93 < 0.0;
   if ($94) {
    $95 = $h;
    $96 = $95;
    $97 = $96 + 6.0;
    $98 = $97;
    $h = $98;
   }
  } else {
   $99 = $max;
   $100 = $87 == $99;
   $101 = $b;
   if ($100) {
    $102 = $r;
    $103 = $101 - $102;
    $104 = $delta;
    $105 = $103 / $104;
    $106 = $105;
    $107 = 2.0 + $106;
    $108 = $107;
    $h = $108;
    break;
   }
   $109 = $max;
   $110 = $101 == $109;
   if ($110) {
    $111 = $r;
    $112 = $g;
    $113 = $111 - $112;
    $114 = $delta;
    $115 = $113 / $114;
    $116 = $115;
    $117 = 4.0 + $116;
    $118 = $117;
    $h = $118;
   }
  }
 } while(0);
 $119 = $h;
 $120 = $119;
 $121 = $120 / 6.0;
 $122 = $121;
 $h = $122;
 $123 = $h;
 $124 = $0;
 HEAPF32[$124>>2] = $123;
 $125 = $s;
 $126 = $1;
 HEAPF32[$126>>2] = $125;
 $127 = $v;
 $128 = $2;
 HEAPF32[$128>>2] = $127;
 STACKTOP = sp;return;
}
function _hsv_to_rgb_float($h_,$s_,$v_) {
 $h_ = $h_|0;
 $s_ = $s_|0;
 $v_ = $v_|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $100 = 0.0, $101 = 0.0, $102 = 0.0, $103 = 0.0, $104 = 0.0, $105 = 0.0, $106 = 0.0, $107 = 0.0, $108 = 0.0, $109 = 0.0, $11 = 0.0, $110 = 0.0, $111 = 0, $112 = 0.0, $113 = 0, $114 = 0.0, $115 = 0;
 var $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0.0, $26 = 0.0, $27 = 0.0, $28 = 0.0, $29 = 0, $3 = 0;
 var $30 = 0.0, $31 = 0.0, $32 = 0, $33 = 0.0, $34 = 0.0, $35 = 0.0, $36 = 0.0, $37 = 0.0, $38 = 0.0, $39 = 0.0, $4 = 0.0, $40 = 0, $41 = 0.0, $42 = 0.0, $43 = 0.0, $44 = 0.0, $45 = 0.0, $46 = 0.0, $47 = 0, $48 = 0.0;
 var $49 = 0.0, $5 = 0, $50 = 0.0, $51 = 0, $52 = 0.0, $53 = 0, $54 = 0.0, $55 = 0.0, $56 = 0.0, $57 = 0.0, $58 = 0.0, $59 = 0.0, $6 = 0.0, $60 = 0.0, $61 = 0.0, $62 = 0.0, $63 = 0.0, $64 = 0.0, $65 = 0.0, $66 = 0.0;
 var $67 = 0.0, $68 = 0.0, $69 = 0.0, $7 = 0, $70 = 0.0, $71 = 0.0, $72 = 0.0, $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0, $8 = 0.0, $80 = 0.0, $81 = 0.0, $82 = 0.0, $83 = 0.0, $84 = 0.0;
 var $85 = 0.0, $86 = 0.0, $87 = 0.0, $88 = 0.0, $89 = 0.0, $9 = 0.0, $90 = 0.0, $91 = 0.0, $92 = 0.0, $93 = 0.0, $94 = 0.0, $95 = 0.0, $96 = 0.0, $97 = 0.0, $98 = 0.0, $99 = 0.0, $b = 0.0, $f = 0.0, $g = 0.0, $h = 0.0;
 var $hue = 0.0, $i = 0, $q = 0.0, $r = 0.0, $s = 0.0, $t = 0.0, $v = 0.0, $w = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $h_;
 $1 = $s_;
 $2 = $v_;
 $b = 0.0;
 $g = 0.0;
 $r = 0.0;
 $3 = $0;
 $4 = +HEAPF32[$3>>2];
 $h = $4;
 $5 = $1;
 $6 = +HEAPF32[$5>>2];
 $s = $6;
 $7 = $2;
 $8 = +HEAPF32[$7>>2];
 $v = $8;
 $9 = $h;
 $10 = $9;
 $11 = $h;
 $12 = $11;
 $13 = (+Math_floor((+$12)));
 $14 = $10 - $13;
 $15 = $14;
 $h = $15;
 $16 = $s;
 $17 = $16;
 $18 = $17 > 1.0;
 if ($18) {
  $26 = 1.0;
 } else {
  $19 = $s;
  $20 = $19;
  $21 = $20 < 0.0;
  $22 = $s;
  $23 = $22;
  $24 = $21 ? 0.0 : $23;
  $26 = $24;
 }
 $25 = $26;
 $s = $25;
 $27 = $v;
 $28 = $27;
 $29 = $28 > 1.0;
 if ($29) {
  $37 = 1.0;
 } else {
  $30 = $v;
  $31 = $30;
  $32 = $31 < 0.0;
  $33 = $v;
  $34 = $33;
  $35 = $32 ? 0.0 : $34;
  $37 = $35;
 }
 $36 = $37;
 $v = $36;
 $38 = $s;
 $39 = $38;
 $40 = $39 == 0.0;
 L7: do {
  if ($40) {
   $41 = $v;
   $r = $41;
   $42 = $v;
   $g = $42;
   $43 = $v;
   $b = $43;
  } else {
   $44 = $h;
   $45 = $44;
   $hue = $45;
   $46 = $hue;
   $47 = $46 == 1.0;
   if ($47) {
    $hue = 0.0;
   }
   $48 = $hue;
   $49 = $48 * 6.0;
   $hue = $49;
   $50 = $hue;
   $51 = (~~(($50)));
   $i = $51;
   $52 = $hue;
   $53 = $i;
   $54 = (+($53|0));
   $55 = $52 - $54;
   $f = $55;
   $56 = $v;
   $57 = $56;
   $58 = $s;
   $59 = $58;
   $60 = 1.0 - $59;
   $61 = $57 * $60;
   $w = $61;
   $62 = $v;
   $63 = $62;
   $64 = $s;
   $65 = $64;
   $66 = $f;
   $67 = $65 * $66;
   $68 = 1.0 - $67;
   $69 = $63 * $68;
   $q = $69;
   $70 = $v;
   $71 = $70;
   $72 = $s;
   $73 = $72;
   $74 = $f;
   $75 = 1.0 - $74;
   $76 = $73 * $75;
   $77 = 1.0 - $76;
   $78 = $71 * $77;
   $t = $78;
   $79 = $i;
   switch ($79|0) {
   case 0:  {
    $80 = $v;
    $r = $80;
    $81 = $t;
    $82 = $81;
    $g = $82;
    $83 = $w;
    $84 = $83;
    $b = $84;
    break L7;
    break;
   }
   case 1:  {
    $85 = $q;
    $86 = $85;
    $r = $86;
    $87 = $v;
    $g = $87;
    $88 = $w;
    $89 = $88;
    $b = $89;
    break L7;
    break;
   }
   case 2:  {
    $90 = $w;
    $91 = $90;
    $r = $91;
    $92 = $v;
    $g = $92;
    $93 = $t;
    $94 = $93;
    $b = $94;
    break L7;
    break;
   }
   case 3:  {
    $95 = $w;
    $96 = $95;
    $r = $96;
    $97 = $q;
    $98 = $97;
    $g = $98;
    $99 = $v;
    $b = $99;
    break L7;
    break;
   }
   case 4:  {
    $100 = $t;
    $101 = $100;
    $r = $101;
    $102 = $w;
    $103 = $102;
    $g = $103;
    $104 = $v;
    $b = $104;
    break L7;
    break;
   }
   case 5:  {
    $105 = $v;
    $r = $105;
    $106 = $w;
    $107 = $106;
    $g = $107;
    $108 = $q;
    $109 = $108;
    $b = $109;
    break L7;
    break;
   }
   default: {
    break L7;
   }
   }
  }
 } while(0);
 $110 = $r;
 $111 = $0;
 HEAPF32[$111>>2] = $110;
 $112 = $g;
 $113 = $1;
 HEAPF32[$113>>2] = $112;
 $114 = $b;
 $115 = $2;
 HEAPF32[$115>>2] = $114;
 STACKTOP = sp;return;
}
function _rgb_to_hsl_float($r_,$g_,$b_) {
 $r_ = $r_|0;
 $g_ = $g_|0;
 $b_ = $b_|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $100 = 0.0, $101 = 0.0, $102 = 0.0, $103 = 0.0, $104 = 0, $105 = 0.0, $106 = 0.0, $107 = 0.0, $108 = 0, $109 = 0.0, $11 = 0, $110 = 0.0, $111 = 0.0, $112 = 0.0, $113 = 0.0, $114 = 0.0, $115 = 0.0;
 var $116 = 0.0, $117 = 0.0, $118 = 0, $119 = 0.0, $12 = 0.0, $120 = 0.0, $121 = 0.0, $122 = 0.0, $123 = 0.0, $124 = 0.0, $125 = 0.0, $126 = 0.0, $127 = 0.0, $128 = 0.0, $129 = 0, $13 = 0.0, $130 = 0.0, $131 = 0.0, $132 = 0.0, $133 = 0.0;
 var $134 = 0.0, $135 = 0.0, $136 = 0.0, $137 = 0.0, $138 = 0.0, $139 = 0.0, $14 = 0, $140 = 0.0, $141 = 0.0, $142 = 0.0, $143 = 0.0, $144 = 0, $145 = 0.0, $146 = 0.0, $147 = 0.0, $148 = 0.0, $149 = 0.0, $15 = 0.0, $150 = 0, $151 = 0.0;
 var $152 = 0, $153 = 0.0, $154 = 0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0, $22 = 0, $23 = 0.0, $24 = 0.0, $25 = 0, $26 = 0.0, $27 = 0.0, $28 = 0.0, $29 = 0.0, $3 = 0, $30 = 0.0;
 var $31 = 0.0, $32 = 0.0, $33 = 0, $34 = 0.0, $35 = 0.0, $36 = 0, $37 = 0.0, $38 = 0.0, $39 = 0.0, $4 = 0.0, $40 = 0.0, $41 = 0.0, $42 = 0.0, $43 = 0.0, $44 = 0, $45 = 0.0, $46 = 0.0, $47 = 0, $48 = 0.0, $49 = 0.0;
 var $5 = 0, $50 = 0.0, $51 = 0.0, $52 = 0.0, $53 = 0, $54 = 0.0, $55 = 0.0, $56 = 0.0, $57 = 0.0, $58 = 0.0, $59 = 0.0, $6 = 0.0, $60 = 0.0, $61 = 0, $62 = 0.0, $63 = 0.0, $64 = 0, $65 = 0.0, $66 = 0.0, $67 = 0.0;
 var $68 = 0.0, $69 = 0.0, $7 = 0, $70 = 0, $71 = 0.0, $72 = 0.0, $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0.0, $8 = 0.0, $80 = 0.0, $81 = 0.0, $82 = 0.0, $83 = 0, $84 = 0.0, $85 = 0.0;
 var $86 = 0, $87 = 0.0, $88 = 0.0, $89 = 0.0, $9 = 0.0, $90 = 0.0, $91 = 0.0, $92 = 0.0, $93 = 0.0, $94 = 0.0, $95 = 0.0, $96 = 0.0, $97 = 0.0, $98 = 0.0, $99 = 0.0, $b = 0.0, $delta = 0.0, $g = 0.0, $h = 0.0, $l = 0.0;
 var $max = 0.0, $min = 0.0, $r = 0.0, $s = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $r_;
 $1 = $g_;
 $2 = $b_;
 $h = 0.0;
 $3 = $0;
 $4 = +HEAPF32[$3>>2];
 $r = $4;
 $5 = $1;
 $6 = +HEAPF32[$5>>2];
 $g = $6;
 $7 = $2;
 $8 = +HEAPF32[$7>>2];
 $b = $8;
 $9 = $r;
 $10 = $9;
 $11 = $10 > 1.0;
 if ($11) {
  $19 = 1.0;
 } else {
  $12 = $r;
  $13 = $12;
  $14 = $13 < 0.0;
  $15 = $r;
  $16 = $15;
  $17 = $14 ? 0.0 : $16;
  $19 = $17;
 }
 $18 = $19;
 $r = $18;
 $20 = $g;
 $21 = $20;
 $22 = $21 > 1.0;
 if ($22) {
  $30 = 1.0;
 } else {
  $23 = $g;
  $24 = $23;
  $25 = $24 < 0.0;
  $26 = $g;
  $27 = $26;
  $28 = $25 ? 0.0 : $27;
  $30 = $28;
 }
 $29 = $30;
 $g = $29;
 $31 = $b;
 $32 = $31;
 $33 = $32 > 1.0;
 if ($33) {
  $41 = 1.0;
 } else {
  $34 = $b;
  $35 = $34;
  $36 = $35 < 0.0;
  $37 = $b;
  $38 = $37;
  $39 = $36 ? 0.0 : $38;
  $41 = $39;
 }
 $40 = $41;
 $b = $40;
 $42 = $r;
 $43 = $g;
 $44 = $42 > $43;
 if ($44) {
  $45 = $r;
  $46 = $b;
  $47 = $45 > $46;
  $48 = $r;
  $49 = $b;
  $50 = $47 ? $48 : $49;
  $58 = $50;
 } else {
  $51 = $g;
  $52 = $b;
  $53 = $51 > $52;
  $54 = $g;
  $55 = $b;
  $56 = $53 ? $54 : $55;
  $58 = $56;
 }
 $57 = $58;
 $max = $57;
 $59 = $r;
 $60 = $g;
 $61 = $59 < $60;
 if ($61) {
  $62 = $r;
  $63 = $b;
  $64 = $62 < $63;
  $65 = $r;
  $66 = $b;
  $67 = $64 ? $65 : $66;
  $75 = $67;
 } else {
  $68 = $g;
  $69 = $b;
  $70 = $68 < $69;
  $71 = $g;
  $72 = $b;
  $73 = $70 ? $71 : $72;
  $75 = $73;
 }
 $74 = $75;
 $min = $74;
 $76 = $max;
 $77 = $min;
 $78 = $76 + $77;
 $79 = $78 / 2.0;
 $80 = $79;
 $l = $80;
 $81 = $max;
 $82 = $min;
 $83 = $81 == $82;
 if ($83) {
  $s = 0.0;
  $h = 0.0;
  $149 = $h;
  $150 = $0;
  HEAPF32[$150>>2] = $149;
  $151 = $s;
  $152 = $1;
  HEAPF32[$152>>2] = $151;
  $153 = $l;
  $154 = $2;
  HEAPF32[$154>>2] = $153;
  STACKTOP = sp;return;
 }
 $84 = $l;
 $85 = $84;
 $86 = $85 <= 0.5;
 $87 = $max;
 $88 = $min;
 $89 = $87 - $88;
 $90 = $max;
 if ($86) {
  $91 = $min;
  $92 = $90 + $91;
  $93 = $89 / $92;
  $94 = $93;
  $s = $94;
 } else {
  $95 = 2.0 - $90;
  $96 = $min;
  $97 = $95 - $96;
  $98 = $89 / $97;
  $99 = $98;
  $s = $99;
 }
 $100 = $max;
 $101 = $min;
 $102 = $100 - $101;
 $delta = $102;
 $103 = $delta;
 $104 = $103 == 0.0;
 if ($104) {
  $delta = 1.0;
 }
 $105 = $r;
 $106 = $105;
 $107 = $max;
 $108 = $106 == $107;
 $109 = $g;
 do {
  if ($108) {
   $110 = $b;
   $111 = $109 - $110;
   $112 = $111;
   $113 = $delta;
   $114 = $112 / $113;
   $115 = $114;
   $h = $115;
  } else {
   $116 = $109;
   $117 = $max;
   $118 = $116 == $117;
   $119 = $b;
   if ($118) {
    $120 = $r;
    $121 = $119 - $120;
    $122 = $121;
    $123 = $delta;
    $124 = $122 / $123;
    $125 = 2.0 + $124;
    $126 = $125;
    $h = $126;
    break;
   }
   $127 = $119;
   $128 = $max;
   $129 = $127 == $128;
   if ($129) {
    $130 = $r;
    $131 = $g;
    $132 = $130 - $131;
    $133 = $132;
    $134 = $delta;
    $135 = $133 / $134;
    $136 = 4.0 + $135;
    $137 = $136;
    $h = $137;
   }
  }
 } while(0);
 $138 = $h;
 $139 = $138;
 $140 = $139 / 6.0;
 $141 = $140;
 $h = $141;
 $142 = $h;
 $143 = $142;
 $144 = $143 < 0.0;
 if (!($144)) {
  $149 = $h;
  $150 = $0;
  HEAPF32[$150>>2] = $149;
  $151 = $s;
  $152 = $1;
  HEAPF32[$152>>2] = $151;
  $153 = $l;
  $154 = $2;
  HEAPF32[$154>>2] = $153;
  STACKTOP = sp;return;
 }
 $145 = $h;
 $146 = $145;
 $147 = $146 + 1.0;
 $148 = $147;
 $h = $148;
 $149 = $h;
 $150 = $0;
 HEAPF32[$150>>2] = $149;
 $151 = $s;
 $152 = $1;
 HEAPF32[$152>>2] = $151;
 $153 = $l;
 $154 = $2;
 HEAPF32[$154>>2] = $153;
 STACKTOP = sp;return;
}
function _hsl_to_rgb_float($h_,$s_,$l_) {
 $h_ = $h_|0;
 $s_ = $s_|0;
 $l_ = $l_|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0.0, $26 = 0.0;
 var $27 = 0.0, $28 = 0.0, $29 = 0, $3 = 0, $30 = 0.0, $31 = 0.0, $32 = 0, $33 = 0.0, $34 = 0.0, $35 = 0.0, $36 = 0.0, $37 = 0.0, $38 = 0.0, $39 = 0, $4 = 0.0, $40 = 0.0, $41 = 0.0, $42 = 0.0, $43 = 0.0, $44 = 0;
 var $45 = 0.0, $46 = 0.0, $47 = 0.0, $48 = 0.0, $49 = 0.0, $5 = 0, $50 = 0.0, $51 = 0.0, $52 = 0.0, $53 = 0.0, $54 = 0.0, $55 = 0.0, $56 = 0.0, $57 = 0.0, $58 = 0.0, $59 = 0.0, $6 = 0.0, $60 = 0.0, $61 = 0.0, $62 = 0.0;
 var $63 = 0.0, $64 = 0.0, $65 = 0.0, $66 = 0.0, $67 = 0.0, $68 = 0.0, $69 = 0.0, $7 = 0, $70 = 0.0, $71 = 0.0, $72 = 0.0, $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0.0, $8 = 0.0, $80 = 0.0;
 var $81 = 0.0, $82 = 0.0, $83 = 0.0, $84 = 0.0, $85 = 0.0, $86 = 0.0, $87 = 0, $88 = 0.0, $89 = 0, $9 = 0.0, $90 = 0.0, $91 = 0, $b = 0.0, $g = 0.0, $h = 0.0, $l = 0.0, $m1 = 0.0, $m2 = 0.0, $r = 0.0, $s = 0.0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $h_;
 $1 = $s_;
 $2 = $l_;
 $3 = $0;
 $4 = +HEAPF32[$3>>2];
 $h = $4;
 $5 = $1;
 $6 = +HEAPF32[$5>>2];
 $s = $6;
 $7 = $2;
 $8 = +HEAPF32[$7>>2];
 $l = $8;
 $9 = $h;
 $10 = $9;
 $11 = $h;
 $12 = $11;
 $13 = (+Math_floor((+$12)));
 $14 = $10 - $13;
 $15 = $14;
 $h = $15;
 $16 = $s;
 $17 = $16;
 $18 = $17 > 1.0;
 if ($18) {
  $26 = 1.0;
 } else {
  $19 = $s;
  $20 = $19;
  $21 = $20 < 0.0;
  $22 = $s;
  $23 = $22;
  $24 = $21 ? 0.0 : $23;
  $26 = $24;
 }
 $25 = $26;
 $s = $25;
 $27 = $l;
 $28 = $27;
 $29 = $28 > 1.0;
 if ($29) {
  $37 = 1.0;
 } else {
  $30 = $l;
  $31 = $30;
  $32 = $31 < 0.0;
  $33 = $l;
  $34 = $33;
  $35 = $32 ? 0.0 : $34;
  $37 = $35;
 }
 $36 = $37;
 $l = $36;
 $38 = $s;
 $39 = $38 == 0.0;
 $40 = $l;
 if ($39) {
  $r = $40;
  $41 = $l;
  $g = $41;
  $42 = $l;
  $b = $42;
  $86 = $r;
  $87 = $0;
  HEAPF32[$87>>2] = $86;
  $88 = $g;
  $89 = $1;
  HEAPF32[$89>>2] = $88;
  $90 = $b;
  $91 = $2;
  HEAPF32[$91>>2] = $90;
  STACKTOP = sp;return;
 }
 $43 = $40;
 $44 = $43 <= 0.5;
 $45 = $l;
 if ($44) {
  $46 = $45;
  $47 = $s;
  $48 = $47;
  $49 = 1.0 + $48;
  $50 = $46 * $49;
  $m2 = $50;
 } else {
  $51 = $s;
  $52 = $45 + $51;
  $53 = $l;
  $54 = $s;
  $55 = $53 * $54;
  $56 = $52 - $55;
  $57 = $56;
  $m2 = $57;
 }
 $58 = $l;
 $59 = $58;
 $60 = 2.0 * $59;
 $61 = $m2;
 $62 = $60 - $61;
 $m1 = $62;
 $63 = $m1;
 $64 = $m2;
 $65 = $h;
 $66 = $65;
 $67 = $66 * 6.0;
 $68 = $67 + 2.0;
 $69 = (+_hsl_value($63,$64,$68));
 $70 = $69;
 $r = $70;
 $71 = $m1;
 $72 = $m2;
 $73 = $h;
 $74 = $73;
 $75 = $74 * 6.0;
 $76 = (+_hsl_value($71,$72,$75));
 $77 = $76;
 $g = $77;
 $78 = $m1;
 $79 = $m2;
 $80 = $h;
 $81 = $80;
 $82 = $81 * 6.0;
 $83 = $82 - 2.0;
 $84 = (+_hsl_value($78,$79,$83));
 $85 = $84;
 $b = $85;
 $86 = $r;
 $87 = $0;
 HEAPF32[$87>>2] = $86;
 $88 = $g;
 $89 = $1;
 HEAPF32[$89>>2] = $88;
 $90 = $b;
 $91 = $2;
 HEAPF32[$91>>2] = $90;
 STACKTOP = sp;return;
}
function _hsl_value($n1,$n2,$hue) {
 $n1 = +$n1;
 $n2 = +$n2;
 $hue = +$hue;
 var $0 = 0.0, $1 = 0.0, $10 = 0.0, $11 = 0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0.0, $20 = 0, $21 = 0.0, $22 = 0.0, $23 = 0, $24 = 0.0, $25 = 0.0, $26 = 0.0;
 var $27 = 0.0, $28 = 0.0, $29 = 0.0, $3 = 0.0, $30 = 0.0, $31 = 0.0, $32 = 0.0, $4 = 0, $5 = 0.0, $6 = 0.0, $7 = 0, $8 = 0.0, $9 = 0.0, $val = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $n1;
 $1 = $n2;
 $2 = $hue;
 $3 = $2;
 $4 = $3 > 6.0;
 $5 = $2;
 if ($4) {
  $6 = $5 - 6.0;
  $2 = $6;
 } else {
  $7 = $5 < 0.0;
  if ($7) {
   $8 = $2;
   $9 = $8 + 6.0;
   $2 = $9;
  }
 }
 $10 = $2;
 $11 = $10 < 1.0;
 do {
  if ($11) {
   $12 = $0;
   $13 = $1;
   $14 = $0;
   $15 = $13 - $14;
   $16 = $2;
   $17 = $15 * $16;
   $18 = $12 + $17;
   $val = $18;
  } else {
   $19 = $2;
   $20 = $19 < 3.0;
   if ($20) {
    $21 = $1;
    $val = $21;
    break;
   }
   $22 = $2;
   $23 = $22 < 4.0;
   $24 = $0;
   if ($23) {
    $25 = $1;
    $26 = $0;
    $27 = $25 - $26;
    $28 = $2;
    $29 = 4.0 - $28;
    $30 = $27 * $29;
    $31 = $24 + $30;
    $val = $31;
    break;
   } else {
    $val = $24;
    break;
   }
  }
 } while(0);
 $32 = $val;
 STACKTOP = sp;return (+$32);
}
function _rng_double_get_array($self,$aa,$n) {
 $self = $self|0;
 $aa = $aa|0;
 $n = $n|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0.0, $104 = 0.0, $105 = 0, $106 = 0.0, $107 = 0.0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $12 = 0;
 var $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0.0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0.0, $27 = 0.0, $28 = 0, $29 = 0, $3 = 0, $30 = 0;
 var $31 = 0, $32 = 0.0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0.0, $38 = 0.0, $39 = 0, $4 = 0, $40 = 0.0, $41 = 0.0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0;
 var $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0.0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0.0, $59 = 0.0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0.0, $65 = 0, $66 = 0, $67 = 0;
 var $68 = 0, $69 = 0.0, $7 = 0, $70 = 0.0, $71 = 0, $72 = 0.0, $73 = 0.0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0.0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0;
 var $86 = 0, $87 = 0.0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0.0, $93 = 0.0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0.0, $99 = 0, $i = 0, $j = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $aa;
 $2 = $n;
 $j = 0;
 while(1) {
  $3 = $j;
  $4 = ($3|0)<(10);
  if (!($4)) {
   break;
  }
  $5 = $j;
  $6 = $0;
  $7 = (($6) + ($5<<3)|0);
  $8 = +HEAPF64[$7>>3];
  $9 = $j;
  $10 = $1;
  $11 = (($10) + ($9<<3)|0);
  HEAPF64[$11>>3] = $8;
  $12 = $j;
  $13 = (($12) + 1)|0;
  $j = $13;
 }
 while(1) {
  $14 = $j;
  $15 = $2;
  $16 = ($14|0)<($15|0);
  if (!($16)) {
   break;
  }
  $17 = $j;
  $18 = (($17) - 10)|0;
  $19 = $1;
  $20 = (($19) + ($18<<3)|0);
  $21 = +HEAPF64[$20>>3];
  $22 = $j;
  $23 = (($22) - 7)|0;
  $24 = $1;
  $25 = (($24) + ($23<<3)|0);
  $26 = +HEAPF64[$25>>3];
  $27 = $21 + $26;
  $28 = $j;
  $29 = (($28) - 10)|0;
  $30 = $1;
  $31 = (($30) + ($29<<3)|0);
  $32 = +HEAPF64[$31>>3];
  $33 = $j;
  $34 = (($33) - 7)|0;
  $35 = $1;
  $36 = (($35) + ($34<<3)|0);
  $37 = +HEAPF64[$36>>3];
  $38 = $32 + $37;
  $39 = (~~(($38)));
  $40 = (+($39|0));
  $41 = $27 - $40;
  $42 = $j;
  $43 = $1;
  $44 = (($43) + ($42<<3)|0);
  HEAPF64[$44>>3] = $41;
  $45 = $j;
  $46 = (($45) + 1)|0;
  $j = $46;
 }
 $i = 0;
 while(1) {
  $47 = $i;
  $48 = ($47|0)<(7);
  if (!($48)) {
   break;
  }
  $49 = $j;
  $50 = (($49) - 10)|0;
  $51 = $1;
  $52 = (($51) + ($50<<3)|0);
  $53 = +HEAPF64[$52>>3];
  $54 = $j;
  $55 = (($54) - 7)|0;
  $56 = $1;
  $57 = (($56) + ($55<<3)|0);
  $58 = +HEAPF64[$57>>3];
  $59 = $53 + $58;
  $60 = $j;
  $61 = (($60) - 10)|0;
  $62 = $1;
  $63 = (($62) + ($61<<3)|0);
  $64 = +HEAPF64[$63>>3];
  $65 = $j;
  $66 = (($65) - 7)|0;
  $67 = $1;
  $68 = (($67) + ($66<<3)|0);
  $69 = +HEAPF64[$68>>3];
  $70 = $64 + $69;
  $71 = (~~(($70)));
  $72 = (+($71|0));
  $73 = $59 - $72;
  $74 = $i;
  $75 = $0;
  $76 = (($75) + ($74<<3)|0);
  HEAPF64[$76>>3] = $73;
  $77 = $i;
  $78 = (($77) + 1)|0;
  $i = $78;
  $79 = $j;
  $80 = (($79) + 1)|0;
  $j = $80;
 }
 while(1) {
  $81 = $i;
  $82 = ($81|0)<(10);
  if (!($82)) {
   break;
  }
  $83 = $j;
  $84 = (($83) - 10)|0;
  $85 = $1;
  $86 = (($85) + ($84<<3)|0);
  $87 = +HEAPF64[$86>>3];
  $88 = $i;
  $89 = (($88) - 7)|0;
  $90 = $0;
  $91 = (($90) + ($89<<3)|0);
  $92 = +HEAPF64[$91>>3];
  $93 = $87 + $92;
  $94 = $j;
  $95 = (($94) - 10)|0;
  $96 = $1;
  $97 = (($96) + ($95<<3)|0);
  $98 = +HEAPF64[$97>>3];
  $99 = $i;
  $100 = (($99) - 7)|0;
  $101 = $0;
  $102 = (($101) + ($100<<3)|0);
  $103 = +HEAPF64[$102>>3];
  $104 = $98 + $103;
  $105 = (~~(($104)));
  $106 = (+($105|0));
  $107 = $93 - $106;
  $108 = $i;
  $109 = $0;
  $110 = (($109) + ($108<<3)|0);
  HEAPF64[$110>>3] = $107;
  $111 = $i;
  $112 = (($111) + 1)|0;
  $i = $112;
  $113 = $j;
  $114 = (($113) + 1)|0;
  $j = $114;
 }
 STACKTOP = sp;return;
}
function _rng_double_new($seed) {
 $seed = $seed|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $self = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $seed;
 $1 = (_malloc(240)|0);
 $self = $1;
 $2 = $self;
 $3 = ((($2)) + 232|0);
 HEAP32[$3>>2] = 8;
 $4 = $self;
 $5 = $0;
 _rng_double_set_seed($4,$5);
 $6 = $self;
 STACKTOP = sp;return ($6|0);
}
function _rng_double_set_seed($self,$seed) {
 $self = $self|0;
 $seed = $seed|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0.0, $107 = 0, $108 = 0, $109 = 0, $11 = 0.0, $110 = 0, $111 = 0, $112 = 0.0, $113 = 0, $114 = 0.0, $115 = 0;
 var $116 = 0.0, $117 = 0.0, $118 = 0, $119 = 0.0, $12 = 0, $120 = 0, $121 = 0.0, $122 = 0.0, $123 = 0, $124 = 0.0, $125 = 0.0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0.0, $138 = 0, $139 = 0, $14 = 0.0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0.0, $15 = 0.0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0.0, $160 = 0, $161 = 0, $17 = 0.0, $18 = 0, $19 = 0.0, $2 = 0.0, $20 = 0.0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0;
 var $25 = 0, $26 = 0.0, $27 = 0, $28 = 0.0, $29 = 0.0, $3 = 0.0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0.0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
 var $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0.0, $56 = 0, $57 = 0, $58 = 0.0, $59 = 0.0, $6 = 0, $60 = 0;
 var $61 = 0, $62 = 0, $63 = 0.0, $64 = 0, $65 = 0, $66 = 0.0, $67 = 0.0, $68 = 0, $69 = 0.0, $7 = 0.0, $70 = 0.0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0.0, $78 = 0, $79 = 0;
 var $8 = 0.0, $80 = 0.0, $81 = 0.0, $82 = 0, $83 = 0, $84 = 0, $85 = 0.0, $86 = 0, $87 = 0, $88 = 0.0, $89 = 0.0, $9 = 0, $90 = 0, $91 = 0.0, $92 = 0.0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0;
 var $98 = 0, $99 = 0, $j = 0, $s = 0, $ss = 0.0, $t = 0, $u = 0, $ulp = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 192|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $u = sp + 16|0;
 $0 = $self;
 $1 = $seed;
 $ulp = 2.2204460492503131E-16;
 $2 = $ulp;
 $3 = 2.0 * $2;
 $4 = $1;
 $5 = $4 & 1073741823;
 $6 = (($5) + 2)|0;
 $7 = (+($6|0));
 $8 = $3 * $7;
 $ss = $8;
 $j = 0;
 while(1) {
  $9 = $j;
  $10 = ($9|0)<(10);
  if (!($10)) {
   break;
  }
  $11 = $ss;
  $12 = $j;
  $13 = (($u) + ($12<<3)|0);
  HEAPF64[$13>>3] = $11;
  $14 = $ss;
  $15 = $ss;
  $16 = $15 + $14;
  $ss = $16;
  $17 = $ss;
  $18 = $17 >= 1.0;
  if ($18) {
   $19 = $ulp;
   $20 = 2.0 * $19;
   $21 = 1.0 - $20;
   $22 = $ss;
   $23 = $22 - $21;
   $ss = $23;
  }
  $24 = $j;
  $25 = (($24) + 1)|0;
  $j = $25;
 }
 $26 = $ulp;
 $27 = ((($u)) + 8|0);
 $28 = +HEAPF64[$27>>3];
 $29 = $28 + $26;
 HEAPF64[$27>>3] = $29;
 $30 = $1;
 $31 = $30 & 1073741823;
 $s = $31;
 $t = 6;
 while(1) {
  $32 = $t;
  $33 = ($32|0)!=(0);
  if (!($33)) {
   break;
  }
  $j = 9;
  while(1) {
   $34 = $j;
   $35 = ($34|0)>(0);
   if (!($35)) {
    break;
   }
   $36 = $j;
   $37 = (($u) + ($36<<3)|0);
   $38 = +HEAPF64[$37>>3];
   $39 = $j;
   $40 = $j;
   $41 = (($39) + ($40))|0;
   $42 = (($u) + ($41<<3)|0);
   HEAPF64[$42>>3] = $38;
   $43 = $j;
   $44 = $j;
   $45 = (($43) + ($44))|0;
   $46 = (($45) - 1)|0;
   $47 = (($u) + ($46<<3)|0);
   HEAPF64[$47>>3] = 0.0;
   $48 = $j;
   $49 = (($48) + -1)|0;
   $j = $49;
  }
  $j = 18;
  while(1) {
   $50 = $j;
   $51 = ($50|0)>=(10);
   if (!($51)) {
    break;
   }
   $52 = $j;
   $53 = (($52) - 3)|0;
   $54 = (($u) + ($53<<3)|0);
   $55 = +HEAPF64[$54>>3];
   $56 = $j;
   $57 = (($u) + ($56<<3)|0);
   $58 = +HEAPF64[$57>>3];
   $59 = $55 + $58;
   $60 = $j;
   $61 = (($60) - 3)|0;
   $62 = (($u) + ($61<<3)|0);
   $63 = +HEAPF64[$62>>3];
   $64 = $j;
   $65 = (($u) + ($64<<3)|0);
   $66 = +HEAPF64[$65>>3];
   $67 = $63 + $66;
   $68 = (~~(($67)));
   $69 = (+($68|0));
   $70 = $59 - $69;
   $71 = $j;
   $72 = (($71) - 3)|0;
   $73 = (($u) + ($72<<3)|0);
   HEAPF64[$73>>3] = $70;
   $74 = $j;
   $75 = (($74) - 10)|0;
   $76 = (($u) + ($75<<3)|0);
   $77 = +HEAPF64[$76>>3];
   $78 = $j;
   $79 = (($u) + ($78<<3)|0);
   $80 = +HEAPF64[$79>>3];
   $81 = $77 + $80;
   $82 = $j;
   $83 = (($82) - 10)|0;
   $84 = (($u) + ($83<<3)|0);
   $85 = +HEAPF64[$84>>3];
   $86 = $j;
   $87 = (($u) + ($86<<3)|0);
   $88 = +HEAPF64[$87>>3];
   $89 = $85 + $88;
   $90 = (~~(($89)));
   $91 = (+($90|0));
   $92 = $81 - $91;
   $93 = $j;
   $94 = (($93) - 10)|0;
   $95 = (($u) + ($94<<3)|0);
   HEAPF64[$95>>3] = $92;
   $96 = $j;
   $97 = (($96) + -1)|0;
   $j = $97;
  }
  $98 = $s;
  $99 = $98 & 1;
  $100 = ($99|0)!=(0);
  if ($100) {
   $j = 10;
   while(1) {
    $101 = $j;
    $102 = ($101|0)>(0);
    if (!($102)) {
     break;
    }
    $103 = $j;
    $104 = (($103) - 1)|0;
    $105 = (($u) + ($104<<3)|0);
    $106 = +HEAPF64[$105>>3];
    $107 = $j;
    $108 = (($u) + ($107<<3)|0);
    HEAPF64[$108>>3] = $106;
    $109 = $j;
    $110 = (($109) + -1)|0;
    $j = $110;
   }
   $111 = ((($u)) + 80|0);
   $112 = +HEAPF64[$111>>3];
   HEAPF64[$u>>3] = $112;
   $113 = ((($u)) + 56|0);
   $114 = +HEAPF64[$113>>3];
   $115 = ((($u)) + 80|0);
   $116 = +HEAPF64[$115>>3];
   $117 = $114 + $116;
   $118 = ((($u)) + 56|0);
   $119 = +HEAPF64[$118>>3];
   $120 = ((($u)) + 80|0);
   $121 = +HEAPF64[$120>>3];
   $122 = $119 + $121;
   $123 = (~~(($122)));
   $124 = (+($123|0));
   $125 = $117 - $124;
   $126 = ((($u)) + 56|0);
   HEAPF64[$126>>3] = $125;
  }
  $127 = $s;
  $128 = ($127|0)!=(0);
  if ($128) {
   $129 = $s;
   $130 = $129 >> 1;
   $s = $130;
   continue;
  } else {
   $131 = $t;
   $132 = (($131) + -1)|0;
   $t = $132;
   continue;
  }
 }
 $j = 0;
 while(1) {
  $133 = $j;
  $134 = ($133|0)<(7);
  if (!($134)) {
   break;
  }
  $135 = $j;
  $136 = (($u) + ($135<<3)|0);
  $137 = +HEAPF64[$136>>3];
  $138 = $j;
  $139 = (($138) + 10)|0;
  $140 = (($139) - 7)|0;
  $141 = $0;
  $142 = (($141) + ($140<<3)|0);
  HEAPF64[$142>>3] = $137;
  $143 = $j;
  $144 = (($143) + 1)|0;
  $j = $144;
 }
 while(1) {
  $145 = $j;
  $146 = ($145|0)<(10);
  if (!($146)) {
   break;
  }
  $147 = $j;
  $148 = (($u) + ($147<<3)|0);
  $149 = +HEAPF64[$148>>3];
  $150 = $j;
  $151 = (($150) - 7)|0;
  $152 = $0;
  $153 = (($152) + ($151<<3)|0);
  HEAPF64[$153>>3] = $149;
  $154 = $j;
  $155 = (($154) + 1)|0;
  $j = $155;
 }
 $j = 0;
 while(1) {
  $156 = $j;
  $157 = ($156|0)<(10);
  $158 = $0;
  if (!($157)) {
   break;
  }
  _rng_double_get_array($158,$u,19);
  $159 = $j;
  $160 = (($159) + 1)|0;
  $j = $160;
 }
 $161 = ((($158)) + 232|0);
 HEAP32[$161>>2] = 16;
 STACKTOP = sp;return;
}
function _rng_double_free($self) {
 $self = $self|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $0;
 _free($1);
 STACKTOP = sp;return;
}
function _rng_double_cycle($self) {
 $self = $self|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0.0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $0;
 $2 = $0;
 $3 = ((($2)) + 80|0);
 _rng_double_get_array($1,$3,19);
 $4 = $0;
 $5 = ((($4)) + 80|0);
 $6 = ((($5)) + 80|0);
 HEAPF64[$6>>3] = -1.0;
 $7 = $0;
 $8 = ((($7)) + 80|0);
 $9 = ((($8)) + 8|0);
 $10 = $0;
 $11 = ((($10)) + 232|0);
 HEAP32[$11>>2] = $9;
 $12 = $0;
 $13 = ((($12)) + 80|0);
 $14 = +HEAPF64[$13>>3];
 STACKTOP = sp;return (+$14);
}
function _mypaint_brush_new() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, $self = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = (_malloc(544)|0);
 $self = $0;
 $1 = $self;
 $2 = ((($1)) + 536|0);
 HEAP32[$2>>2] = 1;
 $i = 0;
 $i = 0;
 while(1) {
  $3 = $i;
  $4 = ($3|0)<(45);
  if (!($4)) {
   break;
  }
  $5 = (_mapping_new(9)|0);
  $6 = $i;
  $7 = $self;
  $8 = ((($7)) + 148|0);
  $9 = (($8) + ($6<<2)|0);
  HEAP32[$9>>2] = $5;
  $10 = $i;
  $11 = (($10) + 1)|0;
  $i = $11;
 }
 $12 = (_rng_double_new(1000)|0);
 $13 = $self;
 $14 = ((($13)) + 144|0);
 HEAP32[$14>>2] = $12;
 $15 = $self;
 HEAP32[$15>>2] = 0;
 $i = 0;
 while(1) {
  $16 = $i;
  $17 = ($16|0)<(30);
  if (!($17)) {
   break;
  }
  $18 = $i;
  $19 = $self;
  $20 = ((($19)) + 24|0);
  $21 = (($20) + ($18<<2)|0);
  HEAPF32[$21>>2] = 0.0;
  $22 = $i;
  $23 = (($22) + 1)|0;
  $i = $23;
 }
 $24 = $self;
 _mypaint_brush_new_stroke($24);
 $25 = $self;
 _settings_base_values_have_changed($25);
 $26 = $self;
 $27 = ((($26)) + 532|0);
 HEAP32[$27>>2] = 1;
 $28 = $self;
 STACKTOP = sp;return ($28|0);
}
function _mypaint_brush_new_stroke($self) {
 $self = $self|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $0;
 $2 = ((($1)) + 16|0);
 HEAPF64[$2>>3] = 0.0;
 $3 = $0;
 $4 = ((($3)) + 8|0);
 HEAPF64[$4>>3] = 0.0;
 STACKTOP = sp;return;
}
function _settings_base_values_have_changed($self) {
 $self = $self|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0.0, $26 = 0.0;
 var $27 = 0.0, $28 = 0.0, $29 = 0.0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0.0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0.0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $c1 = 0.0, $fix1_x = 0.0, $fix1_y = 0.0, $fix2_dy = 0.0, $fix2_x = 0.0, $gamma = 0.0, $i = 0, $m = 0.0, $q = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $i = 0;
 $i = 0;
 while(1) {
  $1 = $i;
  $2 = ($1|0)<(2);
  if (!($2)) {
   break;
  }
  $3 = $i;
  $4 = ($3|0)==(0);
  $5 = $4 ? 12 : 13;
  $6 = $0;
  $7 = ((($6)) + 148|0);
  $8 = (($7) + ($5<<2)|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = (+_mapping_get_base_value($9));
  $gamma = $10;
  $11 = $gamma;
  $12 = (+Math_exp((+$11)));
  $gamma = $12;
  $fix1_x = 45.0;
  $fix1_y = 0.5;
  $fix2_x = 45.0;
  $fix2_dy = 0.014999999664723873;
  $13 = $fix1_x;
  $14 = $gamma;
  $15 = $13 + $14;
  $16 = $15;
  $17 = (+Math_log((+$16)));
  $18 = $17;
  $c1 = $18;
  $19 = $fix2_dy;
  $20 = $fix2_x;
  $21 = $gamma;
  $22 = $20 + $21;
  $23 = $19 * $22;
  $m = $23;
  $24 = $fix1_y;
  $25 = $m;
  $26 = $c1;
  $27 = $25 * $26;
  $28 = $24 - $27;
  $q = $28;
  $29 = $gamma;
  $30 = $i;
  $31 = $0;
  $32 = ((($31)) + 508|0);
  $33 = (($32) + ($30<<2)|0);
  HEAPF32[$33>>2] = $29;
  $34 = $m;
  $35 = $i;
  $36 = $0;
  $37 = ((($36)) + 516|0);
  $38 = (($37) + ($35<<2)|0);
  HEAPF32[$38>>2] = $34;
  $39 = $q;
  $40 = $i;
  $41 = $0;
  $42 = ((($41)) + 524|0);
  $43 = (($42) + ($40<<2)|0);
  HEAPF32[$43>>2] = $39;
  $44 = $i;
  $45 = (($44) + 1)|0;
  $i = $45;
 }
 STACKTOP = sp;return;
}
function _brush_free($self) {
 $self = $self|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $i = 0;
 while(1) {
  $1 = $i;
  $2 = ($1|0)<(45);
  if (!($2)) {
   break;
  }
  $3 = $i;
  $4 = $0;
  $5 = ((($4)) + 148|0);
  $6 = (($5) + ($3<<2)|0);
  $7 = HEAP32[$6>>2]|0;
  _mapping_free($7);
  $8 = $i;
  $9 = (($8) + 1)|0;
  $i = $9;
 }
 $10 = $0;
 $11 = ((($10)) + 144|0);
 $12 = HEAP32[$11>>2]|0;
 _rng_double_free($12);
 $13 = $0;
 $14 = ((($13)) + 144|0);
 HEAP32[$14>>2] = 0;
 $15 = $0;
 _free($15);
 STACKTOP = sp;return;
}
function _mypaint_brush_unref($self) {
 $self = $self|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $0;
 $2 = ((($1)) + 536|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($3) + -1)|0;
 HEAP32[$2>>2] = $4;
 $5 = $0;
 $6 = ((($5)) + 536|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = ($7|0)==(0);
 if (!($8)) {
  STACKTOP = sp;return;
 }
 $9 = $0;
 _brush_free($9);
 STACKTOP = sp;return;
}
function _mypaint_brush_reset($self) {
 $self = $self|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $0;
 $2 = ((($1)) + 532|0);
 HEAP32[$2>>2] = 1;
 STACKTOP = sp;return;
}
function _mypaint_brush_set_base_value($self,$id,$value) {
 $self = $self|0;
 $id = $id|0;
 $value = +$value;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0.0, $13 = 0, $2 = 0.0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $id;
 $2 = $value;
 $3 = $1;
 $4 = ($3>>>0)>=(0);
 $5 = $1;
 $6 = ($5>>>0)<(45);
 $or$cond = $4 & $6;
 if ($or$cond) {
  $7 = $1;
  $8 = $0;
  $9 = ((($8)) + 148|0);
  $10 = (($9) + ($7<<2)|0);
  $11 = HEAP32[$10>>2]|0;
  $12 = $2;
  _mapping_set_base_value($11,$12);
  $13 = $0;
  _settings_base_values_have_changed($13);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((2482|0),(2527|0),239,(2565|0));
  // unreachable;
 }
}
function _mypaint_brush_set_mapping_n($self,$id,$input,$n) {
 $self = $self|0;
 $id = $id|0;
 $input = $input|0;
 $n = $n|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $id;
 $2 = $input;
 $3 = $n;
 $4 = $1;
 $5 = ($4>>>0)>=(0);
 $6 = $1;
 $7 = ($6>>>0)<(45);
 $or$cond = $5 & $7;
 if ($or$cond) {
  $8 = $1;
  $9 = $0;
  $10 = ((($9)) + 148|0);
  $11 = (($10) + ($8<<2)|0);
  $12 = HEAP32[$11>>2]|0;
  $13 = $2;
  $14 = $3;
  _mapping_set_n($12,$13,$14);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((2482|0),(2527|0),265,(2594|0));
  // unreachable;
 }
}
function _mypaint_brush_set_mapping_point($self,$id,$input,$index,$x,$y) {
 $self = $self|0;
 $id = $id|0;
 $input = $input|0;
 $index = $index|0;
 $x = +$x;
 $y = +$y;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0.0, $18 = 0.0, $2 = 0, $3 = 0, $4 = 0.0, $5 = 0.0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $id;
 $2 = $input;
 $3 = $index;
 $4 = $x;
 $5 = $y;
 $6 = $1;
 $7 = ($6>>>0)>=(0);
 $8 = $1;
 $9 = ($8>>>0)<(45);
 $or$cond = $7 & $9;
 if ($or$cond) {
  $10 = $1;
  $11 = $0;
  $12 = ((($11)) + 148|0);
  $13 = (($12) + ($10<<2)|0);
  $14 = HEAP32[$13>>2]|0;
  $15 = $2;
  $16 = $3;
  $17 = $4;
  $18 = $5;
  _mapping_set_point($14,$15,$16,$17,$18);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((2482|0),(2527|0),313,(2622|0));
  // unreachable;
 }
}
function _exp_decay($T_const,$t) {
 $T_const = +$T_const;
 $t = +$t;
 var $0 = 0.0, $1 = 0.0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $2 = 0.0, $3 = 0.0, $4 = 0.0, $5 = 0, $6 = 0.0, $7 = 0.0, $8 = 0.0, $9 = 0.0, $arg = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $1 = $T_const;
 $2 = $t;
 $3 = $1;
 $4 = $3;
 $5 = $4 <= 0.001;
 if ($5) {
  $0 = 0.0;
  $12 = $0;
  STACKTOP = sp;return (+$12);
 } else {
  $6 = $2;
  $7 = -$6;
  $8 = $1;
  $9 = $7 / $8;
  $arg = $9;
  $10 = $arg;
  $11 = (+Math_exp((+$10)));
  $0 = $11;
  $12 = $0;
  STACKTOP = sp;return (+$12);
 }
 return +(0.0);
}
function _update_states_and_setting_values($self,$step_ddab,$step_dx,$step_dy,$step_dpressure,$step_declination,$step_ascension,$step_dtime) {
 $self = $self|0;
 $step_ddab = +$step_ddab;
 $step_dx = +$step_dx;
 $step_dy = +$step_dy;
 $step_dpressure = +$step_dpressure;
 $step_declination = +$step_declination;
 $step_ascension = +$step_ascension;
 $step_dtime = +$step_dtime;
 var $0 = 0, $1 = 0.0, $10 = 0, $100 = 0.0, $101 = 0.0, $102 = 0.0, $103 = 0.0, $104 = 0.0, $105 = 0.0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0.0, $110 = 0.0, $111 = 0.0, $112 = 0.0, $113 = 0, $114 = 0, $115 = 0.0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0.0, $12 = 0.0, $120 = 0.0, $121 = 0.0, $122 = 0.0, $123 = 0, $124 = 0, $125 = 0.0, $126 = 0.0, $127 = 0.0, $128 = 0, $129 = 0, $13 = 0, $130 = 0.0, $131 = 0.0, $132 = 0.0, $133 = 0.0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0.0, $139 = 0, $14 = 0.0, $140 = 0, $141 = 0, $142 = 0.0, $143 = 0.0, $144 = 0.0, $145 = 0.0, $146 = 0, $147 = 0, $148 = 0, $149 = 0.0, $15 = 0, $150 = 0.0, $151 = 0.0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0.0, $156 = 0.0, $157 = 0.0, $158 = 0.0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0.0, $164 = 0.0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0.0, $17 = 0.0;
 var $170 = 0.0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0.0, $176 = 0.0, $177 = 0.0, $178 = 0.0, $179 = 0, $18 = 0.0, $180 = 0, $181 = 0, $182 = 0, $183 = 0.0, $184 = 0, $185 = 0, $186 = 0, $187 = 0.0, $188 = 0.0;
 var $189 = 0.0, $19 = 0.0, $190 = 0.0, $191 = 0.0, $192 = 0.0, $193 = 0.0, $194 = 0.0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0.0, $2 = 0.0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0.0, $205 = 0.0;
 var $206 = 0.0, $207 = 0.0, $208 = 0.0, $209 = 0.0, $21 = 0, $210 = 0.0, $211 = 0.0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0.0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0.0, $222 = 0.0, $223 = 0;
 var $224 = 0.0, $225 = 0.0, $226 = 0, $227 = 0.0, $228 = 0.0, $229 = 0, $23 = 0.0, $230 = 0.0, $231 = 0.0, $232 = 0, $233 = 0.0, $234 = 0.0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0.0, $240 = 0, $241 = 0;
 var $242 = 0.0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0.0, $250 = 0, $251 = 0, $252 = 0.0, $253 = 0.0, $254 = 0.0, $255 = 0.0, $256 = 0.0, $257 = 0.0, $258 = 0, $259 = 0, $26 = 0;
 var $260 = 0.0, $261 = 0, $262 = 0, $263 = 0, $264 = 0.0, $265 = 0.0, $266 = 0.0, $267 = 0.0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0.0, $272 = 0.0, $273 = 0, $274 = 0, $275 = 0, $276 = 0.0, $277 = 0, $278 = 0;
 var $279 = 0, $28 = 0, $280 = 0.0, $281 = 0.0, $282 = 0.0, $283 = 0.0, $284 = 0, $285 = 0, $286 = 0, $287 = 0.0, $288 = 0.0, $289 = 0, $29 = 0.0, $290 = 0, $291 = 0, $292 = 0.0, $293 = 0.0, $294 = 0.0, $295 = 0.0, $296 = 0.0;
 var $297 = 0.0, $298 = 0.0, $299 = 0, $3 = 0.0, $30 = 0.0, $300 = 0, $301 = 0, $302 = 0.0, $303 = 0.0, $304 = 0.0, $305 = 0.0, $306 = 0, $307 = 0, $308 = 0, $309 = 0.0, $31 = 0.0, $310 = 0.0, $311 = 0, $312 = 0, $313 = 0;
 var $314 = 0.0, $315 = 0.0, $316 = 0.0, $317 = 0.0, $318 = 0.0, $319 = 0.0, $32 = 0, $320 = 0.0, $321 = 0, $322 = 0, $323 = 0, $324 = 0.0, $325 = 0.0, $326 = 0.0, $327 = 0.0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0.0;
 var $332 = 0.0, $333 = 0, $334 = 0, $335 = 0, $336 = 0.0, $337 = 0.0, $338 = 0.0, $339 = 0.0, $34 = 0, $340 = 0.0, $341 = 0.0, $342 = 0.0, $343 = 0.0, $344 = 0.0, $345 = 0.0, $346 = 0, $347 = 0.0, $348 = 0.0, $349 = 0.0, $35 = 0.0;
 var $350 = 0.0, $351 = 0.0, $352 = 0.0, $353 = 0.0, $354 = 0, $355 = 0, $356 = 0, $357 = 0.0, $358 = 0.0, $359 = 0.0, $36 = 0.0, $360 = 0.0, $361 = 0, $362 = 0, $363 = 0, $364 = 0.0, $365 = 0.0, $366 = 0.0, $367 = 0, $368 = 0;
 var $369 = 0, $37 = 0.0, $370 = 0.0, $371 = 0.0, $372 = 0.0, $373 = 0.0, $374 = 0, $375 = 0, $376 = 0, $377 = 0.0, $378 = 0.0, $379 = 0.0, $38 = 0, $380 = 0.0, $381 = 0.0, $382 = 0.0, $383 = 0.0, $384 = 0.0, $385 = 0.0, $386 = 0.0;
 var $387 = 0.0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0.0, $392 = 0.0, $393 = 0.0, $394 = 0.0, $395 = 0.0, $396 = 0.0, $397 = 0.0, $398 = 0.0, $399 = 0.0, $4 = 0.0, $40 = 0, $400 = 0.0, $401 = 0.0, $402 = 0, $403 = 0;
 var $404 = 0, $405 = 0.0, $406 = 0, $407 = 0, $408 = 0, $409 = 0.0, $41 = 0.0, $410 = 0.0, $411 = 0.0, $412 = 0.0, $413 = 0.0, $414 = 0.0, $415 = 0.0, $416 = 0.0, $417 = 0.0, $418 = 0.0, $419 = 0.0, $42 = 0.0, $420 = 0.0, $421 = 0.0;
 var $422 = 0.0, $423 = 0.0, $424 = 0.0, $425 = 0.0, $426 = 0.0, $427 = 0.0, $428 = 0.0, $429 = 0.0, $43 = 0, $430 = 0.0, $431 = 0.0, $432 = 0.0, $433 = 0.0, $434 = 0.0, $435 = 0.0, $436 = 0.0, $437 = 0.0, $438 = 0.0, $439 = 0.0, $44 = 0;
 var $440 = 0.0, $441 = 0.0, $442 = 0.0, $443 = 0.0, $444 = 0, $445 = 0.0, $446 = 0.0, $447 = 0.0, $448 = 0.0, $449 = 0.0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0.0, $454 = 0.0, $455 = 0.0, $456 = 0.0, $457 = 0, $458 = 0;
 var $459 = 0, $46 = 0, $460 = 0.0, $461 = 0.0, $462 = 0.0, $463 = 0, $464 = 0, $465 = 0, $466 = 0.0, $467 = 0.0, $468 = 0.0, $469 = 0.0, $47 = 0.0, $470 = 0, $471 = 0, $472 = 0, $473 = 0.0, $474 = 0.0, $475 = 0, $476 = 0;
 var $477 = 0, $478 = 0.0, $479 = 0.0, $48 = 0.0, $480 = 0.0, $481 = 0.0, $482 = 0.0, $483 = 0, $484 = 0, $485 = 0, $486 = 0.0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0.0, $491 = 0.0, $492 = 0.0, $493 = 0.0, $494 = 0;
 var $495 = 0, $496 = 0, $497 = 0.0, $498 = 0.0, $499 = 0, $5 = 0.0, $50 = 0, $500 = 0, $501 = 0, $502 = 0.0, $503 = 0.0, $504 = 0.0, $505 = 0.0, $506 = 0.0, $507 = 0.0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0.0;
 var $512 = 0.0, $513 = 0, $514 = 0, $515 = 0, $516 = 0.0, $517 = 0, $518 = 0, $519 = 0, $52 = 0.0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0.0, $525 = 0.0, $526 = 0.0, $527 = 0.0, $528 = 0, $529 = 0, $53 = 0.0;
 var $530 = 0, $531 = 0.0, $532 = 0.0, $533 = 0, $534 = 0.0, $535 = 0.0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0.0, $541 = 0.0, $542 = 0.0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0;
 var $549 = 0.0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0.0, $558 = 0.0, $559 = 0.0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0.0;
 var $567 = 0.0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0.0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0.0, $584 = 0;
 var $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0.0, $591 = 0, $592 = 0, $593 = 0, $6 = 0.0, $60 = 0, $61 = 0.0, $62 = 0, $63 = 0, $64 = 0, $65 = 0.0, $66 = 0, $67 = 0.0, $68 = 0.0;
 var $69 = 0, $7 = 0.0, $70 = 0, $71 = 0, $72 = 0, $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0.0, $80 = 0, $81 = 0, $82 = 0, $83 = 0.0, $84 = 0.0, $85 = 0, $86 = 0;
 var $87 = 0, $88 = 0, $89 = 0.0, $9 = 0.0, $90 = 0.0, $91 = 0.0, $92 = 0.0, $93 = 0.0, $94 = 0.0, $95 = 0.0, $96 = 0.0, $97 = 0.0, $98 = 0.0, $99 = 0.0, $base_radius = 0.0, $dx = 0.0, $dx_old = 0.0, $dy = 0.0, $dy_old = 0.0, $fac = 0.0;
 var $fac1 = 0.0, $fac2 = 0.0, $fac3 = 0.0, $fac4 = 0.0, $frequency = 0.0, $i = 0, $inputs = 0, $norm_dist = 0.0, $norm_dx = 0.0, $norm_dy = 0.0, $norm_speed = 0.0, $pressure = 0.0, $radius_log = 0.0, $step_in_dabtime = 0.0, $time_constant = 0.0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_ptr3 = 0, $vararg_ptr4 = 0, $vararg_ptr5 = 0;
 var $vararg_ptr6 = 0, $wrap = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 208|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer1 = sp + 8|0;
 $vararg_buffer = sp;
 $inputs = sp + 128|0;
 $0 = $self;
 $1 = $step_ddab;
 $2 = $step_dx;
 $3 = $step_dy;
 $4 = $step_dpressure;
 $5 = $step_declination;
 $6 = $step_ascension;
 $7 = $step_dtime;
 $8 = $7;
 $9 = $8;
 $10 = $9 < 0.0;
 if ($10) {
  (_printf(2654,$vararg_buffer)|0);
  $7 = 0.0010000000474974513;
 } else {
  $11 = $7;
  $12 = $11;
  $13 = $12 == 0.0;
  if ($13) {
   $7 = 0.0010000000474974513;
  }
 }
 $14 = $2;
 $15 = $0;
 $16 = ((($15)) + 24|0);
 $17 = +HEAPF32[$16>>2];
 $18 = $17 + $14;
 HEAPF32[$16>>2] = $18;
 $19 = $3;
 $20 = $0;
 $21 = ((($20)) + 24|0);
 $22 = ((($21)) + 4|0);
 $23 = +HEAPF32[$22>>2];
 $24 = $23 + $19;
 HEAPF32[$22>>2] = $24;
 $25 = $4;
 $26 = $0;
 $27 = ((($26)) + 24|0);
 $28 = ((($27)) + 8|0);
 $29 = +HEAPF32[$28>>2];
 $30 = $29 + $25;
 HEAPF32[$28>>2] = $30;
 $31 = $5;
 $32 = $0;
 $33 = ((($32)) + 24|0);
 $34 = ((($33)) + 112|0);
 $35 = +HEAPF32[$34>>2];
 $36 = $35 + $31;
 HEAPF32[$34>>2] = $36;
 $37 = $6;
 $38 = $0;
 $39 = ((($38)) + 24|0);
 $40 = ((($39)) + 116|0);
 $41 = +HEAPF32[$40>>2];
 $42 = $41 + $37;
 HEAPF32[$40>>2] = $42;
 $43 = $0;
 $44 = ((($43)) + 148|0);
 $45 = ((($44)) + 12|0);
 $46 = HEAP32[$45>>2]|0;
 $47 = (+_mapping_get_base_value($46));
 $48 = (+Math_exp((+$47)));
 $base_radius = $48;
 $49 = $0;
 $50 = ((($49)) + 24|0);
 $51 = ((($50)) + 8|0);
 $52 = +HEAPF32[$51>>2];
 $53 = $52;
 $54 = $53 <= 0.0;
 if ($54) {
  $55 = $0;
  $56 = ((($55)) + 24|0);
  $57 = ((($56)) + 8|0);
  HEAPF32[$57>>2] = 0.0;
 }
 $58 = $0;
 $59 = ((($58)) + 24|0);
 $60 = ((($59)) + 8|0);
 $61 = +HEAPF32[$60>>2];
 $pressure = $61;
 $62 = $0;
 $63 = ((($62)) + 24|0);
 $64 = ((($63)) + 84|0);
 $65 = +HEAPF32[$64>>2];
 $66 = $65 != 0.0;
 $67 = $pressure;
 $68 = $67;
 $69 = $0;
 $70 = ((($69)) + 148|0);
 $71 = ((($70)) + 132|0);
 $72 = HEAP32[$71>>2]|0;
 $73 = (+_mapping_get_base_value($72));
 $74 = $73;
 if ($66) {
  $83 = $74 * 0.90000000000000002;
  $84 = $83 + 1.0E-4;
  $85 = $68 <= $84;
  if ($85) {
   $86 = $0;
   $87 = ((($86)) + 24|0);
   $88 = ((($87)) + 84|0);
   HEAPF32[$88>>2] = 0.0;
  }
 } else {
  $75 = $74 + 1.0E-4;
  $76 = $68 > $75;
  if ($76) {
   $77 = $0;
   $78 = ((($77)) + 24|0);
   $79 = ((($78)) + 84|0);
   HEAPF32[$79>>2] = 1.0;
   $80 = $0;
   $81 = ((($80)) + 24|0);
   $82 = ((($81)) + 80|0);
   HEAPF32[$82>>2] = 0.0;
  }
 }
 $89 = $2;
 $90 = $7;
 $91 = $89 / $90;
 $92 = $base_radius;
 $93 = $91 / $92;
 $norm_dx = $93;
 $94 = $3;
 $95 = $7;
 $96 = $94 / $95;
 $97 = $base_radius;
 $98 = $96 / $97;
 $norm_dy = $98;
 $99 = $norm_dx;
 $100 = $norm_dy;
 $101 = (+_hypotf($99,$100));
 $norm_speed = $101;
 $102 = $norm_speed;
 $103 = $7;
 $104 = $102 * $103;
 $norm_dist = $104;
 $105 = $pressure;
 $106 = $0;
 $107 = ((($106)) + 148|0);
 $108 = ((($107)) + 176|0);
 $109 = HEAP32[$108>>2]|0;
 $110 = (+_mapping_get_base_value($109));
 $111 = (+Math_exp((+$110)));
 $112 = $105 * $111;
 HEAPF32[$inputs>>2] = $112;
 $113 = $0;
 $114 = ((($113)) + 508|0);
 $115 = +HEAPF32[$114>>2];
 $116 = $0;
 $117 = ((($116)) + 24|0);
 $118 = ((($117)) + 72|0);
 $119 = +HEAPF32[$118>>2];
 $120 = $115 + $119;
 $121 = $120;
 $122 = (+Math_log((+$121)));
 $123 = $0;
 $124 = ((($123)) + 516|0);
 $125 = +HEAPF32[$124>>2];
 $126 = $125;
 $127 = $122 * $126;
 $128 = $0;
 $129 = ((($128)) + 524|0);
 $130 = +HEAPF32[$129>>2];
 $131 = $130;
 $132 = $127 + $131;
 $133 = $132;
 $134 = ((($inputs)) + 4|0);
 HEAPF32[$134>>2] = $133;
 $135 = $0;
 $136 = ((($135)) + 508|0);
 $137 = ((($136)) + 4|0);
 $138 = +HEAPF32[$137>>2];
 $139 = $0;
 $140 = ((($139)) + 24|0);
 $141 = ((($140)) + 76|0);
 $142 = +HEAPF32[$141>>2];
 $143 = $138 + $142;
 $144 = $143;
 $145 = (+Math_log((+$144)));
 $146 = $0;
 $147 = ((($146)) + 516|0);
 $148 = ((($147)) + 4|0);
 $149 = +HEAPF32[$148>>2];
 $150 = $149;
 $151 = $145 * $150;
 $152 = $0;
 $153 = ((($152)) + 524|0);
 $154 = ((($153)) + 4|0);
 $155 = +HEAPF32[$154>>2];
 $156 = $155;
 $157 = $151 + $156;
 $158 = $157;
 $159 = ((($inputs)) + 8|0);
 HEAPF32[$159>>2] = $158;
 $160 = $0;
 $161 = ((($160)) + 144|0);
 $162 = HEAP32[$161>>2]|0;
 $163 = (+_rng_double_next($162));
 $164 = $163;
 $165 = ((($inputs)) + 12|0);
 HEAPF32[$165>>2] = $164;
 $166 = $0;
 $167 = ((($166)) + 24|0);
 $168 = ((($167)) + 80|0);
 $169 = +HEAPF32[$168>>2];
 $170 = $169;
 $171 = $170 < 1.0;
 if ($171) {
  $172 = $0;
  $173 = ((($172)) + 24|0);
  $174 = ((($173)) + 80|0);
  $175 = +HEAPF32[$174>>2];
  $176 = $175;
  $178 = $176;
 } else {
  $178 = 1.0;
 }
 $177 = $178;
 $179 = ((($inputs)) + 16|0);
 HEAPF32[$179>>2] = $177;
 $180 = $0;
 $181 = ((($180)) + 24|0);
 $182 = ((($181)) + 108|0);
 $183 = +HEAPF32[$182>>2];
 $184 = $0;
 $185 = ((($184)) + 24|0);
 $186 = ((($185)) + 104|0);
 $187 = +HEAPF32[$186>>2];
 $188 = (+Math_atan2((+$183),(+$187)));
 $189 = $188;
 $190 = $189 / 6.2831853071795862;
 $191 = $190 * 360.0;
 $192 = $191 + 180.0;
 $193 = $192;
 $194 = (+_fmodf($193,180.0));
 $195 = ((($inputs)) + 20|0);
 HEAPF32[$195>>2] = $194;
 $196 = $0;
 $197 = ((($196)) + 24|0);
 $198 = ((($197)) + 112|0);
 $199 = +HEAPF32[$198>>2];
 $200 = ((($inputs)) + 24|0);
 HEAPF32[$200>>2] = $199;
 $201 = $0;
 $202 = ((($201)) + 24|0);
 $203 = ((($202)) + 116|0);
 $204 = +HEAPF32[$203>>2];
 $205 = $204;
 $206 = $205 + 180.0;
 $207 = $206;
 $208 = (+_fmodf($207,360.0));
 $209 = $208;
 $210 = $209 - 180.0;
 $211 = $210;
 $212 = ((($inputs)) + 28|0);
 HEAPF32[$212>>2] = $211;
 $213 = $0;
 $214 = ((($213)) + 24|0);
 $215 = ((($214)) + 88|0);
 $216 = +HEAPF32[$215>>2];
 $217 = ((($inputs)) + 32|0);
 HEAPF32[$217>>2] = $216;
 $218 = $0;
 $219 = HEAP32[$218>>2]|0;
 $220 = ($219|0)!=(0);
 if ($220) {
  $221 = +HEAPF32[$inputs>>2];
  $222 = $221;
  $223 = ((($inputs)) + 4|0);
  $224 = +HEAPF32[$223>>2];
  $225 = $224;
  $226 = ((($inputs)) + 8|0);
  $227 = +HEAPF32[$226>>2];
  $228 = $227;
  $229 = ((($inputs)) + 16|0);
  $230 = +HEAPF32[$229>>2];
  $231 = $230;
  $232 = ((($inputs)) + 32|0);
  $233 = +HEAPF32[$232>>2];
  $234 = $233;
  HEAPF64[$vararg_buffer1>>3] = $222;
  $vararg_ptr3 = ((($vararg_buffer1)) + 8|0);
  HEAPF64[$vararg_ptr3>>3] = $225;
  $vararg_ptr4 = ((($vararg_buffer1)) + 16|0);
  HEAPF64[$vararg_ptr4>>3] = $228;
  $vararg_ptr5 = ((($vararg_buffer1)) + 24|0);
  HEAPF64[$vararg_ptr5>>3] = $231;
  $vararg_ptr6 = ((($vararg_buffer1)) + 32|0);
  HEAPF64[$vararg_ptr6>>3] = $234;
  (_printf(2682,$vararg_buffer1)|0);
 }
 $i = 0;
 $i = 0;
 while(1) {
  $235 = $i;
  $236 = ($235|0)<(45);
  if (!($236)) {
   break;
  }
  $237 = $i;
  $238 = $0;
  $239 = ((($238)) + 148|0);
  $240 = (($239) + ($237<<2)|0);
  $241 = HEAP32[$240>>2]|0;
  $242 = (+_mapping_calculate($241,$inputs));
  $243 = $i;
  $244 = $0;
  $245 = ((($244)) + 328|0);
  $246 = (($245) + ($243<<2)|0);
  HEAPF32[$246>>2] = $242;
  $247 = $i;
  $248 = (($247) + 1)|0;
  $i = $248;
 }
 $249 = $0;
 $250 = ((($249)) + 328|0);
 $251 = ((($250)) + 72|0);
 $252 = +HEAPF32[$251>>2];
 $253 = $1;
 $254 = (+_exp_decay($252,$253));
 $255 = $254;
 $256 = 1.0 - $255;
 $257 = $256;
 $fac = $257;
 $258 = $0;
 $259 = ((($258)) + 24|0);
 $260 = +HEAPF32[$259>>2];
 $261 = $0;
 $262 = ((($261)) + 24|0);
 $263 = ((($262)) + 56|0);
 $264 = +HEAPF32[$263>>2];
 $265 = $260 - $264;
 $266 = $fac;
 $267 = $265 * $266;
 $268 = $0;
 $269 = ((($268)) + 24|0);
 $270 = ((($269)) + 56|0);
 $271 = +HEAPF32[$270>>2];
 $272 = $271 + $267;
 HEAPF32[$270>>2] = $272;
 $273 = $0;
 $274 = ((($273)) + 24|0);
 $275 = ((($274)) + 4|0);
 $276 = +HEAPF32[$275>>2];
 $277 = $0;
 $278 = ((($277)) + 24|0);
 $279 = ((($278)) + 60|0);
 $280 = +HEAPF32[$279>>2];
 $281 = $276 - $280;
 $282 = $fac;
 $283 = $281 * $282;
 $284 = $0;
 $285 = ((($284)) + 24|0);
 $286 = ((($285)) + 60|0);
 $287 = +HEAPF32[$286>>2];
 $288 = $287 + $283;
 HEAPF32[$286>>2] = $288;
 $289 = $0;
 $290 = ((($289)) + 328|0);
 $291 = ((($290)) + 40|0);
 $292 = +HEAPF32[$291>>2];
 $293 = $7;
 $294 = (+_exp_decay($292,$293));
 $295 = $294;
 $296 = 1.0 - $295;
 $297 = $296;
 $fac1 = $297;
 $298 = $norm_speed;
 $299 = $0;
 $300 = ((($299)) + 24|0);
 $301 = ((($300)) + 72|0);
 $302 = +HEAPF32[$301>>2];
 $303 = $298 - $302;
 $304 = $fac1;
 $305 = $303 * $304;
 $306 = $0;
 $307 = ((($306)) + 24|0);
 $308 = ((($307)) + 72|0);
 $309 = +HEAPF32[$308>>2];
 $310 = $309 + $305;
 HEAPF32[$308>>2] = $310;
 $311 = $0;
 $312 = ((($311)) + 328|0);
 $313 = ((($312)) + 44|0);
 $314 = +HEAPF32[$313>>2];
 $315 = $7;
 $316 = (+_exp_decay($314,$315));
 $317 = $316;
 $318 = 1.0 - $317;
 $319 = $318;
 $fac1 = $319;
 $320 = $norm_speed;
 $321 = $0;
 $322 = ((($321)) + 24|0);
 $323 = ((($322)) + 76|0);
 $324 = +HEAPF32[$323>>2];
 $325 = $320 - $324;
 $326 = $fac1;
 $327 = $325 * $326;
 $328 = $0;
 $329 = ((($328)) + 24|0);
 $330 = ((($329)) + 76|0);
 $331 = +HEAPF32[$330>>2];
 $332 = $331 + $327;
 HEAPF32[$330>>2] = $332;
 $333 = $0;
 $334 = ((($333)) + 328|0);
 $335 = ((($334)) + 64|0);
 $336 = +HEAPF32[$335>>2];
 $337 = $336;
 $338 = $337 * 0.01;
 $339 = $338;
 $340 = (+Math_exp((+$339)));
 $341 = $340;
 $342 = $341 - 1.0;
 $343 = $342;
 $time_constant = $343;
 $344 = $time_constant;
 $345 = $344;
 $346 = $345 < 0.002;
 if ($346) {
  $time_constant = 0.0020000000949949026;
 }
 $347 = $time_constant;
 $348 = $7;
 $349 = (+_exp_decay($347,$348));
 $350 = $349;
 $351 = 1.0 - $350;
 $352 = $351;
 $fac2 = $352;
 $353 = $norm_dx;
 $354 = $0;
 $355 = ((($354)) + 24|0);
 $356 = ((($355)) + 64|0);
 $357 = +HEAPF32[$356>>2];
 $358 = $353 - $357;
 $359 = $fac2;
 $360 = $358 * $359;
 $361 = $0;
 $362 = ((($361)) + 24|0);
 $363 = ((($362)) + 64|0);
 $364 = +HEAPF32[$363>>2];
 $365 = $364 + $360;
 HEAPF32[$363>>2] = $365;
 $366 = $norm_dy;
 $367 = $0;
 $368 = ((($367)) + 24|0);
 $369 = ((($368)) + 68|0);
 $370 = +HEAPF32[$369>>2];
 $371 = $366 - $370;
 $372 = $fac2;
 $373 = $371 * $372;
 $374 = $0;
 $375 = ((($374)) + 24|0);
 $376 = ((($375)) + 68|0);
 $377 = +HEAPF32[$376>>2];
 $378 = $377 + $373;
 HEAPF32[$376>>2] = $378;
 $379 = $2;
 $380 = $base_radius;
 $381 = $379 / $380;
 $dx = $381;
 $382 = $3;
 $383 = $base_radius;
 $384 = $382 / $383;
 $dy = $384;
 $385 = $dx;
 $386 = $dy;
 $387 = (+_hypotf($385,$386));
 $step_in_dabtime = $387;
 $388 = $0;
 $389 = ((($388)) + 328|0);
 $390 = ((($389)) + 160|0);
 $391 = +HEAPF32[$390>>2];
 $392 = $391;
 $393 = $392 * 0.5;
 $394 = (+Math_exp((+$393)));
 $395 = $394 - 1.0;
 $396 = $395;
 $397 = $step_in_dabtime;
 $398 = (+_exp_decay($396,$397));
 $399 = $398;
 $400 = 1.0 - $399;
 $401 = $400;
 $fac3 = $401;
 $402 = $0;
 $403 = ((($402)) + 24|0);
 $404 = ((($403)) + 104|0);
 $405 = +HEAPF32[$404>>2];
 $dx_old = $405;
 $406 = $0;
 $407 = ((($406)) + 24|0);
 $408 = ((($407)) + 108|0);
 $409 = +HEAPF32[$408>>2];
 $dy_old = $409;
 $410 = $dx_old;
 $411 = $dx;
 $412 = $410 - $411;
 $413 = $dx_old;
 $414 = $dx;
 $415 = $413 - $414;
 $416 = $412 * $415;
 $417 = $dy_old;
 $418 = $dy;
 $419 = $417 - $418;
 $420 = $dy_old;
 $421 = $dy;
 $422 = $420 - $421;
 $423 = $419 * $422;
 $424 = $416 + $423;
 $425 = $dx_old;
 $426 = $dx;
 $427 = -$426;
 $428 = $425 - $427;
 $429 = $dx_old;
 $430 = $dx;
 $431 = -$430;
 $432 = $429 - $431;
 $433 = $428 * $432;
 $434 = $dy_old;
 $435 = $dy;
 $436 = -$435;
 $437 = $434 - $436;
 $438 = $dy_old;
 $439 = $dy;
 $440 = -$439;
 $441 = $438 - $440;
 $442 = $437 * $441;
 $443 = $433 + $442;
 $444 = $424 > $443;
 if ($444) {
  $445 = $dx;
  $446 = -$445;
  $dx = $446;
  $447 = $dy;
  $448 = -$447;
  $dy = $448;
 }
 $449 = $dx;
 $450 = $0;
 $451 = ((($450)) + 24|0);
 $452 = ((($451)) + 104|0);
 $453 = +HEAPF32[$452>>2];
 $454 = $449 - $453;
 $455 = $fac3;
 $456 = $454 * $455;
 $457 = $0;
 $458 = ((($457)) + 24|0);
 $459 = ((($458)) + 104|0);
 $460 = +HEAPF32[$459>>2];
 $461 = $460 + $456;
 HEAPF32[$459>>2] = $461;
 $462 = $dy;
 $463 = $0;
 $464 = ((($463)) + 24|0);
 $465 = ((($464)) + 108|0);
 $466 = +HEAPF32[$465>>2];
 $467 = $462 - $466;
 $468 = $fac3;
 $469 = $467 * $468;
 $470 = $0;
 $471 = ((($470)) + 24|0);
 $472 = ((($471)) + 108|0);
 $473 = +HEAPF32[$472>>2];
 $474 = $473 + $469;
 HEAPF32[$472>>2] = $474;
 $475 = $0;
 $476 = ((($475)) + 328|0);
 $477 = ((($476)) + 148|0);
 $478 = +HEAPF32[$477>>2];
 $479 = (+_exp_decay($478,0.10000000149011612));
 $480 = $479;
 $481 = 1.0 - $480;
 $482 = $481;
 $fac4 = $482;
 $483 = $0;
 $484 = ((($483)) + 328|0);
 $485 = ((($484)) + 144|0);
 $486 = +HEAPF32[$485>>2];
 $487 = $0;
 $488 = ((($487)) + 24|0);
 $489 = ((($488)) + 88|0);
 $490 = +HEAPF32[$489>>2];
 $491 = $486 - $490;
 $492 = $fac4;
 $493 = $491 * $492;
 $494 = $0;
 $495 = ((($494)) + 24|0);
 $496 = ((($495)) + 88|0);
 $497 = +HEAPF32[$496>>2];
 $498 = $497 + $493;
 HEAPF32[$496>>2] = $498;
 $499 = $0;
 $500 = ((($499)) + 328|0);
 $501 = ((($500)) + 136|0);
 $502 = +HEAPF32[$501>>2];
 $503 = -$502;
 $504 = (+Math_exp((+$503)));
 $frequency = $504;
 $505 = $norm_dist;
 $506 = $frequency;
 $507 = $505 * $506;
 $508 = $0;
 $509 = ((($508)) + 24|0);
 $510 = ((($509)) + 80|0);
 $511 = +HEAPF32[$510>>2];
 $512 = $511 + $507;
 HEAPF32[$510>>2] = $512;
 $513 = $0;
 $514 = ((($513)) + 24|0);
 $515 = ((($514)) + 80|0);
 $516 = +HEAPF32[$515>>2];
 $517 = $516 < 0.0;
 if ($517) {
  $518 = $0;
  $519 = ((($518)) + 24|0);
  $520 = ((($519)) + 80|0);
  HEAPF32[$520>>2] = 0.0;
 }
 $521 = $0;
 $522 = ((($521)) + 328|0);
 $523 = ((($522)) + 140|0);
 $524 = +HEAPF32[$523>>2];
 $525 = $524;
 $526 = 1.0 + $525;
 $527 = $526;
 $wrap = $527;
 $528 = $0;
 $529 = ((($528)) + 24|0);
 $530 = ((($529)) + 80|0);
 $531 = +HEAPF32[$530>>2];
 $532 = $wrap;
 $533 = $531 > $532;
 do {
  if ($533) {
   $534 = $wrap;
   $535 = $534;
   $536 = $535 > 10.9;
   $537 = $0;
   $538 = ((($537)) + 24|0);
   $539 = ((($538)) + 80|0);
   if ($536) {
    HEAPF32[$539>>2] = 1.0;
    break;
   }
   $540 = +HEAPF32[$539>>2];
   $541 = $wrap;
   $542 = (+_fmodf($540,$541));
   $543 = $0;
   $544 = ((($543)) + 24|0);
   $545 = ((($544)) + 80|0);
   HEAPF32[$545>>2] = $542;
   $546 = $0;
   $547 = ((($546)) + 24|0);
   $548 = ((($547)) + 80|0);
   $549 = +HEAPF32[$548>>2];
   $550 = $549 < 0.0;
   if ($550) {
    $551 = $0;
    $552 = ((($551)) + 24|0);
    $553 = ((($552)) + 80|0);
    HEAPF32[$553>>2] = 0.0;
   }
  }
 } while(0);
 $554 = $0;
 $555 = ((($554)) + 328|0);
 $556 = ((($555)) + 12|0);
 $557 = +HEAPF32[$556>>2];
 $radius_log = $557;
 $558 = $radius_log;
 $559 = (+Math_exp((+$558)));
 $560 = $0;
 $561 = ((($560)) + 24|0);
 $562 = ((($561)) + 16|0);
 HEAPF32[$562>>2] = $559;
 $563 = $0;
 $564 = ((($563)) + 24|0);
 $565 = ((($564)) + 16|0);
 $566 = +HEAPF32[$565>>2];
 $567 = $566;
 $568 = $567 < 0.20000000000000001;
 if ($568) {
  $569 = $0;
  $570 = ((($569)) + 24|0);
  $571 = ((($570)) + 16|0);
  HEAPF32[$571>>2] = 0.20000000298023224;
 }
 $572 = $0;
 $573 = ((($572)) + 24|0);
 $574 = ((($573)) + 16|0);
 $575 = +HEAPF32[$574>>2];
 $576 = $575 > 1000.0;
 if (!($576)) {
  $580 = $0;
  $581 = ((($580)) + 328|0);
  $582 = ((($581)) + 152|0);
  $583 = +HEAPF32[$582>>2];
  $584 = $0;
  $585 = ((($584)) + 24|0);
  $586 = ((($585)) + 96|0);
  HEAPF32[$586>>2] = $583;
  $587 = $0;
  $588 = ((($587)) + 328|0);
  $589 = ((($588)) + 156|0);
  $590 = +HEAPF32[$589>>2];
  $591 = $0;
  $592 = ((($591)) + 24|0);
  $593 = ((($592)) + 100|0);
  HEAPF32[$593>>2] = $590;
  STACKTOP = sp;return;
 }
 $577 = $0;
 $578 = ((($577)) + 24|0);
 $579 = ((($578)) + 16|0);
 HEAPF32[$579>>2] = 1000.0;
 $580 = $0;
 $581 = ((($580)) + 328|0);
 $582 = ((($581)) + 152|0);
 $583 = +HEAPF32[$582>>2];
 $584 = $0;
 $585 = ((($584)) + 24|0);
 $586 = ((($585)) + 96|0);
 HEAPF32[$586>>2] = $583;
 $587 = $0;
 $588 = ((($587)) + 328|0);
 $589 = ((($588)) + 156|0);
 $590 = +HEAPF32[$589>>2];
 $591 = $0;
 $592 = ((($591)) + 24|0);
 $593 = ((($592)) + 100|0);
 HEAPF32[$593>>2] = $590;
 STACKTOP = sp;return;
}
function _prepare_and_draw_dab($self,$surface) {
 $self = $self|0;
 $surface = $surface|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $100 = 0, $101 = 0, $102 = 0, $103 = 0.0, $104 = 0.0, $105 = 0.0, $106 = 0.0, $107 = 0.0, $108 = 0.0, $109 = 0.0, $11 = 0, $110 = 0.0, $111 = 0.0, $112 = 0.0, $113 = 0.0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0.0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0.0, $122 = 0.0, $123 = 0.0, $124 = 0.0, $125 = 0.0, $126 = 0.0, $127 = 0.0, $128 = 0.0, $129 = 0.0, $13 = 0, $130 = 0.0, $131 = 0.0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0.0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0.0, $140 = 0.0, $141 = 0.0, $142 = 0.0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0.0, $148 = 0.0, $149 = 0.0, $15 = 0.0, $150 = 0.0, $151 = 0.0;
 var $152 = 0.0, $153 = 0.0, $154 = 0, $155 = 0, $156 = 0, $157 = 0.0, $158 = 0.0, $159 = 0.0, $16 = 0.0, $160 = 0.0, $161 = 0.0, $162 = 0.0, $163 = 0.0, $164 = 0, $165 = 0, $166 = 0, $167 = 0.0, $168 = 0, $169 = 0, $17 = 0.0;
 var $170 = 0, $171 = 0.0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0.0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0.0, $181 = 0, $182 = 0, $183 = 0, $184 = 0.0, $185 = 0.0, $186 = 0.0, $187 = 0.0, $188 = 0.0;
 var $189 = 0.0, $19 = 0.0, $190 = 0.0, $191 = 0, $192 = 0.0, $193 = 0.0, $194 = 0, $195 = 0.0, $196 = 0.0, $197 = 0.0, $198 = 0.0, $199 = 0.0, $2 = 0, $20 = 0.0, $200 = 0, $201 = 0, $202 = 0, $203 = 0.0, $204 = 0.0, $205 = 0.0;
 var $206 = 0.0, $207 = 0.0, $208 = 0.0, $209 = 0.0, $21 = 0, $210 = 0.0, $211 = 0, $212 = 0.0, $213 = 0.0, $214 = 0.0, $215 = 0, $216 = 0, $217 = 0, $218 = 0.0, $219 = 0.0, $22 = 0.0, $220 = 0, $221 = 0, $222 = 0, $223 = 0;
 var $224 = 0.0, $225 = 0.0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0.0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0.0, $237 = 0.0, $238 = 0.0, $239 = 0, $24 = 0.0, $240 = 0.0, $241 = 0.0;
 var $242 = 0.0, $243 = 0, $244 = 0.0, $245 = 0.0, $246 = 0.0, $247 = 0, $248 = 0.0, $249 = 0, $25 = 0.0, $250 = 0, $251 = 0, $252 = 0.0, $253 = 0.0, $254 = 0, $255 = 0, $256 = 0, $257 = 0.0, $258 = 0.0, $259 = 0.0, $26 = 0.0;
 var $260 = 0.0, $261 = 0.0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0.0, $267 = 0.0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0.0, $273 = 0, $274 = 0, $275 = 0, $276 = 0.0, $277 = 0.0, $278 = 0.0;
 var $279 = 0.0, $28 = 0, $280 = 0, $281 = 0.0, $282 = 0.0, $283 = 0, $284 = 0.0, $285 = 0.0, $286 = 0.0, $287 = 0.0, $288 = 0.0, $289 = 0, $29 = 0, $290 = 0, $291 = 0.0, $292 = 0, $293 = 0.0, $294 = 0.0, $295 = 0.0, $296 = 0;
 var $297 = 0, $298 = 0, $299 = 0.0, $3 = 0, $30 = 0.0, $300 = 0, $301 = 0, $302 = 0, $303 = 0.0, $304 = 0, $305 = 0, $306 = 0, $307 = 0.0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0.0, $313 = 0;
 var $314 = 0, $315 = 0, $316 = 0.0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0.0, $321 = 0, $322 = 0, $323 = 0, $324 = 0.0, $325 = 0.0, $326 = 0, $327 = 0, $328 = 0, $329 = 0.0, $33 = 0, $330 = 0.0, $331 = 0.0;
 var $332 = 0.0, $333 = 0.0, $334 = 0.0, $335 = 0.0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0.0, $343 = 0.0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0.0, $349 = 0.0, $35 = 0;
 var $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0.0, $355 = 0.0, $356 = 0.0, $357 = 0.0, $358 = 0, $359 = 0, $36 = 0.0, $360 = 0, $361 = 0.0, $362 = 0, $363 = 0, $364 = 0, $365 = 0.0, $366 = 0.0, $367 = 0.0, $368 = 0.0;
 var $369 = 0.0, $37 = 0, $370 = 0.0, $371 = 0.0, $372 = 0.0, $373 = 0.0, $374 = 0, $375 = 0, $376 = 0, $377 = 0.0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0.0, $382 = 0.0, $383 = 0.0, $384 = 0.0, $385 = 0.0, $386 = 0.0;
 var $387 = 0.0, $388 = 0.0, $389 = 0.0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0.0, $394 = 0, $395 = 0, $396 = 0, $397 = 0.0, $398 = 0.0, $399 = 0.0, $4 = 0.0, $40 = 0, $400 = 0.0, $401 = 0.0, $402 = 0.0, $403 = 0.0;
 var $404 = 0.0, $405 = 0.0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0.0, $410 = 0, $411 = 0, $412 = 0, $413 = 0.0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0.0, $419 = 0, $42 = 0.0, $420 = 0, $421 = 0;
 var $422 = 0, $423 = 0.0, $424 = 0, $425 = 0, $426 = 0, $427 = 0.0, $428 = 0.0, $429 = 0, $43 = 0.0, $430 = 0, $431 = 0, $432 = 0, $433 = 0.0, $434 = 0.0, $435 = 0.0, $436 = 0, $437 = 0.0, $438 = 0.0, $439 = 0.0, $44 = 0.0;
 var $440 = 0.0, $441 = 0.0, $442 = 0, $443 = 0, $444 = 0, $445 = 0.0, $446 = 0.0, $447 = 0.0, $448 = 0.0, $449 = 0.0, $45 = 0.0, $450 = 0.0, $451 = 0.0, $452 = 0, $453 = 0.0, $454 = 0.0, $455 = 0, $456 = 0.0, $457 = 0.0, $458 = 0.0;
 var $459 = 0.0, $46 = 0.0, $460 = 0.0, $461 = 0.0, $462 = 0, $463 = 0.0, $464 = 0, $465 = 0, $466 = 0, $467 = 0.0, $468 = 0.0, $469 = 0.0, $47 = 0.0, $470 = 0.0, $471 = 0.0, $472 = 0.0, $473 = 0.0, $474 = 0.0, $475 = 0.0, $476 = 0.0;
 var $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0.0, $481 = 0.0, $482 = 0.0, $483 = 0.0, $484 = 0.0, $485 = 0.0, $486 = 0.0, $487 = 0.0, $488 = 0.0, $489 = 0.0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0.0, $494 = 0.0;
 var $495 = 0.0, $496 = 0.0, $497 = 0.0, $498 = 0.0, $499 = 0.0, $5 = 0, $50 = 0, $500 = 0.0, $501 = 0.0, $502 = 0, $503 = 0, $504 = 0, $505 = 0.0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0.0, $511 = 0.0;
 var $512 = 0.0, $513 = 0.0, $514 = 0.0, $515 = 0.0, $516 = 0.0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0.0, $521 = 0.0, $522 = 0.0, $523 = 0, $524 = 0, $525 = 0, $526 = 0.0, $527 = 0.0, $528 = 0.0, $529 = 0, $53 = 0.0;
 var $530 = 0, $531 = 0, $532 = 0.0, $533 = 0.0, $534 = 0.0, $535 = 0, $536 = 0, $537 = 0, $538 = 0.0, $539 = 0, $54 = 0.0, $540 = 0, $541 = 0, $542 = 0, $543 = 0.0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0.0;
 var $549 = 0.0, $55 = 0.0, $550 = 0.0, $551 = 0, $552 = 0, $553 = 0, $554 = 0.0, $555 = 0.0, $556 = 0.0, $557 = 0, $558 = 0, $559 = 0, $56 = 0.0, $560 = 0.0, $561 = 0.0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0.0;
 var $567 = 0.0, $568 = 0, $569 = 0, $57 = 0.0, $570 = 0, $571 = 0, $572 = 0.0, $573 = 0.0, $574 = 0.0, $575 = 0.0, $576 = 0.0, $577 = 0.0, $578 = 0.0, $579 = 0.0, $58 = 0.0, $580 = 0.0, $581 = 0.0, $582 = 0.0, $583 = 0, $584 = 0;
 var $585 = 0, $586 = 0.0, $587 = 0.0, $588 = 0.0, $589 = 0, $59 = 0.0, $590 = 0.0, $591 = 0.0, $592 = 0.0, $593 = 0.0, $594 = 0.0, $595 = 0.0, $596 = 0.0, $597 = 0.0, $598 = 0.0, $599 = 0.0, $6 = 0, $60 = 0.0, $600 = 0.0, $601 = 0.0;
 var $602 = 0.0, $603 = 0.0, $604 = 0.0, $605 = 0.0, $606 = 0.0, $607 = 0.0, $608 = 0.0, $609 = 0.0, $61 = 0.0, $610 = 0.0, $611 = 0.0, $612 = 0.0, $613 = 0.0, $614 = 0.0, $615 = 0.0, $616 = 0.0, $617 = 0.0, $618 = 0.0, $619 = 0.0, $62 = 0.0;
 var $620 = 0.0, $621 = 0.0, $622 = 0.0, $623 = 0.0, $624 = 0, $625 = 0, $626 = 0, $627 = 0.0, $628 = 0.0, $629 = 0.0, $63 = 0.0, $630 = 0, $631 = 0.0, $632 = 0.0, $633 = 0.0, $634 = 0.0, $635 = 0.0, $636 = 0.0, $637 = 0.0, $638 = 0.0;
 var $639 = 0.0, $64 = 0.0, $640 = 0.0, $641 = 0.0, $642 = 0.0, $643 = 0.0, $644 = 0.0, $645 = 0.0, $646 = 0.0, $647 = 0.0, $648 = 0.0, $649 = 0.0, $65 = 0.0, $650 = 0.0, $651 = 0.0, $652 = 0.0, $653 = 0.0, $654 = 0.0, $655 = 0.0, $656 = 0.0;
 var $657 = 0.0, $658 = 0.0, $659 = 0.0, $66 = 0.0, $660 = 0.0, $661 = 0.0, $662 = 0.0, $663 = 0.0, $664 = 0.0, $665 = 0, $666 = 0.0, $667 = 0.0, $668 = 0, $669 = 0.0, $67 = 0.0, $670 = 0.0, $671 = 0.0, $672 = 0.0, $673 = 0.0, $674 = 0.0;
 var $675 = 0.0, $676 = 0.0, $677 = 0.0, $678 = 0.0, $679 = 0.0, $68 = 0.0, $680 = 0, $681 = 0.0, $682 = 0.0, $683 = 0.0, $684 = 0.0, $685 = 0.0, $686 = 0.0, $687 = 0.0, $688 = 0.0, $689 = 0.0, $69 = 0.0, $690 = 0, $691 = 0, $692 = 0;
 var $693 = 0.0, $694 = 0, $695 = 0, $696 = 0, $697 = 0.0, $698 = 0, $699 = 0, $7 = 0, $70 = 0.0, $700 = 0, $701 = 0.0, $702 = 0, $703 = 0, $704 = 0, $705 = 0.0, $706 = 0, $71 = 0.0, $72 = 0.0, $73 = 0.0, $74 = 0.0;
 var $75 = 0.0, $76 = 0.0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0.0, $81 = 0, $82 = 0, $83 = 0, $84 = 0.0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0.0, $9 = 0, $90 = 0.0, $91 = 0, $92 = 0;
 var $93 = 0, $94 = 0.0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0.0, $a = 0, $alpha = 0.0, $alpha_correction = 0.0, $alpha_dab = 0.0, $amp = 0.0, $b = 0, $base_radius = 0.0, $beta = 0.0, $beta_dab = 0.0, $color_h = 0, $color_s = 0, $color_v = 0, $current_fadeout_in_pixels = 0.0;
 var $current_optical_radius = 0.0, $dabs_per_pixel = 0.0, $eraser_target_alpha = 0.0, $fac = 0.0, $fac1 = 0.0, $g = 0, $hardness = 0.0, $hardness_new = 0.0, $min_fadeout_in_pixels = 0.0, $opaque = 0.0, $px = 0, $py = 0, $r = 0, $radius = 0.0, $radius_log = 0.0, $radius_new = 0.0, $smudge_radius = 0.0, $snapToPixel = 0.0, $snapped_radius = 0.0, $snapped_x = 0.0;
 var $snapped_y = 0.0, $x = 0.0, $y = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 160|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $r = sp + 76|0;
 $g = sp + 72|0;
 $b = sp + 68|0;
 $a = sp + 64|0;
 $color_h = sp + 56|0;
 $color_s = sp + 52|0;
 $color_v = sp + 48|0;
 $0 = $self;
 $1 = $surface;
 $2 = $0;
 $3 = ((($2)) + 328|0);
 $4 = +HEAPF32[$3>>2];
 $5 = $4 < 0.0;
 if ($5) {
  $6 = $0;
  $7 = ((($6)) + 328|0);
  HEAPF32[$7>>2] = 0.0;
 }
 $8 = $0;
 $9 = ((($8)) + 328|0);
 $10 = +HEAPF32[$9>>2];
 $11 = $0;
 $12 = ((($11)) + 328|0);
 $13 = ((($12)) + 4|0);
 $14 = +HEAPF32[$13>>2];
 $15 = $10 * $14;
 $opaque = $15;
 $16 = $opaque;
 $17 = $16;
 $18 = $17 > 1.0;
 if ($18) {
  $26 = 1.0;
 } else {
  $19 = $opaque;
  $20 = $19;
  $21 = $20 < 0.0;
  $22 = $opaque;
  $23 = $22;
  $24 = $21 ? 0.0 : $23;
  $26 = $24;
 }
 $25 = $26;
 $opaque = $25;
 $27 = $0;
 $28 = ((($27)) + 328|0);
 $29 = ((($28)) + 8|0);
 $30 = +HEAPF32[$29>>2];
 $31 = $30 != 0.0;
 if ($31) {
  $32 = $0;
  $33 = ((($32)) + 148|0);
  $34 = ((($33)) + 28|0);
  $35 = HEAP32[$34>>2]|0;
  $36 = (+_mapping_get_base_value($35));
  $37 = $0;
  $38 = ((($37)) + 148|0);
  $39 = ((($38)) + 24|0);
  $40 = HEAP32[$39>>2]|0;
  $41 = (+_mapping_get_base_value($40));
  $42 = $36 + $41;
  $43 = $42;
  $44 = $43 * 2.0;
  $45 = $44;
  $dabs_per_pixel = $45;
  $46 = $dabs_per_pixel;
  $47 = $46;
  $48 = $47 < 1.0;
  if ($48) {
   $dabs_per_pixel = 1.0;
  }
  $49 = $0;
  $50 = ((($49)) + 148|0);
  $51 = ((($50)) + 8|0);
  $52 = HEAP32[$51>>2]|0;
  $53 = (+_mapping_get_base_value($52));
  $54 = $53;
  $55 = $dabs_per_pixel;
  $56 = $55;
  $57 = $56 - 1.0;
  $58 = $54 * $57;
  $59 = 1.0 + $58;
  $60 = $59;
  $dabs_per_pixel = $60;
  $61 = $opaque;
  $alpha = $61;
  $62 = $alpha;
  $63 = $62;
  $64 = 1.0 - $63;
  $65 = $64;
  $beta = $65;
  $66 = $beta;
  $67 = $dabs_per_pixel;
  $68 = $67;
  $69 = 1.0 / $68;
  $70 = $69;
  $71 = (+Math_pow((+$66),(+$70)));
  $beta_dab = $71;
  $72 = $beta_dab;
  $73 = $72;
  $74 = 1.0 - $73;
  $75 = $74;
  $alpha_dab = $75;
  $76 = $alpha_dab;
  $opaque = $76;
 }
 $77 = $0;
 $78 = ((($77)) + 24|0);
 $79 = ((($78)) + 56|0);
 $80 = +HEAPF32[$79>>2];
 $x = $80;
 $81 = $0;
 $82 = ((($81)) + 24|0);
 $83 = ((($82)) + 60|0);
 $84 = +HEAPF32[$83>>2];
 $y = $84;
 $85 = $0;
 $86 = ((($85)) + 148|0);
 $87 = ((($86)) + 12|0);
 $88 = HEAP32[$87>>2]|0;
 $89 = (+_mapping_get_base_value($88));
 $90 = (+Math_exp((+$89)));
 $base_radius = $90;
 $91 = $0;
 $92 = ((($91)) + 328|0);
 $93 = ((($92)) + 60|0);
 $94 = +HEAPF32[$93>>2];
 $95 = $94 != 0.0;
 if ($95) {
  $96 = $0;
  $97 = ((($96)) + 24|0);
  $98 = ((($97)) + 64|0);
  $99 = +HEAPF32[$98>>2];
  $100 = $0;
  $101 = ((($100)) + 328|0);
  $102 = ((($101)) + 60|0);
  $103 = +HEAPF32[$102>>2];
  $104 = $99 * $103;
  $105 = $104;
  $106 = $105 * 0.10000000000000001;
  $107 = $base_radius;
  $108 = $107;
  $109 = $106 * $108;
  $110 = $x;
  $111 = $110;
  $112 = $111 + $109;
  $113 = $112;
  $x = $113;
  $114 = $0;
  $115 = ((($114)) + 24|0);
  $116 = ((($115)) + 68|0);
  $117 = +HEAPF32[$116>>2];
  $118 = $0;
  $119 = ((($118)) + 328|0);
  $120 = ((($119)) + 60|0);
  $121 = +HEAPF32[$120>>2];
  $122 = $117 * $121;
  $123 = $122;
  $124 = $123 * 0.10000000000000001;
  $125 = $base_radius;
  $126 = $125;
  $127 = $124 * $126;
  $128 = $y;
  $129 = $128;
  $130 = $129 + $127;
  $131 = $130;
  $y = $131;
 }
 $132 = $0;
 $133 = ((($132)) + 328|0);
 $134 = ((($133)) + 56|0);
 $135 = +HEAPF32[$134>>2];
 $136 = $135 != 0.0;
 if ($136) {
  $137 = $0;
  $138 = ((($137)) + 328|0);
  $139 = ((($138)) + 56|0);
  $140 = +HEAPF32[$139>>2];
  $amp = $140;
  $141 = $amp;
  $142 = $141;
  $143 = $142 < 0.0;
  if ($143) {
   $amp = 0.0;
  }
  $144 = $0;
  $145 = ((($144)) + 144|0);
  $146 = HEAP32[$145>>2]|0;
  $147 = (+_rand_gauss($146));
  $148 = $amp;
  $149 = $147 * $148;
  $150 = $base_radius;
  $151 = $149 * $150;
  $152 = $x;
  $153 = $152 + $151;
  $x = $153;
  $154 = $0;
  $155 = ((($154)) + 144|0);
  $156 = HEAP32[$155>>2]|0;
  $157 = (+_rand_gauss($156));
  $158 = $amp;
  $159 = $157 * $158;
  $160 = $base_radius;
  $161 = $159 * $160;
  $162 = $y;
  $163 = $162 + $161;
  $y = $163;
 }
 $164 = $0;
 $165 = ((($164)) + 24|0);
 $166 = ((($165)) + 16|0);
 $167 = +HEAPF32[$166>>2];
 $radius = $167;
 $168 = $0;
 $169 = ((($168)) + 328|0);
 $170 = ((($169)) + 36|0);
 $171 = +HEAPF32[$170>>2];
 $172 = $171 != 0.0;
 if ($172) {
  $173 = $0;
  $174 = ((($173)) + 328|0);
  $175 = ((($174)) + 12|0);
  $176 = +HEAPF32[$175>>2];
  $radius_log = $176;
  $177 = $0;
  $178 = ((($177)) + 144|0);
  $179 = HEAP32[$178>>2]|0;
  $180 = (+_rand_gauss($179));
  $181 = $0;
  $182 = ((($181)) + 328|0);
  $183 = ((($182)) + 36|0);
  $184 = +HEAPF32[$183>>2];
  $185 = $180 * $184;
  $186 = $radius_log;
  $187 = $186 + $185;
  $radius_log = $187;
  $188 = $radius_log;
  $189 = (+Math_exp((+$188)));
  $radius = $189;
  $190 = $radius;
  $191 = $190 > 1000.0;
  if ($191) {
   $199 = 1000.0;
  } else {
   $192 = $radius;
   $193 = $192;
   $194 = $193 < 0.20000000000000001;
   $195 = $radius;
   $196 = $195;
   $197 = $194 ? 0.20000000000000001 : $196;
   $199 = $197;
  }
  $198 = $199;
  $radius = $198;
  $200 = $0;
  $201 = ((($200)) + 24|0);
  $202 = ((($201)) + 16|0);
  $203 = +HEAPF32[$202>>2];
  $204 = $radius;
  $205 = $203 / $204;
  $alpha_correction = $205;
  $206 = $alpha_correction;
  $207 = $alpha_correction;
  $208 = $206 * $207;
  $alpha_correction = $208;
  $209 = $alpha_correction;
  $210 = $209;
  $211 = $210 <= 1.0;
  if ($211) {
   $212 = $alpha_correction;
   $213 = $opaque;
   $214 = $213 * $212;
   $opaque = $214;
  }
 }
 $215 = $0;
 $216 = ((($215)) + 328|0);
 $217 = ((($216)) + 120|0);
 $218 = +HEAPF32[$217>>2];
 $219 = $218;
 $220 = $219 < 1.0;
 do {
  if ($220) {
   $221 = $0;
   $222 = ((($221)) + 328|0);
   $223 = ((($222)) + 116|0);
   $224 = +HEAPF32[$223>>2];
   $225 = $224;
   $226 = $225 != 0.0;
   if (!($226)) {
    $227 = $0;
    $228 = ((($227)) + 148|0);
    $229 = ((($228)) + 116|0);
    $230 = HEAP32[$229>>2]|0;
    $231 = (_mapping_is_constant($230)|0);
    $232 = ($231|0)!=(0);
    if ($232) {
     break;
    }
   }
   $233 = $0;
   $234 = ((($233)) + 328|0);
   $235 = ((($234)) + 120|0);
   $236 = +HEAPF32[$235>>2];
   $fac = $236;
   $237 = $fac;
   $238 = $237;
   $239 = $238 < 0.01;
   if ($239) {
    $fac = 0.0099999997764825821;
   }
   $240 = $x;
   $241 = $240;
   $242 = $241 + 0.5;
   $243 = (~~(($242)));
   $px = $243;
   $244 = $y;
   $245 = $244;
   $246 = $245 + 0.5;
   $247 = (~~(($246)));
   $py = $247;
   $248 = $fac;
   $249 = $0;
   $250 = ((($249)) + 24|0);
   $251 = ((($250)) + 52|0);
   $252 = +HEAPF32[$251>>2];
   $253 = $252 * $248;
   HEAPF32[$251>>2] = $253;
   $254 = $0;
   $255 = ((($254)) + 24|0);
   $256 = ((($255)) + 52|0);
   $257 = +HEAPF32[$256>>2];
   $258 = $257;
   $259 = $fac;
   $260 = $259;
   $261 = 0.5 * $260;
   $262 = $258 < $261;
   $263 = $0;
   $264 = ((($263)) + 24|0);
   if ($262) {
    $265 = ((($264)) + 52|0);
    $266 = +HEAPF32[$265>>2];
    $267 = $266;
    $268 = $267 == 0.0;
    if ($268) {
     $fac = 0.0;
    }
    $269 = $0;
    $270 = ((($269)) + 24|0);
    $271 = ((($270)) + 52|0);
    HEAPF32[$271>>2] = 1.0;
    $272 = $radius;
    $273 = $0;
    $274 = ((($273)) + 328|0);
    $275 = ((($274)) + 124|0);
    $276 = +HEAPF32[$275>>2];
    $277 = (+Math_exp((+$276)));
    $278 = $272 * $277;
    $smudge_radius = $278;
    $279 = $smudge_radius;
    $280 = $279 > 1000.0;
    if ($280) {
     $288 = 1000.0;
    } else {
     $281 = $smudge_radius;
     $282 = $281;
     $283 = $282 < 0.20000000000000001;
     $284 = $smudge_radius;
     $285 = $284;
     $286 = $283 ? 0.20000000000000001 : $285;
     $288 = $286;
    }
    $287 = $288;
    $smudge_radius = $287;
    $289 = $1;
    $290 = $px;
    $291 = (+($290|0));
    $292 = $py;
    $293 = (+($292|0));
    $294 = $smudge_radius;
    _mypaint_surface_get_color($289,$291,$293,$294,$r,$g,$b,$a);
    $295 = +HEAPF32[$r>>2];
    $296 = $0;
    $297 = ((($296)) + 24|0);
    $298 = ((($297)) + 36|0);
    HEAPF32[$298>>2] = $295;
    $299 = +HEAPF32[$g>>2];
    $300 = $0;
    $301 = ((($300)) + 24|0);
    $302 = ((($301)) + 40|0);
    HEAPF32[$302>>2] = $299;
    $303 = +HEAPF32[$b>>2];
    $304 = $0;
    $305 = ((($304)) + 24|0);
    $306 = ((($305)) + 44|0);
    HEAPF32[$306>>2] = $303;
    $307 = +HEAPF32[$a>>2];
    $308 = $0;
    $309 = ((($308)) + 24|0);
    $310 = ((($309)) + 48|0);
    HEAPF32[$310>>2] = $307;
   } else {
    $311 = ((($264)) + 36|0);
    $312 = +HEAPF32[$311>>2];
    HEAPF32[$r>>2] = $312;
    $313 = $0;
    $314 = ((($313)) + 24|0);
    $315 = ((($314)) + 40|0);
    $316 = +HEAPF32[$315>>2];
    HEAPF32[$g>>2] = $316;
    $317 = $0;
    $318 = ((($317)) + 24|0);
    $319 = ((($318)) + 44|0);
    $320 = +HEAPF32[$319>>2];
    HEAPF32[$b>>2] = $320;
    $321 = $0;
    $322 = ((($321)) + 24|0);
    $323 = ((($322)) + 48|0);
    $324 = +HEAPF32[$323>>2];
    HEAPF32[$a>>2] = $324;
   }
   $325 = $fac;
   $326 = $0;
   $327 = ((($326)) + 24|0);
   $328 = ((($327)) + 32|0);
   $329 = +HEAPF32[$328>>2];
   $330 = $325 * $329;
   $331 = $fac;
   $332 = 1.0 - $331;
   $333 = +HEAPF32[$a>>2];
   $334 = $332 * $333;
   $335 = $330 + $334;
   $336 = $0;
   $337 = ((($336)) + 24|0);
   $338 = ((($337)) + 32|0);
   HEAPF32[$338>>2] = $335;
   $339 = $0;
   $340 = ((($339)) + 24|0);
   $341 = ((($340)) + 32|0);
   $342 = +HEAPF32[$341>>2];
   $343 = $342;
   $344 = $343 > 1.0;
   if ($344) {
    $357 = 1.0;
   } else {
    $345 = $0;
    $346 = ((($345)) + 24|0);
    $347 = ((($346)) + 32|0);
    $348 = +HEAPF32[$347>>2];
    $349 = $348;
    $350 = $349 < 0.0;
    if ($350) {
     $357 = 0.0;
    } else {
     $351 = $0;
     $352 = ((($351)) + 24|0);
     $353 = ((($352)) + 32|0);
     $354 = +HEAPF32[$353>>2];
     $355 = $354;
     $357 = $355;
    }
   }
   $356 = $357;
   $358 = $0;
   $359 = ((($358)) + 24|0);
   $360 = ((($359)) + 32|0);
   HEAPF32[$360>>2] = $356;
   $361 = $fac;
   $362 = $0;
   $363 = ((($362)) + 24|0);
   $364 = ((($363)) + 20|0);
   $365 = +HEAPF32[$364>>2];
   $366 = $361 * $365;
   $367 = $fac;
   $368 = 1.0 - $367;
   $369 = +HEAPF32[$r>>2];
   $370 = $368 * $369;
   $371 = +HEAPF32[$a>>2];
   $372 = $370 * $371;
   $373 = $366 + $372;
   $374 = $0;
   $375 = ((($374)) + 24|0);
   $376 = ((($375)) + 20|0);
   HEAPF32[$376>>2] = $373;
   $377 = $fac;
   $378 = $0;
   $379 = ((($378)) + 24|0);
   $380 = ((($379)) + 24|0);
   $381 = +HEAPF32[$380>>2];
   $382 = $377 * $381;
   $383 = $fac;
   $384 = 1.0 - $383;
   $385 = +HEAPF32[$g>>2];
   $386 = $384 * $385;
   $387 = +HEAPF32[$a>>2];
   $388 = $386 * $387;
   $389 = $382 + $388;
   $390 = $0;
   $391 = ((($390)) + 24|0);
   $392 = ((($391)) + 24|0);
   HEAPF32[$392>>2] = $389;
   $393 = $fac;
   $394 = $0;
   $395 = ((($394)) + 24|0);
   $396 = ((($395)) + 28|0);
   $397 = +HEAPF32[$396>>2];
   $398 = $393 * $397;
   $399 = $fac;
   $400 = 1.0 - $399;
   $401 = +HEAPF32[$b>>2];
   $402 = $400 * $401;
   $403 = +HEAPF32[$a>>2];
   $404 = $402 * $403;
   $405 = $398 + $404;
   $406 = $0;
   $407 = ((($406)) + 24|0);
   $408 = ((($407)) + 28|0);
   HEAPF32[$408>>2] = $405;
  }
 } while(0);
 $409 = $0;
 $410 = ((($409)) + 148|0);
 $411 = ((($410)) + 80|0);
 $412 = HEAP32[$411>>2]|0;
 $413 = (+_mapping_get_base_value($412));
 HEAPF32[$color_h>>2] = $413;
 $414 = $0;
 $415 = ((($414)) + 148|0);
 $416 = ((($415)) + 84|0);
 $417 = HEAP32[$416>>2]|0;
 $418 = (+_mapping_get_base_value($417));
 HEAPF32[$color_s>>2] = $418;
 $419 = $0;
 $420 = ((($419)) + 148|0);
 $421 = ((($420)) + 88|0);
 $422 = HEAP32[$421>>2]|0;
 $423 = (+_mapping_get_base_value($422));
 HEAPF32[$color_v>>2] = $423;
 $eraser_target_alpha = 1.0;
 $424 = $0;
 $425 = ((($424)) + 328|0);
 $426 = ((($425)) + 116|0);
 $427 = +HEAPF32[$426>>2];
 $428 = $427;
 $429 = $428 > 0.0;
 if ($429) {
  _hsv_to_rgb_float($color_h,$color_s,$color_v);
  $430 = $0;
  $431 = ((($430)) + 328|0);
  $432 = ((($431)) + 116|0);
  $433 = +HEAPF32[$432>>2];
  $fac1 = $433;
  $434 = $fac1;
  $435 = $434;
  $436 = $435 > 1.0;
  if ($436) {
   $fac1 = 1.0;
  }
  $437 = $fac1;
  $438 = 1.0 - $437;
  $439 = $438;
  $440 = $439 * 1.0;
  $441 = $fac1;
  $442 = $0;
  $443 = ((($442)) + 24|0);
  $444 = ((($443)) + 32|0);
  $445 = +HEAPF32[$444>>2];
  $446 = $441 * $445;
  $447 = $446;
  $448 = $440 + $447;
  $449 = $448;
  $eraser_target_alpha = $449;
  $450 = $eraser_target_alpha;
  $451 = $450;
  $452 = $451 > 1.0;
  if ($452) {
   $460 = 1.0;
  } else {
   $453 = $eraser_target_alpha;
   $454 = $453;
   $455 = $454 < 0.0;
   $456 = $eraser_target_alpha;
   $457 = $456;
   $458 = $455 ? 0.0 : $457;
   $460 = $458;
  }
  $459 = $460;
  $eraser_target_alpha = $459;
  $461 = $eraser_target_alpha;
  $462 = $461 > 0.0;
  if ($462) {
   $463 = $fac1;
   $464 = $0;
   $465 = ((($464)) + 24|0);
   $466 = ((($465)) + 20|0);
   $467 = +HEAPF32[$466>>2];
   $468 = $463 * $467;
   $469 = $fac1;
   $470 = 1.0 - $469;
   $471 = +HEAPF32[$color_h>>2];
   $472 = $470 * $471;
   $473 = $468 + $472;
   $474 = $eraser_target_alpha;
   $475 = $473 / $474;
   HEAPF32[$color_h>>2] = $475;
   $476 = $fac1;
   $477 = $0;
   $478 = ((($477)) + 24|0);
   $479 = ((($478)) + 24|0);
   $480 = +HEAPF32[$479>>2];
   $481 = $476 * $480;
   $482 = $fac1;
   $483 = 1.0 - $482;
   $484 = +HEAPF32[$color_s>>2];
   $485 = $483 * $484;
   $486 = $481 + $485;
   $487 = $eraser_target_alpha;
   $488 = $486 / $487;
   HEAPF32[$color_s>>2] = $488;
   $489 = $fac1;
   $490 = $0;
   $491 = ((($490)) + 24|0);
   $492 = ((($491)) + 28|0);
   $493 = +HEAPF32[$492>>2];
   $494 = $489 * $493;
   $495 = $fac1;
   $496 = 1.0 - $495;
   $497 = +HEAPF32[$color_v>>2];
   $498 = $496 * $497;
   $499 = $494 + $498;
   $500 = $eraser_target_alpha;
   $501 = $499 / $500;
   HEAPF32[$color_v>>2] = $501;
  } else {
   HEAPF32[$color_h>>2] = 1.0;
   HEAPF32[$color_s>>2] = 0.0;
   HEAPF32[$color_v>>2] = 0.0;
  }
  _rgb_to_hsv_float($color_h,$color_s,$color_v);
 }
 $502 = $0;
 $503 = ((($502)) + 328|0);
 $504 = ((($503)) + 128|0);
 $505 = +HEAPF32[$504>>2];
 $506 = $505 != 0.0;
 if ($506) {
  $507 = $0;
  $508 = ((($507)) + 328|0);
  $509 = ((($508)) + 128|0);
  $510 = +HEAPF32[$509>>2];
  $511 = $510;
  $512 = 1.0 - $511;
  $513 = $eraser_target_alpha;
  $514 = $513;
  $515 = $514 * $512;
  $516 = $515;
  $eraser_target_alpha = $516;
 }
 $517 = $0;
 $518 = ((($517)) + 328|0);
 $519 = ((($518)) + 96|0);
 $520 = +HEAPF32[$519>>2];
 $521 = +HEAPF32[$color_h>>2];
 $522 = $521 + $520;
 HEAPF32[$color_h>>2] = $522;
 $523 = $0;
 $524 = ((($523)) + 328|0);
 $525 = ((($524)) + 112|0);
 $526 = +HEAPF32[$525>>2];
 $527 = +HEAPF32[$color_s>>2];
 $528 = $527 + $526;
 HEAPF32[$color_s>>2] = $528;
 $529 = $0;
 $530 = ((($529)) + 328|0);
 $531 = ((($530)) + 108|0);
 $532 = +HEAPF32[$531>>2];
 $533 = +HEAPF32[$color_v>>2];
 $534 = $533 + $532;
 HEAPF32[$color_v>>2] = $534;
 $535 = $0;
 $536 = ((($535)) + 328|0);
 $537 = ((($536)) + 100|0);
 $538 = +HEAPF32[$537>>2];
 $539 = $538 != 0.0;
 if ($539) {
  label = 49;
 } else {
  $540 = $0;
  $541 = ((($540)) + 328|0);
  $542 = ((($541)) + 104|0);
  $543 = +HEAPF32[$542>>2];
  $544 = $543 != 0.0;
  if ($544) {
   label = 49;
  }
 }
 if ((label|0) == 49) {
  _hsv_to_rgb_float($color_h,$color_s,$color_v);
  _rgb_to_hsl_float($color_h,$color_s,$color_v);
  $545 = $0;
  $546 = ((($545)) + 328|0);
  $547 = ((($546)) + 100|0);
  $548 = +HEAPF32[$547>>2];
  $549 = +HEAPF32[$color_v>>2];
  $550 = $549 + $548;
  HEAPF32[$color_v>>2] = $550;
  $551 = $0;
  $552 = ((($551)) + 328|0);
  $553 = ((($552)) + 104|0);
  $554 = +HEAPF32[$553>>2];
  $555 = +HEAPF32[$color_s>>2];
  $556 = $555 + $554;
  HEAPF32[$color_s>>2] = $556;
  _hsl_to_rgb_float($color_h,$color_s,$color_v);
  _rgb_to_hsv_float($color_h,$color_s,$color_v);
 }
 $557 = $0;
 $558 = ((($557)) + 328|0);
 $559 = ((($558)) + 16|0);
 $560 = +HEAPF32[$559>>2];
 $561 = $560;
 $562 = $561 > 1.0;
 if ($562) {
  $575 = 1.0;
 } else {
  $563 = $0;
  $564 = ((($563)) + 328|0);
  $565 = ((($564)) + 16|0);
  $566 = +HEAPF32[$565>>2];
  $567 = $566;
  $568 = $567 < 0.0;
  if ($568) {
   $575 = 0.0;
  } else {
   $569 = $0;
   $570 = ((($569)) + 328|0);
   $571 = ((($570)) + 16|0);
   $572 = +HEAPF32[$571>>2];
   $573 = $572;
   $575 = $573;
  }
 }
 $574 = $575;
 $hardness = $574;
 $576 = $radius;
 $577 = $576;
 $578 = $hardness;
 $579 = $578;
 $580 = 1.0 - $579;
 $581 = $577 * $580;
 $582 = $581;
 $current_fadeout_in_pixels = $582;
 $583 = $0;
 $584 = ((($583)) + 328|0);
 $585 = ((($584)) + 20|0);
 $586 = +HEAPF32[$585>>2];
 $min_fadeout_in_pixels = $586;
 $587 = $current_fadeout_in_pixels;
 $588 = $min_fadeout_in_pixels;
 $589 = $587 < $588;
 if ($589) {
  $590 = $radius;
  $591 = $590;
  $592 = $hardness;
  $593 = $592;
  $594 = 1.0 - $593;
  $595 = $radius;
  $596 = $595;
  $597 = $594 * $596;
  $598 = $597 / 2.0;
  $599 = $591 - $598;
  $600 = $599;
  $current_optical_radius = $600;
  $601 = $current_optical_radius;
  $602 = $601;
  $603 = $min_fadeout_in_pixels;
  $604 = $603;
  $605 = $604 / 2.0;
  $606 = $602 - $605;
  $607 = $current_optical_radius;
  $608 = $607;
  $609 = $min_fadeout_in_pixels;
  $610 = $609;
  $611 = $610 / 2.0;
  $612 = $608 + $611;
  $613 = $606 / $612;
  $614 = $613;
  $hardness_new = $614;
  $615 = $min_fadeout_in_pixels;
  $616 = $615;
  $617 = $hardness_new;
  $618 = $617;
  $619 = 1.0 - $618;
  $620 = $616 / $619;
  $621 = $620;
  $radius_new = $621;
  $622 = $hardness_new;
  $hardness = $622;
  $623 = $radius_new;
  $radius = $623;
 }
 $624 = $0;
 $625 = ((($624)) + 328|0);
 $626 = ((($625)) + 172|0);
 $627 = +HEAPF32[$626>>2];
 $snapToPixel = $627;
 $628 = $snapToPixel;
 $629 = $628;
 $630 = $629 > 0.0;
 if (!($630)) {
  _hsv_to_rgb_float($color_h,$color_s,$color_v);
  $680 = $1;
  $681 = $x;
  $682 = $y;
  $683 = $radius;
  $684 = +HEAPF32[$color_h>>2];
  $685 = +HEAPF32[$color_s>>2];
  $686 = +HEAPF32[$color_v>>2];
  $687 = $opaque;
  $688 = $hardness;
  $689 = $eraser_target_alpha;
  $690 = $0;
  $691 = ((($690)) + 24|0);
  $692 = ((($691)) + 96|0);
  $693 = +HEAPF32[$692>>2];
  $694 = $0;
  $695 = ((($694)) + 24|0);
  $696 = ((($695)) + 100|0);
  $697 = +HEAPF32[$696>>2];
  $698 = $0;
  $699 = ((($698)) + 328|0);
  $700 = ((($699)) + 164|0);
  $701 = +HEAPF32[$700>>2];
  $702 = $0;
  $703 = ((($702)) + 328|0);
  $704 = ((($703)) + 168|0);
  $705 = +HEAPF32[$704>>2];
  $706 = (_mypaint_surface_draw_dab($680,$681,$682,$683,$684,$685,$686,$687,$688,$689,$693,$697,$701,$705)|0);
  STACKTOP = sp;return ($706|0);
 }
 $631 = $x;
 $632 = $631;
 $633 = (+Math_floor((+$632)));
 $634 = $633 + 0.5;
 $635 = $634;
 $snapped_x = $635;
 $636 = $y;
 $637 = $636;
 $638 = (+Math_floor((+$637)));
 $639 = $638 + 0.5;
 $640 = $639;
 $snapped_y = $640;
 $641 = $x;
 $642 = $snapped_x;
 $643 = $x;
 $644 = $642 - $643;
 $645 = $snapToPixel;
 $646 = $644 * $645;
 $647 = $641 + $646;
 $x = $647;
 $648 = $y;
 $649 = $snapped_y;
 $650 = $y;
 $651 = $649 - $650;
 $652 = $snapToPixel;
 $653 = $651 * $652;
 $654 = $648 + $653;
 $y = $654;
 $655 = $radius;
 $656 = $655;
 $657 = $656 * 2.0;
 $658 = $657;
 $659 = (+_roundf($658));
 $660 = $659;
 $661 = $660 / 2.0;
 $662 = $661;
 $snapped_radius = $662;
 $663 = $snapped_radius;
 $664 = $663;
 $665 = $664 < 0.5;
 if ($665) {
  $snapped_radius = 0.5;
 }
 $666 = $snapToPixel;
 $667 = $666;
 $668 = $667 > 0.99990000000000001;
 if ($668) {
  $669 = $snapped_radius;
  $670 = $669;
  $671 = $670 - 1.0E-4;
  $672 = $671;
  $snapped_radius = $672;
 }
 $673 = $radius;
 $674 = $snapped_radius;
 $675 = $radius;
 $676 = $674 - $675;
 $677 = $snapToPixel;
 $678 = $676 * $677;
 $679 = $673 + $678;
 $radius = $679;
 _hsv_to_rgb_float($color_h,$color_s,$color_v);
 $680 = $1;
 $681 = $x;
 $682 = $y;
 $683 = $radius;
 $684 = +HEAPF32[$color_h>>2];
 $685 = +HEAPF32[$color_s>>2];
 $686 = +HEAPF32[$color_v>>2];
 $687 = $opaque;
 $688 = $hardness;
 $689 = $eraser_target_alpha;
 $690 = $0;
 $691 = ((($690)) + 24|0);
 $692 = ((($691)) + 96|0);
 $693 = +HEAPF32[$692>>2];
 $694 = $0;
 $695 = ((($694)) + 24|0);
 $696 = ((($695)) + 100|0);
 $697 = +HEAPF32[$696>>2];
 $698 = $0;
 $699 = ((($698)) + 328|0);
 $700 = ((($699)) + 164|0);
 $701 = +HEAPF32[$700>>2];
 $702 = $0;
 $703 = ((($702)) + 328|0);
 $704 = ((($703)) + 168|0);
 $705 = +HEAPF32[$704>>2];
 $706 = (_mypaint_surface_draw_dab($680,$681,$682,$683,$684,$685,$686,$687,$688,$689,$693,$697,$701,$705)|0);
 STACKTOP = sp;return ($706|0);
}
function _mypaint_surface_get_color($self,$x,$y,$radius,$color_r,$color_g,$color_b,$color_a) {
 $self = $self|0;
 $x = +$x;
 $y = +$y;
 $radius = +$radius;
 $color_r = $color_r|0;
 $color_g = $color_g|0;
 $color_b = $color_b|0;
 $color_a = $color_a|0;
 var $0 = 0, $1 = 0.0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0, $2 = 0.0, $20 = 0, $21 = 0, $22 = 0, $3 = 0.0, $4 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $x;
 $2 = $y;
 $3 = $radius;
 $4 = $color_r;
 $5 = $color_g;
 $6 = $color_b;
 $7 = $color_a;
 $8 = $0;
 $9 = ((($8)) + 4|0);
 $10 = HEAP32[$9>>2]|0;
 $11 = ($10|0)!=(0|0);
 if ($11) {
  $12 = $0;
  $13 = ((($12)) + 4|0);
  $14 = HEAP32[$13>>2]|0;
  $15 = $0;
  $16 = $1;
  $17 = $2;
  $18 = $3;
  $19 = $4;
  $20 = $5;
  $21 = $6;
  $22 = $7;
  FUNCTION_TABLE_vidddiiii[$14 & 15]($15,$16,$17,$18,$19,$20,$21,$22);
  STACKTOP = sp;return;
 } else {
  ___assert_fail((3268|0),(3203|0),49,(3284|0));
  // unreachable;
 }
}
function _mypaint_surface_draw_dab($self,$x,$y,$radius,$color_r,$color_g,$color_b,$opaque,$hardness,$alpha_eraser,$aspect_ratio,$angle,$lock_alpha,$colorize) {
 $self = $self|0;
 $x = +$x;
 $y = +$y;
 $radius = +$radius;
 $color_r = +$color_r;
 $color_g = +$color_g;
 $color_b = +$color_b;
 $opaque = +$opaque;
 $hardness = +$hardness;
 $alpha_eraser = +$alpha_eraser;
 $aspect_ratio = +$aspect_ratio;
 $angle = +$angle;
 $lock_alpha = +$lock_alpha;
 $colorize = +$colorize;
 var $0 = 0, $1 = 0.0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0.0, $20 = 0.0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0.0, $26 = 0.0;
 var $27 = 0.0, $28 = 0.0, $29 = 0.0, $3 = 0.0, $30 = 0.0, $31 = 0.0, $32 = 0.0, $33 = 0, $4 = 0.0, $5 = 0.0, $6 = 0.0, $7 = 0.0, $8 = 0.0, $9 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $x;
 $2 = $y;
 $3 = $radius;
 $4 = $color_r;
 $5 = $color_g;
 $6 = $color_b;
 $7 = $opaque;
 $8 = $hardness;
 $9 = $alpha_eraser;
 $10 = $aspect_ratio;
 $11 = $angle;
 $12 = $lock_alpha;
 $13 = $colorize;
 $14 = $0;
 $15 = HEAP32[$14>>2]|0;
 $16 = ($15|0)!=(0|0);
 if ($16) {
  $17 = $0;
  $18 = HEAP32[$17>>2]|0;
  $19 = $0;
  $20 = $1;
  $21 = $2;
  $22 = $3;
  $23 = $4;
  $24 = $5;
  $25 = $6;
  $26 = $7;
  $27 = $8;
  $28 = $9;
  $29 = $10;
  $30 = $11;
  $31 = $12;
  $32 = $13;
  $33 = (FUNCTION_TABLE_iiddddddddddddd[$18 & 15]($19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)|0);
  STACKTOP = sp;return ($33|0);
 } else {
  ___assert_fail((3188|0),(3203|0),36,(3243|0));
  // unreachable;
 }
 return (0)|0;
}
function _count_dabs_to($self,$x,$y,$pressure,$dt) {
 $self = $self|0;
 $x = +$x;
 $y = +$y;
 $pressure = +$pressure;
 $dt = +$dt;
 var $0 = 0, $1 = 0.0, $10 = 0, $100 = 0.0, $101 = 0.0, $102 = 0.0, $103 = 0.0, $104 = 0.0, $105 = 0.0, $106 = 0.0, $107 = 0.0, $108 = 0.0, $109 = 0.0, $11 = 0, $110 = 0.0, $111 = 0.0, $112 = 0.0, $113 = 0.0, $114 = 0.0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0.0, $119 = 0.0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0.0, $125 = 0.0, $126 = 0.0, $127 = 0.0, $128 = 0.0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0.0;
 var $134 = 0.0, $135 = 0.0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0.0, $141 = 0.0, $142 = 0.0, $143 = 0.0, $144 = 0.0, $145 = 0.0, $146 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0, $18 = 0, $19 = 0, $2 = 0.0;
 var $20 = 0, $21 = 0, $22 = 0, $23 = 0.0, $24 = 0.0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0.0, $30 = 0, $31 = 0, $32 = 0.0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0;
 var $39 = 0, $4 = 0.0, $40 = 0, $41 = 0.0, $42 = 0.0, $43 = 0.0, $44 = 0.0, $45 = 0, $46 = 0.0, $47 = 0, $48 = 0.0, $49 = 0, $5 = 0, $50 = 0, $51 = 0.0, $52 = 0.0, $53 = 0.0, $54 = 0, $55 = 0, $56 = 0;
 var $57 = 0.0, $58 = 0.0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0.0, $63 = 0.0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0.0, $69 = 0.0, $7 = 0, $70 = 0.0, $71 = 0.0, $72 = 0.0, $73 = 0.0, $74 = 0.0;
 var $75 = 0.0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0.0, $8 = 0.0, $80 = 0.0, $81 = 0.0, $82 = 0.0, $83 = 0.0, $84 = 0.0, $85 = 0.0, $86 = 0.0, $87 = 0.0, $88 = 0.0, $89 = 0, $9 = 0.0, $90 = 0, $91 = 0, $92 = 0.0;
 var $93 = 0.0, $94 = 0.0, $95 = 0.0, $96 = 0.0, $97 = 0.0, $98 = 0.0, $99 = 0.0, $angle_rad = 0.0, $base_radius = 0.0, $cs = 0.0, $dist = 0.0, $res1 = 0.0, $res2 = 0.0, $res3 = 0.0, $sn = 0.0, $xx = 0.0, $xxr = 0.0, $yy = 0.0, $yyr = 0.0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $x;
 $2 = $y;
 $3 = $pressure;
 $4 = $dt;
 $5 = $0;
 $6 = ((($5)) + 24|0);
 $7 = ((($6)) + 16|0);
 $8 = +HEAPF32[$7>>2];
 $9 = $8;
 $10 = $9 == 0.0;
 if ($10) {
  $11 = $0;
  $12 = ((($11)) + 148|0);
  $13 = ((($12)) + 12|0);
  $14 = HEAP32[$13>>2]|0;
  $15 = (+_mapping_get_base_value($14));
  $16 = (+Math_exp((+$15)));
  $17 = $0;
  $18 = ((($17)) + 24|0);
  $19 = ((($18)) + 16|0);
  HEAPF32[$19>>2] = $16;
 }
 $20 = $0;
 $21 = ((($20)) + 24|0);
 $22 = ((($21)) + 16|0);
 $23 = +HEAPF32[$22>>2];
 $24 = $23;
 $25 = $24 < 0.20000000000000001;
 if ($25) {
  $26 = $0;
  $27 = ((($26)) + 24|0);
  $28 = ((($27)) + 16|0);
  HEAPF32[$28>>2] = 0.20000000298023224;
 }
 $29 = $0;
 $30 = ((($29)) + 24|0);
 $31 = ((($30)) + 16|0);
 $32 = +HEAPF32[$31>>2];
 $33 = $32 > 1000.0;
 if ($33) {
  $34 = $0;
  $35 = ((($34)) + 24|0);
  $36 = ((($35)) + 16|0);
  HEAPF32[$36>>2] = 1000.0;
 }
 $37 = $0;
 $38 = ((($37)) + 148|0);
 $39 = ((($38)) + 12|0);
 $40 = HEAP32[$39>>2]|0;
 $41 = (+_mapping_get_base_value($40));
 $42 = (+Math_exp((+$41)));
 $base_radius = $42;
 $43 = $base_radius;
 $44 = $43;
 $45 = $44 < 0.20000000000000001;
 if ($45) {
  $base_radius = 0.20000000298023224;
 }
 $46 = $base_radius;
 $47 = $46 > 1000.0;
 if ($47) {
  $base_radius = 1000.0;
 }
 $48 = $1;
 $49 = $0;
 $50 = ((($49)) + 24|0);
 $51 = +HEAPF32[$50>>2];
 $52 = $48 - $51;
 $xx = $52;
 $53 = $2;
 $54 = $0;
 $55 = ((($54)) + 24|0);
 $56 = ((($55)) + 4|0);
 $57 = +HEAPF32[$56>>2];
 $58 = $53 - $57;
 $yy = $58;
 $59 = $0;
 $60 = ((($59)) + 24|0);
 $61 = ((($60)) + 96|0);
 $62 = +HEAPF32[$61>>2];
 $63 = $62;
 $64 = $63 > 1.0;
 if ($64) {
  $65 = $0;
  $66 = ((($65)) + 24|0);
  $67 = ((($66)) + 100|0);
  $68 = +HEAPF32[$67>>2];
  $69 = $68 / 360.0;
  $70 = $69 * 2.0;
  $71 = $70;
  $72 = $71 * 3.1415926535897931;
  $73 = $72;
  $angle_rad = $73;
  $74 = $angle_rad;
  $75 = $74;
  $76 = (+Math_cos((+$75)));
  $77 = $76;
  $cs = $77;
  $78 = $angle_rad;
  $79 = $78;
  $80 = (+Math_sin((+$79)));
  $81 = $80;
  $sn = $81;
  $82 = $yy;
  $83 = $cs;
  $84 = $82 * $83;
  $85 = $xx;
  $86 = $sn;
  $87 = $85 * $86;
  $88 = $84 - $87;
  $89 = $0;
  $90 = ((($89)) + 24|0);
  $91 = ((($90)) + 96|0);
  $92 = +HEAPF32[$91>>2];
  $93 = $88 * $92;
  $yyr = $93;
  $94 = $yy;
  $95 = $sn;
  $96 = $94 * $95;
  $97 = $xx;
  $98 = $cs;
  $99 = $97 * $98;
  $100 = $96 + $99;
  $xxr = $100;
  $101 = $yyr;
  $102 = $yyr;
  $103 = $101 * $102;
  $104 = $xxr;
  $105 = $xxr;
  $106 = $104 * $105;
  $107 = $103 + $106;
  $108 = $107;
  $109 = (+Math_sqrt((+$108)));
  $110 = $109;
  $dist = $110;
 } else {
  $111 = $xx;
  $112 = $yy;
  $113 = (+_hypotf($111,$112));
  $dist = $113;
 }
 $114 = $dist;
 $115 = $0;
 $116 = ((($115)) + 24|0);
 $117 = ((($116)) + 16|0);
 $118 = +HEAPF32[$117>>2];
 $119 = $114 / $118;
 $120 = $0;
 $121 = ((($120)) + 148|0);
 $122 = ((($121)) + 28|0);
 $123 = HEAP32[$122>>2]|0;
 $124 = (+_mapping_get_base_value($123));
 $125 = $119 * $124;
 $res1 = $125;
 $126 = $dist;
 $127 = $base_radius;
 $128 = $126 / $127;
 $129 = $0;
 $130 = ((($129)) + 148|0);
 $131 = ((($130)) + 24|0);
 $132 = HEAP32[$131>>2]|0;
 $133 = (+_mapping_get_base_value($132));
 $134 = $128 * $133;
 $res2 = $134;
 $135 = $4;
 $136 = $0;
 $137 = ((($136)) + 148|0);
 $138 = ((($137)) + 32|0);
 $139 = HEAP32[$138>>2]|0;
 $140 = (+_mapping_get_base_value($139));
 $141 = $135 * $140;
 $res3 = $141;
 $142 = $res1;
 $143 = $res2;
 $144 = $142 + $143;
 $145 = $res3;
 $146 = $144 + $145;
 STACKTOP = sp;return (+$146);
}
function _mypaint_brush_stroke_to($self,$surface,$x,$y,$pressure,$xtilt,$ytilt,$dtime) {
 $self = $self|0;
 $surface = $surface|0;
 $x = +$x;
 $y = +$y;
 $pressure = +$pressure;
 $xtilt = +$xtilt;
 $ytilt = +$ytilt;
 $dtime = +$dtime;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0.0, $101 = 0, $102 = 0.0, $103 = 0.0, $104 = 0, $105 = 0.0, $106 = 0.0, $107 = 0, $108 = 0.0, $109 = 0, $11 = 0.0, $110 = 0.0, $111 = 0.0, $112 = 0, $113 = 0.0, $114 = 0, $115 = 0.0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0.0, $121 = 0, $122 = 0, $123 = 0, $124 = 0.0, $125 = 0.0, $126 = 0.0, $127 = 0.0, $128 = 0, $129 = 0, $13 = 0.0, $130 = 0, $131 = 0, $132 = 0.0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0.0, $139 = 0.0, $14 = 0.0, $140 = 0, $141 = 0, $142 = 0, $143 = 0.0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0.0, $149 = 0.0, $15 = 0, $150 = 0.0, $151 = 0.0;
 var $152 = 0.0, $153 = 0.0, $154 = 0, $155 = 0, $156 = 0, $157 = 0.0, $158 = 0, $159 = 0, $16 = 0.0, $160 = 0, $161 = 0, $162 = 0.0, $163 = 0.0, $164 = 0.0, $165 = 0.0, $166 = 0.0, $167 = 0.0, $168 = 0, $169 = 0, $17 = 0.0;
 var $170 = 0, $171 = 0, $172 = 0.0, $173 = 0.0, $174 = 0.0, $175 = 0.0, $176 = 0.0, $177 = 0.0, $178 = 0.0, $179 = 0.0, $18 = 0, $180 = 0, $181 = 0, $182 = 0.0, $183 = 0.0, $184 = 0, $185 = 0, $186 = 0.0, $187 = 0.0, $188 = 0.0;
 var $189 = 0.0, $19 = 0.0, $190 = 0.0, $191 = 0, $192 = 0, $193 = 0, $194 = 0.0, $195 = 0.0, $196 = 0, $197 = 0, $198 = 0, $199 = 0.0, $2 = 0, $20 = 0.0, $200 = 0.0, $201 = 0.0, $202 = 0.0, $203 = 0.0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0.0, $208 = 0, $209 = 0.0, $21 = 0.0, $210 = 0.0, $211 = 0.0, $212 = 0.0, $213 = 0.0, $214 = 0.0, $215 = 0.0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0.0, $220 = 0, $221 = 0, $222 = 0, $223 = 0;
 var $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0.0, $230 = 0, $231 = 0.0, $232 = 0, $233 = 0, $234 = 0.0, $235 = 0, $236 = 0, $237 = 0, $238 = 0.0, $239 = 0, $24 = 0.0, $240 = 0, $241 = 0;
 var $242 = 0, $243 = 0, $244 = 0.0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0.0, $250 = 0, $251 = 0.0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0.0, $259 = 0.0, $26 = 0;
 var $260 = 0.0, $261 = 0.0, $262 = 0.0, $263 = 0, $264 = 0.0, $265 = 0, $266 = 0.0, $267 = 0.0, $268 = 0.0, $269 = 0.0, $27 = 0.0, $270 = 0.0, $271 = 0.0, $272 = 0.0, $273 = 0.0, $274 = 0.0, $275 = 0, $276 = 0, $277 = 0.0, $278 = 0.0;
 var $279 = 0.0, $28 = 0.0, $280 = 0.0, $281 = 0.0, $282 = 0, $283 = 0, $284 = 0, $285 = 0.0, $286 = 0.0, $287 = 0.0, $288 = 0.0, $289 = 0.0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0.0, $294 = 0.0, $295 = 0.0, $296 = 0.0;
 var $297 = 0.0, $298 = 0.0, $299 = 0.0, $3 = 0.0, $30 = 0.0, $300 = 0.0, $301 = 0.0, $302 = 0.0, $303 = 0.0, $304 = 0, $305 = 0, $306 = 0, $307 = 0.0, $308 = 0.0, $309 = 0.0, $31 = 0.0, $310 = 0.0, $311 = 0, $312 = 0, $313 = 0;
 var $314 = 0.0, $315 = 0.0, $316 = 0.0, $317 = 0.0, $318 = 0, $319 = 0.0, $32 = 0.0, $320 = 0.0, $321 = 0.0, $322 = 0.0, $323 = 0.0, $324 = 0.0, $325 = 0.0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0.0, $330 = 0, $331 = 0;
 var $332 = 0, $333 = 0.0, $334 = 0.0, $335 = 0.0, $336 = 0.0, $337 = 0, $338 = 0.0, $339 = 0.0, $34 = 0.0, $340 = 0.0, $341 = 0.0, $342 = 0.0, $343 = 0.0, $344 = 0.0, $345 = 0.0, $346 = 0, $347 = 0, $348 = 0.0, $349 = 0.0, $35 = 0.0;
 var $350 = 0.0, $351 = 0, $352 = 0, $353 = 0, $354 = 0.0, $355 = 0.0, $356 = 0.0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0.0, $361 = 0.0, $362 = 0.0, $363 = 0, $364 = 0, $365 = 0, $366 = 0.0, $367 = 0.0, $368 = 0;
 var $369 = 0, $37 = 0, $370 = 0, $371 = 0.0, $372 = 0.0, $373 = 0.0, $374 = 0.0, $375 = 0.0, $376 = 0, $377 = 0.0, $378 = 0.0, $379 = 0.0, $38 = 0, $380 = 0.0, $381 = 0.0, $382 = 0.0, $383 = 0.0, $384 = 0.0, $385 = 0.0, $386 = 0.0;
 var $387 = 0, $388 = 0, $389 = 0, $39 = 0.0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0.0, $395 = 0, $396 = 0, $397 = 0, $398 = 0.0, $399 = 0, $4 = 0.0, $40 = 0, $400 = 0, $401 = 0, $402 = 0.0, $403 = 0;
 var $404 = 0, $405 = 0.0, $406 = 0.0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0.0, $412 = 0.0, $413 = 0.0, $414 = 0.0, $415 = 0.0, $416 = 0, $417 = 0.0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0.0;
 var $422 = 0, $423 = 0, $424 = 0.0, $425 = 0.0, $426 = 0, $427 = 0, $428 = 0.0, $429 = 0, $43 = 0.0, $430 = 0, $431 = 0, $432 = 0.0, $433 = 0, $434 = 0, $435 = 0.0, $436 = 0, $437 = 0, $438 = 0.0, $439 = 0.0, $44 = 0.0;
 var $440 = 0.0, $441 = 0.0, $442 = 0.0, $443 = 0.0, $444 = 0, $445 = 0, $45 = 0.0, $46 = 0.0, $47 = 0.0, $48 = 0.0, $49 = 0.0, $5 = 0.0, $50 = 0.0, $51 = 0.0, $52 = 0.0, $53 = 0.0, $54 = 0.0, $55 = 0.0, $56 = 0.0, $57 = 0.0;
 var $58 = 0.0, $59 = 0.0, $6 = 0.0, $60 = 0.0, $61 = 0.0, $62 = 0, $63 = 0, $64 = 0, $65 = 0.0, $66 = 0, $67 = 0, $68 = 0, $69 = 0.0, $7 = 0.0, $70 = 0.0, $71 = 0, $72 = 0.0, $73 = 0, $74 = 0, $75 = 0;
 var $76 = 0.0, $77 = 0, $78 = 0, $79 = 0, $8 = 0.0, $80 = 0.0, $81 = 0.0, $82 = 0, $83 = 0.0, $84 = 0.0, $85 = 0, $86 = 0.0, $87 = 0.0, $88 = 0, $89 = 0.0, $9 = 0.0, $90 = 0.0, $91 = 0, $92 = 0.0, $93 = 0.0;
 var $94 = 0.0, $95 = 0.0, $96 = 0.0, $97 = 0.0, $98 = 0, $99 = 0.0, $base_radius = 0.0, $dabs_moved = 0.0, $dabs_todo = 0.0, $dtime_left = 0.0, $fac = 0.0, $frac = 0.0, $i = 0, $or$cond = 0, $or$cond3 = 0, $or$cond5 = 0, $painted = 0, $painted_now = 0, $rad = 0.0, $step_ascension = 0.0;
 var $step_ddab = 0.0, $step_declination = 0.0, $step_dpressure = 0.0, $step_dtime = 0.0, $step_dx = 0.0, $step_dy = 0.0, $tilt_ascension = 0.0, $tilt_declination = 0.0, $vararg_buffer = 0, $vararg_buffer7 = 0, $vararg_ptr6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 144|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer7 = sp + 32|0;
 $vararg_buffer = sp + 16|0;
 $1 = $self;
 $2 = $surface;
 $3 = $x;
 $4 = $y;
 $5 = $pressure;
 $6 = $xtilt;
 $7 = $ytilt;
 $8 = $dtime;
 $tilt_ascension = 0.0;
 $tilt_declination = 90.0;
 $9 = $6;
 $10 = $9 != 0.0;
 $11 = $7;
 $12 = $11 != 0.0;
 $or$cond = $10 | $12;
 do {
  if ($or$cond) {
   $13 = $6;
   $14 = $13;
   $15 = $14 > 1.0;
   if ($15) {
    $23 = 1.0;
   } else {
    $16 = $6;
    $17 = $16;
    $18 = $17 < -1.0;
    $19 = $6;
    $20 = $19;
    $21 = $18 ? -1.0 : $20;
    $23 = $21;
   }
   $22 = $23;
   $6 = $22;
   $24 = $7;
   $25 = $24;
   $26 = $25 > 1.0;
   if ($26) {
    $34 = 1.0;
   } else {
    $27 = $7;
    $28 = $27;
    $29 = $28 < -1.0;
    $30 = $7;
    $31 = $30;
    $32 = $29 ? -1.0 : $31;
    $34 = $32;
   }
   $33 = $34;
   $7 = $33;
   $35 = $6;
   $36 = (___FLOAT_BITS($35)|0);
   $37 = $36 & 2147483647;
   $38 = ($37>>>0)<(2139095040);
   if (!($38)) {
    ___assert_fail((2753|0),(2527|0),890,(2788|0));
    // unreachable;
   }
   $39 = $7;
   $40 = (___FLOAT_BITS($39)|0);
   $41 = $40 & 2147483647;
   $42 = ($41>>>0)<(2139095040);
   if (!($42)) {
    ___assert_fail((2753|0),(2527|0),890,(2788|0));
    // unreachable;
   }
   $43 = $6;
   $44 = -$43;
   $45 = $44;
   $46 = $7;
   $47 = $46;
   $48 = (+Math_atan2((+$45),(+$47)));
   $49 = 180.0 * $48;
   $50 = $49 / 3.1415926535897931;
   $51 = $50;
   $tilt_ascension = $51;
   $52 = $6;
   $53 = $52;
   $54 = $7;
   $55 = $54;
   $56 = (+_hypot($53,$55));
   $57 = $56;
   $rad = $57;
   $58 = $rad;
   $59 = $58 * 60.0;
   $60 = 90.0 - $59;
   $tilt_declination = $60;
   $61 = $tilt_ascension;
   $62 = (___FLOAT_BITS($61)|0);
   $63 = $62 & 2147483647;
   $64 = ($63>>>0)<(2139095040);
   if (!($64)) {
    ___assert_fail((2812|0),(2527|0),896,(2788|0));
    // unreachable;
   }
   $65 = $tilt_declination;
   $66 = (___FLOAT_BITS($65)|0);
   $67 = $66 & 2147483647;
   $68 = ($67>>>0)<(2139095040);
   if ($68) {
    break;
   } else {
    ___assert_fail((2837|0),(2527|0),897,(2788|0));
    // unreachable;
   }
  }
 } while(0);
 $69 = $5;
 $70 = $69;
 $71 = $70 <= 0.0;
 if ($71) {
  $5 = 0.0;
 }
 $72 = $3;
 $73 = (___FLOAT_BITS($72)|0);
 $74 = $73 & 2147483647;
 $75 = ($74>>>0)<(2139095040);
 if ($75) {
  $76 = $4;
  $77 = (___FLOAT_BITS($76)|0);
  $78 = $77 & 2147483647;
  $79 = ($78>>>0)<(2139095040);
  if ($79) {
   $80 = $3;
   $81 = $80;
   $82 = $81 > 1.0E+10;
   if ($82) {
    label = 22;
   } else {
    $83 = $4;
    $84 = $83;
    $85 = $84 > 1.0E+10;
    if ($85) {
     label = 22;
    } else {
     $86 = $3;
     $87 = $86;
     $88 = $87 < -1.0E+10;
     if ($88) {
      label = 22;
     } else {
      $89 = $4;
      $90 = $89;
      $91 = $90 < -1.0E+10;
      if ($91) {
       label = 22;
      }
     }
    }
   }
  } else {
   label = 22;
  }
 } else {
  label = 22;
 }
 if ((label|0) == 22) {
  $92 = $3;
  $93 = $92;
  $94 = $4;
  $95 = $94;
  HEAPF64[$vararg_buffer>>3] = $93;
  $vararg_ptr6 = ((($vararg_buffer)) + 8|0);
  HEAPF64[$vararg_ptr6>>3] = $95;
  (_printf(2864,$vararg_buffer)|0);
  $3 = 0.0;
  $4 = 0.0;
  $5 = 0.0;
 }
 $96 = $3;
 $97 = $96;
 $98 = $97 < 1.0E+8;
 if (!($98)) {
  ___assert_fail((2936|0),(2527|0),913,(2788|0));
  // unreachable;
 }
 $99 = $4;
 $100 = $99;
 $101 = $100 < 1.0E+8;
 if (!($101)) {
  ___assert_fail((2936|0),(2527|0),913,(2788|0));
  // unreachable;
 }
 $102 = $3;
 $103 = $102;
 $104 = $103 > -1.0E+8;
 if (!($104)) {
  ___assert_fail((2936|0),(2527|0),913,(2788|0));
  // unreachable;
 }
 $105 = $4;
 $106 = $105;
 $107 = $106 > -1.0E+8;
 if (!($107)) {
  ___assert_fail((2936|0),(2527|0),913,(2788|0));
  // unreachable;
 }
 $108 = $8;
 $109 = $108 < 0.0;
 if ($109) {
  $110 = $8;
  HEAPF64[$vararg_buffer7>>3] = $110;
  (_printf(2979,$vararg_buffer7)|0);
 }
 $111 = $8;
 $112 = $111 <= 0.0;
 if ($112) {
  $8 = 1.0E-4;
 }
 $113 = $8;
 $114 = $113 > 0.10000000000000001;
 $115 = $5;
 $116 = $115 != 0.0;
 $or$cond3 = $114 & $116;
 if ($or$cond3) {
  $117 = $1;
  $118 = ((($117)) + 24|0);
  $119 = ((($118)) + 8|0);
  $120 = +HEAPF32[$119>>2];
  $121 = $120 == 0.0;
  if ($121) {
   $122 = $1;
   $123 = $2;
   $124 = $3;
   $125 = $4;
   $126 = $8;
   $127 = $126 - 1.0E-4;
   (_mypaint_brush_stroke_to($122,$123,$124,$125,0.0,90.0,0.0,$127)|0);
   $8 = 1.0E-4;
  }
 }
 $128 = $1;
 $129 = ((($128)) + 148|0);
 $130 = ((($129)) + 76|0);
 $131 = HEAP32[$130>>2]|0;
 $132 = (+_mapping_get_base_value($131));
 $133 = $132 != 0.0;
 if ($133) {
  $134 = $1;
  $135 = ((($134)) + 148|0);
  $136 = ((($135)) + 12|0);
  $137 = HEAP32[$136>>2]|0;
  $138 = (+_mapping_get_base_value($137));
  $139 = (+Math_exp((+$138)));
  $base_radius = $139;
  $140 = $1;
  $141 = ((($140)) + 144|0);
  $142 = HEAP32[$141>>2]|0;
  $143 = (+_rand_gauss($142));
  $144 = $1;
  $145 = ((($144)) + 148|0);
  $146 = ((($145)) + 76|0);
  $147 = HEAP32[$146>>2]|0;
  $148 = (+_mapping_get_base_value($147));
  $149 = $143 * $148;
  $150 = $base_radius;
  $151 = $149 * $150;
  $152 = $3;
  $153 = $152 + $151;
  $3 = $153;
  $154 = $1;
  $155 = ((($154)) + 144|0);
  $156 = HEAP32[$155>>2]|0;
  $157 = (+_rand_gauss($156));
  $158 = $1;
  $159 = ((($158)) + 148|0);
  $160 = ((($159)) + 76|0);
  $161 = HEAP32[$160>>2]|0;
  $162 = (+_mapping_get_base_value($161));
  $163 = $157 * $162;
  $164 = $base_radius;
  $165 = $163 * $164;
  $166 = $4;
  $167 = $166 + $165;
  $4 = $167;
 }
 $168 = $1;
 $169 = ((($168)) + 148|0);
 $170 = ((($169)) + 68|0);
 $171 = HEAP32[$170>>2]|0;
 $172 = (+_mapping_get_base_value($171));
 $173 = $8;
 $174 = 100.0 * $173;
 $175 = $174;
 $176 = (+_exp_decay($172,$175));
 $177 = $176;
 $178 = 1.0 - $177;
 $179 = $178;
 $fac = $179;
 $180 = $1;
 $181 = ((($180)) + 24|0);
 $182 = +HEAPF32[$181>>2];
 $183 = $3;
 $184 = $1;
 $185 = ((($184)) + 24|0);
 $186 = +HEAPF32[$185>>2];
 $187 = $183 - $186;
 $188 = $fac;
 $189 = $187 * $188;
 $190 = $182 + $189;
 $3 = $190;
 $191 = $1;
 $192 = ((($191)) + 24|0);
 $193 = ((($192)) + 4|0);
 $194 = +HEAPF32[$193>>2];
 $195 = $4;
 $196 = $1;
 $197 = ((($196)) + 24|0);
 $198 = ((($197)) + 4|0);
 $199 = +HEAPF32[$198>>2];
 $200 = $195 - $199;
 $201 = $fac;
 $202 = $200 * $201;
 $203 = $194 + $202;
 $4 = $203;
 $204 = $1;
 $205 = ((($204)) + 24|0);
 $206 = ((($205)) + 12|0);
 $207 = +HEAPF32[$206>>2];
 $dabs_moved = $207;
 $208 = $1;
 $209 = $3;
 $210 = $4;
 $211 = $5;
 $212 = $8;
 $213 = $212;
 $214 = (+_count_dabs_to($208,$209,$210,$211,$213));
 $dabs_todo = $214;
 $215 = $8;
 $216 = $215 > 5.0;
 if (!($216)) {
  $217 = $1;
  $218 = ((($217)) + 532|0);
  $219 = HEAP32[$218>>2]|0;
  $220 = ($219|0)!=(0);
  if (!($220)) {
   $painted = 0;
   $258 = $8;
   $dtime_left = $258;
   while(1) {
    $259 = $dabs_moved;
    $260 = $dabs_todo;
    $261 = $259 + $260;
    $262 = $261;
    $263 = $262 >= 1.0;
    if (!($263)) {
     break;
    }
    $264 = $dabs_moved;
    $265 = $264 > 0.0;
    if ($265) {
     $266 = $dabs_moved;
     $267 = $266;
     $268 = 1.0 - $267;
     $269 = $268;
     $step_ddab = $269;
     $dabs_moved = 0.0;
    } else {
     $step_ddab = 1.0;
    }
    $270 = $step_ddab;
    $271 = $dabs_todo;
    $272 = $270 / $271;
    $frac = $272;
    $273 = $frac;
    $274 = $3;
    $275 = $1;
    $276 = ((($275)) + 24|0);
    $277 = +HEAPF32[$276>>2];
    $278 = $274 - $277;
    $279 = $273 * $278;
    $step_dx = $279;
    $280 = $frac;
    $281 = $4;
    $282 = $1;
    $283 = ((($282)) + 24|0);
    $284 = ((($283)) + 4|0);
    $285 = +HEAPF32[$284>>2];
    $286 = $281 - $285;
    $287 = $280 * $286;
    $step_dy = $287;
    $288 = $frac;
    $289 = $5;
    $290 = $1;
    $291 = ((($290)) + 24|0);
    $292 = ((($291)) + 8|0);
    $293 = +HEAPF32[$292>>2];
    $294 = $289 - $293;
    $295 = $288 * $294;
    $step_dpressure = $295;
    $296 = $frac;
    $297 = $296;
    $298 = $dtime_left;
    $299 = $298 - 0.0;
    $300 = $297 * $299;
    $301 = $300;
    $step_dtime = $301;
    $302 = $frac;
    $303 = $tilt_declination;
    $304 = $1;
    $305 = ((($304)) + 24|0);
    $306 = ((($305)) + 112|0);
    $307 = +HEAPF32[$306>>2];
    $308 = $303 - $307;
    $309 = $302 * $308;
    $step_declination = $309;
    $310 = $frac;
    $311 = $1;
    $312 = ((($311)) + 24|0);
    $313 = ((($312)) + 116|0);
    $314 = +HEAPF32[$313>>2];
    $315 = $tilt_ascension;
    $316 = (+_smallest_angular_difference($314,$315));
    $317 = $310 * $316;
    $step_ascension = $317;
    $318 = $1;
    $319 = $step_ddab;
    $320 = $step_dx;
    $321 = $step_dy;
    $322 = $step_dpressure;
    $323 = $step_declination;
    $324 = $step_ascension;
    $325 = $step_dtime;
    _update_states_and_setting_values($318,$319,$320,$321,$322,$323,$324,$325);
    $326 = $1;
    $327 = $2;
    $328 = (_prepare_and_draw_dab($326,$327)|0);
    $painted_now = $328;
    $329 = $painted_now;
    $330 = ($329|0)!=(0);
    if ($330) {
     $painted = 1;
    } else {
     $331 = $painted;
     $332 = ($331|0)==(0);
     if ($332) {
      $painted = 2;
     }
    }
    $333 = $step_dtime;
    $334 = $333;
    $335 = $dtime_left;
    $336 = $335 - $334;
    $dtime_left = $336;
    $337 = $1;
    $338 = $3;
    $339 = $4;
    $340 = $5;
    $341 = $dtime_left;
    $342 = $341;
    $343 = (+_count_dabs_to($337,$338,$339,$340,$342));
    $dabs_todo = $343;
   }
   $344 = $dabs_todo;
   $step_ddab = $344;
   $345 = $3;
   $346 = $1;
   $347 = ((($346)) + 24|0);
   $348 = +HEAPF32[$347>>2];
   $349 = $345 - $348;
   $step_dx = $349;
   $350 = $4;
   $351 = $1;
   $352 = ((($351)) + 24|0);
   $353 = ((($352)) + 4|0);
   $354 = +HEAPF32[$353>>2];
   $355 = $350 - $354;
   $step_dy = $355;
   $356 = $5;
   $357 = $1;
   $358 = ((($357)) + 24|0);
   $359 = ((($358)) + 8|0);
   $360 = +HEAPF32[$359>>2];
   $361 = $356 - $360;
   $step_dpressure = $361;
   $362 = $tilt_declination;
   $363 = $1;
   $364 = ((($363)) + 24|0);
   $365 = ((($364)) + 112|0);
   $366 = +HEAPF32[$365>>2];
   $367 = $362 - $366;
   $step_declination = $367;
   $368 = $1;
   $369 = ((($368)) + 24|0);
   $370 = ((($369)) + 116|0);
   $371 = +HEAPF32[$370>>2];
   $372 = $tilt_ascension;
   $373 = (+_smallest_angular_difference($371,$372));
   $step_ascension = $373;
   $374 = $dtime_left;
   $375 = $374;
   $step_dtime = $375;
   $376 = $1;
   $377 = $step_ddab;
   $378 = $step_dx;
   $379 = $step_dy;
   $380 = $step_dpressure;
   $381 = $step_declination;
   $382 = $step_ascension;
   $383 = $step_dtime;
   _update_states_and_setting_values($376,$377,$378,$379,$380,$381,$382,$383);
   $384 = $dabs_moved;
   $385 = $dabs_todo;
   $386 = $384 + $385;
   $387 = $1;
   $388 = ((($387)) + 24|0);
   $389 = ((($388)) + 12|0);
   HEAPF32[$389>>2] = $386;
   $390 = $painted;
   $391 = ($390|0)==(0);
   do {
    if ($391) {
     $392 = $1;
     $393 = ((($392)) + 16|0);
     $394 = +HEAPF64[$393>>3];
     $395 = $394 > 0.0;
     if (!($395)) {
      $396 = $1;
      $397 = ((($396)) + 8|0);
      $398 = +HEAPF64[$397>>3];
      $399 = $398 == 0.0;
      if (!($399)) {
       $painted = 1;
       break;
      }
     }
     $painted = 2;
    }
   } while(0);
   $400 = $painted;
   $401 = ($400|0)==(1);
   do {
    if ($401) {
     $402 = $8;
     $403 = $1;
     $404 = ((($403)) + 8|0);
     $405 = +HEAPF64[$404>>3];
     $406 = $405 + $402;
     HEAPF64[$404>>3] = $406;
     $407 = $1;
     $408 = ((($407)) + 16|0);
     HEAPF64[$408>>3] = 0.0;
     $409 = $1;
     $410 = ((($409)) + 8|0);
     $411 = +HEAPF64[$410>>3];
     $412 = $5;
     $413 = 3.0 * $412;
     $414 = 4.0 + $413;
     $415 = $414;
     $416 = $411 > $415;
     $417 = $step_dpressure;
     $418 = $417 >= 0.0;
     $or$cond5 = $416 & $418;
     if ($or$cond5) {
      $0 = 1;
      $445 = $0;
      STACKTOP = sp;return ($445|0);
     }
    } else {
     $419 = $painted;
     $420 = ($419|0)==(2);
     if ($420) {
      $421 = $8;
      $422 = $1;
      $423 = ((($422)) + 16|0);
      $424 = +HEAPF64[$423>>3];
      $425 = $424 + $421;
      HEAPF64[$423>>3] = $425;
      $426 = $1;
      $427 = ((($426)) + 8|0);
      $428 = +HEAPF64[$427>>3];
      $429 = $428 == 0.0;
      $430 = $1;
      if ($429) {
       $431 = ((($430)) + 16|0);
       $432 = +HEAPF64[$431>>3];
       $433 = $432 > 1.0;
       if (!($433)) {
        break;
       }
       $0 = 1;
       $445 = $0;
       STACKTOP = sp;return ($445|0);
      } else {
       $434 = ((($430)) + 8|0);
       $435 = +HEAPF64[$434>>3];
       $436 = $1;
       $437 = ((($436)) + 16|0);
       $438 = +HEAPF64[$437>>3];
       $439 = $435 + $438;
       $440 = $5;
       $441 = 5.0 * $440;
       $442 = $441;
       $443 = 0.90000000000000002 + $442;
       $444 = $439 > $443;
       if (!($444)) {
        break;
       }
       $0 = 1;
       $445 = $0;
       STACKTOP = sp;return ($445|0);
      }
     }
    }
   } while(0);
   $0 = 0;
   $445 = $0;
   STACKTOP = sp;return ($445|0);
  }
 }
 $221 = $1;
 $222 = ((($221)) + 532|0);
 HEAP32[$222>>2] = 0;
 $i = 0;
 $i = 0;
 while(1) {
  $223 = $i;
  $224 = ($223|0)<(30);
  if (!($224)) {
   break;
  }
  $225 = $i;
  $226 = $1;
  $227 = ((($226)) + 24|0);
  $228 = (($227) + ($225<<2)|0);
  HEAPF32[$228>>2] = 0.0;
  $229 = $i;
  $230 = (($229) + 1)|0;
  $i = $230;
 }
 $231 = $3;
 $232 = $1;
 $233 = ((($232)) + 24|0);
 HEAPF32[$233>>2] = $231;
 $234 = $4;
 $235 = $1;
 $236 = ((($235)) + 24|0);
 $237 = ((($236)) + 4|0);
 HEAPF32[$237>>2] = $234;
 $238 = $5;
 $239 = $1;
 $240 = ((($239)) + 24|0);
 $241 = ((($240)) + 8|0);
 HEAPF32[$241>>2] = $238;
 $242 = $1;
 $243 = ((($242)) + 24|0);
 $244 = +HEAPF32[$243>>2];
 $245 = $1;
 $246 = ((($245)) + 24|0);
 $247 = ((($246)) + 56|0);
 HEAPF32[$247>>2] = $244;
 $248 = $1;
 $249 = ((($248)) + 24|0);
 $250 = ((($249)) + 4|0);
 $251 = +HEAPF32[$250>>2];
 $252 = $1;
 $253 = ((($252)) + 24|0);
 $254 = ((($253)) + 60|0);
 HEAPF32[$254>>2] = $251;
 $255 = $1;
 $256 = ((($255)) + 24|0);
 $257 = ((($256)) + 80|0);
 HEAPF32[$257>>2] = 1.0;
 $0 = 1;
 $445 = $0;
 STACKTOP = sp;return ($445|0);
}
function ___FLOAT_BITS($__f) {
 $__f = +$__f;
 var $0 = 0.0, $1 = 0.0, $2 = 0, $__u = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $__u = sp;
 $0 = $__f;
 $1 = $0;
 HEAPF32[$__u>>2] = $1;
 $2 = HEAP32[$__u>>2]|0;
 STACKTOP = sp;return ($2|0);
}
function ___DOUBLE_BITS($__f) {
 $__f = +$__f;
 var $0 = 0.0, $1 = 0.0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $__u = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $__u = sp;
 $0 = $__f;
 $1 = $0;
 HEAPF64[$__u>>3] = $1;
 $2 = $__u;
 $3 = $2;
 $4 = HEAP32[$3>>2]|0;
 $5 = (($2) + 4)|0;
 $6 = $5;
 $7 = HEAP32[$6>>2]|0;
 tempRet0 = ($7);
 STACKTOP = sp;return ($4|0);
}
function _smallest_angular_difference($a,$b) {
 $a = +$a;
 $b = +$b;
 var $0 = 0.0, $1 = 0.0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0.0, $20 = 0.0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0.0, $26 = 0.0;
 var $27 = 0.0, $28 = 0.0, $29 = 0.0, $3 = 0.0, $30 = 0, $31 = 0.0, $32 = 0.0, $33 = 0.0, $34 = 0.0, $4 = 0.0, $5 = 0.0, $6 = 0.0, $7 = 0.0, $8 = 0, $9 = 0.0, $d_ccw = 0.0, $d_cw = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $a;
 $1 = $b;
 $2 = $0;
 $3 = (+_fmodf($2,360.0));
 $0 = $3;
 $4 = $1;
 $5 = (+_fmodf($4,360.0));
 $1 = $5;
 $6 = $0;
 $7 = $1;
 $8 = $6 > $7;
 $9 = $0;
 if ($8) {
  $10 = $1;
  $11 = $9 - $10;
  $d_cw = $11;
  $12 = $1;
  $13 = $12;
  $14 = $13 + 360.0;
  $15 = $0;
  $16 = $15;
  $17 = $14 - $16;
  $18 = $17;
  $d_ccw = $18;
 } else {
  $19 = $9;
  $20 = $19 + 360.0;
  $21 = $1;
  $22 = $21;
  $23 = $20 - $22;
  $24 = $23;
  $d_cw = $24;
  $25 = $1;
  $26 = $0;
  $27 = $25 - $26;
  $d_ccw = $27;
 }
 $28 = $d_cw;
 $29 = $d_ccw;
 $30 = $28 < $29;
 $31 = $d_cw;
 $32 = -$31;
 $33 = $d_ccw;
 $34 = $30 ? $32 : $33;
 STACKTOP = sp;return (+$34);
}
function _mypaint_brush_setting_info($id) {
 $id = $id|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $id;
 $1 = $0;
 $2 = ($1>>>0)<(45);
 if ($2) {
  $3 = $0;
  $4 = (24 + (($3*28)|0)|0);
  STACKTOP = sp;return ($4|0);
 } else {
  ___assert_fail((3023|0),(3057|0),41,(3104|0));
  // unreachable;
 }
 return (0)|0;
}
function _mypaint_brush_setting_from_cname($cname) {
 $cname = $cname|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, $id = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $1 = $cname;
 $i = 0;
 while(1) {
  $2 = $i;
  $3 = ($2|0)<(45);
  if (!($3)) {
   label = 6;
   break;
  }
  $4 = $i;
  $id = $4;
  $5 = $id;
  $6 = (_mypaint_brush_setting_info($5)|0);
  $7 = HEAP32[$6>>2]|0;
  $8 = $1;
  $9 = (_strcmp($7,$8)|0);
  $10 = ($9|0)==(0);
  if ($10) {
   label = 4;
   break;
  }
  $12 = $i;
  $13 = (($12) + 1)|0;
  $i = $13;
 }
 if ((label|0) == 4) {
  $11 = $id;
  $0 = $11;
  $14 = $0;
  STACKTOP = sp;return ($14|0);
 }
 else if ((label|0) == 6) {
  $0 = -1;
  $14 = $0;
  STACKTOP = sp;return ($14|0);
 }
 return (0)|0;
}
function _mypaint_brush_input_info($id) {
 $id = $id|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $id;
 $1 = $0;
 $2 = ($1>>>0)<(9);
 if ($2) {
  $3 = $0;
  $4 = (1284 + ($3<<5)|0);
  STACKTOP = sp;return ($4|0);
 } else {
  ___assert_fail((3131|0),(3057|0),73,(3163|0));
  // unreachable;
 }
 return (0)|0;
}
function _mypaint_brush_input_from_cname($cname) {
 $cname = $cname|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, $id = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $1 = $cname;
 $i = 0;
 while(1) {
  $2 = $i;
  $3 = ($2|0)<(9);
  if (!($3)) {
   label = 6;
   break;
  }
  $4 = $i;
  $id = $4;
  $5 = $id;
  $6 = (_mypaint_brush_input_info($5)|0);
  $7 = HEAP32[$6>>2]|0;
  $8 = $1;
  $9 = (_strcmp($7,$8)|0);
  $10 = ($9|0)==(0);
  if ($10) {
   label = 4;
   break;
  }
  $12 = $i;
  $13 = (($12) + 1)|0;
  $i = $13;
 }
 if ((label|0) == 4) {
  $11 = $id;
  $0 = $11;
  $14 = $0;
  STACKTOP = sp;return ($14|0);
 }
 else if ((label|0) == 6) {
  $0 = -1;
  $14 = $0;
  STACKTOP = sp;return ($14|0);
 }
 return (0)|0;
}
function _mypaint_surface_init($self) {
 $self = $self|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $0;
 $2 = ((($1)) + 24|0);
 HEAP32[$2>>2] = 1;
 STACKTOP = sp;return;
}
function _proxy_surface_new($draw_dab_cb,$get_color_cb) {
 $draw_dab_cb = $draw_dab_cb|0;
 $get_color_cb = $get_color_cb|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $self = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $draw_dab_cb;
 $1 = $get_color_cb;
 $2 = (_malloc(36)|0);
 $self = $2;
 $3 = $self;
 _mypaint_surface_init($3);
 $4 = $self;
 HEAP32[$4>>2] = 9;
 $5 = $self;
 $6 = ((($5)) + 4|0);
 HEAP32[$6>>2] = 10;
 $7 = $0;
 $8 = $self;
 $9 = ((($8)) + 32|0);
 HEAP32[$9>>2] = $7;
 $10 = $1;
 $11 = $self;
 $12 = ((($11)) + 28|0);
 HEAP32[$12>>2] = $10;
 $13 = $self;
 STACKTOP = sp;return ($13|0);
}
function _proxy_surface_draw_dab($self,$x,$y,$radius,$color_r,$color_g,$color_b,$opaque,$hardness,$alpha_eraser,$aspect_ratio,$angle,$lock_alpha,$colorize) {
 $self = $self|0;
 $x = +$x;
 $y = +$y;
 $radius = +$radius;
 $color_r = +$color_r;
 $color_g = +$color_g;
 $color_b = +$color_b;
 $opaque = +$opaque;
 $hardness = +$hardness;
 $alpha_eraser = +$alpha_eraser;
 $aspect_ratio = +$aspect_ratio;
 $angle = +$angle;
 $lock_alpha = +$lock_alpha;
 $colorize = +$colorize;
 var $0 = 0, $1 = 0.0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0.0, $19 = 0.0, $2 = 0.0, $20 = 0.0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0.0, $26 = 0.0;
 var $27 = 0.0, $28 = 0.0, $29 = 0.0, $3 = 0.0, $30 = 0.0, $31 = 0, $4 = 0.0, $5 = 0.0, $6 = 0.0, $7 = 0.0, $8 = 0.0, $9 = 0.0, $surface = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $x;
 $2 = $y;
 $3 = $radius;
 $4 = $color_r;
 $5 = $color_g;
 $6 = $color_b;
 $7 = $opaque;
 $8 = $hardness;
 $9 = $alpha_eraser;
 $10 = $aspect_ratio;
 $11 = $angle;
 $12 = $lock_alpha;
 $13 = $colorize;
 $14 = $0;
 $surface = $14;
 $15 = $surface;
 $16 = ((($15)) + 32|0);
 $17 = HEAP32[$16>>2]|0;
 $18 = $1;
 $19 = $2;
 $20 = $3;
 $21 = $4;
 $22 = $5;
 $23 = $6;
 $24 = $7;
 $25 = $8;
 $26 = $9;
 $27 = $10;
 $28 = $11;
 $29 = $12;
 $30 = $13;
 $31 = (FUNCTION_TABLE_iddddddddddddd[$17 & 7]($18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)|0);
 STACKTOP = sp;return ($31|0);
}
function _proxy_surface_get_color($self,$x,$y,$radius,$color_r,$color_g,$color_b,$color_a) {
 $self = $self|0;
 $x = +$x;
 $y = +$y;
 $radius = +$radius;
 $color_r = $color_r|0;
 $color_g = $color_g|0;
 $color_b = $color_b|0;
 $color_a = $color_a|0;
 var $0 = 0, $1 = 0.0, $10 = 0, $11 = 0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0.0, $3 = 0.0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $surface = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $self;
 $1 = $x;
 $2 = $y;
 $3 = $radius;
 $4 = $color_r;
 $5 = $color_g;
 $6 = $color_b;
 $7 = $color_a;
 $8 = $0;
 $surface = $8;
 $9 = $surface;
 $10 = ((($9)) + 28|0);
 $11 = HEAP32[$10>>2]|0;
 $12 = $1;
 $13 = $2;
 $14 = $3;
 $15 = $4;
 $16 = $5;
 $17 = $6;
 $18 = $7;
 FUNCTION_TABLE_vdddiiii[$11 & 7]($12,$13,$14,$15,$16,$17,$18);
 STACKTOP = sp;return;
}
function _new_brush() {
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[1572>>2]|0;
 $1 = ($0|0)!=(0|0);
 if ($1) {
  $2 = HEAP32[1572>>2]|0;
  _mypaint_brush_unref($2);
 }
 $3 = (_mypaint_brush_new()|0);
 HEAP32[1572>>2] = $3;
 return;
}
function _set_brush_base_value($setting_name,$base_value) {
 $setting_name = $setting_name|0;
 $base_value = +$base_value;
 var $0 = 0, $1 = 0.0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0.0, $7 = 0.0, $setting_id = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $setting_name;
 $1 = $base_value;
 $2 = $0;
 $3 = (_mypaint_brush_setting_from_cname($2)|0);
 $setting_id = $3;
 $4 = HEAP32[1572>>2]|0;
 $5 = $setting_id;
 $6 = $1;
 $7 = $6;
 _mypaint_brush_set_base_value($4,$5,$7);
 STACKTOP = sp;return;
}
function _set_brush_mapping_n($setting_name,$input_name,$number_of_mapping_points) {
 $setting_name = $setting_name|0;
 $input_name = $input_name|0;
 $number_of_mapping_points = $number_of_mapping_points|0;
 var $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $input_id = 0, $setting_id = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $setting_name;
 $1 = $input_name;
 $2 = $number_of_mapping_points;
 $3 = $0;
 $4 = (_mypaint_brush_setting_from_cname($3)|0);
 $setting_id = $4;
 $5 = $1;
 $6 = (_mypaint_brush_input_from_cname($5)|0);
 $input_id = $6;
 $7 = HEAP32[1572>>2]|0;
 $8 = $setting_id;
 $9 = $input_id;
 $10 = $2;
 _mypaint_brush_set_mapping_n($7,$8,$9,$10);
 STACKTOP = sp;return;
}
function _set_brush_mapping_point($setting_name,$input_name,$index,$x,$y) {
 $setting_name = $setting_name|0;
 $input_name = $input_name|0;
 $index = $index|0;
 $x = +$x;
 $y = +$y;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0.0, $14 = 0.0, $2 = 0, $3 = 0.0, $4 = 0.0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $input_id = 0, $setting_id = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $setting_name;
 $1 = $input_name;
 $2 = $index;
 $3 = $x;
 $4 = $y;
 $5 = $0;
 $6 = (_mypaint_brush_setting_from_cname($5)|0);
 $setting_id = $6;
 $7 = $1;
 $8 = (_mypaint_brush_input_from_cname($7)|0);
 $input_id = $8;
 $9 = HEAP32[1572>>2]|0;
 $10 = $setting_id;
 $11 = $input_id;
 $12 = $2;
 $13 = $3;
 $14 = $4;
 _mypaint_brush_set_mapping_point($9,$10,$11,$12,$13,$14);
 STACKTOP = sp;return;
}
function _reset_brush() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[1572>>2]|0;
 _mypaint_brush_reset($0);
 return;
}
function _stroke_to($x,$y,$pressure,$xtilt,$ytilt,$dtime) {
 $x = +$x;
 $y = +$y;
 $pressure = +$pressure;
 $xtilt = +$xtilt;
 $ytilt = +$ytilt;
 $dtime = +$dtime;
 var $0 = 0.0, $1 = 0.0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $2 = 0.0, $3 = 0.0, $4 = 0.0, $5 = 0.0, $6 = 0, $7 = 0, $8 = 0.0, $9 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $x;
 $1 = $y;
 $2 = $pressure;
 $3 = $xtilt;
 $4 = $ytilt;
 $5 = $dtime;
 $6 = HEAP32[1572>>2]|0;
 $7 = HEAP32[1576>>2]|0;
 $8 = $0;
 $9 = $1;
 $10 = $2;
 $11 = $3;
 $12 = $4;
 $13 = $5;
 (_mypaint_brush_stroke_to($6,$7,$8,$9,$10,$11,$12,$13)|0);
 STACKTOP = sp;return;
}
function _init($draw_dab_cb,$get_color_cb) {
 $draw_dab_cb = $draw_dab_cb|0;
 $get_color_cb = $get_color_cb|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = $draw_dab_cb;
 $1 = $get_color_cb;
 $2 = $0;
 $3 = $1;
 $4 = (_proxy_surface_new($2,$3)|0);
 HEAP32[1576>>2] = $4;
 $5 = (_mypaint_brush_new()|0);
 HEAP32[1572>>2] = $5;
 STACKTOP = sp;return;
}
function ___stdout_write($f,$buf,$len) {
 $f = $f|0;
 $buf = $buf|0;
 $len = $len|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $tio = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 $tio = sp + 12|0;
 $0 = ((($f)) + 36|0);
 HEAP32[$0>>2] = 11;
 $1 = HEAP32[$f>>2]|0;
 $2 = $1 & 64;
 $3 = ($2|0)==(0);
 if ($3) {
  $4 = ((($f)) + 60|0);
  $5 = HEAP32[$4>>2]|0;
  HEAP32[$vararg_buffer>>2] = $5;
  $vararg_ptr1 = ((($vararg_buffer)) + 4|0);
  HEAP32[$vararg_ptr1>>2] = 21505;
  $vararg_ptr2 = ((($vararg_buffer)) + 8|0);
  HEAP32[$vararg_ptr2>>2] = $tio;
  $6 = (___syscall54(54,($vararg_buffer|0))|0);
  $7 = ($6|0)==(0);
  if (!($7)) {
   $8 = ((($f)) + 75|0);
   HEAP8[$8>>0] = -1;
  }
 }
 $9 = (___stdio_write($f,$buf,$len)|0);
 STACKTOP = sp;return ($9|0);
}
function _vfprintf($f,$fmt,$ap) {
 $f = $f|0;
 $fmt = $fmt|0;
 $ap = $ap|0;
 var $$ = 0, $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $ap2 = 0, $internal_buf = 0, $nl_arg = 0, $nl_type = 0;
 var $ret$1 = 0, $ret$1$ = 0, $vacopy_currentptr = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 224|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $ap2 = sp + 120|0;
 $nl_type = sp + 80|0;
 $nl_arg = sp;
 $internal_buf = sp + 136|0;
 dest=$nl_type; stop=dest+40|0; do { HEAP32[dest>>2]=0|0; dest=dest+4|0; } while ((dest|0) < (stop|0));
 $vacopy_currentptr = HEAP32[$ap>>2]|0;
 HEAP32[$ap2>>2] = $vacopy_currentptr;
 $0 = (_printf_core(0,$fmt,$ap2,$nl_arg,$nl_type)|0);
 $1 = ($0|0)<(0);
 if ($1) {
  $$0 = -1;
 } else {
  $2 = ((($f)) + 76|0);
  $3 = HEAP32[$2>>2]|0;
  $4 = ($3|0)>(-1);
  if ($4) {
   $5 = (___lockfile($f)|0);
   $32 = $5;
  } else {
   $32 = 0;
  }
  $6 = HEAP32[$f>>2]|0;
  $7 = $6 & 32;
  $8 = ((($f)) + 74|0);
  $9 = HEAP8[$8>>0]|0;
  $10 = ($9<<24>>24)<(1);
  if ($10) {
   $11 = $6 & -33;
   HEAP32[$f>>2] = $11;
  }
  $12 = ((($f)) + 48|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = ($13|0)==(0);
  if ($14) {
   $16 = ((($f)) + 44|0);
   $17 = HEAP32[$16>>2]|0;
   HEAP32[$16>>2] = $internal_buf;
   $18 = ((($f)) + 28|0);
   HEAP32[$18>>2] = $internal_buf;
   $19 = ((($f)) + 20|0);
   HEAP32[$19>>2] = $internal_buf;
   HEAP32[$12>>2] = 80;
   $20 = ((($internal_buf)) + 80|0);
   $21 = ((($f)) + 16|0);
   HEAP32[$21>>2] = $20;
   $22 = (_printf_core($f,$fmt,$ap2,$nl_arg,$nl_type)|0);
   $23 = ($17|0)==(0|0);
   if ($23) {
    $ret$1 = $22;
   } else {
    $24 = ((($f)) + 36|0);
    $25 = HEAP32[$24>>2]|0;
    (FUNCTION_TABLE_iiii[$25 & 15]($f,0,0)|0);
    $26 = HEAP32[$19>>2]|0;
    $27 = ($26|0)==(0|0);
    $$ = $27 ? -1 : $22;
    HEAP32[$16>>2] = $17;
    HEAP32[$12>>2] = 0;
    HEAP32[$21>>2] = 0;
    HEAP32[$18>>2] = 0;
    HEAP32[$19>>2] = 0;
    $ret$1 = $$;
   }
  } else {
   $15 = (_printf_core($f,$fmt,$ap2,$nl_arg,$nl_type)|0);
   $ret$1 = $15;
  }
  $28 = HEAP32[$f>>2]|0;
  $29 = $28 & 32;
  $30 = ($29|0)==(0);
  $ret$1$ = $30 ? $ret$1 : -1;
  $31 = $28 | $7;
  HEAP32[$f>>2] = $31;
  $33 = ($32|0)==(0);
  if (!($33)) {
   ___unlockfile($f);
  }
  $$0 = $ret$1$;
 }
 STACKTOP = sp;return ($$0|0);
}
function ___towrite($f) {
 $f = $f|0;
 var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ((($f)) + 74|0);
 $1 = HEAP8[$0>>0]|0;
 $2 = $1 << 24 >> 24;
 $3 = (($2) + 255)|0;
 $4 = $3 | $2;
 $5 = $4&255;
 HEAP8[$0>>0] = $5;
 $6 = HEAP32[$f>>2]|0;
 $7 = $6 & 8;
 $8 = ($7|0)==(0);
 if ($8) {
  $10 = ((($f)) + 8|0);
  HEAP32[$10>>2] = 0;
  $11 = ((($f)) + 4|0);
  HEAP32[$11>>2] = 0;
  $12 = ((($f)) + 44|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = ((($f)) + 28|0);
  HEAP32[$14>>2] = $13;
  $15 = ((($f)) + 20|0);
  HEAP32[$15>>2] = $13;
  $16 = $13;
  $17 = ((($f)) + 48|0);
  $18 = HEAP32[$17>>2]|0;
  $19 = (($16) + ($18)|0);
  $20 = ((($f)) + 16|0);
  HEAP32[$20>>2] = $19;
  $$0 = 0;
 } else {
  $9 = $6 | 32;
  HEAP32[$f>>2] = $9;
  $$0 = -1;
 }
 return ($$0|0);
}
function ___stdio_write($f,$buf,$len) {
 $f = $f|0;
 $buf = $buf|0;
 $len = $len|0;
 var $$0 = 0, $$phi$trans$insert = 0, $$pre = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0;
 var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
 var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $cnt$0 = 0, $cnt$1 = 0, $iov$0 = 0, $iov$0$lcssa11 = 0, $iov$1 = 0, $iovcnt$0 = 0;
 var $iovcnt$0$lcssa12 = 0, $iovcnt$1 = 0, $iovs = 0, $rem$0 = 0, $vararg_buffer = 0, $vararg_buffer3 = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr6 = 0, $vararg_ptr7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer3 = sp + 16|0;
 $vararg_buffer = sp;
 $iovs = sp + 32|0;
 $0 = ((($f)) + 28|0);
 $1 = HEAP32[$0>>2]|0;
 HEAP32[$iovs>>2] = $1;
 $2 = ((($iovs)) + 4|0);
 $3 = ((($f)) + 20|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = $4;
 $6 = (($5) - ($1))|0;
 HEAP32[$2>>2] = $6;
 $7 = ((($iovs)) + 8|0);
 HEAP32[$7>>2] = $buf;
 $8 = ((($iovs)) + 12|0);
 HEAP32[$8>>2] = $len;
 $9 = (($6) + ($len))|0;
 $10 = ((($f)) + 60|0);
 $11 = ((($f)) + 44|0);
 $iov$0 = $iovs;$iovcnt$0 = 2;$rem$0 = $9;
 while(1) {
  $12 = HEAP32[1584>>2]|0;
  $13 = ($12|0)==(0|0);
  if ($13) {
   $17 = HEAP32[$10>>2]|0;
   HEAP32[$vararg_buffer3>>2] = $17;
   $vararg_ptr6 = ((($vararg_buffer3)) + 4|0);
   HEAP32[$vararg_ptr6>>2] = $iov$0;
   $vararg_ptr7 = ((($vararg_buffer3)) + 8|0);
   HEAP32[$vararg_ptr7>>2] = $iovcnt$0;
   $18 = (___syscall146(146,($vararg_buffer3|0))|0);
   $19 = (___syscall_ret($18)|0);
   $cnt$0 = $19;
  } else {
   _pthread_cleanup_push((12|0),($f|0));
   $14 = HEAP32[$10>>2]|0;
   HEAP32[$vararg_buffer>>2] = $14;
   $vararg_ptr1 = ((($vararg_buffer)) + 4|0);
   HEAP32[$vararg_ptr1>>2] = $iov$0;
   $vararg_ptr2 = ((($vararg_buffer)) + 8|0);
   HEAP32[$vararg_ptr2>>2] = $iovcnt$0;
   $15 = (___syscall146(146,($vararg_buffer|0))|0);
   $16 = (___syscall_ret($15)|0);
   _pthread_cleanup_pop(0);
   $cnt$0 = $16;
  }
  $20 = ($rem$0|0)==($cnt$0|0);
  if ($20) {
   label = 6;
   break;
  }
  $27 = ($cnt$0|0)<(0);
  if ($27) {
   $iov$0$lcssa11 = $iov$0;$iovcnt$0$lcssa12 = $iovcnt$0;
   label = 8;
   break;
  }
  $35 = (($rem$0) - ($cnt$0))|0;
  $36 = ((($iov$0)) + 4|0);
  $37 = HEAP32[$36>>2]|0;
  $38 = ($cnt$0>>>0)>($37>>>0);
  if ($38) {
   $39 = HEAP32[$11>>2]|0;
   HEAP32[$0>>2] = $39;
   HEAP32[$3>>2] = $39;
   $40 = (($cnt$0) - ($37))|0;
   $41 = ((($iov$0)) + 8|0);
   $42 = (($iovcnt$0) + -1)|0;
   $$phi$trans$insert = ((($iov$0)) + 12|0);
   $$pre = HEAP32[$$phi$trans$insert>>2]|0;
   $50 = $$pre;$cnt$1 = $40;$iov$1 = $41;$iovcnt$1 = $42;
  } else {
   $43 = ($iovcnt$0|0)==(2);
   if ($43) {
    $44 = HEAP32[$0>>2]|0;
    $45 = (($44) + ($cnt$0)|0);
    HEAP32[$0>>2] = $45;
    $50 = $37;$cnt$1 = $cnt$0;$iov$1 = $iov$0;$iovcnt$1 = 2;
   } else {
    $50 = $37;$cnt$1 = $cnt$0;$iov$1 = $iov$0;$iovcnt$1 = $iovcnt$0;
   }
  }
  $46 = HEAP32[$iov$1>>2]|0;
  $47 = (($46) + ($cnt$1)|0);
  HEAP32[$iov$1>>2] = $47;
  $48 = ((($iov$1)) + 4|0);
  $49 = (($50) - ($cnt$1))|0;
  HEAP32[$48>>2] = $49;
  $iov$0 = $iov$1;$iovcnt$0 = $iovcnt$1;$rem$0 = $35;
 }
 if ((label|0) == 6) {
  $21 = HEAP32[$11>>2]|0;
  $22 = ((($f)) + 48|0);
  $23 = HEAP32[$22>>2]|0;
  $24 = (($21) + ($23)|0);
  $25 = ((($f)) + 16|0);
  HEAP32[$25>>2] = $24;
  $26 = $21;
  HEAP32[$0>>2] = $26;
  HEAP32[$3>>2] = $26;
  $$0 = $len;
 }
 else if ((label|0) == 8) {
  $28 = ((($f)) + 16|0);
  HEAP32[$28>>2] = 0;
  HEAP32[$0>>2] = 0;
  HEAP32[$3>>2] = 0;
  $29 = HEAP32[$f>>2]|0;
  $30 = $29 | 32;
  HEAP32[$f>>2] = $30;
  $31 = ($iovcnt$0$lcssa12|0)==(2);
  if ($31) {
   $$0 = 0;
  } else {
   $32 = ((($iov$0$lcssa11)) + 4|0);
   $33 = HEAP32[$32>>2]|0;
   $34 = (($len) - ($33))|0;
   $$0 = $34;
  }
 }
 STACKTOP = sp;return ($$0|0);
}
function ___stdio_seek($f,$off,$whence) {
 $f = $f|0;
 $off = $off|0;
 $whence = $whence|0;
 var $$pre = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $ret = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr3 = 0, $vararg_ptr4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 $ret = sp + 20|0;
 $0 = ((($f)) + 60|0);
 $1 = HEAP32[$0>>2]|0;
 HEAP32[$vararg_buffer>>2] = $1;
 $vararg_ptr1 = ((($vararg_buffer)) + 4|0);
 HEAP32[$vararg_ptr1>>2] = 0;
 $vararg_ptr2 = ((($vararg_buffer)) + 8|0);
 HEAP32[$vararg_ptr2>>2] = $off;
 $vararg_ptr3 = ((($vararg_buffer)) + 12|0);
 HEAP32[$vararg_ptr3>>2] = $ret;
 $vararg_ptr4 = ((($vararg_buffer)) + 16|0);
 HEAP32[$vararg_ptr4>>2] = $whence;
 $2 = (___syscall140(140,($vararg_buffer|0))|0);
 $3 = (___syscall_ret($2)|0);
 $4 = ($3|0)<(0);
 if ($4) {
  HEAP32[$ret>>2] = -1;
  $5 = -1;
 } else {
  $$pre = HEAP32[$ret>>2]|0;
  $5 = $$pre;
 }
 STACKTOP = sp;return ($5|0);
}
function ___stdio_close($f) {
 $f = $f|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 $0 = ((($f)) + 60|0);
 $1 = HEAP32[$0>>2]|0;
 HEAP32[$vararg_buffer>>2] = $1;
 $2 = (___syscall6(6,($vararg_buffer|0))|0);
 $3 = (___syscall_ret($2)|0);
 STACKTOP = sp;return ($3|0);
}
function ___lockfile($f) {
 $f = $f|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return 0;
}
function ___unlockfile($f) {
 $f = $f|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function _printf($fmt,$varargs) {
 $fmt = $fmt|0;
 $varargs = $varargs|0;
 var $0 = 0, $1 = 0, $ap = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $ap = sp;
 HEAP32[$ap>>2] = $varargs;
 $0 = HEAP32[1580>>2]|0;
 $1 = (_vfprintf($0,$fmt,$ap)|0);
 STACKTOP = sp;return ($1|0);
}
function ___fwritex($s,$l,$f) {
 $s = $s|0;
 $l = $l|0;
 $f = $f|0;
 var $$0 = 0, $$01 = 0, $$02 = 0, $$pre = 0, $$pre6 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
 var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i$0 = 0, $i$0$lcssa10 = 0;
 var $i$1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ((($f)) + 16|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==(0|0);
 if ($2) {
  $3 = (___towrite($f)|0);
  $4 = ($3|0)==(0);
  if ($4) {
   $$pre = HEAP32[$0>>2]|0;
   $7 = $$pre;
   label = 4;
  } else {
   $$0 = 0;
  }
 } else {
  $7 = $1;
  label = 4;
 }
 L4: do {
  if ((label|0) == 4) {
   $5 = ((($f)) + 20|0);
   $6 = HEAP32[$5>>2]|0;
   $8 = $7;
   $9 = $6;
   $10 = (($8) - ($9))|0;
   $11 = ($10>>>0)<($l>>>0);
   if ($11) {
    $12 = ((($f)) + 36|0);
    $13 = HEAP32[$12>>2]|0;
    $14 = (FUNCTION_TABLE_iiii[$13 & 15]($f,$s,$l)|0);
    $$0 = $14;
    break;
   }
   $15 = ((($f)) + 75|0);
   $16 = HEAP8[$15>>0]|0;
   $17 = ($16<<24>>24)>(-1);
   L9: do {
    if ($17) {
     $i$0 = $l;
     while(1) {
      $18 = ($i$0|0)==(0);
      if ($18) {
       $$01 = $l;$$02 = $s;$29 = $6;$i$1 = 0;
       break L9;
      }
      $19 = (($i$0) + -1)|0;
      $20 = (($s) + ($19)|0);
      $21 = HEAP8[$20>>0]|0;
      $22 = ($21<<24>>24)==(10);
      if ($22) {
       $i$0$lcssa10 = $i$0;
       break;
      } else {
       $i$0 = $19;
      }
     }
     $23 = ((($f)) + 36|0);
     $24 = HEAP32[$23>>2]|0;
     $25 = (FUNCTION_TABLE_iiii[$24 & 15]($f,$s,$i$0$lcssa10)|0);
     $26 = ($25>>>0)<($i$0$lcssa10>>>0);
     if ($26) {
      $$0 = $i$0$lcssa10;
      break L4;
     }
     $27 = (($s) + ($i$0$lcssa10)|0);
     $28 = (($l) - ($i$0$lcssa10))|0;
     $$pre6 = HEAP32[$5>>2]|0;
     $$01 = $28;$$02 = $27;$29 = $$pre6;$i$1 = $i$0$lcssa10;
    } else {
     $$01 = $l;$$02 = $s;$29 = $6;$i$1 = 0;
    }
   } while(0);
   _memcpy(($29|0),($$02|0),($$01|0))|0;
   $30 = HEAP32[$5>>2]|0;
   $31 = (($30) + ($$01)|0);
   HEAP32[$5>>2] = $31;
   $32 = (($i$1) + ($$01))|0;
   $$0 = $32;
  }
 } while(0);
 return ($$0|0);
}
function _fmodf($x,$y) {
 $x = +$x;
 $y = +$y;
 var $$0 = 0.0, $$lcssa = 0, $$lcssa6 = 0, $$x = 0.0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0.0, $13 = 0.0, $14 = 0, $15 = 0, $16 = 0, $17 = 0.0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $41 = 0, $42 = 0.0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0.0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0;
 var $6 = 0, $60 = 0, $61 = 0.0, $62 = 0, $63 = 0, $7 = 0, $8 = 0, $9 = 0, $ex$0$lcssa = 0, $ex$025 = 0, $ex$1 = 0, $ex$2$lcssa = 0, $ex$211 = 0, $ex$3$lcssa = 0, $ex$38 = 0, $ey$0$lcssa = 0, $ey$019 = 0, $ey$1$ph = 0, $i$026 = 0, $i$120 = 0;
 var $or$cond = 0, $uxi$0 = 0, $uxi$1$lcssa = 0, $uxi$112 = 0, $uxi$2 = 0, $uxi$3$lcssa = 0, $uxi$3$ph = 0, $uxi$39 = 0, $uxi$4 = 0, $uy$sroa$0$0$ph = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (HEAPF32[tempDoublePtr>>2]=$x,HEAP32[tempDoublePtr>>2]|0);
 $1 = (HEAPF32[tempDoublePtr>>2]=$y,HEAP32[tempDoublePtr>>2]|0);
 $2 = $0 >>> 23;
 $3 = $2 & 255;
 $4 = $1 >>> 23;
 $5 = $4 & 255;
 $6 = $0 & -2147483648;
 $7 = $1 << 1;
 $8 = ($7|0)==(0);
 L1: do {
  if ($8) {
   label = 3;
  } else {
   $9 = $1 & 2147483647;
   $10 = ($9>>>0)>(2139095040);
   $11 = ($3|0)==(255);
   $or$cond = $10 | $11;
   if ($or$cond) {
    label = 3;
   } else {
    $14 = $0 << 1;
    $15 = ($14>>>0)>($7>>>0);
    if (!($15)) {
     $16 = ($14|0)==($7|0);
     $17 = $x * 0.0;
     $$x = $16 ? $17 : $x;
     return (+$$x);
    }
    $18 = ($3|0)==(0);
    if ($18) {
     $19 = $0 << 9;
     $20 = ($19|0)>(-1);
     if ($20) {
      $ex$025 = 0;$i$026 = $19;
      while(1) {
       $21 = (($ex$025) + -1)|0;
       $22 = $i$026 << 1;
       $23 = ($22|0)>(-1);
       if ($23) {
        $ex$025 = $21;$i$026 = $22;
       } else {
        $ex$0$lcssa = $21;
        break;
       }
      }
     } else {
      $ex$0$lcssa = 0;
     }
     $24 = (1 - ($ex$0$lcssa))|0;
     $25 = $0 << $24;
     $ex$1 = $ex$0$lcssa;$uxi$0 = $25;
    } else {
     $26 = $0 & 8388607;
     $27 = $26 | 8388608;
     $ex$1 = $3;$uxi$0 = $27;
    }
    $28 = ($5|0)==(0);
    if ($28) {
     $29 = $1 << 9;
     $30 = ($29|0)>(-1);
     if ($30) {
      $ey$019 = 0;$i$120 = $29;
      while(1) {
       $31 = (($ey$019) + -1)|0;
       $32 = $i$120 << 1;
       $33 = ($32|0)>(-1);
       if ($33) {
        $ey$019 = $31;$i$120 = $32;
       } else {
        $ey$0$lcssa = $31;
        break;
       }
      }
     } else {
      $ey$0$lcssa = 0;
     }
     $34 = (1 - ($ey$0$lcssa))|0;
     $35 = $1 << $34;
     $ey$1$ph = $ey$0$lcssa;$uy$sroa$0$0$ph = $35;
    } else {
     $36 = $1 & 8388607;
     $37 = $36 | 8388608;
     $ey$1$ph = $5;$uy$sroa$0$0$ph = $37;
    }
    $38 = ($ex$1|0)>($ey$1$ph|0);
    $39 = (($uxi$0) - ($uy$sroa$0$0$ph))|0;
    $40 = ($39|0)>(-1);
    L23: do {
     if ($38) {
      $62 = $40;$63 = $39;$ex$211 = $ex$1;$uxi$112 = $uxi$0;
      while(1) {
       if ($62) {
        $41 = ($uxi$112|0)==($uy$sroa$0$0$ph|0);
        if ($41) {
         break;
        } else {
         $uxi$2 = $63;
        }
       } else {
        $uxi$2 = $uxi$112;
       }
       $43 = $uxi$2 << 1;
       $44 = (($ex$211) + -1)|0;
       $45 = ($44|0)>($ey$1$ph|0);
       $46 = (($43) - ($uy$sroa$0$0$ph))|0;
       $47 = ($46|0)>(-1);
       if ($45) {
        $62 = $47;$63 = $46;$ex$211 = $44;$uxi$112 = $43;
       } else {
        $$lcssa = $46;$$lcssa6 = $47;$ex$2$lcssa = $44;$uxi$1$lcssa = $43;
        break L23;
       }
      }
      $42 = $x * 0.0;
      $$0 = $42;
      break L1;
     } else {
      $$lcssa = $39;$$lcssa6 = $40;$ex$2$lcssa = $ex$1;$uxi$1$lcssa = $uxi$0;
     }
    } while(0);
    if ($$lcssa6) {
     $48 = ($uxi$1$lcssa|0)==($uy$sroa$0$0$ph|0);
     if ($48) {
      $50 = $x * 0.0;
      $$0 = $50;
      break;
     } else {
      $uxi$3$ph = $$lcssa;
     }
    } else {
     $uxi$3$ph = $uxi$1$lcssa;
    }
    $49 = ($uxi$3$ph>>>0)<(8388608);
    if ($49) {
     $ex$38 = $ex$2$lcssa;$uxi$39 = $uxi$3$ph;
     while(1) {
      $51 = $uxi$39 << 1;
      $52 = (($ex$38) + -1)|0;
      $53 = ($51>>>0)<(8388608);
      if ($53) {
       $ex$38 = $52;$uxi$39 = $51;
      } else {
       $ex$3$lcssa = $52;$uxi$3$lcssa = $51;
       break;
      }
     }
    } else {
     $ex$3$lcssa = $ex$2$lcssa;$uxi$3$lcssa = $uxi$3$ph;
    }
    $54 = ($ex$3$lcssa|0)>(0);
    if ($54) {
     $55 = (($uxi$3$lcssa) + -8388608)|0;
     $56 = $ex$3$lcssa << 23;
     $57 = $55 | $56;
     $uxi$4 = $57;
    } else {
     $58 = (1 - ($ex$3$lcssa))|0;
     $59 = $uxi$3$lcssa >>> $58;
     $uxi$4 = $59;
    }
    $60 = $uxi$4 | $6;
    $61 = (HEAP32[tempDoublePtr>>2]=$60,+HEAPF32[tempDoublePtr>>2]);
    $$0 = $61;
   }
  }
 } while(0);
 if ((label|0) == 3) {
  $12 = $x * $y;
  $13 = $12 / $12;
  $$0 = $13;
 }
 return (+$$0);
}
function _frexpl($x,$e) {
 $x = +$x;
 $e = $e|0;
 var $0 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (+_frexp($x,$e));
 return (+$0);
}
function _frexp($x,$e) {
 $x = +$x;
 $e = $e|0;
 var $$0 = 0.0, $$01 = 0.0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0.0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0.0, $7 = 0.0, $8 = 0, $9 = 0, $storemerge = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAPF64[tempDoublePtr>>3] = $x;$0 = HEAP32[tempDoublePtr>>2]|0;
 $1 = HEAP32[tempDoublePtr+4>>2]|0;
 $2 = (_bitshift64Lshr(($0|0),($1|0),52)|0);
 $3 = tempRet0;
 $4 = $2 & 2047;
 switch ($4|0) {
 case 0:  {
  $5 = $x != 0.0;
  if ($5) {
   $6 = $x * 1.8446744073709552E+19;
   $7 = (+_frexp($6,$e));
   $8 = HEAP32[$e>>2]|0;
   $9 = (($8) + -64)|0;
   $$01 = $7;$storemerge = $9;
  } else {
   $$01 = $x;$storemerge = 0;
  }
  HEAP32[$e>>2] = $storemerge;
  $$0 = $$01;
  break;
 }
 case 2047:  {
  $$0 = $x;
  break;
 }
 default: {
  $10 = (($4) + -1022)|0;
  HEAP32[$e>>2] = $10;
  $11 = $1 & -2146435073;
  $12 = $11 | 1071644672;
  HEAP32[tempDoublePtr>>2] = $0;HEAP32[tempDoublePtr+4>>2] = $12;$13 = +HEAPF64[tempDoublePtr>>3];
  $$0 = $13;
 }
 }
 return (+$$0);
}
function _hypot($x,$y) {
 $x = +$x;
 $y = +$y;
 var $$0 = 0.0, $$01 = 0.0, $$02 = 0.0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0, $22 = 0, $23 = 0;
 var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0.0, $29 = 0, $3 = 0, $30 = 0.0, $31 = 0.0, $32 = 0, $33 = 0.0, $34 = 0.0, $35 = 0.0, $36 = 0.0, $37 = 0.0, $38 = 0.0, $39 = 0.0, $4 = 0, $40 = 0.0, $41 = 0.0;
 var $42 = 0.0, $43 = 0.0, $44 = 0.0, $45 = 0.0, $46 = 0.0, $47 = 0.0, $48 = 0.0, $49 = 0.0, $5 = 0, $50 = 0.0, $51 = 0.0, $52 = 0.0, $53 = 0.0, $54 = 0.0, $55 = 0.0, $56 = 0.0, $57 = 0.0, $58 = 0.0, $59 = 0.0, $6 = 0;
 var $60 = 0.0, $61 = 0.0, $62 = 0.0, $63 = 0.0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $z$0 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAPF64[tempDoublePtr>>3] = $x;$0 = HEAP32[tempDoublePtr>>2]|0;
 $1 = HEAP32[tempDoublePtr+4>>2]|0;
 HEAPF64[tempDoublePtr>>3] = $y;$2 = HEAP32[tempDoublePtr>>2]|0;
 $3 = HEAP32[tempDoublePtr+4>>2]|0;
 $4 = $1 & 2147483647;
 $5 = $3 & 2147483647;
 $6 = ($4>>>0)<($5>>>0);
 $7 = ($0>>>0)<($2>>>0);
 $8 = ($4|0)==($5|0);
 $9 = $8 & $7;
 $10 = $6 | $9;
 $11 = $10 ? $2 : $0;
 $12 = $10 ? $5 : $4;
 $13 = $10 ? $0 : $2;
 $14 = $10 ? $4 : $5;
 $15 = (_bitshift64Lshr(($11|0),($12|0),52)|0);
 $16 = tempRet0;
 $17 = (_bitshift64Lshr(($13|0),($14|0),52)|0);
 $18 = tempRet0;
 HEAP32[tempDoublePtr>>2] = $11;HEAP32[tempDoublePtr+4>>2] = $12;$19 = +HEAPF64[tempDoublePtr>>3];
 HEAP32[tempDoublePtr>>2] = $13;HEAP32[tempDoublePtr+4>>2] = $14;$20 = +HEAPF64[tempDoublePtr>>3];
 $21 = ($17|0)==(2047);
 do {
  if ($21) {
   $$0 = $20;
  } else {
   $22 = ($15|0)==(2047);
   $23 = ($13|0)==(0);
   $24 = ($14|0)==(0);
   $25 = $23 & $24;
   $or$cond = $25 | $22;
   if ($or$cond) {
    $$0 = $19;
   } else {
    $26 = (($15) - ($17))|0;
    $27 = ($26|0)>(64);
    if ($27) {
     $28 = $19 + $20;
     $$0 = $28;
     break;
    }
    $29 = ($15>>>0)>(1533);
    if ($29) {
     $30 = $19 * 1.9010915662951598E-211;
     $31 = $20 * 1.9010915662951598E-211;
     $$01 = $30;$$02 = $31;$z$0 = 5.2601359015483735E+210;
    } else {
     $32 = ($17>>>0)<(573);
     if ($32) {
      $33 = $19 * 5.2601359015483735E+210;
      $34 = $20 * 5.2601359015483735E+210;
      $$01 = $33;$$02 = $34;$z$0 = 1.9010915662951598E-211;
     } else {
      $$01 = $19;$$02 = $20;$z$0 = 1.0;
     }
    }
    $35 = $$01 * 134217729.0;
    $36 = $$01 - $35;
    $37 = $35 + $36;
    $38 = $$01 - $37;
    $39 = $$01 * $$01;
    $40 = $37 * $37;
    $41 = $40 - $39;
    $42 = $37 * 2.0;
    $43 = $42 * $38;
    $44 = $41 + $43;
    $45 = $38 * $38;
    $46 = $45 + $44;
    $47 = $$02 * 134217729.0;
    $48 = $$02 - $47;
    $49 = $47 + $48;
    $50 = $$02 - $49;
    $51 = $$02 * $$02;
    $52 = $49 * $49;
    $53 = $52 - $51;
    $54 = $49 * 2.0;
    $55 = $54 * $50;
    $56 = $53 + $55;
    $57 = $50 * $50;
    $58 = $57 + $56;
    $59 = $58 + $46;
    $60 = $51 + $59;
    $61 = $39 + $60;
    $62 = (+Math_sqrt((+$61)));
    $63 = $z$0 * $62;
    $$0 = $63;
   }
  }
 } while(0);
 return (+$$0);
}
function _roundf($x) {
 $x = +$x;
 var $$0 = 0.0, $$x = 0.0, $$y$0 = 0.0, $0 = 0, $1 = 0, $10 = 0.0, $11 = 0, $12 = 0.0, $13 = 0.0, $14 = 0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $2 = 0, $3 = 0, $4 = 0, $5 = 0.0, $6 = 0, $7 = 0.0, $8 = 0.0;
 var $9 = 0.0, $y$0 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (HEAPF32[tempDoublePtr>>2]=$x,HEAP32[tempDoublePtr>>2]|0);
 $1 = $0 >>> 23;
 $2 = $1 & 255;
 $3 = ($2>>>0)>(149);
 do {
  if ($3) {
   $$0 = $x;
  } else {
   $4 = ($0|0)<(0);
   $5 = -$x;
   $$x = $4 ? $5 : $x;
   $6 = ($2>>>0)<(126);
   if ($6) {
    $7 = $x * 0.0;
    $$0 = $7;
    break;
   }
   $8 = $$x + 8388608.0;
   $9 = $8 + -8388608.0;
   $10 = $9 - $$x;
   $11 = $10 > 0.5;
   if ($11) {
    $12 = $$x + $10;
    $13 = $12 + -1.0;
    $y$0 = $13;
   } else {
    $14 = !($10 <= -0.5);
    $15 = $$x + $10;
    if ($14) {
     $y$0 = $15;
    } else {
     $16 = $15 + 1.0;
     $y$0 = $16;
    }
   }
   $17 = -$y$0;
   $$y$0 = $4 ? $17 : $y$0;
   $$0 = $$y$0;
  }
 } while(0);
 return (+$$0);
}
function _hypotf($x,$y) {
 $x = +$x;
 $y = +$y;
 var $$ = 0, $$0 = 0.0, $$01 = 0.0, $$02 = 0.0, $$3 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0.0, $13 = 0, $14 = 0.0, $15 = 0.0, $16 = 0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0, $20 = 0.0, $21 = 0.0;
 var $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0.0, $26 = 0.0, $3 = 0, $4 = 0, $5 = 0.0, $6 = 0.0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond5 = 0, $z$0 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (HEAPF32[tempDoublePtr>>2]=$x,HEAP32[tempDoublePtr>>2]|0);
 $1 = (HEAPF32[tempDoublePtr>>2]=$y,HEAP32[tempDoublePtr>>2]|0);
 $2 = $0 & 2147483647;
 $3 = $1 & 2147483647;
 $4 = ($2>>>0)<($3>>>0);
 $$ = $4 ? $3 : $2;
 $$3 = $4 ? $2 : $3;
 $5 = (HEAP32[tempDoublePtr>>2]=$$,+HEAPF32[tempDoublePtr>>2]);
 $6 = (HEAP32[tempDoublePtr>>2]=$$3,+HEAPF32[tempDoublePtr>>2]);
 $7 = ($$3|0)==(2139095040);
 do {
  if ($7) {
   $$0 = $6;
  } else {
   $8 = ($$>>>0)>(2139095039);
   $9 = ($$3|0)==(0);
   $or$cond = $8 | $9;
   $10 = (($$) - ($$3))|0;
   $11 = ($10>>>0)>(209715199);
   $or$cond5 = $or$cond | $11;
   if ($or$cond5) {
    $12 = $5 + $6;
    $$0 = $12;
    break;
   }
   $13 = ($$>>>0)>(1568669695);
   if ($13) {
    $14 = $5 * 8.0779356694631609E-28;
    $15 = $6 * 8.0779356694631609E-28;
    $$01 = $15;$$02 = $14;$z$0 = 1.2379400392853803E+27;
   } else {
    $16 = ($$3>>>0)<(562036736);
    if ($16) {
     $17 = $5 * 1.2379400392853803E+27;
     $18 = $6 * 1.2379400392853803E+27;
     $$01 = $18;$$02 = $17;$z$0 = 8.0779356694631609E-28;
    } else {
     $$01 = $6;$$02 = $5;$z$0 = 1.0;
    }
   }
   $19 = $$02;
   $20 = $19 * $19;
   $21 = $$01;
   $22 = $21 * $21;
   $23 = $20 + $22;
   $24 = $23;
   $25 = (+Math_sqrt((+$24)));
   $26 = $z$0 * $25;
   $$0 = $26;
  }
 } while(0);
 return (+$$0);
}
function ___syscall_ret($r) {
 $r = $r|0;
 var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($r>>>0)>(4294963200);
 if ($0) {
  $1 = (0 - ($r))|0;
  $2 = (___errno_location()|0);
  HEAP32[$2>>2] = $1;
  $$0 = -1;
 } else {
  $$0 = $r;
 }
 return ($$0|0);
}
function _strcmp($l,$r) {
 $l = $l|0;
 $r = $r|0;
 var $$014 = 0, $$05 = 0, $$lcssa = 0, $$lcssa2 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond3 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $0 = HEAP8[$l>>0]|0;
 $1 = HEAP8[$r>>0]|0;
 $2 = ($0<<24>>24)!=($1<<24>>24);
 $3 = ($0<<24>>24)==(0);
 $or$cond3 = $3 | $2;
 if ($or$cond3) {
  $$lcssa = $0;$$lcssa2 = $1;
 } else {
  $$014 = $l;$$05 = $r;
  while(1) {
   $4 = ((($$014)) + 1|0);
   $5 = ((($$05)) + 1|0);
   $6 = HEAP8[$4>>0]|0;
   $7 = HEAP8[$5>>0]|0;
   $8 = ($6<<24>>24)!=($7<<24>>24);
   $9 = ($6<<24>>24)==(0);
   $or$cond = $9 | $8;
   if ($or$cond) {
    $$lcssa = $6;$$lcssa2 = $7;
    break;
   } else {
    $$014 = $4;$$05 = $5;
   }
  }
 }
 $10 = $$lcssa&255;
 $11 = $$lcssa2&255;
 $12 = (($10) - ($11))|0;
 return ($12|0);
}
function _memchr($src,$c,$n) {
 $src = $src|0;
 $c = $c|0;
 $n = $n|0;
 var $$0$lcssa = 0, $$0$lcssa44 = 0, $$019 = 0, $$1$lcssa = 0, $$110 = 0, $$110$lcssa = 0, $$24 = 0, $$3 = 0, $$lcssa = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0;
 var $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond18 = 0, $s$0$lcssa = 0, $s$0$lcssa43 = 0, $s$020 = 0, $s$15 = 0, $s$2 = 0, $w$0$lcssa = 0, $w$011 = 0, $w$011$lcssa = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $c & 255;
 $1 = $src;
 $2 = $1 & 3;
 $3 = ($2|0)!=(0);
 $4 = ($n|0)!=(0);
 $or$cond18 = $4 & $3;
 L1: do {
  if ($or$cond18) {
   $5 = $c&255;
   $$019 = $n;$s$020 = $src;
   while(1) {
    $6 = HEAP8[$s$020>>0]|0;
    $7 = ($6<<24>>24)==($5<<24>>24);
    if ($7) {
     $$0$lcssa44 = $$019;$s$0$lcssa43 = $s$020;
     label = 6;
     break L1;
    }
    $8 = ((($s$020)) + 1|0);
    $9 = (($$019) + -1)|0;
    $10 = $8;
    $11 = $10 & 3;
    $12 = ($11|0)!=(0);
    $13 = ($9|0)!=(0);
    $or$cond = $13 & $12;
    if ($or$cond) {
     $$019 = $9;$s$020 = $8;
    } else {
     $$0$lcssa = $9;$$lcssa = $13;$s$0$lcssa = $8;
     label = 5;
     break;
    }
   }
  } else {
   $$0$lcssa = $n;$$lcssa = $4;$s$0$lcssa = $src;
   label = 5;
  }
 } while(0);
 if ((label|0) == 5) {
  if ($$lcssa) {
   $$0$lcssa44 = $$0$lcssa;$s$0$lcssa43 = $s$0$lcssa;
   label = 6;
  } else {
   $$3 = 0;$s$2 = $s$0$lcssa;
  }
 }
 L8: do {
  if ((label|0) == 6) {
   $14 = HEAP8[$s$0$lcssa43>>0]|0;
   $15 = $c&255;
   $16 = ($14<<24>>24)==($15<<24>>24);
   if ($16) {
    $$3 = $$0$lcssa44;$s$2 = $s$0$lcssa43;
   } else {
    $17 = Math_imul($0, 16843009)|0;
    $18 = ($$0$lcssa44>>>0)>(3);
    L11: do {
     if ($18) {
      $$110 = $$0$lcssa44;$w$011 = $s$0$lcssa43;
      while(1) {
       $19 = HEAP32[$w$011>>2]|0;
       $20 = $19 ^ $17;
       $21 = (($20) + -16843009)|0;
       $22 = $20 & -2139062144;
       $23 = $22 ^ -2139062144;
       $24 = $23 & $21;
       $25 = ($24|0)==(0);
       if (!($25)) {
        $$110$lcssa = $$110;$w$011$lcssa = $w$011;
        break;
       }
       $26 = ((($w$011)) + 4|0);
       $27 = (($$110) + -4)|0;
       $28 = ($27>>>0)>(3);
       if ($28) {
        $$110 = $27;$w$011 = $26;
       } else {
        $$1$lcssa = $27;$w$0$lcssa = $26;
        label = 11;
        break L11;
       }
      }
      $$24 = $$110$lcssa;$s$15 = $w$011$lcssa;
     } else {
      $$1$lcssa = $$0$lcssa44;$w$0$lcssa = $s$0$lcssa43;
      label = 11;
     }
    } while(0);
    if ((label|0) == 11) {
     $29 = ($$1$lcssa|0)==(0);
     if ($29) {
      $$3 = 0;$s$2 = $w$0$lcssa;
      break;
     } else {
      $$24 = $$1$lcssa;$s$15 = $w$0$lcssa;
     }
    }
    while(1) {
     $30 = HEAP8[$s$15>>0]|0;
     $31 = ($30<<24>>24)==($15<<24>>24);
     if ($31) {
      $$3 = $$24;$s$2 = $s$15;
      break L8;
     }
     $32 = ((($s$15)) + 1|0);
     $33 = (($$24) + -1)|0;
     $34 = ($33|0)==(0);
     if ($34) {
      $$3 = 0;$s$2 = $32;
      break;
     } else {
      $$24 = $33;$s$15 = $32;
     }
    }
   }
  }
 } while(0);
 $35 = ($$3|0)!=(0);
 $36 = $35 ? $s$2 : 0;
 return ($36|0);
}
function _strerror($e) {
 $e = $e|0;
 var $$lcssa = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i$03 = 0, $i$03$lcssa = 0, $i$12 = 0, $s$0$lcssa = 0, $s$01 = 0, $s$1 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $i$03 = 0;
 while(1) {
  $1 = (13154 + ($i$03)|0);
  $2 = HEAP8[$1>>0]|0;
  $3 = $2&255;
  $4 = ($3|0)==($e|0);
  if ($4) {
   $i$03$lcssa = $i$03;
   label = 2;
   break;
  }
  $5 = (($i$03) + 1)|0;
  $6 = ($5|0)==(87);
  if ($6) {
   $i$12 = 87;$s$01 = 13242;
   label = 5;
   break;
  } else {
   $i$03 = $5;
  }
 }
 if ((label|0) == 2) {
  $0 = ($i$03$lcssa|0)==(0);
  if ($0) {
   $s$0$lcssa = 13242;
  } else {
   $i$12 = $i$03$lcssa;$s$01 = 13242;
   label = 5;
  }
 }
 if ((label|0) == 5) {
  while(1) {
   label = 0;
   $s$1 = $s$01;
   while(1) {
    $7 = HEAP8[$s$1>>0]|0;
    $8 = ($7<<24>>24)==(0);
    $9 = ((($s$1)) + 1|0);
    if ($8) {
     $$lcssa = $9;
     break;
    } else {
     $s$1 = $9;
    }
   }
   $10 = (($i$12) + -1)|0;
   $11 = ($10|0)==(0);
   if ($11) {
    $s$0$lcssa = $$lcssa;
    break;
   } else {
    $i$12 = $10;$s$01 = $$lcssa;
    label = 5;
   }
  }
 }
 return ($s$0$lcssa|0);
}
function ___errno_location() {
 var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (0|0)==(0|0);
 if ($0) {
  $$0 = 1628;
 } else {
  $1 = (_pthread_self()|0);
  $2 = ((($1)) + 60|0);
  $3 = HEAP32[$2>>2]|0;
  $$0 = $3;
 }
 return ($$0|0);
}
function _wcrtomb($s,$wc,$st) {
 $s = $s|0;
 $wc = $wc|0;
 $st = $st|0;
 var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($s|0)==(0|0);
 do {
  if ($0) {
   $$0 = 1;
  } else {
   $1 = ($wc>>>0)<(128);
   if ($1) {
    $2 = $wc&255;
    HEAP8[$s>>0] = $2;
    $$0 = 1;
    break;
   }
   $3 = ($wc>>>0)<(2048);
   if ($3) {
    $4 = $wc >>> 6;
    $5 = $4 | 192;
    $6 = $5&255;
    $7 = ((($s)) + 1|0);
    HEAP8[$s>>0] = $6;
    $8 = $wc & 63;
    $9 = $8 | 128;
    $10 = $9&255;
    HEAP8[$7>>0] = $10;
    $$0 = 2;
    break;
   }
   $11 = ($wc>>>0)<(55296);
   $12 = $wc & -8192;
   $13 = ($12|0)==(57344);
   $or$cond = $11 | $13;
   if ($or$cond) {
    $14 = $wc >>> 12;
    $15 = $14 | 224;
    $16 = $15&255;
    $17 = ((($s)) + 1|0);
    HEAP8[$s>>0] = $16;
    $18 = $wc >>> 6;
    $19 = $18 & 63;
    $20 = $19 | 128;
    $21 = $20&255;
    $22 = ((($s)) + 2|0);
    HEAP8[$17>>0] = $21;
    $23 = $wc & 63;
    $24 = $23 | 128;
    $25 = $24&255;
    HEAP8[$22>>0] = $25;
    $$0 = 3;
    break;
   }
   $26 = (($wc) + -65536)|0;
   $27 = ($26>>>0)<(1048576);
   if ($27) {
    $28 = $wc >>> 18;
    $29 = $28 | 240;
    $30 = $29&255;
    $31 = ((($s)) + 1|0);
    HEAP8[$s>>0] = $30;
    $32 = $wc >>> 12;
    $33 = $32 & 63;
    $34 = $33 | 128;
    $35 = $34&255;
    $36 = ((($s)) + 2|0);
    HEAP8[$31>>0] = $35;
    $37 = $wc >>> 6;
    $38 = $37 & 63;
    $39 = $38 | 128;
    $40 = $39&255;
    $41 = ((($s)) + 3|0);
    HEAP8[$36>>0] = $40;
    $42 = $wc & 63;
    $43 = $42 | 128;
    $44 = $43&255;
    HEAP8[$41>>0] = $44;
    $$0 = 4;
    break;
   } else {
    $45 = (___errno_location()|0);
    HEAP32[$45>>2] = 84;
    $$0 = -1;
    break;
   }
  }
 } while(0);
 return ($$0|0);
}
function _wctomb($s,$wc) {
 $s = $s|0;
 $wc = $wc|0;
 var $$0 = 0, $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($s|0)==(0|0);
 if ($0) {
  $$0 = 0;
 } else {
  $1 = (_wcrtomb($s,$wc,0)|0);
  $$0 = $1;
 }
 return ($$0|0);
}
function _printf_core($f,$fmt,$ap,$nl_arg,$nl_type) {
 $f = $f|0;
 $fmt = $fmt|0;
 $ap = $ap|0;
 $nl_arg = $nl_arg|0;
 $nl_type = $nl_type|0;
 var $$ = 0, $$$i = 0, $$0 = 0, $$0$i = 0, $$0$lcssa$i = 0, $$012$i = 0, $$013$i = 0, $$03$i33 = 0, $$07$i = 0.0, $$1$i = 0.0, $$114$i = 0, $$2$i = 0.0, $$20$i = 0.0, $$21$i = 0, $$210$$22$i = 0, $$210$$24$i = 0, $$210$i = 0, $$23$i = 0, $$3$i = 0.0, $$31$i = 0;
 var $$311$i = 0, $$4$i = 0.0, $$412$lcssa$i = 0, $$41276$i = 0, $$43 = 0, $$5$lcssa$i = 0, $$587$i = 0, $$a$3$i = 0, $$a$3185$i = 0, $$a$3186$i = 0, $$fl$4 = 0, $$l10n$0 = 0, $$lcssa159$i = 0, $$lcssa321 = 0, $$lcssa322 = 0, $$lcssa326 = 0, $$lcssa328 = 0, $$lcssa329 = 0, $$lcssa330 = 0, $$lcssa331 = 0;
 var $$lcssa332 = 0, $$lcssa334 = 0, $$lcssa344 = 0, $$lcssa347 = 0.0, $$lcssa349 = 0, $$lcssa52 = 0, $$neg52$i = 0, $$neg53$i = 0, $$p$$i = 0, $$p$0 = 0, $$p$5 = 0, $$p$i = 0, $$pn$i = 0, $$pr$i = 0, $$pr47$i = 0, $$pre = 0, $$pre$i = 0, $$pre$phi184$iZ2D = 0, $$pre179$i = 0, $$pre182$i = 0;
 var $$pre183$i = 0, $$pre190 = 0, $$sum$i = 0, $$sum15$i = 0, $$sum16$i = 0, $$z$3$i = 0, $$z$4$i = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0;
 var $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0;
 var $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0;
 var $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0;
 var $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0;
 var $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0;
 var $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0;
 var $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0;
 var $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0;
 var $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0;
 var $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0;
 var $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0;
 var $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0;
 var $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0;
 var $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0;
 var $362 = 0, $363 = 0, $364 = 0.0, $365 = 0, $366 = 0, $367 = 0, $368 = 0.0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0;
 var $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0.0, $397 = 0.0, $398 = 0;
 var $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0.0, $413 = 0, $414 = 0, $415 = 0;
 var $416 = 0.0, $417 = 0.0, $418 = 0.0, $419 = 0.0, $42 = 0, $420 = 0.0, $421 = 0.0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0;
 var $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0.0, $448 = 0.0, $449 = 0.0, $45 = 0, $450 = 0, $451 = 0;
 var $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0;
 var $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0.0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0;
 var $489 = 0, $49 = 0, $490 = 0.0, $491 = 0.0, $492 = 0.0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0;
 var $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0;
 var $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0;
 var $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0;
 var $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0;
 var $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0;
 var $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0.0, $602 = 0.0, $603 = 0, $604 = 0.0, $605 = 0, $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0;
 var $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0;
 var $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0;
 var $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0;
 var $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0;
 var $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0;
 var $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0;
 var $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0;
 var $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0;
 var $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0;
 var $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0;
 var $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0;
 var $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $a$0 = 0, $a$1 = 0, $a$1$lcssa$i = 0, $a$1147$i = 0, $a$2 = 0, $a$2$ph$i = 0, $a$3$lcssa$i = 0, $a$3134$i = 0, $a$5$lcssa$i = 0, $a$5109$i = 0;
 var $a$6$i = 0, $a$7$i = 0, $a$8$ph$i = 0, $arg = 0, $arglist_current = 0, $arglist_current2 = 0, $arglist_next = 0, $arglist_next3 = 0, $argpos$0 = 0, $big$i = 0, $buf = 0, $buf$i = 0, $carry$0140$i = 0, $carry3$0128$i = 0, $cnt$0 = 0, $cnt$1 = 0, $cnt$1$lcssa = 0, $d$0$i = 0, $d$0139$i = 0, $d$0141$i = 0;
 var $d$1127$i = 0, $d$2$lcssa$i = 0, $d$2108$i = 0, $d$3$i = 0, $d$482$i = 0, $d$575$i = 0, $d$686$i = 0, $e$0123$i = 0, $e$1$i = 0, $e$2104$i = 0, $e$3$i = 0, $e$4$ph$i = 0, $e2$i = 0, $ebuf0$i = 0, $estr$0$i = 0, $estr$1$lcssa$i = 0, $estr$193$i = 0, $estr$2$i = 0, $exitcond$i = 0, $expanded = 0;
 var $expanded10 = 0, $expanded11 = 0, $expanded13 = 0, $expanded14 = 0, $expanded15 = 0, $expanded4 = 0, $expanded6 = 0, $expanded7 = 0, $expanded8 = 0, $fl$0103 = 0, $fl$056 = 0, $fl$1 = 0, $fl$1$ = 0, $fl$3 = 0, $fl$4 = 0, $fl$6 = 0, $i$0$lcssa = 0, $i$0$lcssa197 = 0, $i$0108 = 0, $i$0122$i = 0;
 var $i$03$i = 0, $i$03$i25 = 0, $i$1$lcssa$i = 0, $i$1116$i = 0, $i$1119 = 0, $i$2103$i = 0, $i$295 = 0, $i$295$lcssa = 0, $i$393 = 0, $i$399$i = 0, $isdigit = 0, $isdigit$i = 0, $isdigit$i27 = 0, $isdigit10 = 0, $isdigit12 = 0, $isdigit2$i = 0, $isdigit2$i23 = 0, $isdigittmp = 0, $isdigittmp$ = 0, $isdigittmp$i = 0;
 var $isdigittmp$i26 = 0, $isdigittmp1$i = 0, $isdigittmp1$i22 = 0, $isdigittmp11 = 0, $isdigittmp4$i = 0, $isdigittmp4$i24 = 0, $isdigittmp9 = 0, $j$0$i = 0, $j$0115$i = 0, $j$0117$i = 0, $j$1100$i = 0, $j$2$i = 0, $l$0 = 0, $l$0$i = 0, $l$1$i = 0, $l$1107 = 0, $l$2 = 0, $l10n$0 = 0, $l10n$0$lcssa = 0, $l10n$0$phi = 0;
 var $l10n$1 = 0, $l10n$2 = 0, $l10n$3 = 0, $mb = 0, $notlhs$i = 0, $notrhs$i = 0, $or$cond = 0, $or$cond$i = 0, $or$cond15 = 0, $or$cond17 = 0, $or$cond20 = 0, $or$cond239 = 0, $or$cond29$i = 0, $or$cond3$not$i = 0, $or$cond6$i = 0, $p$0 = 0, $p$1 = 0, $p$2 = 0, $p$2$ = 0, $p$3 = 0;
 var $p$4195 = 0, $p$5 = 0, $pl$0 = 0, $pl$0$i = 0, $pl$1 = 0, $pl$1$i = 0, $pl$2 = 0, $prefix$0 = 0, $prefix$0$$i = 0, $prefix$0$i = 0, $prefix$1 = 0, $prefix$2 = 0, $r$0$a$8$i = 0, $re$169$i = 0, $round$068$i = 0.0, $round6$1$i = 0.0, $s$0$i = 0, $s$1$i = 0, $s$1$i$lcssa = 0, $s1$0$i = 0;
 var $s7$079$i = 0, $s7$1$i = 0, $s8$0$lcssa$i = 0, $s8$070$i = 0, $s9$0$i = 0, $s9$183$i = 0, $s9$2$i = 0, $small$0$i = 0.0, $small$1$i = 0.0, $st$0 = 0, $st$0$lcssa327 = 0, $storemerge = 0, $storemerge13 = 0, $storemerge8102 = 0, $storemerge854 = 0, $sum = 0, $t$0 = 0, $t$1 = 0, $w$$i = 0, $w$0 = 0;
 var $w$1 = 0, $w$2 = 0, $w$30$i = 0, $wc = 0, $ws$0109 = 0, $ws$1120 = 0, $z$0$i = 0, $z$0$lcssa = 0, $z$096 = 0, $z$1 = 0, $z$1$lcssa$i = 0, $z$1146$i = 0, $z$2 = 0, $z$2$i = 0, $z$2$i$lcssa = 0, $z$3$lcssa$i = 0, $z$3133$i = 0, $z$4$i = 0, $z$6$$i = 0, $z$6$i = 0;
 var $z$6$i$lcssa = 0, $z$6$ph$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 624|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $big$i = sp + 24|0;
 $e2$i = sp + 16|0;
 $buf$i = sp + 588|0;
 $ebuf0$i = sp + 576|0;
 $arg = sp;
 $buf = sp + 536|0;
 $wc = sp + 8|0;
 $mb = sp + 528|0;
 $0 = ($f|0)!=(0|0);
 $1 = ((($buf)) + 40|0);
 $2 = $1;
 $3 = ((($buf)) + 39|0);
 $4 = ((($wc)) + 4|0);
 $5 = ((($ebuf0$i)) + 12|0);
 $6 = ((($ebuf0$i)) + 11|0);
 $7 = $buf$i;
 $8 = $5;
 $9 = (($8) - ($7))|0;
 $10 = (-2 - ($7))|0;
 $11 = (($8) + 2)|0;
 $12 = ((($big$i)) + 288|0);
 $13 = ((($buf$i)) + 9|0);
 $14 = $13;
 $15 = ((($buf$i)) + 8|0);
 $22 = $fmt;$cnt$0 = 0;$l$0 = 0;$l10n$0 = 0;
 L1: while(1) {
  $16 = ($cnt$0|0)>(-1);
  do {
   if ($16) {
    $17 = (2147483647 - ($cnt$0))|0;
    $18 = ($l$0|0)>($17|0);
    if ($18) {
     $19 = (___errno_location()|0);
     HEAP32[$19>>2] = 75;
     $cnt$1 = -1;
     break;
    } else {
     $20 = (($l$0) + ($cnt$0))|0;
     $cnt$1 = $20;
     break;
    }
   } else {
    $cnt$1 = $cnt$0;
   }
  } while(0);
  $21 = HEAP8[$22>>0]|0;
  $23 = ($21<<24>>24)==(0);
  if ($23) {
   $cnt$1$lcssa = $cnt$1;$l10n$0$lcssa = $l10n$0;
   label = 245;
   break;
  } else {
   $24 = $21;$26 = $22;
  }
  L9: while(1) {
   switch ($24<<24>>24) {
   case 37:  {
    $28 = $26;$z$096 = $26;
    label = 9;
    break L9;
    break;
   }
   case 0:  {
    $$lcssa52 = $26;$z$0$lcssa = $26;
    break L9;
    break;
   }
   default: {
   }
   }
   $25 = ((($26)) + 1|0);
   $$pre = HEAP8[$25>>0]|0;
   $24 = $$pre;$26 = $25;
  }
  L12: do {
   if ((label|0) == 9) {
    while(1) {
     label = 0;
     $27 = ((($28)) + 1|0);
     $29 = HEAP8[$27>>0]|0;
     $30 = ($29<<24>>24)==(37);
     if (!($30)) {
      $$lcssa52 = $28;$z$0$lcssa = $z$096;
      break L12;
     }
     $31 = ((($z$096)) + 1|0);
     $32 = ((($28)) + 2|0);
     $33 = HEAP8[$32>>0]|0;
     $34 = ($33<<24>>24)==(37);
     if ($34) {
      $28 = $32;$z$096 = $31;
      label = 9;
     } else {
      $$lcssa52 = $32;$z$0$lcssa = $31;
      break;
     }
    }
   }
  } while(0);
  $35 = $z$0$lcssa;
  $36 = $22;
  $37 = (($35) - ($36))|0;
  if ($0) {
   $38 = HEAP32[$f>>2]|0;
   $39 = $38 & 32;
   $40 = ($39|0)==(0);
   if ($40) {
    (___fwritex($22,$37,$f)|0);
   }
  }
  $41 = ($z$0$lcssa|0)==($22|0);
  if (!($41)) {
   $l10n$0$phi = $l10n$0;$22 = $$lcssa52;$cnt$0 = $cnt$1;$l$0 = $37;$l10n$0 = $l10n$0$phi;
   continue;
  }
  $42 = ((($$lcssa52)) + 1|0);
  $43 = HEAP8[$42>>0]|0;
  $44 = $43 << 24 >> 24;
  $isdigittmp = (($44) + -48)|0;
  $isdigit = ($isdigittmp>>>0)<(10);
  if ($isdigit) {
   $45 = ((($$lcssa52)) + 2|0);
   $46 = HEAP8[$45>>0]|0;
   $47 = ($46<<24>>24)==(36);
   $48 = ((($$lcssa52)) + 3|0);
   $$43 = $47 ? $48 : $42;
   $$l10n$0 = $47 ? 1 : $l10n$0;
   $isdigittmp$ = $47 ? $isdigittmp : -1;
   $$pre190 = HEAP8[$$43>>0]|0;
   $50 = $$pre190;$argpos$0 = $isdigittmp$;$l10n$1 = $$l10n$0;$storemerge = $$43;
  } else {
   $50 = $43;$argpos$0 = -1;$l10n$1 = $l10n$0;$storemerge = $42;
  }
  $49 = $50 << 24 >> 24;
  $51 = $49 & -32;
  $52 = ($51|0)==(32);
  L25: do {
   if ($52) {
    $54 = $49;$59 = $50;$fl$0103 = 0;$storemerge8102 = $storemerge;
    while(1) {
     $53 = (($54) + -32)|0;
     $55 = 1 << $53;
     $56 = $55 & 75913;
     $57 = ($56|0)==(0);
     if ($57) {
      $68 = $59;$fl$056 = $fl$0103;$storemerge854 = $storemerge8102;
      break L25;
     }
     $58 = $59 << 24 >> 24;
     $60 = (($58) + -32)|0;
     $61 = 1 << $60;
     $62 = $61 | $fl$0103;
     $63 = ((($storemerge8102)) + 1|0);
     $64 = HEAP8[$63>>0]|0;
     $65 = $64 << 24 >> 24;
     $66 = $65 & -32;
     $67 = ($66|0)==(32);
     if ($67) {
      $54 = $65;$59 = $64;$fl$0103 = $62;$storemerge8102 = $63;
     } else {
      $68 = $64;$fl$056 = $62;$storemerge854 = $63;
      break;
     }
    }
   } else {
    $68 = $50;$fl$056 = 0;$storemerge854 = $storemerge;
   }
  } while(0);
  $69 = ($68<<24>>24)==(42);
  do {
   if ($69) {
    $70 = ((($storemerge854)) + 1|0);
    $71 = HEAP8[$70>>0]|0;
    $72 = $71 << 24 >> 24;
    $isdigittmp11 = (($72) + -48)|0;
    $isdigit12 = ($isdigittmp11>>>0)<(10);
    if ($isdigit12) {
     $73 = ((($storemerge854)) + 2|0);
     $74 = HEAP8[$73>>0]|0;
     $75 = ($74<<24>>24)==(36);
     if ($75) {
      $76 = (($nl_type) + ($isdigittmp11<<2)|0);
      HEAP32[$76>>2] = 10;
      $77 = HEAP8[$70>>0]|0;
      $78 = $77 << 24 >> 24;
      $79 = (($78) + -48)|0;
      $80 = (($nl_arg) + ($79<<3)|0);
      $81 = $80;
      $82 = $81;
      $83 = HEAP32[$82>>2]|0;
      $84 = (($81) + 4)|0;
      $85 = $84;
      $86 = HEAP32[$85>>2]|0;
      $87 = ((($storemerge854)) + 3|0);
      $l10n$2 = 1;$storemerge13 = $87;$w$0 = $83;
     } else {
      label = 24;
     }
    } else {
     label = 24;
    }
    if ((label|0) == 24) {
     label = 0;
     $88 = ($l10n$1|0)==(0);
     if (!($88)) {
      $$0 = -1;
      break L1;
     }
     if (!($0)) {
      $108 = $70;$fl$1 = $fl$056;$l10n$3 = 0;$w$1 = 0;
      break;
     }
     $arglist_current = HEAP32[$ap>>2]|0;
     $89 = $arglist_current;
     $90 = ((0) + 4|0);
     $expanded4 = $90;
     $expanded = (($expanded4) - 1)|0;
     $91 = (($89) + ($expanded))|0;
     $92 = ((0) + 4|0);
     $expanded8 = $92;
     $expanded7 = (($expanded8) - 1)|0;
     $expanded6 = $expanded7 ^ -1;
     $93 = $91 & $expanded6;
     $94 = $93;
     $95 = HEAP32[$94>>2]|0;
     $arglist_next = ((($94)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next;
     $l10n$2 = 0;$storemerge13 = $70;$w$0 = $95;
    }
    $96 = ($w$0|0)<(0);
    if ($96) {
     $97 = $fl$056 | 8192;
     $98 = (0 - ($w$0))|0;
     $108 = $storemerge13;$fl$1 = $97;$l10n$3 = $l10n$2;$w$1 = $98;
    } else {
     $108 = $storemerge13;$fl$1 = $fl$056;$l10n$3 = $l10n$2;$w$1 = $w$0;
    }
   } else {
    $99 = $68 << 24 >> 24;
    $isdigittmp1$i = (($99) + -48)|0;
    $isdigit2$i = ($isdigittmp1$i>>>0)<(10);
    if ($isdigit2$i) {
     $103 = $storemerge854;$i$03$i = 0;$isdigittmp4$i = $isdigittmp1$i;
     while(1) {
      $100 = ($i$03$i*10)|0;
      $101 = (($100) + ($isdigittmp4$i))|0;
      $102 = ((($103)) + 1|0);
      $104 = HEAP8[$102>>0]|0;
      $105 = $104 << 24 >> 24;
      $isdigittmp$i = (($105) + -48)|0;
      $isdigit$i = ($isdigittmp$i>>>0)<(10);
      if ($isdigit$i) {
       $103 = $102;$i$03$i = $101;$isdigittmp4$i = $isdigittmp$i;
      } else {
       $$lcssa321 = $101;$$lcssa322 = $102;
       break;
      }
     }
     $106 = ($$lcssa321|0)<(0);
     if ($106) {
      $$0 = -1;
      break L1;
     } else {
      $108 = $$lcssa322;$fl$1 = $fl$056;$l10n$3 = $l10n$1;$w$1 = $$lcssa321;
     }
    } else {
     $108 = $storemerge854;$fl$1 = $fl$056;$l10n$3 = $l10n$1;$w$1 = 0;
    }
   }
  } while(0);
  $107 = HEAP8[$108>>0]|0;
  $109 = ($107<<24>>24)==(46);
  L46: do {
   if ($109) {
    $110 = ((($108)) + 1|0);
    $111 = HEAP8[$110>>0]|0;
    $112 = ($111<<24>>24)==(42);
    if (!($112)) {
     $139 = $111 << 24 >> 24;
     $isdigittmp1$i22 = (($139) + -48)|0;
     $isdigit2$i23 = ($isdigittmp1$i22>>>0)<(10);
     if ($isdigit2$i23) {
      $143 = $110;$i$03$i25 = 0;$isdigittmp4$i24 = $isdigittmp1$i22;
     } else {
      $802 = $110;$p$0 = 0;
      break;
     }
     while(1) {
      $140 = ($i$03$i25*10)|0;
      $141 = (($140) + ($isdigittmp4$i24))|0;
      $142 = ((($143)) + 1|0);
      $144 = HEAP8[$142>>0]|0;
      $145 = $144 << 24 >> 24;
      $isdigittmp$i26 = (($145) + -48)|0;
      $isdigit$i27 = ($isdigittmp$i26>>>0)<(10);
      if ($isdigit$i27) {
       $143 = $142;$i$03$i25 = $141;$isdigittmp4$i24 = $isdigittmp$i26;
      } else {
       $802 = $142;$p$0 = $141;
       break L46;
      }
     }
    }
    $113 = ((($108)) + 2|0);
    $114 = HEAP8[$113>>0]|0;
    $115 = $114 << 24 >> 24;
    $isdigittmp9 = (($115) + -48)|0;
    $isdigit10 = ($isdigittmp9>>>0)<(10);
    if ($isdigit10) {
     $116 = ((($108)) + 3|0);
     $117 = HEAP8[$116>>0]|0;
     $118 = ($117<<24>>24)==(36);
     if ($118) {
      $119 = (($nl_type) + ($isdigittmp9<<2)|0);
      HEAP32[$119>>2] = 10;
      $120 = HEAP8[$113>>0]|0;
      $121 = $120 << 24 >> 24;
      $122 = (($121) + -48)|0;
      $123 = (($nl_arg) + ($122<<3)|0);
      $124 = $123;
      $125 = $124;
      $126 = HEAP32[$125>>2]|0;
      $127 = (($124) + 4)|0;
      $128 = $127;
      $129 = HEAP32[$128>>2]|0;
      $130 = ((($108)) + 4|0);
      $802 = $130;$p$0 = $126;
      break;
     }
    }
    $131 = ($l10n$3|0)==(0);
    if (!($131)) {
     $$0 = -1;
     break L1;
    }
    if ($0) {
     $arglist_current2 = HEAP32[$ap>>2]|0;
     $132 = $arglist_current2;
     $133 = ((0) + 4|0);
     $expanded11 = $133;
     $expanded10 = (($expanded11) - 1)|0;
     $134 = (($132) + ($expanded10))|0;
     $135 = ((0) + 4|0);
     $expanded15 = $135;
     $expanded14 = (($expanded15) - 1)|0;
     $expanded13 = $expanded14 ^ -1;
     $136 = $134 & $expanded13;
     $137 = $136;
     $138 = HEAP32[$137>>2]|0;
     $arglist_next3 = ((($137)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next3;
     $802 = $113;$p$0 = $138;
    } else {
     $802 = $113;$p$0 = 0;
    }
   } else {
    $802 = $108;$p$0 = -1;
   }
  } while(0);
  $147 = $802;$st$0 = 0;
  while(1) {
   $146 = HEAP8[$147>>0]|0;
   $148 = $146 << 24 >> 24;
   $149 = (($148) + -65)|0;
   $150 = ($149>>>0)>(57);
   if ($150) {
    $$0 = -1;
    break L1;
   }
   $151 = ((($147)) + 1|0);
   $152 = ((16078 + (($st$0*58)|0)|0) + ($149)|0);
   $153 = HEAP8[$152>>0]|0;
   $154 = $153&255;
   $155 = (($154) + -1)|0;
   $156 = ($155>>>0)<(8);
   if ($156) {
    $147 = $151;$st$0 = $154;
   } else {
    $$lcssa326 = $147;$$lcssa328 = $151;$$lcssa329 = $153;$$lcssa330 = $154;$st$0$lcssa327 = $st$0;
    break;
   }
  }
  $157 = ($$lcssa329<<24>>24)==(0);
  if ($157) {
   $$0 = -1;
   break;
  }
  $158 = ($$lcssa329<<24>>24)==(19);
  $159 = ($argpos$0|0)>(-1);
  do {
   if ($158) {
    if ($159) {
     $$0 = -1;
     break L1;
    } else {
     label = 52;
    }
   } else {
    if ($159) {
     $160 = (($nl_type) + ($argpos$0<<2)|0);
     HEAP32[$160>>2] = $$lcssa330;
     $161 = (($nl_arg) + ($argpos$0<<3)|0);
     $162 = $161;
     $163 = $162;
     $164 = HEAP32[$163>>2]|0;
     $165 = (($162) + 4)|0;
     $166 = $165;
     $167 = HEAP32[$166>>2]|0;
     $168 = $arg;
     $169 = $168;
     HEAP32[$169>>2] = $164;
     $170 = (($168) + 4)|0;
     $171 = $170;
     HEAP32[$171>>2] = $167;
     label = 52;
     break;
    }
    if (!($0)) {
     $$0 = 0;
     break L1;
    }
    _pop_arg($arg,$$lcssa330,$ap);
   }
  } while(0);
  if ((label|0) == 52) {
   label = 0;
   if (!($0)) {
    $22 = $$lcssa328;$cnt$0 = $cnt$1;$l$0 = $37;$l10n$0 = $l10n$3;
    continue;
   }
  }
  $172 = HEAP8[$$lcssa326>>0]|0;
  $173 = $172 << 24 >> 24;
  $174 = ($st$0$lcssa327|0)!=(0);
  $175 = $173 & 15;
  $176 = ($175|0)==(3);
  $or$cond15 = $174 & $176;
  $177 = $173 & -33;
  $t$0 = $or$cond15 ? $177 : $173;
  $178 = $fl$1 & 8192;
  $179 = ($178|0)==(0);
  $180 = $fl$1 & -65537;
  $fl$1$ = $179 ? $fl$1 : $180;
  L75: do {
   switch ($t$0|0) {
   case 110:  {
    switch ($st$0$lcssa327|0) {
    case 0:  {
     $187 = HEAP32[$arg>>2]|0;
     HEAP32[$187>>2] = $cnt$1;
     $22 = $$lcssa328;$cnt$0 = $cnt$1;$l$0 = $37;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    case 1:  {
     $188 = HEAP32[$arg>>2]|0;
     HEAP32[$188>>2] = $cnt$1;
     $22 = $$lcssa328;$cnt$0 = $cnt$1;$l$0 = $37;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    case 2:  {
     $189 = ($cnt$1|0)<(0);
     $190 = $189 << 31 >> 31;
     $191 = HEAP32[$arg>>2]|0;
     $192 = $191;
     $193 = $192;
     HEAP32[$193>>2] = $cnt$1;
     $194 = (($192) + 4)|0;
     $195 = $194;
     HEAP32[$195>>2] = $190;
     $22 = $$lcssa328;$cnt$0 = $cnt$1;$l$0 = $37;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    case 3:  {
     $196 = $cnt$1&65535;
     $197 = HEAP32[$arg>>2]|0;
     HEAP16[$197>>1] = $196;
     $22 = $$lcssa328;$cnt$0 = $cnt$1;$l$0 = $37;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    case 4:  {
     $198 = $cnt$1&255;
     $199 = HEAP32[$arg>>2]|0;
     HEAP8[$199>>0] = $198;
     $22 = $$lcssa328;$cnt$0 = $cnt$1;$l$0 = $37;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    case 6:  {
     $200 = HEAP32[$arg>>2]|0;
     HEAP32[$200>>2] = $cnt$1;
     $22 = $$lcssa328;$cnt$0 = $cnt$1;$l$0 = $37;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    case 7:  {
     $201 = ($cnt$1|0)<(0);
     $202 = $201 << 31 >> 31;
     $203 = HEAP32[$arg>>2]|0;
     $204 = $203;
     $205 = $204;
     HEAP32[$205>>2] = $cnt$1;
     $206 = (($204) + 4)|0;
     $207 = $206;
     HEAP32[$207>>2] = $202;
     $22 = $$lcssa328;$cnt$0 = $cnt$1;$l$0 = $37;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    default: {
     $22 = $$lcssa328;$cnt$0 = $cnt$1;$l$0 = $37;$l10n$0 = $l10n$3;
     continue L1;
    }
    }
    break;
   }
   case 112:  {
    $208 = ($p$0>>>0)>(8);
    $209 = $208 ? $p$0 : 8;
    $210 = $fl$1$ | 8;
    $fl$3 = $210;$p$1 = $209;$t$1 = 120;
    label = 64;
    break;
   }
   case 88: case 120:  {
    $fl$3 = $fl$1$;$p$1 = $p$0;$t$1 = $t$0;
    label = 64;
    break;
   }
   case 111:  {
    $248 = $arg;
    $249 = $248;
    $250 = HEAP32[$249>>2]|0;
    $251 = (($248) + 4)|0;
    $252 = $251;
    $253 = HEAP32[$252>>2]|0;
    $254 = ($250|0)==(0);
    $255 = ($253|0)==(0);
    $256 = $254 & $255;
    if ($256) {
     $$0$lcssa$i = $1;
    } else {
     $$03$i33 = $1;$258 = $250;$262 = $253;
     while(1) {
      $257 = $258 & 7;
      $259 = $257 | 48;
      $260 = $259&255;
      $261 = ((($$03$i33)) + -1|0);
      HEAP8[$261>>0] = $260;
      $263 = (_bitshift64Lshr(($258|0),($262|0),3)|0);
      $264 = tempRet0;
      $265 = ($263|0)==(0);
      $266 = ($264|0)==(0);
      $267 = $265 & $266;
      if ($267) {
       $$0$lcssa$i = $261;
       break;
      } else {
       $$03$i33 = $261;$258 = $263;$262 = $264;
      }
     }
    }
    $268 = $fl$1$ & 8;
    $269 = ($268|0)==(0);
    if ($269) {
     $a$0 = $$0$lcssa$i;$fl$4 = $fl$1$;$p$2 = $p$0;$pl$1 = 0;$prefix$1 = 16558;
     label = 77;
    } else {
     $270 = $$0$lcssa$i;
     $271 = (($2) - ($270))|0;
     $272 = (($271) + 1)|0;
     $273 = ($p$0|0)<($272|0);
     $$p$0 = $273 ? $272 : $p$0;
     $a$0 = $$0$lcssa$i;$fl$4 = $fl$1$;$p$2 = $$p$0;$pl$1 = 0;$prefix$1 = 16558;
     label = 77;
    }
    break;
   }
   case 105: case 100:  {
    $274 = $arg;
    $275 = $274;
    $276 = HEAP32[$275>>2]|0;
    $277 = (($274) + 4)|0;
    $278 = $277;
    $279 = HEAP32[$278>>2]|0;
    $280 = ($279|0)<(0);
    if ($280) {
     $281 = (_i64Subtract(0,0,($276|0),($279|0))|0);
     $282 = tempRet0;
     $283 = $arg;
     $284 = $283;
     HEAP32[$284>>2] = $281;
     $285 = (($283) + 4)|0;
     $286 = $285;
     HEAP32[$286>>2] = $282;
     $291 = $281;$292 = $282;$pl$0 = 1;$prefix$0 = 16558;
     label = 76;
     break L75;
    }
    $287 = $fl$1$ & 2048;
    $288 = ($287|0)==(0);
    if ($288) {
     $289 = $fl$1$ & 1;
     $290 = ($289|0)==(0);
     $$ = $290 ? 16558 : (16560);
     $291 = $276;$292 = $279;$pl$0 = $289;$prefix$0 = $$;
     label = 76;
    } else {
     $291 = $276;$292 = $279;$pl$0 = 1;$prefix$0 = (16559);
     label = 76;
    }
    break;
   }
   case 117:  {
    $181 = $arg;
    $182 = $181;
    $183 = HEAP32[$182>>2]|0;
    $184 = (($181) + 4)|0;
    $185 = $184;
    $186 = HEAP32[$185>>2]|0;
    $291 = $183;$292 = $186;$pl$0 = 0;$prefix$0 = 16558;
    label = 76;
    break;
   }
   case 99:  {
    $312 = $arg;
    $313 = $312;
    $314 = HEAP32[$313>>2]|0;
    $315 = (($312) + 4)|0;
    $316 = $315;
    $317 = HEAP32[$316>>2]|0;
    $318 = $314&255;
    HEAP8[$3>>0] = $318;
    $a$2 = $3;$fl$6 = $180;$p$5 = 1;$pl$2 = 0;$prefix$2 = 16558;$z$2 = $1;
    break;
   }
   case 109:  {
    $319 = (___errno_location()|0);
    $320 = HEAP32[$319>>2]|0;
    $321 = (_strerror($320)|0);
    $a$1 = $321;
    label = 82;
    break;
   }
   case 115:  {
    $322 = HEAP32[$arg>>2]|0;
    $323 = ($322|0)!=(0|0);
    $324 = $323 ? $322 : 16568;
    $a$1 = $324;
    label = 82;
    break;
   }
   case 67:  {
    $331 = $arg;
    $332 = $331;
    $333 = HEAP32[$332>>2]|0;
    $334 = (($331) + 4)|0;
    $335 = $334;
    $336 = HEAP32[$335>>2]|0;
    HEAP32[$wc>>2] = $333;
    HEAP32[$4>>2] = 0;
    HEAP32[$arg>>2] = $wc;
    $p$4195 = -1;
    label = 86;
    break;
   }
   case 83:  {
    $337 = ($p$0|0)==(0);
    if ($337) {
     _pad($f,32,$w$1,0,$fl$1$);
     $i$0$lcssa197 = 0;
     label = 98;
    } else {
     $p$4195 = $p$0;
     label = 86;
    }
    break;
   }
   case 65: case 71: case 70: case 69: case 97: case 103: case 102: case 101:  {
    $364 = +HEAPF64[$arg>>3];
    HEAP32[$e2$i>>2] = 0;
    HEAPF64[tempDoublePtr>>3] = $364;$365 = HEAP32[tempDoublePtr>>2]|0;
    $366 = HEAP32[tempDoublePtr+4>>2]|0;
    $367 = ($366|0)<(0);
    if ($367) {
     $368 = -$364;
     $$07$i = $368;$pl$0$i = 1;$prefix$0$i = 16575;
    } else {
     $369 = $fl$1$ & 2048;
     $370 = ($369|0)==(0);
     if ($370) {
      $371 = $fl$1$ & 1;
      $372 = ($371|0)==(0);
      $$$i = $372 ? (16576) : (16581);
      $$07$i = $364;$pl$0$i = $371;$prefix$0$i = $$$i;
     } else {
      $$07$i = $364;$pl$0$i = 1;$prefix$0$i = (16578);
     }
    }
    HEAPF64[tempDoublePtr>>3] = $$07$i;$373 = HEAP32[tempDoublePtr>>2]|0;
    $374 = HEAP32[tempDoublePtr+4>>2]|0;
    $375 = $374 & 2146435072;
    $376 = ($375>>>0)<(2146435072);
    $377 = (0)<(0);
    $378 = ($375|0)==(2146435072);
    $379 = $378 & $377;
    $380 = $376 | $379;
    do {
     if ($380) {
      $396 = (+_frexpl($$07$i,$e2$i));
      $397 = $396 * 2.0;
      $398 = $397 != 0.0;
      if ($398) {
       $399 = HEAP32[$e2$i>>2]|0;
       $400 = (($399) + -1)|0;
       HEAP32[$e2$i>>2] = $400;
      }
      $401 = $t$0 | 32;
      $402 = ($401|0)==(97);
      if ($402) {
       $403 = $t$0 & 32;
       $404 = ($403|0)==(0);
       $405 = ((($prefix$0$i)) + 9|0);
       $prefix$0$$i = $404 ? $prefix$0$i : $405;
       $406 = $pl$0$i | 2;
       $407 = ($p$0>>>0)>(11);
       $408 = (12 - ($p$0))|0;
       $409 = ($408|0)==(0);
       $410 = $407 | $409;
       do {
        if ($410) {
         $$1$i = $397;
        } else {
         $re$169$i = $408;$round$068$i = 8.0;
         while(1) {
          $411 = (($re$169$i) + -1)|0;
          $412 = $round$068$i * 16.0;
          $413 = ($411|0)==(0);
          if ($413) {
           $$lcssa347 = $412;
           break;
          } else {
           $re$169$i = $411;$round$068$i = $412;
          }
         }
         $414 = HEAP8[$prefix$0$$i>>0]|0;
         $415 = ($414<<24>>24)==(45);
         if ($415) {
          $416 = -$397;
          $417 = $416 - $$lcssa347;
          $418 = $$lcssa347 + $417;
          $419 = -$418;
          $$1$i = $419;
          break;
         } else {
          $420 = $397 + $$lcssa347;
          $421 = $420 - $$lcssa347;
          $$1$i = $421;
          break;
         }
        }
       } while(0);
       $422 = HEAP32[$e2$i>>2]|0;
       $423 = ($422|0)<(0);
       $424 = (0 - ($422))|0;
       $425 = $423 ? $424 : $422;
       $426 = ($425|0)<(0);
       $427 = $426 << 31 >> 31;
       $428 = (_fmt_u($425,$427,$5)|0);
       $429 = ($428|0)==($5|0);
       if ($429) {
        HEAP8[$6>>0] = 48;
        $estr$0$i = $6;
       } else {
        $estr$0$i = $428;
       }
       $430 = $422 >> 31;
       $431 = $430 & 2;
       $432 = (($431) + 43)|0;
       $433 = $432&255;
       $434 = ((($estr$0$i)) + -1|0);
       HEAP8[$434>>0] = $433;
       $435 = (($t$0) + 15)|0;
       $436 = $435&255;
       $437 = ((($estr$0$i)) + -2|0);
       HEAP8[$437>>0] = $436;
       $notrhs$i = ($p$0|0)<(1);
       $438 = $fl$1$ & 8;
       $439 = ($438|0)==(0);
       $$2$i = $$1$i;$s$0$i = $buf$i;
       while(1) {
        $440 = (~~(($$2$i)));
        $441 = (16542 + ($440)|0);
        $442 = HEAP8[$441>>0]|0;
        $443 = $442&255;
        $444 = $443 | $403;
        $445 = $444&255;
        $446 = ((($s$0$i)) + 1|0);
        HEAP8[$s$0$i>>0] = $445;
        $447 = (+($440|0));
        $448 = $$2$i - $447;
        $449 = $448 * 16.0;
        $450 = $446;
        $451 = (($450) - ($7))|0;
        $452 = ($451|0)==(1);
        do {
         if ($452) {
          $notlhs$i = $449 == 0.0;
          $or$cond3$not$i = $notrhs$i & $notlhs$i;
          $or$cond$i = $439 & $or$cond3$not$i;
          if ($or$cond$i) {
           $s$1$i = $446;
           break;
          }
          $453 = ((($s$0$i)) + 2|0);
          HEAP8[$446>>0] = 46;
          $s$1$i = $453;
         } else {
          $s$1$i = $446;
         }
        } while(0);
        $454 = $449 != 0.0;
        if ($454) {
         $$2$i = $449;$s$0$i = $s$1$i;
        } else {
         $s$1$i$lcssa = $s$1$i;
         break;
        }
       }
       $455 = ($p$0|0)!=(0);
       $$pre182$i = $s$1$i$lcssa;
       $456 = (($10) + ($$pre182$i))|0;
       $457 = ($456|0)<($p$0|0);
       $or$cond239 = $455 & $457;
       $458 = $437;
       $459 = (($11) + ($p$0))|0;
       $460 = (($459) - ($458))|0;
       $461 = $437;
       $462 = (($9) - ($461))|0;
       $463 = (($462) + ($$pre182$i))|0;
       $l$0$i = $or$cond239 ? $460 : $463;
       $464 = (($l$0$i) + ($406))|0;
       _pad($f,32,$w$1,$464,$fl$1$);
       $465 = HEAP32[$f>>2]|0;
       $466 = $465 & 32;
       $467 = ($466|0)==(0);
       if ($467) {
        (___fwritex($prefix$0$$i,$406,$f)|0);
       }
       $468 = $fl$1$ ^ 65536;
       _pad($f,48,$w$1,$464,$468);
       $469 = (($$pre182$i) - ($7))|0;
       $470 = HEAP32[$f>>2]|0;
       $471 = $470 & 32;
       $472 = ($471|0)==(0);
       if ($472) {
        (___fwritex($buf$i,$469,$f)|0);
       }
       $473 = $437;
       $474 = (($8) - ($473))|0;
       $sum = (($469) + ($474))|0;
       $475 = (($l$0$i) - ($sum))|0;
       _pad($f,48,$475,0,0);
       $476 = HEAP32[$f>>2]|0;
       $477 = $476 & 32;
       $478 = ($477|0)==(0);
       if ($478) {
        (___fwritex($437,$474,$f)|0);
       }
       $479 = $fl$1$ ^ 8192;
       _pad($f,32,$w$1,$464,$479);
       $480 = ($464|0)<($w$1|0);
       $w$$i = $480 ? $w$1 : $464;
       $$0$i = $w$$i;
       break;
      }
      $481 = ($p$0|0)<(0);
      $$p$i = $481 ? 6 : $p$0;
      if ($398) {
       $482 = $397 * 268435456.0;
       $483 = HEAP32[$e2$i>>2]|0;
       $484 = (($483) + -28)|0;
       HEAP32[$e2$i>>2] = $484;
       $$3$i = $482;$485 = $484;
      } else {
       $$pre179$i = HEAP32[$e2$i>>2]|0;
       $$3$i = $397;$485 = $$pre179$i;
      }
      $486 = ($485|0)<(0);
      $$31$i = $486 ? $big$i : $12;
      $487 = $$31$i;
      $$4$i = $$3$i;$z$0$i = $$31$i;
      while(1) {
       $488 = (~~(($$4$i))>>>0);
       HEAP32[$z$0$i>>2] = $488;
       $489 = ((($z$0$i)) + 4|0);
       $490 = (+($488>>>0));
       $491 = $$4$i - $490;
       $492 = $491 * 1.0E+9;
       $493 = $492 != 0.0;
       if ($493) {
        $$4$i = $492;$z$0$i = $489;
       } else {
        $$lcssa331 = $489;
        break;
       }
      }
      $$pr$i = HEAP32[$e2$i>>2]|0;
      $494 = ($$pr$i|0)>(0);
      if ($494) {
       $495 = $$pr$i;$a$1147$i = $$31$i;$z$1146$i = $$lcssa331;
       while(1) {
        $496 = ($495|0)>(29);
        $497 = $496 ? 29 : $495;
        $d$0139$i = ((($z$1146$i)) + -4|0);
        $498 = ($d$0139$i>>>0)<($a$1147$i>>>0);
        do {
         if ($498) {
          $a$2$ph$i = $a$1147$i;
         } else {
          $carry$0140$i = 0;$d$0141$i = $d$0139$i;
          while(1) {
           $499 = HEAP32[$d$0141$i>>2]|0;
           $500 = (_bitshift64Shl(($499|0),0,($497|0))|0);
           $501 = tempRet0;
           $502 = (_i64Add(($500|0),($501|0),($carry$0140$i|0),0)|0);
           $503 = tempRet0;
           $504 = (___uremdi3(($502|0),($503|0),1000000000,0)|0);
           $505 = tempRet0;
           HEAP32[$d$0141$i>>2] = $504;
           $506 = (___udivdi3(($502|0),($503|0),1000000000,0)|0);
           $507 = tempRet0;
           $d$0$i = ((($d$0141$i)) + -4|0);
           $508 = ($d$0$i>>>0)<($a$1147$i>>>0);
           if ($508) {
            $$lcssa332 = $506;
            break;
           } else {
            $carry$0140$i = $506;$d$0141$i = $d$0$i;
           }
          }
          $509 = ($$lcssa332|0)==(0);
          if ($509) {
           $a$2$ph$i = $a$1147$i;
           break;
          }
          $510 = ((($a$1147$i)) + -4|0);
          HEAP32[$510>>2] = $$lcssa332;
          $a$2$ph$i = $510;
         }
        } while(0);
        $z$2$i = $z$1146$i;
        while(1) {
         $511 = ($z$2$i>>>0)>($a$2$ph$i>>>0);
         if (!($511)) {
          $z$2$i$lcssa = $z$2$i;
          break;
         }
         $512 = ((($z$2$i)) + -4|0);
         $513 = HEAP32[$512>>2]|0;
         $514 = ($513|0)==(0);
         if ($514) {
          $z$2$i = $512;
         } else {
          $z$2$i$lcssa = $z$2$i;
          break;
         }
        }
        $515 = HEAP32[$e2$i>>2]|0;
        $516 = (($515) - ($497))|0;
        HEAP32[$e2$i>>2] = $516;
        $517 = ($516|0)>(0);
        if ($517) {
         $495 = $516;$a$1147$i = $a$2$ph$i;$z$1146$i = $z$2$i$lcssa;
        } else {
         $$pr47$i = $516;$a$1$lcssa$i = $a$2$ph$i;$z$1$lcssa$i = $z$2$i$lcssa;
         break;
        }
       }
      } else {
       $$pr47$i = $$pr$i;$a$1$lcssa$i = $$31$i;$z$1$lcssa$i = $$lcssa331;
      }
      $518 = ($$pr47$i|0)<(0);
      if ($518) {
       $519 = (($$p$i) + 25)|0;
       $520 = (($519|0) / 9)&-1;
       $521 = (($520) + 1)|0;
       $522 = ($401|0)==(102);
       $524 = $$pr47$i;$a$3134$i = $a$1$lcssa$i;$z$3133$i = $z$1$lcssa$i;
       while(1) {
        $523 = (0 - ($524))|0;
        $525 = ($523|0)>(9);
        $526 = $525 ? 9 : $523;
        $527 = ($a$3134$i>>>0)<($z$3133$i>>>0);
        do {
         if ($527) {
          $531 = 1 << $526;
          $532 = (($531) + -1)|0;
          $533 = 1000000000 >>> $526;
          $carry3$0128$i = 0;$d$1127$i = $a$3134$i;
          while(1) {
           $534 = HEAP32[$d$1127$i>>2]|0;
           $535 = $534 & $532;
           $536 = $534 >>> $526;
           $537 = (($536) + ($carry3$0128$i))|0;
           HEAP32[$d$1127$i>>2] = $537;
           $538 = Math_imul($535, $533)|0;
           $539 = ((($d$1127$i)) + 4|0);
           $540 = ($539>>>0)<($z$3133$i>>>0);
           if ($540) {
            $carry3$0128$i = $538;$d$1127$i = $539;
           } else {
            $$lcssa334 = $538;
            break;
           }
          }
          $541 = HEAP32[$a$3134$i>>2]|0;
          $542 = ($541|0)==(0);
          $543 = ((($a$3134$i)) + 4|0);
          $$a$3$i = $542 ? $543 : $a$3134$i;
          $544 = ($$lcssa334|0)==(0);
          if ($544) {
           $$a$3186$i = $$a$3$i;$z$4$i = $z$3133$i;
           break;
          }
          $545 = ((($z$3133$i)) + 4|0);
          HEAP32[$z$3133$i>>2] = $$lcssa334;
          $$a$3186$i = $$a$3$i;$z$4$i = $545;
         } else {
          $528 = HEAP32[$a$3134$i>>2]|0;
          $529 = ($528|0)==(0);
          $530 = ((($a$3134$i)) + 4|0);
          $$a$3185$i = $529 ? $530 : $a$3134$i;
          $$a$3186$i = $$a$3185$i;$z$4$i = $z$3133$i;
         }
        } while(0);
        $546 = $522 ? $$31$i : $$a$3186$i;
        $547 = $z$4$i;
        $548 = $546;
        $549 = (($547) - ($548))|0;
        $550 = $549 >> 2;
        $551 = ($550|0)>($521|0);
        $552 = (($546) + ($521<<2)|0);
        $$z$4$i = $551 ? $552 : $z$4$i;
        $553 = HEAP32[$e2$i>>2]|0;
        $554 = (($553) + ($526))|0;
        HEAP32[$e2$i>>2] = $554;
        $555 = ($554|0)<(0);
        if ($555) {
         $524 = $554;$a$3134$i = $$a$3186$i;$z$3133$i = $$z$4$i;
        } else {
         $a$3$lcssa$i = $$a$3186$i;$z$3$lcssa$i = $$z$4$i;
         break;
        }
       }
      } else {
       $a$3$lcssa$i = $a$1$lcssa$i;$z$3$lcssa$i = $z$1$lcssa$i;
      }
      $556 = ($a$3$lcssa$i>>>0)<($z$3$lcssa$i>>>0);
      do {
       if ($556) {
        $557 = $a$3$lcssa$i;
        $558 = (($487) - ($557))|0;
        $559 = $558 >> 2;
        $560 = ($559*9)|0;
        $561 = HEAP32[$a$3$lcssa$i>>2]|0;
        $562 = ($561>>>0)<(10);
        if ($562) {
         $e$1$i = $560;
         break;
        } else {
         $e$0123$i = $560;$i$0122$i = 10;
        }
        while(1) {
         $563 = ($i$0122$i*10)|0;
         $564 = (($e$0123$i) + 1)|0;
         $565 = ($561>>>0)<($563>>>0);
         if ($565) {
          $e$1$i = $564;
          break;
         } else {
          $e$0123$i = $564;$i$0122$i = $563;
         }
        }
       } else {
        $e$1$i = 0;
       }
      } while(0);
      $566 = ($401|0)!=(102);
      $567 = $566 ? $e$1$i : 0;
      $568 = (($$p$i) - ($567))|0;
      $569 = ($401|0)==(103);
      $570 = ($$p$i|0)!=(0);
      $571 = $570 & $569;
      $$neg52$i = $571 << 31 >> 31;
      $572 = (($568) + ($$neg52$i))|0;
      $573 = $z$3$lcssa$i;
      $574 = (($573) - ($487))|0;
      $575 = $574 >> 2;
      $576 = ($575*9)|0;
      $577 = (($576) + -9)|0;
      $578 = ($572|0)<($577|0);
      if ($578) {
       $579 = (($572) + 9216)|0;
       $580 = (($579|0) / 9)&-1;
       $$sum$i = (($580) + -1023)|0;
       $581 = (($$31$i) + ($$sum$i<<2)|0);
       $582 = (($579|0) % 9)&-1;
       $j$0115$i = (($582) + 1)|0;
       $583 = ($j$0115$i|0)<(9);
       if ($583) {
        $i$1116$i = 10;$j$0117$i = $j$0115$i;
        while(1) {
         $584 = ($i$1116$i*10)|0;
         $j$0$i = (($j$0117$i) + 1)|0;
         $exitcond$i = ($j$0$i|0)==(9);
         if ($exitcond$i) {
          $i$1$lcssa$i = $584;
          break;
         } else {
          $i$1116$i = $584;$j$0117$i = $j$0$i;
         }
        }
       } else {
        $i$1$lcssa$i = 10;
       }
       $585 = HEAP32[$581>>2]|0;
       $586 = (($585>>>0) % ($i$1$lcssa$i>>>0))&-1;
       $587 = ($586|0)==(0);
       if ($587) {
        $$sum15$i = (($580) + -1022)|0;
        $588 = (($$31$i) + ($$sum15$i<<2)|0);
        $589 = ($588|0)==($z$3$lcssa$i|0);
        if ($589) {
         $a$7$i = $a$3$lcssa$i;$d$3$i = $581;$e$3$i = $e$1$i;
        } else {
         label = 163;
        }
       } else {
        label = 163;
       }
       do {
        if ((label|0) == 163) {
         label = 0;
         $590 = (($585>>>0) / ($i$1$lcssa$i>>>0))&-1;
         $591 = $590 & 1;
         $592 = ($591|0)==(0);
         $$20$i = $592 ? 9007199254740992.0 : 9007199254740994.0;
         $593 = (($i$1$lcssa$i|0) / 2)&-1;
         $594 = ($586>>>0)<($593>>>0);
         do {
          if ($594) {
           $small$0$i = 0.5;
          } else {
           $595 = ($586|0)==($593|0);
           if ($595) {
            $$sum16$i = (($580) + -1022)|0;
            $596 = (($$31$i) + ($$sum16$i<<2)|0);
            $597 = ($596|0)==($z$3$lcssa$i|0);
            if ($597) {
             $small$0$i = 1.0;
             break;
            }
           }
           $small$0$i = 1.5;
          }
         } while(0);
         $598 = ($pl$0$i|0)==(0);
         do {
          if ($598) {
           $round6$1$i = $$20$i;$small$1$i = $small$0$i;
          } else {
           $599 = HEAP8[$prefix$0$i>>0]|0;
           $600 = ($599<<24>>24)==(45);
           if (!($600)) {
            $round6$1$i = $$20$i;$small$1$i = $small$0$i;
            break;
           }
           $601 = -$$20$i;
           $602 = -$small$0$i;
           $round6$1$i = $601;$small$1$i = $602;
          }
         } while(0);
         $603 = (($585) - ($586))|0;
         HEAP32[$581>>2] = $603;
         $604 = $round6$1$i + $small$1$i;
         $605 = $604 != $round6$1$i;
         if (!($605)) {
          $a$7$i = $a$3$lcssa$i;$d$3$i = $581;$e$3$i = $e$1$i;
          break;
         }
         $606 = (($603) + ($i$1$lcssa$i))|0;
         HEAP32[$581>>2] = $606;
         $607 = ($606>>>0)>(999999999);
         if ($607) {
          $a$5109$i = $a$3$lcssa$i;$d$2108$i = $581;
          while(1) {
           $608 = ((($d$2108$i)) + -4|0);
           HEAP32[$d$2108$i>>2] = 0;
           $609 = ($608>>>0)<($a$5109$i>>>0);
           if ($609) {
            $610 = ((($a$5109$i)) + -4|0);
            HEAP32[$610>>2] = 0;
            $a$6$i = $610;
           } else {
            $a$6$i = $a$5109$i;
           }
           $611 = HEAP32[$608>>2]|0;
           $612 = (($611) + 1)|0;
           HEAP32[$608>>2] = $612;
           $613 = ($612>>>0)>(999999999);
           if ($613) {
            $a$5109$i = $a$6$i;$d$2108$i = $608;
           } else {
            $a$5$lcssa$i = $a$6$i;$d$2$lcssa$i = $608;
            break;
           }
          }
         } else {
          $a$5$lcssa$i = $a$3$lcssa$i;$d$2$lcssa$i = $581;
         }
         $614 = $a$5$lcssa$i;
         $615 = (($487) - ($614))|0;
         $616 = $615 >> 2;
         $617 = ($616*9)|0;
         $618 = HEAP32[$a$5$lcssa$i>>2]|0;
         $619 = ($618>>>0)<(10);
         if ($619) {
          $a$7$i = $a$5$lcssa$i;$d$3$i = $d$2$lcssa$i;$e$3$i = $617;
          break;
         } else {
          $e$2104$i = $617;$i$2103$i = 10;
         }
         while(1) {
          $620 = ($i$2103$i*10)|0;
          $621 = (($e$2104$i) + 1)|0;
          $622 = ($618>>>0)<($620>>>0);
          if ($622) {
           $a$7$i = $a$5$lcssa$i;$d$3$i = $d$2$lcssa$i;$e$3$i = $621;
           break;
          } else {
           $e$2104$i = $621;$i$2103$i = $620;
          }
         }
        }
       } while(0);
       $623 = ((($d$3$i)) + 4|0);
       $624 = ($z$3$lcssa$i>>>0)>($623>>>0);
       $$z$3$i = $624 ? $623 : $z$3$lcssa$i;
       $a$8$ph$i = $a$7$i;$e$4$ph$i = $e$3$i;$z$6$ph$i = $$z$3$i;
      } else {
       $a$8$ph$i = $a$3$lcssa$i;$e$4$ph$i = $e$1$i;$z$6$ph$i = $z$3$lcssa$i;
      }
      $625 = (0 - ($e$4$ph$i))|0;
      $z$6$i = $z$6$ph$i;
      while(1) {
       $626 = ($z$6$i>>>0)>($a$8$ph$i>>>0);
       if (!($626)) {
        $$lcssa159$i = 0;$z$6$i$lcssa = $z$6$i;
        break;
       }
       $627 = ((($z$6$i)) + -4|0);
       $628 = HEAP32[$627>>2]|0;
       $629 = ($628|0)==(0);
       if ($629) {
        $z$6$i = $627;
       } else {
        $$lcssa159$i = 1;$z$6$i$lcssa = $z$6$i;
        break;
       }
      }
      do {
       if ($569) {
        $630 = $570&1;
        $631 = $630 ^ 1;
        $$p$$i = (($631) + ($$p$i))|0;
        $632 = ($$p$$i|0)>($e$4$ph$i|0);
        $633 = ($e$4$ph$i|0)>(-5);
        $or$cond6$i = $632 & $633;
        if ($or$cond6$i) {
         $634 = (($t$0) + -1)|0;
         $$neg53$i = (($$p$$i) + -1)|0;
         $635 = (($$neg53$i) - ($e$4$ph$i))|0;
         $$013$i = $634;$$210$i = $635;
        } else {
         $636 = (($t$0) + -2)|0;
         $637 = (($$p$$i) + -1)|0;
         $$013$i = $636;$$210$i = $637;
        }
        $638 = $fl$1$ & 8;
        $639 = ($638|0)==(0);
        if (!($639)) {
         $$114$i = $$013$i;$$311$i = $$210$i;$$pre$phi184$iZ2D = $638;
         break;
        }
        do {
         if ($$lcssa159$i) {
          $640 = ((($z$6$i$lcssa)) + -4|0);
          $641 = HEAP32[$640>>2]|0;
          $642 = ($641|0)==(0);
          if ($642) {
           $j$2$i = 9;
           break;
          }
          $643 = (($641>>>0) % 10)&-1;
          $644 = ($643|0)==(0);
          if ($644) {
           $i$399$i = 10;$j$1100$i = 0;
          } else {
           $j$2$i = 0;
           break;
          }
          while(1) {
           $645 = ($i$399$i*10)|0;
           $646 = (($j$1100$i) + 1)|0;
           $647 = (($641>>>0) % ($645>>>0))&-1;
           $648 = ($647|0)==(0);
           if ($648) {
            $i$399$i = $645;$j$1100$i = $646;
           } else {
            $j$2$i = $646;
            break;
           }
          }
         } else {
          $j$2$i = 9;
         }
        } while(0);
        $649 = $$013$i | 32;
        $650 = ($649|0)==(102);
        $651 = $z$6$i$lcssa;
        $652 = (($651) - ($487))|0;
        $653 = $652 >> 2;
        $654 = ($653*9)|0;
        $655 = (($654) + -9)|0;
        if ($650) {
         $656 = (($655) - ($j$2$i))|0;
         $657 = ($656|0)<(0);
         $$21$i = $657 ? 0 : $656;
         $658 = ($$210$i|0)<($$21$i|0);
         $$210$$22$i = $658 ? $$210$i : $$21$i;
         $$114$i = $$013$i;$$311$i = $$210$$22$i;$$pre$phi184$iZ2D = 0;
         break;
        } else {
         $659 = (($655) + ($e$4$ph$i))|0;
         $660 = (($659) - ($j$2$i))|0;
         $661 = ($660|0)<(0);
         $$23$i = $661 ? 0 : $660;
         $662 = ($$210$i|0)<($$23$i|0);
         $$210$$24$i = $662 ? $$210$i : $$23$i;
         $$114$i = $$013$i;$$311$i = $$210$$24$i;$$pre$phi184$iZ2D = 0;
         break;
        }
       } else {
        $$pre183$i = $fl$1$ & 8;
        $$114$i = $t$0;$$311$i = $$p$i;$$pre$phi184$iZ2D = $$pre183$i;
       }
      } while(0);
      $663 = $$311$i | $$pre$phi184$iZ2D;
      $664 = ($663|0)!=(0);
      $665 = $664&1;
      $666 = $$114$i | 32;
      $667 = ($666|0)==(102);
      if ($667) {
       $668 = ($e$4$ph$i|0)>(0);
       $669 = $668 ? $e$4$ph$i : 0;
       $$pn$i = $669;$estr$2$i = 0;
      } else {
       $670 = ($e$4$ph$i|0)<(0);
       $671 = $670 ? $625 : $e$4$ph$i;
       $672 = ($671|0)<(0);
       $673 = $672 << 31 >> 31;
       $674 = (_fmt_u($671,$673,$5)|0);
       $675 = $674;
       $676 = (($8) - ($675))|0;
       $677 = ($676|0)<(2);
       if ($677) {
        $estr$193$i = $674;
        while(1) {
         $678 = ((($estr$193$i)) + -1|0);
         HEAP8[$678>>0] = 48;
         $679 = $678;
         $680 = (($8) - ($679))|0;
         $681 = ($680|0)<(2);
         if ($681) {
          $estr$193$i = $678;
         } else {
          $estr$1$lcssa$i = $678;
          break;
         }
        }
       } else {
        $estr$1$lcssa$i = $674;
       }
       $682 = $e$4$ph$i >> 31;
       $683 = $682 & 2;
       $684 = (($683) + 43)|0;
       $685 = $684&255;
       $686 = ((($estr$1$lcssa$i)) + -1|0);
       HEAP8[$686>>0] = $685;
       $687 = $$114$i&255;
       $688 = ((($estr$1$lcssa$i)) + -2|0);
       HEAP8[$688>>0] = $687;
       $689 = $688;
       $690 = (($8) - ($689))|0;
       $$pn$i = $690;$estr$2$i = $688;
      }
      $691 = (($pl$0$i) + 1)|0;
      $692 = (($691) + ($$311$i))|0;
      $l$1$i = (($692) + ($665))|0;
      $693 = (($l$1$i) + ($$pn$i))|0;
      _pad($f,32,$w$1,$693,$fl$1$);
      $694 = HEAP32[$f>>2]|0;
      $695 = $694 & 32;
      $696 = ($695|0)==(0);
      if ($696) {
       (___fwritex($prefix$0$i,$pl$0$i,$f)|0);
      }
      $697 = $fl$1$ ^ 65536;
      _pad($f,48,$w$1,$693,$697);
      do {
       if ($667) {
        $698 = ($a$8$ph$i>>>0)>($$31$i>>>0);
        $r$0$a$8$i = $698 ? $$31$i : $a$8$ph$i;
        $d$482$i = $r$0$a$8$i;
        while(1) {
         $699 = HEAP32[$d$482$i>>2]|0;
         $700 = (_fmt_u($699,0,$13)|0);
         $701 = ($d$482$i|0)==($r$0$a$8$i|0);
         do {
          if ($701) {
           $705 = ($700|0)==($13|0);
           if (!($705)) {
            $s7$1$i = $700;
            break;
           }
           HEAP8[$15>>0] = 48;
           $s7$1$i = $15;
          } else {
           $702 = ($700>>>0)>($buf$i>>>0);
           if ($702) {
            $s7$079$i = $700;
           } else {
            $s7$1$i = $700;
            break;
           }
           while(1) {
            $703 = ((($s7$079$i)) + -1|0);
            HEAP8[$703>>0] = 48;
            $704 = ($703>>>0)>($buf$i>>>0);
            if ($704) {
             $s7$079$i = $703;
            } else {
             $s7$1$i = $703;
             break;
            }
           }
          }
         } while(0);
         $706 = HEAP32[$f>>2]|0;
         $707 = $706 & 32;
         $708 = ($707|0)==(0);
         if ($708) {
          $709 = $s7$1$i;
          $710 = (($14) - ($709))|0;
          (___fwritex($s7$1$i,$710,$f)|0);
         }
         $711 = ((($d$482$i)) + 4|0);
         $712 = ($711>>>0)>($$31$i>>>0);
         if ($712) {
          $$lcssa344 = $711;
          break;
         } else {
          $d$482$i = $711;
         }
        }
        $713 = ($663|0)==(0);
        do {
         if (!($713)) {
          $714 = HEAP32[$f>>2]|0;
          $715 = $714 & 32;
          $716 = ($715|0)==(0);
          if (!($716)) {
           break;
          }
          (___fwritex(16610,1,$f)|0);
         }
        } while(0);
        $717 = ($$lcssa344>>>0)<($z$6$i$lcssa>>>0);
        $718 = ($$311$i|0)>(0);
        $719 = $718 & $717;
        if ($719) {
         $$41276$i = $$311$i;$d$575$i = $$lcssa344;
         while(1) {
          $720 = HEAP32[$d$575$i>>2]|0;
          $721 = (_fmt_u($720,0,$13)|0);
          $722 = ($721>>>0)>($buf$i>>>0);
          if ($722) {
           $s8$070$i = $721;
           while(1) {
            $723 = ((($s8$070$i)) + -1|0);
            HEAP8[$723>>0] = 48;
            $724 = ($723>>>0)>($buf$i>>>0);
            if ($724) {
             $s8$070$i = $723;
            } else {
             $s8$0$lcssa$i = $723;
             break;
            }
           }
          } else {
           $s8$0$lcssa$i = $721;
          }
          $725 = HEAP32[$f>>2]|0;
          $726 = $725 & 32;
          $727 = ($726|0)==(0);
          if ($727) {
           $728 = ($$41276$i|0)>(9);
           $729 = $728 ? 9 : $$41276$i;
           (___fwritex($s8$0$lcssa$i,$729,$f)|0);
          }
          $730 = ((($d$575$i)) + 4|0);
          $731 = (($$41276$i) + -9)|0;
          $732 = ($730>>>0)<($z$6$i$lcssa>>>0);
          $733 = ($$41276$i|0)>(9);
          $734 = $733 & $732;
          if ($734) {
           $$41276$i = $731;$d$575$i = $730;
          } else {
           $$412$lcssa$i = $731;
           break;
          }
         }
        } else {
         $$412$lcssa$i = $$311$i;
        }
        $735 = (($$412$lcssa$i) + 9)|0;
        _pad($f,48,$735,9,0);
       } else {
        $736 = ((($a$8$ph$i)) + 4|0);
        $z$6$$i = $$lcssa159$i ? $z$6$i$lcssa : $736;
        $737 = ($$311$i|0)>(-1);
        if ($737) {
         $738 = ($$pre$phi184$iZ2D|0)==(0);
         $$587$i = $$311$i;$d$686$i = $a$8$ph$i;
         while(1) {
          $739 = HEAP32[$d$686$i>>2]|0;
          $740 = (_fmt_u($739,0,$13)|0);
          $741 = ($740|0)==($13|0);
          if ($741) {
           HEAP8[$15>>0] = 48;
           $s9$0$i = $15;
          } else {
           $s9$0$i = $740;
          }
          $742 = ($d$686$i|0)==($a$8$ph$i|0);
          do {
           if ($742) {
            $746 = ((($s9$0$i)) + 1|0);
            $747 = HEAP32[$f>>2]|0;
            $748 = $747 & 32;
            $749 = ($748|0)==(0);
            if ($749) {
             (___fwritex($s9$0$i,1,$f)|0);
            }
            $750 = ($$587$i|0)<(1);
            $or$cond29$i = $738 & $750;
            if ($or$cond29$i) {
             $s9$2$i = $746;
             break;
            }
            $751 = HEAP32[$f>>2]|0;
            $752 = $751 & 32;
            $753 = ($752|0)==(0);
            if (!($753)) {
             $s9$2$i = $746;
             break;
            }
            (___fwritex(16610,1,$f)|0);
            $s9$2$i = $746;
           } else {
            $743 = ($s9$0$i>>>0)>($buf$i>>>0);
            if ($743) {
             $s9$183$i = $s9$0$i;
            } else {
             $s9$2$i = $s9$0$i;
             break;
            }
            while(1) {
             $744 = ((($s9$183$i)) + -1|0);
             HEAP8[$744>>0] = 48;
             $745 = ($744>>>0)>($buf$i>>>0);
             if ($745) {
              $s9$183$i = $744;
             } else {
              $s9$2$i = $744;
              break;
             }
            }
           }
          } while(0);
          $754 = $s9$2$i;
          $755 = (($14) - ($754))|0;
          $756 = HEAP32[$f>>2]|0;
          $757 = $756 & 32;
          $758 = ($757|0)==(0);
          if ($758) {
           $759 = ($$587$i|0)>($755|0);
           $760 = $759 ? $755 : $$587$i;
           (___fwritex($s9$2$i,$760,$f)|0);
          }
          $761 = (($$587$i) - ($755))|0;
          $762 = ((($d$686$i)) + 4|0);
          $763 = ($762>>>0)<($z$6$$i>>>0);
          $764 = ($761|0)>(-1);
          $765 = $763 & $764;
          if ($765) {
           $$587$i = $761;$d$686$i = $762;
          } else {
           $$5$lcssa$i = $761;
           break;
          }
         }
        } else {
         $$5$lcssa$i = $$311$i;
        }
        $766 = (($$5$lcssa$i) + 18)|0;
        _pad($f,48,$766,18,0);
        $767 = HEAP32[$f>>2]|0;
        $768 = $767 & 32;
        $769 = ($768|0)==(0);
        if (!($769)) {
         break;
        }
        $770 = $estr$2$i;
        $771 = (($8) - ($770))|0;
        (___fwritex($estr$2$i,$771,$f)|0);
       }
      } while(0);
      $772 = $fl$1$ ^ 8192;
      _pad($f,32,$w$1,$693,$772);
      $773 = ($693|0)<($w$1|0);
      $w$30$i = $773 ? $w$1 : $693;
      $$0$i = $w$30$i;
     } else {
      $381 = $t$0 & 32;
      $382 = ($381|0)!=(0);
      $383 = $382 ? 16594 : 16598;
      $384 = ($$07$i != $$07$i) | (0.0 != 0.0);
      $385 = $382 ? 16602 : 16606;
      $pl$1$i = $384 ? 0 : $pl$0$i;
      $s1$0$i = $384 ? $385 : $383;
      $386 = (($pl$1$i) + 3)|0;
      _pad($f,32,$w$1,$386,$180);
      $387 = HEAP32[$f>>2]|0;
      $388 = $387 & 32;
      $389 = ($388|0)==(0);
      if ($389) {
       (___fwritex($prefix$0$i,$pl$1$i,$f)|0);
       $$pre$i = HEAP32[$f>>2]|0;
       $391 = $$pre$i;
      } else {
       $391 = $387;
      }
      $390 = $391 & 32;
      $392 = ($390|0)==(0);
      if ($392) {
       (___fwritex($s1$0$i,3,$f)|0);
      }
      $393 = $fl$1$ ^ 8192;
      _pad($f,32,$w$1,$386,$393);
      $394 = ($386|0)<($w$1|0);
      $395 = $394 ? $w$1 : $386;
      $$0$i = $395;
     }
    } while(0);
    $22 = $$lcssa328;$cnt$0 = $cnt$1;$l$0 = $$0$i;$l10n$0 = $l10n$3;
    continue L1;
    break;
   }
   default: {
    $a$2 = $22;$fl$6 = $fl$1$;$p$5 = $p$0;$pl$2 = 0;$prefix$2 = 16558;$z$2 = $1;
   }
   }
  } while(0);
  L313: do {
   if ((label|0) == 64) {
    label = 0;
    $211 = $arg;
    $212 = $211;
    $213 = HEAP32[$212>>2]|0;
    $214 = (($211) + 4)|0;
    $215 = $214;
    $216 = HEAP32[$215>>2]|0;
    $217 = $t$1 & 32;
    $218 = ($213|0)==(0);
    $219 = ($216|0)==(0);
    $220 = $218 & $219;
    if ($220) {
     $a$0 = $1;$fl$4 = $fl$3;$p$2 = $p$1;$pl$1 = 0;$prefix$1 = 16558;
     label = 77;
    } else {
     $$012$i = $1;$222 = $213;$229 = $216;
     while(1) {
      $221 = $222 & 15;
      $223 = (16542 + ($221)|0);
      $224 = HEAP8[$223>>0]|0;
      $225 = $224&255;
      $226 = $225 | $217;
      $227 = $226&255;
      $228 = ((($$012$i)) + -1|0);
      HEAP8[$228>>0] = $227;
      $230 = (_bitshift64Lshr(($222|0),($229|0),4)|0);
      $231 = tempRet0;
      $232 = ($230|0)==(0);
      $233 = ($231|0)==(0);
      $234 = $232 & $233;
      if ($234) {
       $$lcssa349 = $228;
       break;
      } else {
       $$012$i = $228;$222 = $230;$229 = $231;
      }
     }
     $235 = $arg;
     $236 = $235;
     $237 = HEAP32[$236>>2]|0;
     $238 = (($235) + 4)|0;
     $239 = $238;
     $240 = HEAP32[$239>>2]|0;
     $241 = ($237|0)==(0);
     $242 = ($240|0)==(0);
     $243 = $241 & $242;
     $244 = $fl$3 & 8;
     $245 = ($244|0)==(0);
     $or$cond17 = $245 | $243;
     if ($or$cond17) {
      $a$0 = $$lcssa349;$fl$4 = $fl$3;$p$2 = $p$1;$pl$1 = 0;$prefix$1 = 16558;
      label = 77;
     } else {
      $246 = $t$1 >> 4;
      $247 = (16558 + ($246)|0);
      $a$0 = $$lcssa349;$fl$4 = $fl$3;$p$2 = $p$1;$pl$1 = 2;$prefix$1 = $247;
      label = 77;
     }
    }
   }
   else if ((label|0) == 76) {
    label = 0;
    $293 = (_fmt_u($291,$292,$1)|0);
    $a$0 = $293;$fl$4 = $fl$1$;$p$2 = $p$0;$pl$1 = $pl$0;$prefix$1 = $prefix$0;
    label = 77;
   }
   else if ((label|0) == 82) {
    label = 0;
    $325 = (_memchr($a$1,0,$p$0)|0);
    $326 = ($325|0)==(0|0);
    $327 = $325;
    $328 = $a$1;
    $329 = (($327) - ($328))|0;
    $330 = (($a$1) + ($p$0)|0);
    $z$1 = $326 ? $330 : $325;
    $p$3 = $326 ? $p$0 : $329;
    $a$2 = $a$1;$fl$6 = $180;$p$5 = $p$3;$pl$2 = 0;$prefix$2 = 16558;$z$2 = $z$1;
   }
   else if ((label|0) == 86) {
    label = 0;
    $338 = HEAP32[$arg>>2]|0;
    $i$0108 = 0;$l$1107 = 0;$ws$0109 = $338;
    while(1) {
     $339 = HEAP32[$ws$0109>>2]|0;
     $340 = ($339|0)==(0);
     if ($340) {
      $i$0$lcssa = $i$0108;$l$2 = $l$1107;
      break;
     }
     $341 = (_wctomb($mb,$339)|0);
     $342 = ($341|0)<(0);
     $343 = (($p$4195) - ($i$0108))|0;
     $344 = ($341>>>0)>($343>>>0);
     $or$cond20 = $342 | $344;
     if ($or$cond20) {
      $i$0$lcssa = $i$0108;$l$2 = $341;
      break;
     }
     $345 = ((($ws$0109)) + 4|0);
     $346 = (($341) + ($i$0108))|0;
     $347 = ($p$4195>>>0)>($346>>>0);
     if ($347) {
      $i$0108 = $346;$l$1107 = $341;$ws$0109 = $345;
     } else {
      $i$0$lcssa = $346;$l$2 = $341;
      break;
     }
    }
    $348 = ($l$2|0)<(0);
    if ($348) {
     $$0 = -1;
     break L1;
    }
    _pad($f,32,$w$1,$i$0$lcssa,$fl$1$);
    $349 = ($i$0$lcssa|0)==(0);
    if ($349) {
     $i$0$lcssa197 = 0;
     label = 98;
    } else {
     $350 = HEAP32[$arg>>2]|0;
     $i$1119 = 0;$ws$1120 = $350;
     while(1) {
      $351 = HEAP32[$ws$1120>>2]|0;
      $352 = ($351|0)==(0);
      if ($352) {
       $i$0$lcssa197 = $i$0$lcssa;
       label = 98;
       break L313;
      }
      $353 = ((($ws$1120)) + 4|0);
      $354 = (_wctomb($mb,$351)|0);
      $355 = (($354) + ($i$1119))|0;
      $356 = ($355|0)>($i$0$lcssa|0);
      if ($356) {
       $i$0$lcssa197 = $i$0$lcssa;
       label = 98;
       break L313;
      }
      $357 = HEAP32[$f>>2]|0;
      $358 = $357 & 32;
      $359 = ($358|0)==(0);
      if ($359) {
       (___fwritex($mb,$354,$f)|0);
      }
      $360 = ($355>>>0)<($i$0$lcssa>>>0);
      if ($360) {
       $i$1119 = $355;$ws$1120 = $353;
      } else {
       $i$0$lcssa197 = $i$0$lcssa;
       label = 98;
       break;
      }
     }
    }
   }
  } while(0);
  if ((label|0) == 98) {
   label = 0;
   $361 = $fl$1$ ^ 8192;
   _pad($f,32,$w$1,$i$0$lcssa197,$361);
   $362 = ($w$1|0)>($i$0$lcssa197|0);
   $363 = $362 ? $w$1 : $i$0$lcssa197;
   $22 = $$lcssa328;$cnt$0 = $cnt$1;$l$0 = $363;$l10n$0 = $l10n$3;
   continue;
  }
  if ((label|0) == 77) {
   label = 0;
   $294 = ($p$2|0)>(-1);
   $295 = $fl$4 & -65537;
   $$fl$4 = $294 ? $295 : $fl$4;
   $296 = $arg;
   $297 = $296;
   $298 = HEAP32[$297>>2]|0;
   $299 = (($296) + 4)|0;
   $300 = $299;
   $301 = HEAP32[$300>>2]|0;
   $302 = ($298|0)!=(0);
   $303 = ($301|0)!=(0);
   $304 = $302 | $303;
   $305 = ($p$2|0)!=(0);
   $or$cond = $305 | $304;
   if ($or$cond) {
    $306 = $a$0;
    $307 = (($2) - ($306))|0;
    $308 = $304&1;
    $309 = $308 ^ 1;
    $310 = (($309) + ($307))|0;
    $311 = ($p$2|0)>($310|0);
    $p$2$ = $311 ? $p$2 : $310;
    $a$2 = $a$0;$fl$6 = $$fl$4;$p$5 = $p$2$;$pl$2 = $pl$1;$prefix$2 = $prefix$1;$z$2 = $1;
   } else {
    $a$2 = $1;$fl$6 = $$fl$4;$p$5 = 0;$pl$2 = $pl$1;$prefix$2 = $prefix$1;$z$2 = $1;
   }
  }
  $774 = $z$2;
  $775 = $a$2;
  $776 = (($774) - ($775))|0;
  $777 = ($p$5|0)<($776|0);
  $$p$5 = $777 ? $776 : $p$5;
  $778 = (($pl$2) + ($$p$5))|0;
  $779 = ($w$1|0)<($778|0);
  $w$2 = $779 ? $778 : $w$1;
  _pad($f,32,$w$2,$778,$fl$6);
  $780 = HEAP32[$f>>2]|0;
  $781 = $780 & 32;
  $782 = ($781|0)==(0);
  if ($782) {
   (___fwritex($prefix$2,$pl$2,$f)|0);
  }
  $783 = $fl$6 ^ 65536;
  _pad($f,48,$w$2,$778,$783);
  _pad($f,48,$$p$5,$776,0);
  $784 = HEAP32[$f>>2]|0;
  $785 = $784 & 32;
  $786 = ($785|0)==(0);
  if ($786) {
   (___fwritex($a$2,$776,$f)|0);
  }
  $787 = $fl$6 ^ 8192;
  _pad($f,32,$w$2,$778,$787);
  $22 = $$lcssa328;$cnt$0 = $cnt$1;$l$0 = $w$2;$l10n$0 = $l10n$3;
 }
 L348: do {
  if ((label|0) == 245) {
   $788 = ($f|0)==(0|0);
   if ($788) {
    $789 = ($l10n$0$lcssa|0)==(0);
    if ($789) {
     $$0 = 0;
    } else {
     $i$295 = 1;
     while(1) {
      $790 = (($nl_type) + ($i$295<<2)|0);
      $791 = HEAP32[$790>>2]|0;
      $792 = ($791|0)==(0);
      if ($792) {
       $i$295$lcssa = $i$295;
       break;
      }
      $794 = (($nl_arg) + ($i$295<<3)|0);
      _pop_arg($794,$791,$ap);
      $795 = (($i$295) + 1)|0;
      $796 = ($795|0)<(10);
      if ($796) {
       $i$295 = $795;
      } else {
       $$0 = 1;
       break L348;
      }
     }
     $793 = ($i$295$lcssa|0)<(10);
     if ($793) {
      $i$393 = $i$295$lcssa;
      while(1) {
       $799 = (($nl_type) + ($i$393<<2)|0);
       $800 = HEAP32[$799>>2]|0;
       $801 = ($800|0)==(0);
       $797 = (($i$393) + 1)|0;
       if (!($801)) {
        $$0 = -1;
        break L348;
       }
       $798 = ($797|0)<(10);
       if ($798) {
        $i$393 = $797;
       } else {
        $$0 = 1;
        break;
       }
      }
     } else {
      $$0 = 1;
     }
    }
   } else {
    $$0 = $cnt$1$lcssa;
   }
  }
 } while(0);
 STACKTOP = sp;return ($$0|0);
}
function _cleanup($p) {
 $p = $p|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ((($p)) + 68|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==(0);
 if ($2) {
  ___unlockfile($p);
 }
 return;
}
function _pop_arg($arg,$type,$ap) {
 $arg = $arg|0;
 $type = $type|0;
 $ap = $ap|0;
 var $$mask = 0, $$mask1 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0.0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0.0;
 var $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0;
 var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $arglist_current = 0, $arglist_current11 = 0, $arglist_current14 = 0, $arglist_current17 = 0;
 var $arglist_current2 = 0, $arglist_current20 = 0, $arglist_current23 = 0, $arglist_current26 = 0, $arglist_current5 = 0, $arglist_current8 = 0, $arglist_next = 0, $arglist_next12 = 0, $arglist_next15 = 0, $arglist_next18 = 0, $arglist_next21 = 0, $arglist_next24 = 0, $arglist_next27 = 0, $arglist_next3 = 0, $arglist_next6 = 0, $arglist_next9 = 0, $expanded = 0, $expanded28 = 0, $expanded30 = 0, $expanded31 = 0;
 var $expanded32 = 0, $expanded34 = 0, $expanded35 = 0, $expanded37 = 0, $expanded38 = 0, $expanded39 = 0, $expanded41 = 0, $expanded42 = 0, $expanded44 = 0, $expanded45 = 0, $expanded46 = 0, $expanded48 = 0, $expanded49 = 0, $expanded51 = 0, $expanded52 = 0, $expanded53 = 0, $expanded55 = 0, $expanded56 = 0, $expanded58 = 0, $expanded59 = 0;
 var $expanded60 = 0, $expanded62 = 0, $expanded63 = 0, $expanded65 = 0, $expanded66 = 0, $expanded67 = 0, $expanded69 = 0, $expanded70 = 0, $expanded72 = 0, $expanded73 = 0, $expanded74 = 0, $expanded76 = 0, $expanded77 = 0, $expanded79 = 0, $expanded80 = 0, $expanded81 = 0, $expanded83 = 0, $expanded84 = 0, $expanded86 = 0, $expanded87 = 0;
 var $expanded88 = 0, $expanded90 = 0, $expanded91 = 0, $expanded93 = 0, $expanded94 = 0, $expanded95 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($type>>>0)>(20);
 L1: do {
  if (!($0)) {
   do {
    switch ($type|0) {
    case 9:  {
     $arglist_current = HEAP32[$ap>>2]|0;
     $1 = $arglist_current;
     $2 = ((0) + 4|0);
     $expanded28 = $2;
     $expanded = (($expanded28) - 1)|0;
     $3 = (($1) + ($expanded))|0;
     $4 = ((0) + 4|0);
     $expanded32 = $4;
     $expanded31 = (($expanded32) - 1)|0;
     $expanded30 = $expanded31 ^ -1;
     $5 = $3 & $expanded30;
     $6 = $5;
     $7 = HEAP32[$6>>2]|0;
     $arglist_next = ((($6)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next;
     HEAP32[$arg>>2] = $7;
     break L1;
     break;
    }
    case 10:  {
     $arglist_current2 = HEAP32[$ap>>2]|0;
     $8 = $arglist_current2;
     $9 = ((0) + 4|0);
     $expanded35 = $9;
     $expanded34 = (($expanded35) - 1)|0;
     $10 = (($8) + ($expanded34))|0;
     $11 = ((0) + 4|0);
     $expanded39 = $11;
     $expanded38 = (($expanded39) - 1)|0;
     $expanded37 = $expanded38 ^ -1;
     $12 = $10 & $expanded37;
     $13 = $12;
     $14 = HEAP32[$13>>2]|0;
     $arglist_next3 = ((($13)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next3;
     $15 = ($14|0)<(0);
     $16 = $15 << 31 >> 31;
     $17 = $arg;
     $18 = $17;
     HEAP32[$18>>2] = $14;
     $19 = (($17) + 4)|0;
     $20 = $19;
     HEAP32[$20>>2] = $16;
     break L1;
     break;
    }
    case 11:  {
     $arglist_current5 = HEAP32[$ap>>2]|0;
     $21 = $arglist_current5;
     $22 = ((0) + 4|0);
     $expanded42 = $22;
     $expanded41 = (($expanded42) - 1)|0;
     $23 = (($21) + ($expanded41))|0;
     $24 = ((0) + 4|0);
     $expanded46 = $24;
     $expanded45 = (($expanded46) - 1)|0;
     $expanded44 = $expanded45 ^ -1;
     $25 = $23 & $expanded44;
     $26 = $25;
     $27 = HEAP32[$26>>2]|0;
     $arglist_next6 = ((($26)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next6;
     $28 = $arg;
     $29 = $28;
     HEAP32[$29>>2] = $27;
     $30 = (($28) + 4)|0;
     $31 = $30;
     HEAP32[$31>>2] = 0;
     break L1;
     break;
    }
    case 12:  {
     $arglist_current8 = HEAP32[$ap>>2]|0;
     $32 = $arglist_current8;
     $33 = ((0) + 8|0);
     $expanded49 = $33;
     $expanded48 = (($expanded49) - 1)|0;
     $34 = (($32) + ($expanded48))|0;
     $35 = ((0) + 8|0);
     $expanded53 = $35;
     $expanded52 = (($expanded53) - 1)|0;
     $expanded51 = $expanded52 ^ -1;
     $36 = $34 & $expanded51;
     $37 = $36;
     $38 = $37;
     $39 = $38;
     $40 = HEAP32[$39>>2]|0;
     $41 = (($38) + 4)|0;
     $42 = $41;
     $43 = HEAP32[$42>>2]|0;
     $arglist_next9 = ((($37)) + 8|0);
     HEAP32[$ap>>2] = $arglist_next9;
     $44 = $arg;
     $45 = $44;
     HEAP32[$45>>2] = $40;
     $46 = (($44) + 4)|0;
     $47 = $46;
     HEAP32[$47>>2] = $43;
     break L1;
     break;
    }
    case 13:  {
     $arglist_current11 = HEAP32[$ap>>2]|0;
     $48 = $arglist_current11;
     $49 = ((0) + 4|0);
     $expanded56 = $49;
     $expanded55 = (($expanded56) - 1)|0;
     $50 = (($48) + ($expanded55))|0;
     $51 = ((0) + 4|0);
     $expanded60 = $51;
     $expanded59 = (($expanded60) - 1)|0;
     $expanded58 = $expanded59 ^ -1;
     $52 = $50 & $expanded58;
     $53 = $52;
     $54 = HEAP32[$53>>2]|0;
     $arglist_next12 = ((($53)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next12;
     $55 = $54&65535;
     $56 = $55 << 16 >> 16;
     $57 = ($56|0)<(0);
     $58 = $57 << 31 >> 31;
     $59 = $arg;
     $60 = $59;
     HEAP32[$60>>2] = $56;
     $61 = (($59) + 4)|0;
     $62 = $61;
     HEAP32[$62>>2] = $58;
     break L1;
     break;
    }
    case 14:  {
     $arglist_current14 = HEAP32[$ap>>2]|0;
     $63 = $arglist_current14;
     $64 = ((0) + 4|0);
     $expanded63 = $64;
     $expanded62 = (($expanded63) - 1)|0;
     $65 = (($63) + ($expanded62))|0;
     $66 = ((0) + 4|0);
     $expanded67 = $66;
     $expanded66 = (($expanded67) - 1)|0;
     $expanded65 = $expanded66 ^ -1;
     $67 = $65 & $expanded65;
     $68 = $67;
     $69 = HEAP32[$68>>2]|0;
     $arglist_next15 = ((($68)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next15;
     $$mask1 = $69 & 65535;
     $70 = $arg;
     $71 = $70;
     HEAP32[$71>>2] = $$mask1;
     $72 = (($70) + 4)|0;
     $73 = $72;
     HEAP32[$73>>2] = 0;
     break L1;
     break;
    }
    case 15:  {
     $arglist_current17 = HEAP32[$ap>>2]|0;
     $74 = $arglist_current17;
     $75 = ((0) + 4|0);
     $expanded70 = $75;
     $expanded69 = (($expanded70) - 1)|0;
     $76 = (($74) + ($expanded69))|0;
     $77 = ((0) + 4|0);
     $expanded74 = $77;
     $expanded73 = (($expanded74) - 1)|0;
     $expanded72 = $expanded73 ^ -1;
     $78 = $76 & $expanded72;
     $79 = $78;
     $80 = HEAP32[$79>>2]|0;
     $arglist_next18 = ((($79)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next18;
     $81 = $80&255;
     $82 = $81 << 24 >> 24;
     $83 = ($82|0)<(0);
     $84 = $83 << 31 >> 31;
     $85 = $arg;
     $86 = $85;
     HEAP32[$86>>2] = $82;
     $87 = (($85) + 4)|0;
     $88 = $87;
     HEAP32[$88>>2] = $84;
     break L1;
     break;
    }
    case 16:  {
     $arglist_current20 = HEAP32[$ap>>2]|0;
     $89 = $arglist_current20;
     $90 = ((0) + 4|0);
     $expanded77 = $90;
     $expanded76 = (($expanded77) - 1)|0;
     $91 = (($89) + ($expanded76))|0;
     $92 = ((0) + 4|0);
     $expanded81 = $92;
     $expanded80 = (($expanded81) - 1)|0;
     $expanded79 = $expanded80 ^ -1;
     $93 = $91 & $expanded79;
     $94 = $93;
     $95 = HEAP32[$94>>2]|0;
     $arglist_next21 = ((($94)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next21;
     $$mask = $95 & 255;
     $96 = $arg;
     $97 = $96;
     HEAP32[$97>>2] = $$mask;
     $98 = (($96) + 4)|0;
     $99 = $98;
     HEAP32[$99>>2] = 0;
     break L1;
     break;
    }
    case 17:  {
     $arglist_current23 = HEAP32[$ap>>2]|0;
     $100 = $arglist_current23;
     $101 = ((0) + 8|0);
     $expanded84 = $101;
     $expanded83 = (($expanded84) - 1)|0;
     $102 = (($100) + ($expanded83))|0;
     $103 = ((0) + 8|0);
     $expanded88 = $103;
     $expanded87 = (($expanded88) - 1)|0;
     $expanded86 = $expanded87 ^ -1;
     $104 = $102 & $expanded86;
     $105 = $104;
     $106 = +HEAPF64[$105>>3];
     $arglist_next24 = ((($105)) + 8|0);
     HEAP32[$ap>>2] = $arglist_next24;
     HEAPF64[$arg>>3] = $106;
     break L1;
     break;
    }
    case 18:  {
     $arglist_current26 = HEAP32[$ap>>2]|0;
     $107 = $arglist_current26;
     $108 = ((0) + 8|0);
     $expanded91 = $108;
     $expanded90 = (($expanded91) - 1)|0;
     $109 = (($107) + ($expanded90))|0;
     $110 = ((0) + 8|0);
     $expanded95 = $110;
     $expanded94 = (($expanded95) - 1)|0;
     $expanded93 = $expanded94 ^ -1;
     $111 = $109 & $expanded93;
     $112 = $111;
     $113 = +HEAPF64[$112>>3];
     $arglist_next27 = ((($112)) + 8|0);
     HEAP32[$ap>>2] = $arglist_next27;
     HEAPF64[$arg>>3] = $113;
     break L1;
     break;
    }
    default: {
     break L1;
    }
    }
   } while(0);
  }
 } while(0);
 return;
}
function _fmt_u($0,$1,$s) {
 $0 = $0|0;
 $1 = $1|0;
 $s = $s|0;
 var $$0$lcssa = 0, $$01$lcssa$off0 = 0, $$05 = 0, $$1$lcssa = 0, $$12 = 0, $$lcssa20 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $y$03 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $2 = ($1>>>0)>(0);
 $3 = ($0>>>0)>(4294967295);
 $4 = ($1|0)==(0);
 $5 = $4 & $3;
 $6 = $2 | $5;
 if ($6) {
  $$05 = $s;$7 = $0;$8 = $1;
  while(1) {
   $9 = (___uremdi3(($7|0),($8|0),10,0)|0);
   $10 = tempRet0;
   $11 = $9 | 48;
   $12 = $11&255;
   $13 = ((($$05)) + -1|0);
   HEAP8[$13>>0] = $12;
   $14 = (___udivdi3(($7|0),($8|0),10,0)|0);
   $15 = tempRet0;
   $16 = ($8>>>0)>(9);
   $17 = ($7>>>0)>(4294967295);
   $18 = ($8|0)==(9);
   $19 = $18 & $17;
   $20 = $16 | $19;
   if ($20) {
    $$05 = $13;$7 = $14;$8 = $15;
   } else {
    $$lcssa20 = $13;$28 = $14;$29 = $15;
    break;
   }
  }
  $$0$lcssa = $$lcssa20;$$01$lcssa$off0 = $28;
 } else {
  $$0$lcssa = $s;$$01$lcssa$off0 = $0;
 }
 $21 = ($$01$lcssa$off0|0)==(0);
 if ($21) {
  $$1$lcssa = $$0$lcssa;
 } else {
  $$12 = $$0$lcssa;$y$03 = $$01$lcssa$off0;
  while(1) {
   $22 = (($y$03>>>0) % 10)&-1;
   $23 = $22 | 48;
   $24 = $23&255;
   $25 = ((($$12)) + -1|0);
   HEAP8[$25>>0] = $24;
   $26 = (($y$03>>>0) / 10)&-1;
   $27 = ($y$03>>>0)<(10);
   if ($27) {
    $$1$lcssa = $25;
    break;
   } else {
    $$12 = $25;$y$03 = $26;
   }
  }
 }
 return ($$1$lcssa|0);
}
function _pad($f,$c,$w,$l,$fl) {
 $f = $f|0;
 $c = $c|0;
 $w = $w|0;
 $l = $l|0;
 $fl = $fl|0;
 var $$0$lcssa6 = 0, $$02 = 0, $$pre = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $or$cond = 0, $pad = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 256|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $pad = sp;
 $0 = $fl & 73728;
 $1 = ($0|0)==(0);
 $2 = ($w|0)>($l|0);
 $or$cond = $2 & $1;
 do {
  if ($or$cond) {
   $3 = (($w) - ($l))|0;
   $4 = ($3>>>0)>(256);
   $5 = $4 ? 256 : $3;
   _memset(($pad|0),($c|0),($5|0))|0;
   $6 = ($3>>>0)>(255);
   $7 = HEAP32[$f>>2]|0;
   $8 = $7 & 32;
   $9 = ($8|0)==(0);
   if ($6) {
    $10 = (($w) - ($l))|0;
    $$02 = $3;$17 = $7;$18 = $9;
    while(1) {
     if ($18) {
      (___fwritex($pad,256,$f)|0);
      $$pre = HEAP32[$f>>2]|0;
      $14 = $$pre;
     } else {
      $14 = $17;
     }
     $11 = (($$02) + -256)|0;
     $12 = ($11>>>0)>(255);
     $13 = $14 & 32;
     $15 = ($13|0)==(0);
     if ($12) {
      $$02 = $11;$17 = $14;$18 = $15;
     } else {
      break;
     }
    }
    $16 = $10 & 255;
    if ($15) {
     $$0$lcssa6 = $16;
    } else {
     break;
    }
   } else {
    if ($9) {
     $$0$lcssa6 = $3;
    } else {
     break;
    }
   }
   (___fwritex($pad,$$0$lcssa6,$f)|0);
  }
 } while(0);
 STACKTOP = sp;return;
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$3$i = 0, $$lcssa = 0, $$lcssa211 = 0, $$lcssa215 = 0, $$lcssa216 = 0, $$lcssa217 = 0, $$lcssa219 = 0, $$lcssa222 = 0, $$lcssa224 = 0, $$lcssa226 = 0, $$lcssa228 = 0, $$lcssa230 = 0, $$lcssa232 = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i22$i = 0, $$pre$i25 = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i23$iZ2D = 0;
 var $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre105 = 0, $$pre106 = 0, $$pre14$i$i = 0, $$pre43$i = 0, $$pre56$i$i = 0, $$pre57$i$i = 0, $$pre8$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0, $$sum$i$i = 0, $$sum$i$i$i = 0, $$sum$i13$i = 0, $$sum$i14$i = 0, $$sum$i17$i = 0, $$sum$i19$i = 0;
 var $$sum$i2334 = 0, $$sum$i32 = 0, $$sum$i35 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i15$i = 0, $$sum1$i20$i = 0, $$sum1$i24 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum11$i = 0, $$sum11$i$i = 0, $$sum1112 = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0;
 var $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum120$i = 0, $$sum121$i = 0, $$sum122$i = 0, $$sum123$i = 0, $$sum124$i = 0, $$sum125$i = 0, $$sum13$i = 0, $$sum13$i$i = 0, $$sum14$i$i = 0, $$sum15$i = 0, $$sum15$i$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0;
 var $$sum18$i = 0, $$sum1819$i$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i16$i = 0, $$sum2$i18$i = 0, $$sum2$i21$i = 0, $$sum20$i$i = 0, $$sum21$i$i = 0, $$sum22$i$i = 0, $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum27$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i27 = 0;
 var $$sum30$i$i = 0, $$sum3132$i$i = 0, $$sum34$i$i = 0, $$sum3536$i$i = 0, $$sum3738$i$i = 0, $$sum39$i$i = 0, $$sum4 = 0, $$sum4$i = 0, $$sum4$i$i = 0, $$sum4$i28 = 0, $$sum40$i$i = 0, $$sum41$i$i = 0, $$sum42$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum56 = 0, $$sum6$i = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum8$i = 0;
 var $$sum9 = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$tsize$1$i = 0, $$v$0$i = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0, $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0;
 var $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0, $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0;
 var $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0, $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0;
 var $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0, $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0;
 var $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0;
 var $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0;
 var $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0;
 var $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0;
 var $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0;
 var $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0;
 var $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0;
 var $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0;
 var $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0;
 var $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0;
 var $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0;
 var $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0;
 var $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0;
 var $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0;
 var $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0;
 var $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0;
 var $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0;
 var $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0;
 var $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0;
 var $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0;
 var $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0;
 var $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0;
 var $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0;
 var $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0;
 var $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0;
 var $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0;
 var $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0;
 var $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0;
 var $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0;
 var $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0;
 var $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0;
 var $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0;
 var $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0;
 var $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0;
 var $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0;
 var $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0;
 var $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0;
 var $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0;
 var $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0;
 var $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0;
 var $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0;
 var $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0;
 var $859 = 0, $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0;
 var $877 = 0, $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0;
 var $895 = 0, $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0;
 var $912 = 0, $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0;
 var $930 = 0, $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0;
 var $949 = 0, $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0;
 var $967 = 0, $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0;
 var $985 = 0, $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0;
 var $F5$0$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$029$i = 0, $K2$07$i$i = 0, $K8$051$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i$i$lcssa = 0, $R$0$i$lcssa = 0, $R$0$i18 = 0, $R$0$i18$lcssa = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i$i$lcssa = 0, $RP$0$i$lcssa = 0;
 var $RP$0$i17 = 0, $RP$0$i17$lcssa = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i25$i = 0, $T$028$i = 0, $T$028$i$lcssa = 0, $T$050$i$i = 0, $T$050$i$i$lcssa = 0, $T$06$i$i = 0, $T$06$i$i$lcssa = 0, $br$0$ph$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i21 = 0, $exitcond$i$i = 0, $i$02$i$i = 0, $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0;
 var $not$$i = 0, $not$$i$i = 0, $not$$i26$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i30 = 0, $or$cond1$i = 0, $or$cond19$i = 0, $or$cond2$i = 0, $or$cond3$i = 0, $or$cond5$i = 0, $or$cond57$i = 0, $or$cond6$i = 0, $or$cond8$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i$lcssa = 0, $rsize$0$i15 = 0, $rsize$1$i = 0;
 var $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$331$i = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$084$i = 0, $sp$084$i$lcssa = 0, $sp$183$i = 0, $sp$183$i$lcssa = 0, $ssize$0$$i = 0, $ssize$0$i = 0, $ssize$1$ph$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0;
 var $t$2$v$3$i = 0, $t$230$i = 0, $tbase$255$i = 0, $tsize$0$ph$i = 0, $tsize$0323944$i = 0, $tsize$1$i = 0, $tsize$254$i = 0, $v$0$i = 0, $v$0$i$lcssa = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0, $v$3$ph$i = 0, $v$332$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($bytes>>>0)<(245);
 do {
  if ($0) {
   $1 = ($bytes>>>0)<(11);
   $2 = (($bytes) + 11)|0;
   $3 = $2 & -8;
   $4 = $1 ? 16 : $3;
   $5 = $4 >>> 3;
   $6 = HEAP32[1744>>2]|0;
   $7 = $6 >>> $5;
   $8 = $7 & 3;
   $9 = ($8|0)==(0);
   if (!($9)) {
    $10 = $7 & 1;
    $11 = $10 ^ 1;
    $12 = (($11) + ($5))|0;
    $13 = $12 << 1;
    $14 = (1784 + ($13<<2)|0);
    $$sum10 = (($13) + 2)|0;
    $15 = (1784 + ($$sum10<<2)|0);
    $16 = HEAP32[$15>>2]|0;
    $17 = ((($16)) + 8|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = ($14|0)==($18|0);
    do {
     if ($19) {
      $20 = 1 << $12;
      $21 = $20 ^ -1;
      $22 = $6 & $21;
      HEAP32[1744>>2] = $22;
     } else {
      $23 = HEAP32[(1760)>>2]|0;
      $24 = ($18>>>0)<($23>>>0);
      if ($24) {
       _abort();
       // unreachable;
      }
      $25 = ((($18)) + 12|0);
      $26 = HEAP32[$25>>2]|0;
      $27 = ($26|0)==($16|0);
      if ($27) {
       HEAP32[$25>>2] = $14;
       HEAP32[$15>>2] = $18;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $28 = $12 << 3;
    $29 = $28 | 3;
    $30 = ((($16)) + 4|0);
    HEAP32[$30>>2] = $29;
    $$sum1112 = $28 | 4;
    $31 = (($16) + ($$sum1112)|0);
    $32 = HEAP32[$31>>2]|0;
    $33 = $32 | 1;
    HEAP32[$31>>2] = $33;
    $mem$0 = $17;
    return ($mem$0|0);
   }
   $34 = HEAP32[(1752)>>2]|0;
   $35 = ($4>>>0)>($34>>>0);
   if ($35) {
    $36 = ($7|0)==(0);
    if (!($36)) {
     $37 = $7 << $5;
     $38 = 2 << $5;
     $39 = (0 - ($38))|0;
     $40 = $38 | $39;
     $41 = $37 & $40;
     $42 = (0 - ($41))|0;
     $43 = $41 & $42;
     $44 = (($43) + -1)|0;
     $45 = $44 >>> 12;
     $46 = $45 & 16;
     $47 = $44 >>> $46;
     $48 = $47 >>> 5;
     $49 = $48 & 8;
     $50 = $49 | $46;
     $51 = $47 >>> $49;
     $52 = $51 >>> 2;
     $53 = $52 & 4;
     $54 = $50 | $53;
     $55 = $51 >>> $53;
     $56 = $55 >>> 1;
     $57 = $56 & 2;
     $58 = $54 | $57;
     $59 = $55 >>> $57;
     $60 = $59 >>> 1;
     $61 = $60 & 1;
     $62 = $58 | $61;
     $63 = $59 >>> $61;
     $64 = (($62) + ($63))|0;
     $65 = $64 << 1;
     $66 = (1784 + ($65<<2)|0);
     $$sum4 = (($65) + 2)|0;
     $67 = (1784 + ($$sum4<<2)|0);
     $68 = HEAP32[$67>>2]|0;
     $69 = ((($68)) + 8|0);
     $70 = HEAP32[$69>>2]|0;
     $71 = ($66|0)==($70|0);
     do {
      if ($71) {
       $72 = 1 << $64;
       $73 = $72 ^ -1;
       $74 = $6 & $73;
       HEAP32[1744>>2] = $74;
       $88 = $34;
      } else {
       $75 = HEAP32[(1760)>>2]|0;
       $76 = ($70>>>0)<($75>>>0);
       if ($76) {
        _abort();
        // unreachable;
       }
       $77 = ((($70)) + 12|0);
       $78 = HEAP32[$77>>2]|0;
       $79 = ($78|0)==($68|0);
       if ($79) {
        HEAP32[$77>>2] = $66;
        HEAP32[$67>>2] = $70;
        $$pre = HEAP32[(1752)>>2]|0;
        $88 = $$pre;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $80 = $64 << 3;
     $81 = (($80) - ($4))|0;
     $82 = $4 | 3;
     $83 = ((($68)) + 4|0);
     HEAP32[$83>>2] = $82;
     $84 = (($68) + ($4)|0);
     $85 = $81 | 1;
     $$sum56 = $4 | 4;
     $86 = (($68) + ($$sum56)|0);
     HEAP32[$86>>2] = $85;
     $87 = (($68) + ($80)|0);
     HEAP32[$87>>2] = $81;
     $89 = ($88|0)==(0);
     if (!($89)) {
      $90 = HEAP32[(1764)>>2]|0;
      $91 = $88 >>> 3;
      $92 = $91 << 1;
      $93 = (1784 + ($92<<2)|0);
      $94 = HEAP32[1744>>2]|0;
      $95 = 1 << $91;
      $96 = $94 & $95;
      $97 = ($96|0)==(0);
      if ($97) {
       $98 = $94 | $95;
       HEAP32[1744>>2] = $98;
       $$pre105 = (($92) + 2)|0;
       $$pre106 = (1784 + ($$pre105<<2)|0);
       $$pre$phiZ2D = $$pre106;$F4$0 = $93;
      } else {
       $$sum9 = (($92) + 2)|0;
       $99 = (1784 + ($$sum9<<2)|0);
       $100 = HEAP32[$99>>2]|0;
       $101 = HEAP32[(1760)>>2]|0;
       $102 = ($100>>>0)<($101>>>0);
       if ($102) {
        _abort();
        // unreachable;
       } else {
        $$pre$phiZ2D = $99;$F4$0 = $100;
       }
      }
      HEAP32[$$pre$phiZ2D>>2] = $90;
      $103 = ((($F4$0)) + 12|0);
      HEAP32[$103>>2] = $90;
      $104 = ((($90)) + 8|0);
      HEAP32[$104>>2] = $F4$0;
      $105 = ((($90)) + 12|0);
      HEAP32[$105>>2] = $93;
     }
     HEAP32[(1752)>>2] = $81;
     HEAP32[(1764)>>2] = $84;
     $mem$0 = $69;
     return ($mem$0|0);
    }
    $106 = HEAP32[(1748)>>2]|0;
    $107 = ($106|0)==(0);
    if ($107) {
     $nb$0 = $4;
    } else {
     $108 = (0 - ($106))|0;
     $109 = $106 & $108;
     $110 = (($109) + -1)|0;
     $111 = $110 >>> 12;
     $112 = $111 & 16;
     $113 = $110 >>> $112;
     $114 = $113 >>> 5;
     $115 = $114 & 8;
     $116 = $115 | $112;
     $117 = $113 >>> $115;
     $118 = $117 >>> 2;
     $119 = $118 & 4;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = $121 >>> 1;
     $123 = $122 & 2;
     $124 = $120 | $123;
     $125 = $121 >>> $123;
     $126 = $125 >>> 1;
     $127 = $126 & 1;
     $128 = $124 | $127;
     $129 = $125 >>> $127;
     $130 = (($128) + ($129))|0;
     $131 = (2048 + ($130<<2)|0);
     $132 = HEAP32[$131>>2]|0;
     $133 = ((($132)) + 4|0);
     $134 = HEAP32[$133>>2]|0;
     $135 = $134 & -8;
     $136 = (($135) - ($4))|0;
     $rsize$0$i = $136;$t$0$i = $132;$v$0$i = $132;
     while(1) {
      $137 = ((($t$0$i)) + 16|0);
      $138 = HEAP32[$137>>2]|0;
      $139 = ($138|0)==(0|0);
      if ($139) {
       $140 = ((($t$0$i)) + 20|0);
       $141 = HEAP32[$140>>2]|0;
       $142 = ($141|0)==(0|0);
       if ($142) {
        $rsize$0$i$lcssa = $rsize$0$i;$v$0$i$lcssa = $v$0$i;
        break;
       } else {
        $144 = $141;
       }
      } else {
       $144 = $138;
      }
      $143 = ((($144)) + 4|0);
      $145 = HEAP32[$143>>2]|0;
      $146 = $145 & -8;
      $147 = (($146) - ($4))|0;
      $148 = ($147>>>0)<($rsize$0$i>>>0);
      $$rsize$0$i = $148 ? $147 : $rsize$0$i;
      $$v$0$i = $148 ? $144 : $v$0$i;
      $rsize$0$i = $$rsize$0$i;$t$0$i = $144;$v$0$i = $$v$0$i;
     }
     $149 = HEAP32[(1760)>>2]|0;
     $150 = ($v$0$i$lcssa>>>0)<($149>>>0);
     if ($150) {
      _abort();
      // unreachable;
     }
     $151 = (($v$0$i$lcssa) + ($4)|0);
     $152 = ($v$0$i$lcssa>>>0)<($151>>>0);
     if (!($152)) {
      _abort();
      // unreachable;
     }
     $153 = ((($v$0$i$lcssa)) + 24|0);
     $154 = HEAP32[$153>>2]|0;
     $155 = ((($v$0$i$lcssa)) + 12|0);
     $156 = HEAP32[$155>>2]|0;
     $157 = ($156|0)==($v$0$i$lcssa|0);
     do {
      if ($157) {
       $167 = ((($v$0$i$lcssa)) + 20|0);
       $168 = HEAP32[$167>>2]|0;
       $169 = ($168|0)==(0|0);
       if ($169) {
        $170 = ((($v$0$i$lcssa)) + 16|0);
        $171 = HEAP32[$170>>2]|0;
        $172 = ($171|0)==(0|0);
        if ($172) {
         $R$1$i = 0;
         break;
        } else {
         $R$0$i = $171;$RP$0$i = $170;
        }
       } else {
        $R$0$i = $168;$RP$0$i = $167;
       }
       while(1) {
        $173 = ((($R$0$i)) + 20|0);
        $174 = HEAP32[$173>>2]|0;
        $175 = ($174|0)==(0|0);
        if (!($175)) {
         $R$0$i = $174;$RP$0$i = $173;
         continue;
        }
        $176 = ((($R$0$i)) + 16|0);
        $177 = HEAP32[$176>>2]|0;
        $178 = ($177|0)==(0|0);
        if ($178) {
         $R$0$i$lcssa = $R$0$i;$RP$0$i$lcssa = $RP$0$i;
         break;
        } else {
         $R$0$i = $177;$RP$0$i = $176;
        }
       }
       $179 = ($RP$0$i$lcssa>>>0)<($149>>>0);
       if ($179) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP$0$i$lcssa>>2] = 0;
        $R$1$i = $R$0$i$lcssa;
        break;
       }
      } else {
       $158 = ((($v$0$i$lcssa)) + 8|0);
       $159 = HEAP32[$158>>2]|0;
       $160 = ($159>>>0)<($149>>>0);
       if ($160) {
        _abort();
        // unreachable;
       }
       $161 = ((($159)) + 12|0);
       $162 = HEAP32[$161>>2]|0;
       $163 = ($162|0)==($v$0$i$lcssa|0);
       if (!($163)) {
        _abort();
        // unreachable;
       }
       $164 = ((($156)) + 8|0);
       $165 = HEAP32[$164>>2]|0;
       $166 = ($165|0)==($v$0$i$lcssa|0);
       if ($166) {
        HEAP32[$161>>2] = $156;
        HEAP32[$164>>2] = $159;
        $R$1$i = $156;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $180 = ($154|0)==(0|0);
     do {
      if (!($180)) {
       $181 = ((($v$0$i$lcssa)) + 28|0);
       $182 = HEAP32[$181>>2]|0;
       $183 = (2048 + ($182<<2)|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($v$0$i$lcssa|0)==($184|0);
       if ($185) {
        HEAP32[$183>>2] = $R$1$i;
        $cond$i = ($R$1$i|0)==(0|0);
        if ($cond$i) {
         $186 = 1 << $182;
         $187 = $186 ^ -1;
         $188 = HEAP32[(1748)>>2]|0;
         $189 = $188 & $187;
         HEAP32[(1748)>>2] = $189;
         break;
        }
       } else {
        $190 = HEAP32[(1760)>>2]|0;
        $191 = ($154>>>0)<($190>>>0);
        if ($191) {
         _abort();
         // unreachable;
        }
        $192 = ((($154)) + 16|0);
        $193 = HEAP32[$192>>2]|0;
        $194 = ($193|0)==($v$0$i$lcssa|0);
        if ($194) {
         HEAP32[$192>>2] = $R$1$i;
        } else {
         $195 = ((($154)) + 20|0);
         HEAP32[$195>>2] = $R$1$i;
        }
        $196 = ($R$1$i|0)==(0|0);
        if ($196) {
         break;
        }
       }
       $197 = HEAP32[(1760)>>2]|0;
       $198 = ($R$1$i>>>0)<($197>>>0);
       if ($198) {
        _abort();
        // unreachable;
       }
       $199 = ((($R$1$i)) + 24|0);
       HEAP32[$199>>2] = $154;
       $200 = ((($v$0$i$lcssa)) + 16|0);
       $201 = HEAP32[$200>>2]|0;
       $202 = ($201|0)==(0|0);
       do {
        if (!($202)) {
         $203 = ($201>>>0)<($197>>>0);
         if ($203) {
          _abort();
          // unreachable;
         } else {
          $204 = ((($R$1$i)) + 16|0);
          HEAP32[$204>>2] = $201;
          $205 = ((($201)) + 24|0);
          HEAP32[$205>>2] = $R$1$i;
          break;
         }
        }
       } while(0);
       $206 = ((($v$0$i$lcssa)) + 20|0);
       $207 = HEAP32[$206>>2]|0;
       $208 = ($207|0)==(0|0);
       if (!($208)) {
        $209 = HEAP32[(1760)>>2]|0;
        $210 = ($207>>>0)<($209>>>0);
        if ($210) {
         _abort();
         // unreachable;
        } else {
         $211 = ((($R$1$i)) + 20|0);
         HEAP32[$211>>2] = $207;
         $212 = ((($207)) + 24|0);
         HEAP32[$212>>2] = $R$1$i;
         break;
        }
       }
      }
     } while(0);
     $213 = ($rsize$0$i$lcssa>>>0)<(16);
     if ($213) {
      $214 = (($rsize$0$i$lcssa) + ($4))|0;
      $215 = $214 | 3;
      $216 = ((($v$0$i$lcssa)) + 4|0);
      HEAP32[$216>>2] = $215;
      $$sum4$i = (($214) + 4)|0;
      $217 = (($v$0$i$lcssa) + ($$sum4$i)|0);
      $218 = HEAP32[$217>>2]|0;
      $219 = $218 | 1;
      HEAP32[$217>>2] = $219;
     } else {
      $220 = $4 | 3;
      $221 = ((($v$0$i$lcssa)) + 4|0);
      HEAP32[$221>>2] = $220;
      $222 = $rsize$0$i$lcssa | 1;
      $$sum$i35 = $4 | 4;
      $223 = (($v$0$i$lcssa) + ($$sum$i35)|0);
      HEAP32[$223>>2] = $222;
      $$sum1$i = (($rsize$0$i$lcssa) + ($4))|0;
      $224 = (($v$0$i$lcssa) + ($$sum1$i)|0);
      HEAP32[$224>>2] = $rsize$0$i$lcssa;
      $225 = HEAP32[(1752)>>2]|0;
      $226 = ($225|0)==(0);
      if (!($226)) {
       $227 = HEAP32[(1764)>>2]|0;
       $228 = $225 >>> 3;
       $229 = $228 << 1;
       $230 = (1784 + ($229<<2)|0);
       $231 = HEAP32[1744>>2]|0;
       $232 = 1 << $228;
       $233 = $231 & $232;
       $234 = ($233|0)==(0);
       if ($234) {
        $235 = $231 | $232;
        HEAP32[1744>>2] = $235;
        $$pre$i = (($229) + 2)|0;
        $$pre8$i = (1784 + ($$pre$i<<2)|0);
        $$pre$phi$iZ2D = $$pre8$i;$F1$0$i = $230;
       } else {
        $$sum3$i = (($229) + 2)|0;
        $236 = (1784 + ($$sum3$i<<2)|0);
        $237 = HEAP32[$236>>2]|0;
        $238 = HEAP32[(1760)>>2]|0;
        $239 = ($237>>>0)<($238>>>0);
        if ($239) {
         _abort();
         // unreachable;
        } else {
         $$pre$phi$iZ2D = $236;$F1$0$i = $237;
        }
       }
       HEAP32[$$pre$phi$iZ2D>>2] = $227;
       $240 = ((($F1$0$i)) + 12|0);
       HEAP32[$240>>2] = $227;
       $241 = ((($227)) + 8|0);
       HEAP32[$241>>2] = $F1$0$i;
       $242 = ((($227)) + 12|0);
       HEAP32[$242>>2] = $230;
      }
      HEAP32[(1752)>>2] = $rsize$0$i$lcssa;
      HEAP32[(1764)>>2] = $151;
     }
     $243 = ((($v$0$i$lcssa)) + 8|0);
     $mem$0 = $243;
     return ($mem$0|0);
    }
   } else {
    $nb$0 = $4;
   }
  } else {
   $244 = ($bytes>>>0)>(4294967231);
   if ($244) {
    $nb$0 = -1;
   } else {
    $245 = (($bytes) + 11)|0;
    $246 = $245 & -8;
    $247 = HEAP32[(1748)>>2]|0;
    $248 = ($247|0)==(0);
    if ($248) {
     $nb$0 = $246;
    } else {
     $249 = (0 - ($246))|0;
     $250 = $245 >>> 8;
     $251 = ($250|0)==(0);
     if ($251) {
      $idx$0$i = 0;
     } else {
      $252 = ($246>>>0)>(16777215);
      if ($252) {
       $idx$0$i = 31;
      } else {
       $253 = (($250) + 1048320)|0;
       $254 = $253 >>> 16;
       $255 = $254 & 8;
       $256 = $250 << $255;
       $257 = (($256) + 520192)|0;
       $258 = $257 >>> 16;
       $259 = $258 & 4;
       $260 = $259 | $255;
       $261 = $256 << $259;
       $262 = (($261) + 245760)|0;
       $263 = $262 >>> 16;
       $264 = $263 & 2;
       $265 = $260 | $264;
       $266 = (14 - ($265))|0;
       $267 = $261 << $264;
       $268 = $267 >>> 15;
       $269 = (($266) + ($268))|0;
       $270 = $269 << 1;
       $271 = (($269) + 7)|0;
       $272 = $246 >>> $271;
       $273 = $272 & 1;
       $274 = $273 | $270;
       $idx$0$i = $274;
      }
     }
     $275 = (2048 + ($idx$0$i<<2)|0);
     $276 = HEAP32[$275>>2]|0;
     $277 = ($276|0)==(0|0);
     L123: do {
      if ($277) {
       $rsize$2$i = $249;$t$1$i = 0;$v$2$i = 0;
       label = 86;
      } else {
       $278 = ($idx$0$i|0)==(31);
       $279 = $idx$0$i >>> 1;
       $280 = (25 - ($279))|0;
       $281 = $278 ? 0 : $280;
       $282 = $246 << $281;
       $rsize$0$i15 = $249;$rst$0$i = 0;$sizebits$0$i = $282;$t$0$i14 = $276;$v$0$i16 = 0;
       while(1) {
        $283 = ((($t$0$i14)) + 4|0);
        $284 = HEAP32[$283>>2]|0;
        $285 = $284 & -8;
        $286 = (($285) - ($246))|0;
        $287 = ($286>>>0)<($rsize$0$i15>>>0);
        if ($287) {
         $288 = ($285|0)==($246|0);
         if ($288) {
          $rsize$331$i = $286;$t$230$i = $t$0$i14;$v$332$i = $t$0$i14;
          label = 90;
          break L123;
         } else {
          $rsize$1$i = $286;$v$1$i = $t$0$i14;
         }
        } else {
         $rsize$1$i = $rsize$0$i15;$v$1$i = $v$0$i16;
        }
        $289 = ((($t$0$i14)) + 20|0);
        $290 = HEAP32[$289>>2]|0;
        $291 = $sizebits$0$i >>> 31;
        $292 = (((($t$0$i14)) + 16|0) + ($291<<2)|0);
        $293 = HEAP32[$292>>2]|0;
        $294 = ($290|0)==(0|0);
        $295 = ($290|0)==($293|0);
        $or$cond19$i = $294 | $295;
        $rst$1$i = $or$cond19$i ? $rst$0$i : $290;
        $296 = ($293|0)==(0|0);
        $297 = $sizebits$0$i << 1;
        if ($296) {
         $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
         label = 86;
         break;
        } else {
         $rsize$0$i15 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $297;$t$0$i14 = $293;$v$0$i16 = $v$1$i;
        }
       }
      }
     } while(0);
     if ((label|0) == 86) {
      $298 = ($t$1$i|0)==(0|0);
      $299 = ($v$2$i|0)==(0|0);
      $or$cond$i = $298 & $299;
      if ($or$cond$i) {
       $300 = 2 << $idx$0$i;
       $301 = (0 - ($300))|0;
       $302 = $300 | $301;
       $303 = $247 & $302;
       $304 = ($303|0)==(0);
       if ($304) {
        $nb$0 = $246;
        break;
       }
       $305 = (0 - ($303))|0;
       $306 = $303 & $305;
       $307 = (($306) + -1)|0;
       $308 = $307 >>> 12;
       $309 = $308 & 16;
       $310 = $307 >>> $309;
       $311 = $310 >>> 5;
       $312 = $311 & 8;
       $313 = $312 | $309;
       $314 = $310 >>> $312;
       $315 = $314 >>> 2;
       $316 = $315 & 4;
       $317 = $313 | $316;
       $318 = $314 >>> $316;
       $319 = $318 >>> 1;
       $320 = $319 & 2;
       $321 = $317 | $320;
       $322 = $318 >>> $320;
       $323 = $322 >>> 1;
       $324 = $323 & 1;
       $325 = $321 | $324;
       $326 = $322 >>> $324;
       $327 = (($325) + ($326))|0;
       $328 = (2048 + ($327<<2)|0);
       $329 = HEAP32[$328>>2]|0;
       $t$2$ph$i = $329;$v$3$ph$i = 0;
      } else {
       $t$2$ph$i = $t$1$i;$v$3$ph$i = $v$2$i;
      }
      $330 = ($t$2$ph$i|0)==(0|0);
      if ($330) {
       $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$3$ph$i;
      } else {
       $rsize$331$i = $rsize$2$i;$t$230$i = $t$2$ph$i;$v$332$i = $v$3$ph$i;
       label = 90;
      }
     }
     if ((label|0) == 90) {
      while(1) {
       label = 0;
       $331 = ((($t$230$i)) + 4|0);
       $332 = HEAP32[$331>>2]|0;
       $333 = $332 & -8;
       $334 = (($333) - ($246))|0;
       $335 = ($334>>>0)<($rsize$331$i>>>0);
       $$rsize$3$i = $335 ? $334 : $rsize$331$i;
       $t$2$v$3$i = $335 ? $t$230$i : $v$332$i;
       $336 = ((($t$230$i)) + 16|0);
       $337 = HEAP32[$336>>2]|0;
       $338 = ($337|0)==(0|0);
       if (!($338)) {
        $rsize$331$i = $$rsize$3$i;$t$230$i = $337;$v$332$i = $t$2$v$3$i;
        label = 90;
        continue;
       }
       $339 = ((($t$230$i)) + 20|0);
       $340 = HEAP32[$339>>2]|0;
       $341 = ($340|0)==(0|0);
       if ($341) {
        $rsize$3$lcssa$i = $$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
        break;
       } else {
        $rsize$331$i = $$rsize$3$i;$t$230$i = $340;$v$332$i = $t$2$v$3$i;
        label = 90;
       }
      }
     }
     $342 = ($v$3$lcssa$i|0)==(0|0);
     if ($342) {
      $nb$0 = $246;
     } else {
      $343 = HEAP32[(1752)>>2]|0;
      $344 = (($343) - ($246))|0;
      $345 = ($rsize$3$lcssa$i>>>0)<($344>>>0);
      if ($345) {
       $346 = HEAP32[(1760)>>2]|0;
       $347 = ($v$3$lcssa$i>>>0)<($346>>>0);
       if ($347) {
        _abort();
        // unreachable;
       }
       $348 = (($v$3$lcssa$i) + ($246)|0);
       $349 = ($v$3$lcssa$i>>>0)<($348>>>0);
       if (!($349)) {
        _abort();
        // unreachable;
       }
       $350 = ((($v$3$lcssa$i)) + 24|0);
       $351 = HEAP32[$350>>2]|0;
       $352 = ((($v$3$lcssa$i)) + 12|0);
       $353 = HEAP32[$352>>2]|0;
       $354 = ($353|0)==($v$3$lcssa$i|0);
       do {
        if ($354) {
         $364 = ((($v$3$lcssa$i)) + 20|0);
         $365 = HEAP32[$364>>2]|0;
         $366 = ($365|0)==(0|0);
         if ($366) {
          $367 = ((($v$3$lcssa$i)) + 16|0);
          $368 = HEAP32[$367>>2]|0;
          $369 = ($368|0)==(0|0);
          if ($369) {
           $R$1$i20 = 0;
           break;
          } else {
           $R$0$i18 = $368;$RP$0$i17 = $367;
          }
         } else {
          $R$0$i18 = $365;$RP$0$i17 = $364;
         }
         while(1) {
          $370 = ((($R$0$i18)) + 20|0);
          $371 = HEAP32[$370>>2]|0;
          $372 = ($371|0)==(0|0);
          if (!($372)) {
           $R$0$i18 = $371;$RP$0$i17 = $370;
           continue;
          }
          $373 = ((($R$0$i18)) + 16|0);
          $374 = HEAP32[$373>>2]|0;
          $375 = ($374|0)==(0|0);
          if ($375) {
           $R$0$i18$lcssa = $R$0$i18;$RP$0$i17$lcssa = $RP$0$i17;
           break;
          } else {
           $R$0$i18 = $374;$RP$0$i17 = $373;
          }
         }
         $376 = ($RP$0$i17$lcssa>>>0)<($346>>>0);
         if ($376) {
          _abort();
          // unreachable;
         } else {
          HEAP32[$RP$0$i17$lcssa>>2] = 0;
          $R$1$i20 = $R$0$i18$lcssa;
          break;
         }
        } else {
         $355 = ((($v$3$lcssa$i)) + 8|0);
         $356 = HEAP32[$355>>2]|0;
         $357 = ($356>>>0)<($346>>>0);
         if ($357) {
          _abort();
          // unreachable;
         }
         $358 = ((($356)) + 12|0);
         $359 = HEAP32[$358>>2]|0;
         $360 = ($359|0)==($v$3$lcssa$i|0);
         if (!($360)) {
          _abort();
          // unreachable;
         }
         $361 = ((($353)) + 8|0);
         $362 = HEAP32[$361>>2]|0;
         $363 = ($362|0)==($v$3$lcssa$i|0);
         if ($363) {
          HEAP32[$358>>2] = $353;
          HEAP32[$361>>2] = $356;
          $R$1$i20 = $353;
          break;
         } else {
          _abort();
          // unreachable;
         }
        }
       } while(0);
       $377 = ($351|0)==(0|0);
       do {
        if (!($377)) {
         $378 = ((($v$3$lcssa$i)) + 28|0);
         $379 = HEAP32[$378>>2]|0;
         $380 = (2048 + ($379<<2)|0);
         $381 = HEAP32[$380>>2]|0;
         $382 = ($v$3$lcssa$i|0)==($381|0);
         if ($382) {
          HEAP32[$380>>2] = $R$1$i20;
          $cond$i21 = ($R$1$i20|0)==(0|0);
          if ($cond$i21) {
           $383 = 1 << $379;
           $384 = $383 ^ -1;
           $385 = HEAP32[(1748)>>2]|0;
           $386 = $385 & $384;
           HEAP32[(1748)>>2] = $386;
           break;
          }
         } else {
          $387 = HEAP32[(1760)>>2]|0;
          $388 = ($351>>>0)<($387>>>0);
          if ($388) {
           _abort();
           // unreachable;
          }
          $389 = ((($351)) + 16|0);
          $390 = HEAP32[$389>>2]|0;
          $391 = ($390|0)==($v$3$lcssa$i|0);
          if ($391) {
           HEAP32[$389>>2] = $R$1$i20;
          } else {
           $392 = ((($351)) + 20|0);
           HEAP32[$392>>2] = $R$1$i20;
          }
          $393 = ($R$1$i20|0)==(0|0);
          if ($393) {
           break;
          }
         }
         $394 = HEAP32[(1760)>>2]|0;
         $395 = ($R$1$i20>>>0)<($394>>>0);
         if ($395) {
          _abort();
          // unreachable;
         }
         $396 = ((($R$1$i20)) + 24|0);
         HEAP32[$396>>2] = $351;
         $397 = ((($v$3$lcssa$i)) + 16|0);
         $398 = HEAP32[$397>>2]|0;
         $399 = ($398|0)==(0|0);
         do {
          if (!($399)) {
           $400 = ($398>>>0)<($394>>>0);
           if ($400) {
            _abort();
            // unreachable;
           } else {
            $401 = ((($R$1$i20)) + 16|0);
            HEAP32[$401>>2] = $398;
            $402 = ((($398)) + 24|0);
            HEAP32[$402>>2] = $R$1$i20;
            break;
           }
          }
         } while(0);
         $403 = ((($v$3$lcssa$i)) + 20|0);
         $404 = HEAP32[$403>>2]|0;
         $405 = ($404|0)==(0|0);
         if (!($405)) {
          $406 = HEAP32[(1760)>>2]|0;
          $407 = ($404>>>0)<($406>>>0);
          if ($407) {
           _abort();
           // unreachable;
          } else {
           $408 = ((($R$1$i20)) + 20|0);
           HEAP32[$408>>2] = $404;
           $409 = ((($404)) + 24|0);
           HEAP32[$409>>2] = $R$1$i20;
           break;
          }
         }
        }
       } while(0);
       $410 = ($rsize$3$lcssa$i>>>0)<(16);
       L199: do {
        if ($410) {
         $411 = (($rsize$3$lcssa$i) + ($246))|0;
         $412 = $411 | 3;
         $413 = ((($v$3$lcssa$i)) + 4|0);
         HEAP32[$413>>2] = $412;
         $$sum18$i = (($411) + 4)|0;
         $414 = (($v$3$lcssa$i) + ($$sum18$i)|0);
         $415 = HEAP32[$414>>2]|0;
         $416 = $415 | 1;
         HEAP32[$414>>2] = $416;
        } else {
         $417 = $246 | 3;
         $418 = ((($v$3$lcssa$i)) + 4|0);
         HEAP32[$418>>2] = $417;
         $419 = $rsize$3$lcssa$i | 1;
         $$sum$i2334 = $246 | 4;
         $420 = (($v$3$lcssa$i) + ($$sum$i2334)|0);
         HEAP32[$420>>2] = $419;
         $$sum1$i24 = (($rsize$3$lcssa$i) + ($246))|0;
         $421 = (($v$3$lcssa$i) + ($$sum1$i24)|0);
         HEAP32[$421>>2] = $rsize$3$lcssa$i;
         $422 = $rsize$3$lcssa$i >>> 3;
         $423 = ($rsize$3$lcssa$i>>>0)<(256);
         if ($423) {
          $424 = $422 << 1;
          $425 = (1784 + ($424<<2)|0);
          $426 = HEAP32[1744>>2]|0;
          $427 = 1 << $422;
          $428 = $426 & $427;
          $429 = ($428|0)==(0);
          if ($429) {
           $430 = $426 | $427;
           HEAP32[1744>>2] = $430;
           $$pre$i25 = (($424) + 2)|0;
           $$pre43$i = (1784 + ($$pre$i25<<2)|0);
           $$pre$phi$i26Z2D = $$pre43$i;$F5$0$i = $425;
          } else {
           $$sum17$i = (($424) + 2)|0;
           $431 = (1784 + ($$sum17$i<<2)|0);
           $432 = HEAP32[$431>>2]|0;
           $433 = HEAP32[(1760)>>2]|0;
           $434 = ($432>>>0)<($433>>>0);
           if ($434) {
            _abort();
            // unreachable;
           } else {
            $$pre$phi$i26Z2D = $431;$F5$0$i = $432;
           }
          }
          HEAP32[$$pre$phi$i26Z2D>>2] = $348;
          $435 = ((($F5$0$i)) + 12|0);
          HEAP32[$435>>2] = $348;
          $$sum15$i = (($246) + 8)|0;
          $436 = (($v$3$lcssa$i) + ($$sum15$i)|0);
          HEAP32[$436>>2] = $F5$0$i;
          $$sum16$i = (($246) + 12)|0;
          $437 = (($v$3$lcssa$i) + ($$sum16$i)|0);
          HEAP32[$437>>2] = $425;
          break;
         }
         $438 = $rsize$3$lcssa$i >>> 8;
         $439 = ($438|0)==(0);
         if ($439) {
          $I7$0$i = 0;
         } else {
          $440 = ($rsize$3$lcssa$i>>>0)>(16777215);
          if ($440) {
           $I7$0$i = 31;
          } else {
           $441 = (($438) + 1048320)|0;
           $442 = $441 >>> 16;
           $443 = $442 & 8;
           $444 = $438 << $443;
           $445 = (($444) + 520192)|0;
           $446 = $445 >>> 16;
           $447 = $446 & 4;
           $448 = $447 | $443;
           $449 = $444 << $447;
           $450 = (($449) + 245760)|0;
           $451 = $450 >>> 16;
           $452 = $451 & 2;
           $453 = $448 | $452;
           $454 = (14 - ($453))|0;
           $455 = $449 << $452;
           $456 = $455 >>> 15;
           $457 = (($454) + ($456))|0;
           $458 = $457 << 1;
           $459 = (($457) + 7)|0;
           $460 = $rsize$3$lcssa$i >>> $459;
           $461 = $460 & 1;
           $462 = $461 | $458;
           $I7$0$i = $462;
          }
         }
         $463 = (2048 + ($I7$0$i<<2)|0);
         $$sum2$i = (($246) + 28)|0;
         $464 = (($v$3$lcssa$i) + ($$sum2$i)|0);
         HEAP32[$464>>2] = $I7$0$i;
         $$sum3$i27 = (($246) + 16)|0;
         $465 = (($v$3$lcssa$i) + ($$sum3$i27)|0);
         $$sum4$i28 = (($246) + 20)|0;
         $466 = (($v$3$lcssa$i) + ($$sum4$i28)|0);
         HEAP32[$466>>2] = 0;
         HEAP32[$465>>2] = 0;
         $467 = HEAP32[(1748)>>2]|0;
         $468 = 1 << $I7$0$i;
         $469 = $467 & $468;
         $470 = ($469|0)==(0);
         if ($470) {
          $471 = $467 | $468;
          HEAP32[(1748)>>2] = $471;
          HEAP32[$463>>2] = $348;
          $$sum5$i = (($246) + 24)|0;
          $472 = (($v$3$lcssa$i) + ($$sum5$i)|0);
          HEAP32[$472>>2] = $463;
          $$sum6$i = (($246) + 12)|0;
          $473 = (($v$3$lcssa$i) + ($$sum6$i)|0);
          HEAP32[$473>>2] = $348;
          $$sum7$i = (($246) + 8)|0;
          $474 = (($v$3$lcssa$i) + ($$sum7$i)|0);
          HEAP32[$474>>2] = $348;
          break;
         }
         $475 = HEAP32[$463>>2]|0;
         $476 = ((($475)) + 4|0);
         $477 = HEAP32[$476>>2]|0;
         $478 = $477 & -8;
         $479 = ($478|0)==($rsize$3$lcssa$i|0);
         L217: do {
          if ($479) {
           $T$0$lcssa$i = $475;
          } else {
           $480 = ($I7$0$i|0)==(31);
           $481 = $I7$0$i >>> 1;
           $482 = (25 - ($481))|0;
           $483 = $480 ? 0 : $482;
           $484 = $rsize$3$lcssa$i << $483;
           $K12$029$i = $484;$T$028$i = $475;
           while(1) {
            $491 = $K12$029$i >>> 31;
            $492 = (((($T$028$i)) + 16|0) + ($491<<2)|0);
            $487 = HEAP32[$492>>2]|0;
            $493 = ($487|0)==(0|0);
            if ($493) {
             $$lcssa232 = $492;$T$028$i$lcssa = $T$028$i;
             break;
            }
            $485 = $K12$029$i << 1;
            $486 = ((($487)) + 4|0);
            $488 = HEAP32[$486>>2]|0;
            $489 = $488 & -8;
            $490 = ($489|0)==($rsize$3$lcssa$i|0);
            if ($490) {
             $T$0$lcssa$i = $487;
             break L217;
            } else {
             $K12$029$i = $485;$T$028$i = $487;
            }
           }
           $494 = HEAP32[(1760)>>2]|0;
           $495 = ($$lcssa232>>>0)<($494>>>0);
           if ($495) {
            _abort();
            // unreachable;
           } else {
            HEAP32[$$lcssa232>>2] = $348;
            $$sum11$i = (($246) + 24)|0;
            $496 = (($v$3$lcssa$i) + ($$sum11$i)|0);
            HEAP32[$496>>2] = $T$028$i$lcssa;
            $$sum12$i = (($246) + 12)|0;
            $497 = (($v$3$lcssa$i) + ($$sum12$i)|0);
            HEAP32[$497>>2] = $348;
            $$sum13$i = (($246) + 8)|0;
            $498 = (($v$3$lcssa$i) + ($$sum13$i)|0);
            HEAP32[$498>>2] = $348;
            break L199;
           }
          }
         } while(0);
         $499 = ((($T$0$lcssa$i)) + 8|0);
         $500 = HEAP32[$499>>2]|0;
         $501 = HEAP32[(1760)>>2]|0;
         $502 = ($500>>>0)>=($501>>>0);
         $not$$i = ($T$0$lcssa$i>>>0)>=($501>>>0);
         $503 = $502 & $not$$i;
         if ($503) {
          $504 = ((($500)) + 12|0);
          HEAP32[$504>>2] = $348;
          HEAP32[$499>>2] = $348;
          $$sum8$i = (($246) + 8)|0;
          $505 = (($v$3$lcssa$i) + ($$sum8$i)|0);
          HEAP32[$505>>2] = $500;
          $$sum9$i = (($246) + 12)|0;
          $506 = (($v$3$lcssa$i) + ($$sum9$i)|0);
          HEAP32[$506>>2] = $T$0$lcssa$i;
          $$sum10$i = (($246) + 24)|0;
          $507 = (($v$3$lcssa$i) + ($$sum10$i)|0);
          HEAP32[$507>>2] = 0;
          break;
         } else {
          _abort();
          // unreachable;
         }
        }
       } while(0);
       $508 = ((($v$3$lcssa$i)) + 8|0);
       $mem$0 = $508;
       return ($mem$0|0);
      } else {
       $nb$0 = $246;
      }
     }
    }
   }
  }
 } while(0);
 $509 = HEAP32[(1752)>>2]|0;
 $510 = ($509>>>0)<($nb$0>>>0);
 if (!($510)) {
  $511 = (($509) - ($nb$0))|0;
  $512 = HEAP32[(1764)>>2]|0;
  $513 = ($511>>>0)>(15);
  if ($513) {
   $514 = (($512) + ($nb$0)|0);
   HEAP32[(1764)>>2] = $514;
   HEAP32[(1752)>>2] = $511;
   $515 = $511 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $516 = (($512) + ($$sum2)|0);
   HEAP32[$516>>2] = $515;
   $517 = (($512) + ($509)|0);
   HEAP32[$517>>2] = $511;
   $518 = $nb$0 | 3;
   $519 = ((($512)) + 4|0);
   HEAP32[$519>>2] = $518;
  } else {
   HEAP32[(1752)>>2] = 0;
   HEAP32[(1764)>>2] = 0;
   $520 = $509 | 3;
   $521 = ((($512)) + 4|0);
   HEAP32[$521>>2] = $520;
   $$sum1 = (($509) + 4)|0;
   $522 = (($512) + ($$sum1)|0);
   $523 = HEAP32[$522>>2]|0;
   $524 = $523 | 1;
   HEAP32[$522>>2] = $524;
  }
  $525 = ((($512)) + 8|0);
  $mem$0 = $525;
  return ($mem$0|0);
 }
 $526 = HEAP32[(1756)>>2]|0;
 $527 = ($526>>>0)>($nb$0>>>0);
 if ($527) {
  $528 = (($526) - ($nb$0))|0;
  HEAP32[(1756)>>2] = $528;
  $529 = HEAP32[(1768)>>2]|0;
  $530 = (($529) + ($nb$0)|0);
  HEAP32[(1768)>>2] = $530;
  $531 = $528 | 1;
  $$sum = (($nb$0) + 4)|0;
  $532 = (($529) + ($$sum)|0);
  HEAP32[$532>>2] = $531;
  $533 = $nb$0 | 3;
  $534 = ((($529)) + 4|0);
  HEAP32[$534>>2] = $533;
  $535 = ((($529)) + 8|0);
  $mem$0 = $535;
  return ($mem$0|0);
 }
 $536 = HEAP32[2216>>2]|0;
 $537 = ($536|0)==(0);
 do {
  if ($537) {
   $538 = (_sysconf(30)|0);
   $539 = (($538) + -1)|0;
   $540 = $539 & $538;
   $541 = ($540|0)==(0);
   if ($541) {
    HEAP32[(2224)>>2] = $538;
    HEAP32[(2220)>>2] = $538;
    HEAP32[(2228)>>2] = -1;
    HEAP32[(2232)>>2] = -1;
    HEAP32[(2236)>>2] = 0;
    HEAP32[(2188)>>2] = 0;
    $542 = (_time((0|0))|0);
    $543 = $542 & -16;
    $544 = $543 ^ 1431655768;
    HEAP32[2216>>2] = $544;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $545 = (($nb$0) + 48)|0;
 $546 = HEAP32[(2224)>>2]|0;
 $547 = (($nb$0) + 47)|0;
 $548 = (($546) + ($547))|0;
 $549 = (0 - ($546))|0;
 $550 = $548 & $549;
 $551 = ($550>>>0)>($nb$0>>>0);
 if (!($551)) {
  $mem$0 = 0;
  return ($mem$0|0);
 }
 $552 = HEAP32[(2184)>>2]|0;
 $553 = ($552|0)==(0);
 if (!($553)) {
  $554 = HEAP32[(2176)>>2]|0;
  $555 = (($554) + ($550))|0;
  $556 = ($555>>>0)<=($554>>>0);
  $557 = ($555>>>0)>($552>>>0);
  $or$cond1$i = $556 | $557;
  if ($or$cond1$i) {
   $mem$0 = 0;
   return ($mem$0|0);
  }
 }
 $558 = HEAP32[(2188)>>2]|0;
 $559 = $558 & 4;
 $560 = ($559|0)==(0);
 L258: do {
  if ($560) {
   $561 = HEAP32[(1768)>>2]|0;
   $562 = ($561|0)==(0|0);
   L260: do {
    if ($562) {
     label = 174;
    } else {
     $sp$0$i$i = (2192);
     while(1) {
      $563 = HEAP32[$sp$0$i$i>>2]|0;
      $564 = ($563>>>0)>($561>>>0);
      if (!($564)) {
       $565 = ((($sp$0$i$i)) + 4|0);
       $566 = HEAP32[$565>>2]|0;
       $567 = (($563) + ($566)|0);
       $568 = ($567>>>0)>($561>>>0);
       if ($568) {
        $$lcssa228 = $sp$0$i$i;$$lcssa230 = $565;
        break;
       }
      }
      $569 = ((($sp$0$i$i)) + 8|0);
      $570 = HEAP32[$569>>2]|0;
      $571 = ($570|0)==(0|0);
      if ($571) {
       label = 174;
       break L260;
      } else {
       $sp$0$i$i = $570;
      }
     }
     $594 = HEAP32[(1756)>>2]|0;
     $595 = (($548) - ($594))|0;
     $596 = $595 & $549;
     $597 = ($596>>>0)<(2147483647);
     if ($597) {
      $598 = (_sbrk(($596|0))|0);
      $599 = HEAP32[$$lcssa228>>2]|0;
      $600 = HEAP32[$$lcssa230>>2]|0;
      $601 = (($599) + ($600)|0);
      $602 = ($598|0)==($601|0);
      $$3$i = $602 ? $596 : 0;
      if ($602) {
       $603 = ($598|0)==((-1)|0);
       if ($603) {
        $tsize$0323944$i = $$3$i;
       } else {
        $tbase$255$i = $598;$tsize$254$i = $$3$i;
        label = 194;
        break L258;
       }
      } else {
       $br$0$ph$i = $598;$ssize$1$ph$i = $596;$tsize$0$ph$i = $$3$i;
       label = 184;
      }
     } else {
      $tsize$0323944$i = 0;
     }
    }
   } while(0);
   do {
    if ((label|0) == 174) {
     $572 = (_sbrk(0)|0);
     $573 = ($572|0)==((-1)|0);
     if ($573) {
      $tsize$0323944$i = 0;
     } else {
      $574 = $572;
      $575 = HEAP32[(2220)>>2]|0;
      $576 = (($575) + -1)|0;
      $577 = $576 & $574;
      $578 = ($577|0)==(0);
      if ($578) {
       $ssize$0$i = $550;
      } else {
       $579 = (($576) + ($574))|0;
       $580 = (0 - ($575))|0;
       $581 = $579 & $580;
       $582 = (($550) - ($574))|0;
       $583 = (($582) + ($581))|0;
       $ssize$0$i = $583;
      }
      $584 = HEAP32[(2176)>>2]|0;
      $585 = (($584) + ($ssize$0$i))|0;
      $586 = ($ssize$0$i>>>0)>($nb$0>>>0);
      $587 = ($ssize$0$i>>>0)<(2147483647);
      $or$cond$i30 = $586 & $587;
      if ($or$cond$i30) {
       $588 = HEAP32[(2184)>>2]|0;
       $589 = ($588|0)==(0);
       if (!($589)) {
        $590 = ($585>>>0)<=($584>>>0);
        $591 = ($585>>>0)>($588>>>0);
        $or$cond2$i = $590 | $591;
        if ($or$cond2$i) {
         $tsize$0323944$i = 0;
         break;
        }
       }
       $592 = (_sbrk(($ssize$0$i|0))|0);
       $593 = ($592|0)==($572|0);
       $ssize$0$$i = $593 ? $ssize$0$i : 0;
       if ($593) {
        $tbase$255$i = $572;$tsize$254$i = $ssize$0$$i;
        label = 194;
        break L258;
       } else {
        $br$0$ph$i = $592;$ssize$1$ph$i = $ssize$0$i;$tsize$0$ph$i = $ssize$0$$i;
        label = 184;
       }
      } else {
       $tsize$0323944$i = 0;
      }
     }
    }
   } while(0);
   L280: do {
    if ((label|0) == 184) {
     $604 = (0 - ($ssize$1$ph$i))|0;
     $605 = ($br$0$ph$i|0)!=((-1)|0);
     $606 = ($ssize$1$ph$i>>>0)<(2147483647);
     $or$cond5$i = $606 & $605;
     $607 = ($545>>>0)>($ssize$1$ph$i>>>0);
     $or$cond6$i = $607 & $or$cond5$i;
     do {
      if ($or$cond6$i) {
       $608 = HEAP32[(2224)>>2]|0;
       $609 = (($547) - ($ssize$1$ph$i))|0;
       $610 = (($609) + ($608))|0;
       $611 = (0 - ($608))|0;
       $612 = $610 & $611;
       $613 = ($612>>>0)<(2147483647);
       if ($613) {
        $614 = (_sbrk(($612|0))|0);
        $615 = ($614|0)==((-1)|0);
        if ($615) {
         (_sbrk(($604|0))|0);
         $tsize$0323944$i = $tsize$0$ph$i;
         break L280;
        } else {
         $616 = (($612) + ($ssize$1$ph$i))|0;
         $ssize$2$i = $616;
         break;
        }
       } else {
        $ssize$2$i = $ssize$1$ph$i;
       }
      } else {
       $ssize$2$i = $ssize$1$ph$i;
      }
     } while(0);
     $617 = ($br$0$ph$i|0)==((-1)|0);
     if ($617) {
      $tsize$0323944$i = $tsize$0$ph$i;
     } else {
      $tbase$255$i = $br$0$ph$i;$tsize$254$i = $ssize$2$i;
      label = 194;
      break L258;
     }
    }
   } while(0);
   $618 = HEAP32[(2188)>>2]|0;
   $619 = $618 | 4;
   HEAP32[(2188)>>2] = $619;
   $tsize$1$i = $tsize$0323944$i;
   label = 191;
  } else {
   $tsize$1$i = 0;
   label = 191;
  }
 } while(0);
 if ((label|0) == 191) {
  $620 = ($550>>>0)<(2147483647);
  if ($620) {
   $621 = (_sbrk(($550|0))|0);
   $622 = (_sbrk(0)|0);
   $623 = ($621|0)!=((-1)|0);
   $624 = ($622|0)!=((-1)|0);
   $or$cond3$i = $623 & $624;
   $625 = ($621>>>0)<($622>>>0);
   $or$cond8$i = $625 & $or$cond3$i;
   if ($or$cond8$i) {
    $626 = $622;
    $627 = $621;
    $628 = (($626) - ($627))|0;
    $629 = (($nb$0) + 40)|0;
    $630 = ($628>>>0)>($629>>>0);
    $$tsize$1$i = $630 ? $628 : $tsize$1$i;
    if ($630) {
     $tbase$255$i = $621;$tsize$254$i = $$tsize$1$i;
     label = 194;
    }
   }
  }
 }
 if ((label|0) == 194) {
  $631 = HEAP32[(2176)>>2]|0;
  $632 = (($631) + ($tsize$254$i))|0;
  HEAP32[(2176)>>2] = $632;
  $633 = HEAP32[(2180)>>2]|0;
  $634 = ($632>>>0)>($633>>>0);
  if ($634) {
   HEAP32[(2180)>>2] = $632;
  }
  $635 = HEAP32[(1768)>>2]|0;
  $636 = ($635|0)==(0|0);
  L299: do {
   if ($636) {
    $637 = HEAP32[(1760)>>2]|0;
    $638 = ($637|0)==(0|0);
    $639 = ($tbase$255$i>>>0)<($637>>>0);
    $or$cond9$i = $638 | $639;
    if ($or$cond9$i) {
     HEAP32[(1760)>>2] = $tbase$255$i;
    }
    HEAP32[(2192)>>2] = $tbase$255$i;
    HEAP32[(2196)>>2] = $tsize$254$i;
    HEAP32[(2204)>>2] = 0;
    $640 = HEAP32[2216>>2]|0;
    HEAP32[(1780)>>2] = $640;
    HEAP32[(1776)>>2] = -1;
    $i$02$i$i = 0;
    while(1) {
     $641 = $i$02$i$i << 1;
     $642 = (1784 + ($641<<2)|0);
     $$sum$i$i = (($641) + 3)|0;
     $643 = (1784 + ($$sum$i$i<<2)|0);
     HEAP32[$643>>2] = $642;
     $$sum1$i$i = (($641) + 2)|0;
     $644 = (1784 + ($$sum1$i$i<<2)|0);
     HEAP32[$644>>2] = $642;
     $645 = (($i$02$i$i) + 1)|0;
     $exitcond$i$i = ($645|0)==(32);
     if ($exitcond$i$i) {
      break;
     } else {
      $i$02$i$i = $645;
     }
    }
    $646 = (($tsize$254$i) + -40)|0;
    $647 = ((($tbase$255$i)) + 8|0);
    $648 = $647;
    $649 = $648 & 7;
    $650 = ($649|0)==(0);
    $651 = (0 - ($648))|0;
    $652 = $651 & 7;
    $653 = $650 ? 0 : $652;
    $654 = (($tbase$255$i) + ($653)|0);
    $655 = (($646) - ($653))|0;
    HEAP32[(1768)>>2] = $654;
    HEAP32[(1756)>>2] = $655;
    $656 = $655 | 1;
    $$sum$i13$i = (($653) + 4)|0;
    $657 = (($tbase$255$i) + ($$sum$i13$i)|0);
    HEAP32[$657>>2] = $656;
    $$sum2$i$i = (($tsize$254$i) + -36)|0;
    $658 = (($tbase$255$i) + ($$sum2$i$i)|0);
    HEAP32[$658>>2] = 40;
    $659 = HEAP32[(2232)>>2]|0;
    HEAP32[(1772)>>2] = $659;
   } else {
    $sp$084$i = (2192);
    while(1) {
     $660 = HEAP32[$sp$084$i>>2]|0;
     $661 = ((($sp$084$i)) + 4|0);
     $662 = HEAP32[$661>>2]|0;
     $663 = (($660) + ($662)|0);
     $664 = ($tbase$255$i|0)==($663|0);
     if ($664) {
      $$lcssa222 = $660;$$lcssa224 = $661;$$lcssa226 = $662;$sp$084$i$lcssa = $sp$084$i;
      label = 204;
      break;
     }
     $665 = ((($sp$084$i)) + 8|0);
     $666 = HEAP32[$665>>2]|0;
     $667 = ($666|0)==(0|0);
     if ($667) {
      break;
     } else {
      $sp$084$i = $666;
     }
    }
    if ((label|0) == 204) {
     $668 = ((($sp$084$i$lcssa)) + 12|0);
     $669 = HEAP32[$668>>2]|0;
     $670 = $669 & 8;
     $671 = ($670|0)==(0);
     if ($671) {
      $672 = ($635>>>0)>=($$lcssa222>>>0);
      $673 = ($635>>>0)<($tbase$255$i>>>0);
      $or$cond57$i = $673 & $672;
      if ($or$cond57$i) {
       $674 = (($$lcssa226) + ($tsize$254$i))|0;
       HEAP32[$$lcssa224>>2] = $674;
       $675 = HEAP32[(1756)>>2]|0;
       $676 = (($675) + ($tsize$254$i))|0;
       $677 = ((($635)) + 8|0);
       $678 = $677;
       $679 = $678 & 7;
       $680 = ($679|0)==(0);
       $681 = (0 - ($678))|0;
       $682 = $681 & 7;
       $683 = $680 ? 0 : $682;
       $684 = (($635) + ($683)|0);
       $685 = (($676) - ($683))|0;
       HEAP32[(1768)>>2] = $684;
       HEAP32[(1756)>>2] = $685;
       $686 = $685 | 1;
       $$sum$i17$i = (($683) + 4)|0;
       $687 = (($635) + ($$sum$i17$i)|0);
       HEAP32[$687>>2] = $686;
       $$sum2$i18$i = (($676) + 4)|0;
       $688 = (($635) + ($$sum2$i18$i)|0);
       HEAP32[$688>>2] = 40;
       $689 = HEAP32[(2232)>>2]|0;
       HEAP32[(1772)>>2] = $689;
       break;
      }
     }
    }
    $690 = HEAP32[(1760)>>2]|0;
    $691 = ($tbase$255$i>>>0)<($690>>>0);
    if ($691) {
     HEAP32[(1760)>>2] = $tbase$255$i;
     $755 = $tbase$255$i;
    } else {
     $755 = $690;
    }
    $692 = (($tbase$255$i) + ($tsize$254$i)|0);
    $sp$183$i = (2192);
    while(1) {
     $693 = HEAP32[$sp$183$i>>2]|0;
     $694 = ($693|0)==($692|0);
     if ($694) {
      $$lcssa219 = $sp$183$i;$sp$183$i$lcssa = $sp$183$i;
      label = 212;
      break;
     }
     $695 = ((($sp$183$i)) + 8|0);
     $696 = HEAP32[$695>>2]|0;
     $697 = ($696|0)==(0|0);
     if ($697) {
      $sp$0$i$i$i = (2192);
      break;
     } else {
      $sp$183$i = $696;
     }
    }
    if ((label|0) == 212) {
     $698 = ((($sp$183$i$lcssa)) + 12|0);
     $699 = HEAP32[$698>>2]|0;
     $700 = $699 & 8;
     $701 = ($700|0)==(0);
     if ($701) {
      HEAP32[$$lcssa219>>2] = $tbase$255$i;
      $702 = ((($sp$183$i$lcssa)) + 4|0);
      $703 = HEAP32[$702>>2]|0;
      $704 = (($703) + ($tsize$254$i))|0;
      HEAP32[$702>>2] = $704;
      $705 = ((($tbase$255$i)) + 8|0);
      $706 = $705;
      $707 = $706 & 7;
      $708 = ($707|0)==(0);
      $709 = (0 - ($706))|0;
      $710 = $709 & 7;
      $711 = $708 ? 0 : $710;
      $712 = (($tbase$255$i) + ($711)|0);
      $$sum112$i = (($tsize$254$i) + 8)|0;
      $713 = (($tbase$255$i) + ($$sum112$i)|0);
      $714 = $713;
      $715 = $714 & 7;
      $716 = ($715|0)==(0);
      $717 = (0 - ($714))|0;
      $718 = $717 & 7;
      $719 = $716 ? 0 : $718;
      $$sum113$i = (($719) + ($tsize$254$i))|0;
      $720 = (($tbase$255$i) + ($$sum113$i)|0);
      $721 = $720;
      $722 = $712;
      $723 = (($721) - ($722))|0;
      $$sum$i19$i = (($711) + ($nb$0))|0;
      $724 = (($tbase$255$i) + ($$sum$i19$i)|0);
      $725 = (($723) - ($nb$0))|0;
      $726 = $nb$0 | 3;
      $$sum1$i20$i = (($711) + 4)|0;
      $727 = (($tbase$255$i) + ($$sum1$i20$i)|0);
      HEAP32[$727>>2] = $726;
      $728 = ($720|0)==($635|0);
      L324: do {
       if ($728) {
        $729 = HEAP32[(1756)>>2]|0;
        $730 = (($729) + ($725))|0;
        HEAP32[(1756)>>2] = $730;
        HEAP32[(1768)>>2] = $724;
        $731 = $730 | 1;
        $$sum42$i$i = (($$sum$i19$i) + 4)|0;
        $732 = (($tbase$255$i) + ($$sum42$i$i)|0);
        HEAP32[$732>>2] = $731;
       } else {
        $733 = HEAP32[(1764)>>2]|0;
        $734 = ($720|0)==($733|0);
        if ($734) {
         $735 = HEAP32[(1752)>>2]|0;
         $736 = (($735) + ($725))|0;
         HEAP32[(1752)>>2] = $736;
         HEAP32[(1764)>>2] = $724;
         $737 = $736 | 1;
         $$sum40$i$i = (($$sum$i19$i) + 4)|0;
         $738 = (($tbase$255$i) + ($$sum40$i$i)|0);
         HEAP32[$738>>2] = $737;
         $$sum41$i$i = (($736) + ($$sum$i19$i))|0;
         $739 = (($tbase$255$i) + ($$sum41$i$i)|0);
         HEAP32[$739>>2] = $736;
         break;
        }
        $$sum2$i21$i = (($tsize$254$i) + 4)|0;
        $$sum114$i = (($$sum2$i21$i) + ($719))|0;
        $740 = (($tbase$255$i) + ($$sum114$i)|0);
        $741 = HEAP32[$740>>2]|0;
        $742 = $741 & 3;
        $743 = ($742|0)==(1);
        if ($743) {
         $744 = $741 & -8;
         $745 = $741 >>> 3;
         $746 = ($741>>>0)<(256);
         L332: do {
          if ($746) {
           $$sum3738$i$i = $719 | 8;
           $$sum124$i = (($$sum3738$i$i) + ($tsize$254$i))|0;
           $747 = (($tbase$255$i) + ($$sum124$i)|0);
           $748 = HEAP32[$747>>2]|0;
           $$sum39$i$i = (($tsize$254$i) + 12)|0;
           $$sum125$i = (($$sum39$i$i) + ($719))|0;
           $749 = (($tbase$255$i) + ($$sum125$i)|0);
           $750 = HEAP32[$749>>2]|0;
           $751 = $745 << 1;
           $752 = (1784 + ($751<<2)|0);
           $753 = ($748|0)==($752|0);
           do {
            if (!($753)) {
             $754 = ($748>>>0)<($755>>>0);
             if ($754) {
              _abort();
              // unreachable;
             }
             $756 = ((($748)) + 12|0);
             $757 = HEAP32[$756>>2]|0;
             $758 = ($757|0)==($720|0);
             if ($758) {
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $759 = ($750|0)==($748|0);
           if ($759) {
            $760 = 1 << $745;
            $761 = $760 ^ -1;
            $762 = HEAP32[1744>>2]|0;
            $763 = $762 & $761;
            HEAP32[1744>>2] = $763;
            break;
           }
           $764 = ($750|0)==($752|0);
           do {
            if ($764) {
             $$pre57$i$i = ((($750)) + 8|0);
             $$pre$phi58$i$iZ2D = $$pre57$i$i;
            } else {
             $765 = ($750>>>0)<($755>>>0);
             if ($765) {
              _abort();
              // unreachable;
             }
             $766 = ((($750)) + 8|0);
             $767 = HEAP32[$766>>2]|0;
             $768 = ($767|0)==($720|0);
             if ($768) {
              $$pre$phi58$i$iZ2D = $766;
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $769 = ((($748)) + 12|0);
           HEAP32[$769>>2] = $750;
           HEAP32[$$pre$phi58$i$iZ2D>>2] = $748;
          } else {
           $$sum34$i$i = $719 | 24;
           $$sum115$i = (($$sum34$i$i) + ($tsize$254$i))|0;
           $770 = (($tbase$255$i) + ($$sum115$i)|0);
           $771 = HEAP32[$770>>2]|0;
           $$sum5$i$i = (($tsize$254$i) + 12)|0;
           $$sum116$i = (($$sum5$i$i) + ($719))|0;
           $772 = (($tbase$255$i) + ($$sum116$i)|0);
           $773 = HEAP32[$772>>2]|0;
           $774 = ($773|0)==($720|0);
           do {
            if ($774) {
             $$sum67$i$i = $719 | 16;
             $$sum122$i = (($$sum2$i21$i) + ($$sum67$i$i))|0;
             $784 = (($tbase$255$i) + ($$sum122$i)|0);
             $785 = HEAP32[$784>>2]|0;
             $786 = ($785|0)==(0|0);
             if ($786) {
              $$sum123$i = (($$sum67$i$i) + ($tsize$254$i))|0;
              $787 = (($tbase$255$i) + ($$sum123$i)|0);
              $788 = HEAP32[$787>>2]|0;
              $789 = ($788|0)==(0|0);
              if ($789) {
               $R$1$i$i = 0;
               break;
              } else {
               $R$0$i$i = $788;$RP$0$i$i = $787;
              }
             } else {
              $R$0$i$i = $785;$RP$0$i$i = $784;
             }
             while(1) {
              $790 = ((($R$0$i$i)) + 20|0);
              $791 = HEAP32[$790>>2]|0;
              $792 = ($791|0)==(0|0);
              if (!($792)) {
               $R$0$i$i = $791;$RP$0$i$i = $790;
               continue;
              }
              $793 = ((($R$0$i$i)) + 16|0);
              $794 = HEAP32[$793>>2]|0;
              $795 = ($794|0)==(0|0);
              if ($795) {
               $R$0$i$i$lcssa = $R$0$i$i;$RP$0$i$i$lcssa = $RP$0$i$i;
               break;
              } else {
               $R$0$i$i = $794;$RP$0$i$i = $793;
              }
             }
             $796 = ($RP$0$i$i$lcssa>>>0)<($755>>>0);
             if ($796) {
              _abort();
              // unreachable;
             } else {
              HEAP32[$RP$0$i$i$lcssa>>2] = 0;
              $R$1$i$i = $R$0$i$i$lcssa;
              break;
             }
            } else {
             $$sum3536$i$i = $719 | 8;
             $$sum117$i = (($$sum3536$i$i) + ($tsize$254$i))|0;
             $775 = (($tbase$255$i) + ($$sum117$i)|0);
             $776 = HEAP32[$775>>2]|0;
             $777 = ($776>>>0)<($755>>>0);
             if ($777) {
              _abort();
              // unreachable;
             }
             $778 = ((($776)) + 12|0);
             $779 = HEAP32[$778>>2]|0;
             $780 = ($779|0)==($720|0);
             if (!($780)) {
              _abort();
              // unreachable;
             }
             $781 = ((($773)) + 8|0);
             $782 = HEAP32[$781>>2]|0;
             $783 = ($782|0)==($720|0);
             if ($783) {
              HEAP32[$778>>2] = $773;
              HEAP32[$781>>2] = $776;
              $R$1$i$i = $773;
              break;
             } else {
              _abort();
              // unreachable;
             }
            }
           } while(0);
           $797 = ($771|0)==(0|0);
           if ($797) {
            break;
           }
           $$sum30$i$i = (($tsize$254$i) + 28)|0;
           $$sum118$i = (($$sum30$i$i) + ($719))|0;
           $798 = (($tbase$255$i) + ($$sum118$i)|0);
           $799 = HEAP32[$798>>2]|0;
           $800 = (2048 + ($799<<2)|0);
           $801 = HEAP32[$800>>2]|0;
           $802 = ($720|0)==($801|0);
           do {
            if ($802) {
             HEAP32[$800>>2] = $R$1$i$i;
             $cond$i$i = ($R$1$i$i|0)==(0|0);
             if (!($cond$i$i)) {
              break;
             }
             $803 = 1 << $799;
             $804 = $803 ^ -1;
             $805 = HEAP32[(1748)>>2]|0;
             $806 = $805 & $804;
             HEAP32[(1748)>>2] = $806;
             break L332;
            } else {
             $807 = HEAP32[(1760)>>2]|0;
             $808 = ($771>>>0)<($807>>>0);
             if ($808) {
              _abort();
              // unreachable;
             }
             $809 = ((($771)) + 16|0);
             $810 = HEAP32[$809>>2]|0;
             $811 = ($810|0)==($720|0);
             if ($811) {
              HEAP32[$809>>2] = $R$1$i$i;
             } else {
              $812 = ((($771)) + 20|0);
              HEAP32[$812>>2] = $R$1$i$i;
             }
             $813 = ($R$1$i$i|0)==(0|0);
             if ($813) {
              break L332;
             }
            }
           } while(0);
           $814 = HEAP32[(1760)>>2]|0;
           $815 = ($R$1$i$i>>>0)<($814>>>0);
           if ($815) {
            _abort();
            // unreachable;
           }
           $816 = ((($R$1$i$i)) + 24|0);
           HEAP32[$816>>2] = $771;
           $$sum3132$i$i = $719 | 16;
           $$sum119$i = (($$sum3132$i$i) + ($tsize$254$i))|0;
           $817 = (($tbase$255$i) + ($$sum119$i)|0);
           $818 = HEAP32[$817>>2]|0;
           $819 = ($818|0)==(0|0);
           do {
            if (!($819)) {
             $820 = ($818>>>0)<($814>>>0);
             if ($820) {
              _abort();
              // unreachable;
             } else {
              $821 = ((($R$1$i$i)) + 16|0);
              HEAP32[$821>>2] = $818;
              $822 = ((($818)) + 24|0);
              HEAP32[$822>>2] = $R$1$i$i;
              break;
             }
            }
           } while(0);
           $$sum120$i = (($$sum2$i21$i) + ($$sum3132$i$i))|0;
           $823 = (($tbase$255$i) + ($$sum120$i)|0);
           $824 = HEAP32[$823>>2]|0;
           $825 = ($824|0)==(0|0);
           if ($825) {
            break;
           }
           $826 = HEAP32[(1760)>>2]|0;
           $827 = ($824>>>0)<($826>>>0);
           if ($827) {
            _abort();
            // unreachable;
           } else {
            $828 = ((($R$1$i$i)) + 20|0);
            HEAP32[$828>>2] = $824;
            $829 = ((($824)) + 24|0);
            HEAP32[$829>>2] = $R$1$i$i;
            break;
           }
          }
         } while(0);
         $$sum9$i$i = $744 | $719;
         $$sum121$i = (($$sum9$i$i) + ($tsize$254$i))|0;
         $830 = (($tbase$255$i) + ($$sum121$i)|0);
         $831 = (($744) + ($725))|0;
         $oldfirst$0$i$i = $830;$qsize$0$i$i = $831;
        } else {
         $oldfirst$0$i$i = $720;$qsize$0$i$i = $725;
        }
        $832 = ((($oldfirst$0$i$i)) + 4|0);
        $833 = HEAP32[$832>>2]|0;
        $834 = $833 & -2;
        HEAP32[$832>>2] = $834;
        $835 = $qsize$0$i$i | 1;
        $$sum10$i$i = (($$sum$i19$i) + 4)|0;
        $836 = (($tbase$255$i) + ($$sum10$i$i)|0);
        HEAP32[$836>>2] = $835;
        $$sum11$i$i = (($qsize$0$i$i) + ($$sum$i19$i))|0;
        $837 = (($tbase$255$i) + ($$sum11$i$i)|0);
        HEAP32[$837>>2] = $qsize$0$i$i;
        $838 = $qsize$0$i$i >>> 3;
        $839 = ($qsize$0$i$i>>>0)<(256);
        if ($839) {
         $840 = $838 << 1;
         $841 = (1784 + ($840<<2)|0);
         $842 = HEAP32[1744>>2]|0;
         $843 = 1 << $838;
         $844 = $842 & $843;
         $845 = ($844|0)==(0);
         do {
          if ($845) {
           $846 = $842 | $843;
           HEAP32[1744>>2] = $846;
           $$pre$i22$i = (($840) + 2)|0;
           $$pre56$i$i = (1784 + ($$pre$i22$i<<2)|0);
           $$pre$phi$i23$iZ2D = $$pre56$i$i;$F4$0$i$i = $841;
          } else {
           $$sum29$i$i = (($840) + 2)|0;
           $847 = (1784 + ($$sum29$i$i<<2)|0);
           $848 = HEAP32[$847>>2]|0;
           $849 = HEAP32[(1760)>>2]|0;
           $850 = ($848>>>0)<($849>>>0);
           if (!($850)) {
            $$pre$phi$i23$iZ2D = $847;$F4$0$i$i = $848;
            break;
           }
           _abort();
           // unreachable;
          }
         } while(0);
         HEAP32[$$pre$phi$i23$iZ2D>>2] = $724;
         $851 = ((($F4$0$i$i)) + 12|0);
         HEAP32[$851>>2] = $724;
         $$sum27$i$i = (($$sum$i19$i) + 8)|0;
         $852 = (($tbase$255$i) + ($$sum27$i$i)|0);
         HEAP32[$852>>2] = $F4$0$i$i;
         $$sum28$i$i = (($$sum$i19$i) + 12)|0;
         $853 = (($tbase$255$i) + ($$sum28$i$i)|0);
         HEAP32[$853>>2] = $841;
         break;
        }
        $854 = $qsize$0$i$i >>> 8;
        $855 = ($854|0)==(0);
        do {
         if ($855) {
          $I7$0$i$i = 0;
         } else {
          $856 = ($qsize$0$i$i>>>0)>(16777215);
          if ($856) {
           $I7$0$i$i = 31;
           break;
          }
          $857 = (($854) + 1048320)|0;
          $858 = $857 >>> 16;
          $859 = $858 & 8;
          $860 = $854 << $859;
          $861 = (($860) + 520192)|0;
          $862 = $861 >>> 16;
          $863 = $862 & 4;
          $864 = $863 | $859;
          $865 = $860 << $863;
          $866 = (($865) + 245760)|0;
          $867 = $866 >>> 16;
          $868 = $867 & 2;
          $869 = $864 | $868;
          $870 = (14 - ($869))|0;
          $871 = $865 << $868;
          $872 = $871 >>> 15;
          $873 = (($870) + ($872))|0;
          $874 = $873 << 1;
          $875 = (($873) + 7)|0;
          $876 = $qsize$0$i$i >>> $875;
          $877 = $876 & 1;
          $878 = $877 | $874;
          $I7$0$i$i = $878;
         }
        } while(0);
        $879 = (2048 + ($I7$0$i$i<<2)|0);
        $$sum12$i$i = (($$sum$i19$i) + 28)|0;
        $880 = (($tbase$255$i) + ($$sum12$i$i)|0);
        HEAP32[$880>>2] = $I7$0$i$i;
        $$sum13$i$i = (($$sum$i19$i) + 16)|0;
        $881 = (($tbase$255$i) + ($$sum13$i$i)|0);
        $$sum14$i$i = (($$sum$i19$i) + 20)|0;
        $882 = (($tbase$255$i) + ($$sum14$i$i)|0);
        HEAP32[$882>>2] = 0;
        HEAP32[$881>>2] = 0;
        $883 = HEAP32[(1748)>>2]|0;
        $884 = 1 << $I7$0$i$i;
        $885 = $883 & $884;
        $886 = ($885|0)==(0);
        if ($886) {
         $887 = $883 | $884;
         HEAP32[(1748)>>2] = $887;
         HEAP32[$879>>2] = $724;
         $$sum15$i$i = (($$sum$i19$i) + 24)|0;
         $888 = (($tbase$255$i) + ($$sum15$i$i)|0);
         HEAP32[$888>>2] = $879;
         $$sum16$i$i = (($$sum$i19$i) + 12)|0;
         $889 = (($tbase$255$i) + ($$sum16$i$i)|0);
         HEAP32[$889>>2] = $724;
         $$sum17$i$i = (($$sum$i19$i) + 8)|0;
         $890 = (($tbase$255$i) + ($$sum17$i$i)|0);
         HEAP32[$890>>2] = $724;
         break;
        }
        $891 = HEAP32[$879>>2]|0;
        $892 = ((($891)) + 4|0);
        $893 = HEAP32[$892>>2]|0;
        $894 = $893 & -8;
        $895 = ($894|0)==($qsize$0$i$i|0);
        L418: do {
         if ($895) {
          $T$0$lcssa$i25$i = $891;
         } else {
          $896 = ($I7$0$i$i|0)==(31);
          $897 = $I7$0$i$i >>> 1;
          $898 = (25 - ($897))|0;
          $899 = $896 ? 0 : $898;
          $900 = $qsize$0$i$i << $899;
          $K8$051$i$i = $900;$T$050$i$i = $891;
          while(1) {
           $907 = $K8$051$i$i >>> 31;
           $908 = (((($T$050$i$i)) + 16|0) + ($907<<2)|0);
           $903 = HEAP32[$908>>2]|0;
           $909 = ($903|0)==(0|0);
           if ($909) {
            $$lcssa = $908;$T$050$i$i$lcssa = $T$050$i$i;
            break;
           }
           $901 = $K8$051$i$i << 1;
           $902 = ((($903)) + 4|0);
           $904 = HEAP32[$902>>2]|0;
           $905 = $904 & -8;
           $906 = ($905|0)==($qsize$0$i$i|0);
           if ($906) {
            $T$0$lcssa$i25$i = $903;
            break L418;
           } else {
            $K8$051$i$i = $901;$T$050$i$i = $903;
           }
          }
          $910 = HEAP32[(1760)>>2]|0;
          $911 = ($$lcssa>>>0)<($910>>>0);
          if ($911) {
           _abort();
           // unreachable;
          } else {
           HEAP32[$$lcssa>>2] = $724;
           $$sum23$i$i = (($$sum$i19$i) + 24)|0;
           $912 = (($tbase$255$i) + ($$sum23$i$i)|0);
           HEAP32[$912>>2] = $T$050$i$i$lcssa;
           $$sum24$i$i = (($$sum$i19$i) + 12)|0;
           $913 = (($tbase$255$i) + ($$sum24$i$i)|0);
           HEAP32[$913>>2] = $724;
           $$sum25$i$i = (($$sum$i19$i) + 8)|0;
           $914 = (($tbase$255$i) + ($$sum25$i$i)|0);
           HEAP32[$914>>2] = $724;
           break L324;
          }
         }
        } while(0);
        $915 = ((($T$0$lcssa$i25$i)) + 8|0);
        $916 = HEAP32[$915>>2]|0;
        $917 = HEAP32[(1760)>>2]|0;
        $918 = ($916>>>0)>=($917>>>0);
        $not$$i26$i = ($T$0$lcssa$i25$i>>>0)>=($917>>>0);
        $919 = $918 & $not$$i26$i;
        if ($919) {
         $920 = ((($916)) + 12|0);
         HEAP32[$920>>2] = $724;
         HEAP32[$915>>2] = $724;
         $$sum20$i$i = (($$sum$i19$i) + 8)|0;
         $921 = (($tbase$255$i) + ($$sum20$i$i)|0);
         HEAP32[$921>>2] = $916;
         $$sum21$i$i = (($$sum$i19$i) + 12)|0;
         $922 = (($tbase$255$i) + ($$sum21$i$i)|0);
         HEAP32[$922>>2] = $T$0$lcssa$i25$i;
         $$sum22$i$i = (($$sum$i19$i) + 24)|0;
         $923 = (($tbase$255$i) + ($$sum22$i$i)|0);
         HEAP32[$923>>2] = 0;
         break;
        } else {
         _abort();
         // unreachable;
        }
       }
      } while(0);
      $$sum1819$i$i = $711 | 8;
      $924 = (($tbase$255$i) + ($$sum1819$i$i)|0);
      $mem$0 = $924;
      return ($mem$0|0);
     } else {
      $sp$0$i$i$i = (2192);
     }
    }
    while(1) {
     $925 = HEAP32[$sp$0$i$i$i>>2]|0;
     $926 = ($925>>>0)>($635>>>0);
     if (!($926)) {
      $927 = ((($sp$0$i$i$i)) + 4|0);
      $928 = HEAP32[$927>>2]|0;
      $929 = (($925) + ($928)|0);
      $930 = ($929>>>0)>($635>>>0);
      if ($930) {
       $$lcssa215 = $925;$$lcssa216 = $928;$$lcssa217 = $929;
       break;
      }
     }
     $931 = ((($sp$0$i$i$i)) + 8|0);
     $932 = HEAP32[$931>>2]|0;
     $sp$0$i$i$i = $932;
    }
    $$sum$i14$i = (($$lcssa216) + -47)|0;
    $$sum1$i15$i = (($$lcssa216) + -39)|0;
    $933 = (($$lcssa215) + ($$sum1$i15$i)|0);
    $934 = $933;
    $935 = $934 & 7;
    $936 = ($935|0)==(0);
    $937 = (0 - ($934))|0;
    $938 = $937 & 7;
    $939 = $936 ? 0 : $938;
    $$sum2$i16$i = (($$sum$i14$i) + ($939))|0;
    $940 = (($$lcssa215) + ($$sum2$i16$i)|0);
    $941 = ((($635)) + 16|0);
    $942 = ($940>>>0)<($941>>>0);
    $943 = $942 ? $635 : $940;
    $944 = ((($943)) + 8|0);
    $945 = (($tsize$254$i) + -40)|0;
    $946 = ((($tbase$255$i)) + 8|0);
    $947 = $946;
    $948 = $947 & 7;
    $949 = ($948|0)==(0);
    $950 = (0 - ($947))|0;
    $951 = $950 & 7;
    $952 = $949 ? 0 : $951;
    $953 = (($tbase$255$i) + ($952)|0);
    $954 = (($945) - ($952))|0;
    HEAP32[(1768)>>2] = $953;
    HEAP32[(1756)>>2] = $954;
    $955 = $954 | 1;
    $$sum$i$i$i = (($952) + 4)|0;
    $956 = (($tbase$255$i) + ($$sum$i$i$i)|0);
    HEAP32[$956>>2] = $955;
    $$sum2$i$i$i = (($tsize$254$i) + -36)|0;
    $957 = (($tbase$255$i) + ($$sum2$i$i$i)|0);
    HEAP32[$957>>2] = 40;
    $958 = HEAP32[(2232)>>2]|0;
    HEAP32[(1772)>>2] = $958;
    $959 = ((($943)) + 4|0);
    HEAP32[$959>>2] = 27;
    ;HEAP32[$944>>2]=HEAP32[(2192)>>2]|0;HEAP32[$944+4>>2]=HEAP32[(2192)+4>>2]|0;HEAP32[$944+8>>2]=HEAP32[(2192)+8>>2]|0;HEAP32[$944+12>>2]=HEAP32[(2192)+12>>2]|0;
    HEAP32[(2192)>>2] = $tbase$255$i;
    HEAP32[(2196)>>2] = $tsize$254$i;
    HEAP32[(2204)>>2] = 0;
    HEAP32[(2200)>>2] = $944;
    $960 = ((($943)) + 28|0);
    HEAP32[$960>>2] = 7;
    $961 = ((($943)) + 32|0);
    $962 = ($961>>>0)<($$lcssa217>>>0);
    if ($962) {
     $964 = $960;
     while(1) {
      $963 = ((($964)) + 4|0);
      HEAP32[$963>>2] = 7;
      $965 = ((($964)) + 8|0);
      $966 = ($965>>>0)<($$lcssa217>>>0);
      if ($966) {
       $964 = $963;
      } else {
       break;
      }
     }
    }
    $967 = ($943|0)==($635|0);
    if (!($967)) {
     $968 = $943;
     $969 = $635;
     $970 = (($968) - ($969))|0;
     $971 = HEAP32[$959>>2]|0;
     $972 = $971 & -2;
     HEAP32[$959>>2] = $972;
     $973 = $970 | 1;
     $974 = ((($635)) + 4|0);
     HEAP32[$974>>2] = $973;
     HEAP32[$943>>2] = $970;
     $975 = $970 >>> 3;
     $976 = ($970>>>0)<(256);
     if ($976) {
      $977 = $975 << 1;
      $978 = (1784 + ($977<<2)|0);
      $979 = HEAP32[1744>>2]|0;
      $980 = 1 << $975;
      $981 = $979 & $980;
      $982 = ($981|0)==(0);
      if ($982) {
       $983 = $979 | $980;
       HEAP32[1744>>2] = $983;
       $$pre$i$i = (($977) + 2)|0;
       $$pre14$i$i = (1784 + ($$pre$i$i<<2)|0);
       $$pre$phi$i$iZ2D = $$pre14$i$i;$F$0$i$i = $978;
      } else {
       $$sum4$i$i = (($977) + 2)|0;
       $984 = (1784 + ($$sum4$i$i<<2)|0);
       $985 = HEAP32[$984>>2]|0;
       $986 = HEAP32[(1760)>>2]|0;
       $987 = ($985>>>0)<($986>>>0);
       if ($987) {
        _abort();
        // unreachable;
       } else {
        $$pre$phi$i$iZ2D = $984;$F$0$i$i = $985;
       }
      }
      HEAP32[$$pre$phi$i$iZ2D>>2] = $635;
      $988 = ((($F$0$i$i)) + 12|0);
      HEAP32[$988>>2] = $635;
      $989 = ((($635)) + 8|0);
      HEAP32[$989>>2] = $F$0$i$i;
      $990 = ((($635)) + 12|0);
      HEAP32[$990>>2] = $978;
      break;
     }
     $991 = $970 >>> 8;
     $992 = ($991|0)==(0);
     if ($992) {
      $I1$0$i$i = 0;
     } else {
      $993 = ($970>>>0)>(16777215);
      if ($993) {
       $I1$0$i$i = 31;
      } else {
       $994 = (($991) + 1048320)|0;
       $995 = $994 >>> 16;
       $996 = $995 & 8;
       $997 = $991 << $996;
       $998 = (($997) + 520192)|0;
       $999 = $998 >>> 16;
       $1000 = $999 & 4;
       $1001 = $1000 | $996;
       $1002 = $997 << $1000;
       $1003 = (($1002) + 245760)|0;
       $1004 = $1003 >>> 16;
       $1005 = $1004 & 2;
       $1006 = $1001 | $1005;
       $1007 = (14 - ($1006))|0;
       $1008 = $1002 << $1005;
       $1009 = $1008 >>> 15;
       $1010 = (($1007) + ($1009))|0;
       $1011 = $1010 << 1;
       $1012 = (($1010) + 7)|0;
       $1013 = $970 >>> $1012;
       $1014 = $1013 & 1;
       $1015 = $1014 | $1011;
       $I1$0$i$i = $1015;
      }
     }
     $1016 = (2048 + ($I1$0$i$i<<2)|0);
     $1017 = ((($635)) + 28|0);
     HEAP32[$1017>>2] = $I1$0$i$i;
     $1018 = ((($635)) + 20|0);
     HEAP32[$1018>>2] = 0;
     HEAP32[$941>>2] = 0;
     $1019 = HEAP32[(1748)>>2]|0;
     $1020 = 1 << $I1$0$i$i;
     $1021 = $1019 & $1020;
     $1022 = ($1021|0)==(0);
     if ($1022) {
      $1023 = $1019 | $1020;
      HEAP32[(1748)>>2] = $1023;
      HEAP32[$1016>>2] = $635;
      $1024 = ((($635)) + 24|0);
      HEAP32[$1024>>2] = $1016;
      $1025 = ((($635)) + 12|0);
      HEAP32[$1025>>2] = $635;
      $1026 = ((($635)) + 8|0);
      HEAP32[$1026>>2] = $635;
      break;
     }
     $1027 = HEAP32[$1016>>2]|0;
     $1028 = ((($1027)) + 4|0);
     $1029 = HEAP32[$1028>>2]|0;
     $1030 = $1029 & -8;
     $1031 = ($1030|0)==($970|0);
     L459: do {
      if ($1031) {
       $T$0$lcssa$i$i = $1027;
      } else {
       $1032 = ($I1$0$i$i|0)==(31);
       $1033 = $I1$0$i$i >>> 1;
       $1034 = (25 - ($1033))|0;
       $1035 = $1032 ? 0 : $1034;
       $1036 = $970 << $1035;
       $K2$07$i$i = $1036;$T$06$i$i = $1027;
       while(1) {
        $1043 = $K2$07$i$i >>> 31;
        $1044 = (((($T$06$i$i)) + 16|0) + ($1043<<2)|0);
        $1039 = HEAP32[$1044>>2]|0;
        $1045 = ($1039|0)==(0|0);
        if ($1045) {
         $$lcssa211 = $1044;$T$06$i$i$lcssa = $T$06$i$i;
         break;
        }
        $1037 = $K2$07$i$i << 1;
        $1038 = ((($1039)) + 4|0);
        $1040 = HEAP32[$1038>>2]|0;
        $1041 = $1040 & -8;
        $1042 = ($1041|0)==($970|0);
        if ($1042) {
         $T$0$lcssa$i$i = $1039;
         break L459;
        } else {
         $K2$07$i$i = $1037;$T$06$i$i = $1039;
        }
       }
       $1046 = HEAP32[(1760)>>2]|0;
       $1047 = ($$lcssa211>>>0)<($1046>>>0);
       if ($1047) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$$lcssa211>>2] = $635;
        $1048 = ((($635)) + 24|0);
        HEAP32[$1048>>2] = $T$06$i$i$lcssa;
        $1049 = ((($635)) + 12|0);
        HEAP32[$1049>>2] = $635;
        $1050 = ((($635)) + 8|0);
        HEAP32[$1050>>2] = $635;
        break L299;
       }
      }
     } while(0);
     $1051 = ((($T$0$lcssa$i$i)) + 8|0);
     $1052 = HEAP32[$1051>>2]|0;
     $1053 = HEAP32[(1760)>>2]|0;
     $1054 = ($1052>>>0)>=($1053>>>0);
     $not$$i$i = ($T$0$lcssa$i$i>>>0)>=($1053>>>0);
     $1055 = $1054 & $not$$i$i;
     if ($1055) {
      $1056 = ((($1052)) + 12|0);
      HEAP32[$1056>>2] = $635;
      HEAP32[$1051>>2] = $635;
      $1057 = ((($635)) + 8|0);
      HEAP32[$1057>>2] = $1052;
      $1058 = ((($635)) + 12|0);
      HEAP32[$1058>>2] = $T$0$lcssa$i$i;
      $1059 = ((($635)) + 24|0);
      HEAP32[$1059>>2] = 0;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   }
  } while(0);
  $1060 = HEAP32[(1756)>>2]|0;
  $1061 = ($1060>>>0)>($nb$0>>>0);
  if ($1061) {
   $1062 = (($1060) - ($nb$0))|0;
   HEAP32[(1756)>>2] = $1062;
   $1063 = HEAP32[(1768)>>2]|0;
   $1064 = (($1063) + ($nb$0)|0);
   HEAP32[(1768)>>2] = $1064;
   $1065 = $1062 | 1;
   $$sum$i32 = (($nb$0) + 4)|0;
   $1066 = (($1063) + ($$sum$i32)|0);
   HEAP32[$1066>>2] = $1065;
   $1067 = $nb$0 | 3;
   $1068 = ((($1063)) + 4|0);
   HEAP32[$1068>>2] = $1067;
   $1069 = ((($1063)) + 8|0);
   $mem$0 = $1069;
   return ($mem$0|0);
  }
 }
 $1070 = (___errno_location()|0);
 HEAP32[$1070>>2] = 12;
 $mem$0 = 0;
 return ($mem$0|0);
}
function _free($mem) {
 $mem = $mem|0;
 var $$lcssa = 0, $$pre = 0, $$pre$phi59Z2D = 0, $$pre$phi61Z2D = 0, $$pre$phiZ2D = 0, $$pre57 = 0, $$pre58 = 0, $$pre60 = 0, $$sum = 0, $$sum11 = 0, $$sum12 = 0, $$sum13 = 0, $$sum14 = 0, $$sum1718 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum22 = 0, $$sum23 = 0, $$sum24 = 0;
 var $$sum25 = 0, $$sum26 = 0, $$sum27 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0, $$sum31 = 0, $$sum5 = 0, $$sum67 = 0, $$sum8 = 0, $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0;
 var $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0;
 var $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0;
 var $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0;
 var $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0;
 var $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0;
 var $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0;
 var $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0;
 var $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0;
 var $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0;
 var $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0;
 var $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0;
 var $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0;
 var $321 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0;
 var $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0;
 var $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0;
 var $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $K19$052 = 0, $R$0 = 0, $R$0$lcssa = 0, $R$1 = 0;
 var $R7$0 = 0, $R7$0$lcssa = 0, $R7$1 = 0, $RP$0 = 0, $RP$0$lcssa = 0, $RP9$0 = 0, $RP9$0$lcssa = 0, $T$0$lcssa = 0, $T$051 = 0, $T$051$lcssa = 0, $cond = 0, $cond47 = 0, $not$ = 0, $p$0 = 0, $psize$0 = 0, $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($mem|0)==(0|0);
 if ($0) {
  return;
 }
 $1 = ((($mem)) + -8|0);
 $2 = HEAP32[(1760)>>2]|0;
 $3 = ($1>>>0)<($2>>>0);
 if ($3) {
  _abort();
  // unreachable;
 }
 $4 = ((($mem)) + -4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $5 & 3;
 $7 = ($6|0)==(1);
 if ($7) {
  _abort();
  // unreachable;
 }
 $8 = $5 & -8;
 $$sum = (($8) + -8)|0;
 $9 = (($mem) + ($$sum)|0);
 $10 = $5 & 1;
 $11 = ($10|0)==(0);
 do {
  if ($11) {
   $12 = HEAP32[$1>>2]|0;
   $13 = ($6|0)==(0);
   if ($13) {
    return;
   }
   $$sum2 = (-8 - ($12))|0;
   $14 = (($mem) + ($$sum2)|0);
   $15 = (($12) + ($8))|0;
   $16 = ($14>>>0)<($2>>>0);
   if ($16) {
    _abort();
    // unreachable;
   }
   $17 = HEAP32[(1764)>>2]|0;
   $18 = ($14|0)==($17|0);
   if ($18) {
    $$sum3 = (($8) + -4)|0;
    $103 = (($mem) + ($$sum3)|0);
    $104 = HEAP32[$103>>2]|0;
    $105 = $104 & 3;
    $106 = ($105|0)==(3);
    if (!($106)) {
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    HEAP32[(1752)>>2] = $15;
    $107 = $104 & -2;
    HEAP32[$103>>2] = $107;
    $108 = $15 | 1;
    $$sum20 = (($$sum2) + 4)|0;
    $109 = (($mem) + ($$sum20)|0);
    HEAP32[$109>>2] = $108;
    HEAP32[$9>>2] = $15;
    return;
   }
   $19 = $12 >>> 3;
   $20 = ($12>>>0)<(256);
   if ($20) {
    $$sum30 = (($$sum2) + 8)|0;
    $21 = (($mem) + ($$sum30)|0);
    $22 = HEAP32[$21>>2]|0;
    $$sum31 = (($$sum2) + 12)|0;
    $23 = (($mem) + ($$sum31)|0);
    $24 = HEAP32[$23>>2]|0;
    $25 = $19 << 1;
    $26 = (1784 + ($25<<2)|0);
    $27 = ($22|0)==($26|0);
    if (!($27)) {
     $28 = ($22>>>0)<($2>>>0);
     if ($28) {
      _abort();
      // unreachable;
     }
     $29 = ((($22)) + 12|0);
     $30 = HEAP32[$29>>2]|0;
     $31 = ($30|0)==($14|0);
     if (!($31)) {
      _abort();
      // unreachable;
     }
    }
    $32 = ($24|0)==($22|0);
    if ($32) {
     $33 = 1 << $19;
     $34 = $33 ^ -1;
     $35 = HEAP32[1744>>2]|0;
     $36 = $35 & $34;
     HEAP32[1744>>2] = $36;
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    $37 = ($24|0)==($26|0);
    if ($37) {
     $$pre60 = ((($24)) + 8|0);
     $$pre$phi61Z2D = $$pre60;
    } else {
     $38 = ($24>>>0)<($2>>>0);
     if ($38) {
      _abort();
      // unreachable;
     }
     $39 = ((($24)) + 8|0);
     $40 = HEAP32[$39>>2]|0;
     $41 = ($40|0)==($14|0);
     if ($41) {
      $$pre$phi61Z2D = $39;
     } else {
      _abort();
      // unreachable;
     }
    }
    $42 = ((($22)) + 12|0);
    HEAP32[$42>>2] = $24;
    HEAP32[$$pre$phi61Z2D>>2] = $22;
    $p$0 = $14;$psize$0 = $15;
    break;
   }
   $$sum22 = (($$sum2) + 24)|0;
   $43 = (($mem) + ($$sum22)|0);
   $44 = HEAP32[$43>>2]|0;
   $$sum23 = (($$sum2) + 12)|0;
   $45 = (($mem) + ($$sum23)|0);
   $46 = HEAP32[$45>>2]|0;
   $47 = ($46|0)==($14|0);
   do {
    if ($47) {
     $$sum25 = (($$sum2) + 20)|0;
     $57 = (($mem) + ($$sum25)|0);
     $58 = HEAP32[$57>>2]|0;
     $59 = ($58|0)==(0|0);
     if ($59) {
      $$sum24 = (($$sum2) + 16)|0;
      $60 = (($mem) + ($$sum24)|0);
      $61 = HEAP32[$60>>2]|0;
      $62 = ($61|0)==(0|0);
      if ($62) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $61;$RP$0 = $60;
      }
     } else {
      $R$0 = $58;$RP$0 = $57;
     }
     while(1) {
      $63 = ((($R$0)) + 20|0);
      $64 = HEAP32[$63>>2]|0;
      $65 = ($64|0)==(0|0);
      if (!($65)) {
       $R$0 = $64;$RP$0 = $63;
       continue;
      }
      $66 = ((($R$0)) + 16|0);
      $67 = HEAP32[$66>>2]|0;
      $68 = ($67|0)==(0|0);
      if ($68) {
       $R$0$lcssa = $R$0;$RP$0$lcssa = $RP$0;
       break;
      } else {
       $R$0 = $67;$RP$0 = $66;
      }
     }
     $69 = ($RP$0$lcssa>>>0)<($2>>>0);
     if ($69) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0$lcssa>>2] = 0;
      $R$1 = $R$0$lcssa;
      break;
     }
    } else {
     $$sum29 = (($$sum2) + 8)|0;
     $48 = (($mem) + ($$sum29)|0);
     $49 = HEAP32[$48>>2]|0;
     $50 = ($49>>>0)<($2>>>0);
     if ($50) {
      _abort();
      // unreachable;
     }
     $51 = ((($49)) + 12|0);
     $52 = HEAP32[$51>>2]|0;
     $53 = ($52|0)==($14|0);
     if (!($53)) {
      _abort();
      // unreachable;
     }
     $54 = ((($46)) + 8|0);
     $55 = HEAP32[$54>>2]|0;
     $56 = ($55|0)==($14|0);
     if ($56) {
      HEAP32[$51>>2] = $46;
      HEAP32[$54>>2] = $49;
      $R$1 = $46;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $70 = ($44|0)==(0|0);
   if ($70) {
    $p$0 = $14;$psize$0 = $15;
   } else {
    $$sum26 = (($$sum2) + 28)|0;
    $71 = (($mem) + ($$sum26)|0);
    $72 = HEAP32[$71>>2]|0;
    $73 = (2048 + ($72<<2)|0);
    $74 = HEAP32[$73>>2]|0;
    $75 = ($14|0)==($74|0);
    if ($75) {
     HEAP32[$73>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $76 = 1 << $72;
      $77 = $76 ^ -1;
      $78 = HEAP32[(1748)>>2]|0;
      $79 = $78 & $77;
      HEAP32[(1748)>>2] = $79;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    } else {
     $80 = HEAP32[(1760)>>2]|0;
     $81 = ($44>>>0)<($80>>>0);
     if ($81) {
      _abort();
      // unreachable;
     }
     $82 = ((($44)) + 16|0);
     $83 = HEAP32[$82>>2]|0;
     $84 = ($83|0)==($14|0);
     if ($84) {
      HEAP32[$82>>2] = $R$1;
     } else {
      $85 = ((($44)) + 20|0);
      HEAP32[$85>>2] = $R$1;
     }
     $86 = ($R$1|0)==(0|0);
     if ($86) {
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
    $87 = HEAP32[(1760)>>2]|0;
    $88 = ($R$1>>>0)<($87>>>0);
    if ($88) {
     _abort();
     // unreachable;
    }
    $89 = ((($R$1)) + 24|0);
    HEAP32[$89>>2] = $44;
    $$sum27 = (($$sum2) + 16)|0;
    $90 = (($mem) + ($$sum27)|0);
    $91 = HEAP32[$90>>2]|0;
    $92 = ($91|0)==(0|0);
    do {
     if (!($92)) {
      $93 = ($91>>>0)<($87>>>0);
      if ($93) {
       _abort();
       // unreachable;
      } else {
       $94 = ((($R$1)) + 16|0);
       HEAP32[$94>>2] = $91;
       $95 = ((($91)) + 24|0);
       HEAP32[$95>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum28 = (($$sum2) + 20)|0;
    $96 = (($mem) + ($$sum28)|0);
    $97 = HEAP32[$96>>2]|0;
    $98 = ($97|0)==(0|0);
    if ($98) {
     $p$0 = $14;$psize$0 = $15;
    } else {
     $99 = HEAP32[(1760)>>2]|0;
     $100 = ($97>>>0)<($99>>>0);
     if ($100) {
      _abort();
      // unreachable;
     } else {
      $101 = ((($R$1)) + 20|0);
      HEAP32[$101>>2] = $97;
      $102 = ((($97)) + 24|0);
      HEAP32[$102>>2] = $R$1;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
   }
  } else {
   $p$0 = $1;$psize$0 = $8;
  }
 } while(0);
 $110 = ($p$0>>>0)<($9>>>0);
 if (!($110)) {
  _abort();
  // unreachable;
 }
 $$sum19 = (($8) + -4)|0;
 $111 = (($mem) + ($$sum19)|0);
 $112 = HEAP32[$111>>2]|0;
 $113 = $112 & 1;
 $114 = ($113|0)==(0);
 if ($114) {
  _abort();
  // unreachable;
 }
 $115 = $112 & 2;
 $116 = ($115|0)==(0);
 if ($116) {
  $117 = HEAP32[(1768)>>2]|0;
  $118 = ($9|0)==($117|0);
  if ($118) {
   $119 = HEAP32[(1756)>>2]|0;
   $120 = (($119) + ($psize$0))|0;
   HEAP32[(1756)>>2] = $120;
   HEAP32[(1768)>>2] = $p$0;
   $121 = $120 | 1;
   $122 = ((($p$0)) + 4|0);
   HEAP32[$122>>2] = $121;
   $123 = HEAP32[(1764)>>2]|0;
   $124 = ($p$0|0)==($123|0);
   if (!($124)) {
    return;
   }
   HEAP32[(1764)>>2] = 0;
   HEAP32[(1752)>>2] = 0;
   return;
  }
  $125 = HEAP32[(1764)>>2]|0;
  $126 = ($9|0)==($125|0);
  if ($126) {
   $127 = HEAP32[(1752)>>2]|0;
   $128 = (($127) + ($psize$0))|0;
   HEAP32[(1752)>>2] = $128;
   HEAP32[(1764)>>2] = $p$0;
   $129 = $128 | 1;
   $130 = ((($p$0)) + 4|0);
   HEAP32[$130>>2] = $129;
   $131 = (($p$0) + ($128)|0);
   HEAP32[$131>>2] = $128;
   return;
  }
  $132 = $112 & -8;
  $133 = (($132) + ($psize$0))|0;
  $134 = $112 >>> 3;
  $135 = ($112>>>0)<(256);
  do {
   if ($135) {
    $136 = (($mem) + ($8)|0);
    $137 = HEAP32[$136>>2]|0;
    $$sum1718 = $8 | 4;
    $138 = (($mem) + ($$sum1718)|0);
    $139 = HEAP32[$138>>2]|0;
    $140 = $134 << 1;
    $141 = (1784 + ($140<<2)|0);
    $142 = ($137|0)==($141|0);
    if (!($142)) {
     $143 = HEAP32[(1760)>>2]|0;
     $144 = ($137>>>0)<($143>>>0);
     if ($144) {
      _abort();
      // unreachable;
     }
     $145 = ((($137)) + 12|0);
     $146 = HEAP32[$145>>2]|0;
     $147 = ($146|0)==($9|0);
     if (!($147)) {
      _abort();
      // unreachable;
     }
    }
    $148 = ($139|0)==($137|0);
    if ($148) {
     $149 = 1 << $134;
     $150 = $149 ^ -1;
     $151 = HEAP32[1744>>2]|0;
     $152 = $151 & $150;
     HEAP32[1744>>2] = $152;
     break;
    }
    $153 = ($139|0)==($141|0);
    if ($153) {
     $$pre58 = ((($139)) + 8|0);
     $$pre$phi59Z2D = $$pre58;
    } else {
     $154 = HEAP32[(1760)>>2]|0;
     $155 = ($139>>>0)<($154>>>0);
     if ($155) {
      _abort();
      // unreachable;
     }
     $156 = ((($139)) + 8|0);
     $157 = HEAP32[$156>>2]|0;
     $158 = ($157|0)==($9|0);
     if ($158) {
      $$pre$phi59Z2D = $156;
     } else {
      _abort();
      // unreachable;
     }
    }
    $159 = ((($137)) + 12|0);
    HEAP32[$159>>2] = $139;
    HEAP32[$$pre$phi59Z2D>>2] = $137;
   } else {
    $$sum5 = (($8) + 16)|0;
    $160 = (($mem) + ($$sum5)|0);
    $161 = HEAP32[$160>>2]|0;
    $$sum67 = $8 | 4;
    $162 = (($mem) + ($$sum67)|0);
    $163 = HEAP32[$162>>2]|0;
    $164 = ($163|0)==($9|0);
    do {
     if ($164) {
      $$sum9 = (($8) + 12)|0;
      $175 = (($mem) + ($$sum9)|0);
      $176 = HEAP32[$175>>2]|0;
      $177 = ($176|0)==(0|0);
      if ($177) {
       $$sum8 = (($8) + 8)|0;
       $178 = (($mem) + ($$sum8)|0);
       $179 = HEAP32[$178>>2]|0;
       $180 = ($179|0)==(0|0);
       if ($180) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $179;$RP9$0 = $178;
       }
      } else {
       $R7$0 = $176;$RP9$0 = $175;
      }
      while(1) {
       $181 = ((($R7$0)) + 20|0);
       $182 = HEAP32[$181>>2]|0;
       $183 = ($182|0)==(0|0);
       if (!($183)) {
        $R7$0 = $182;$RP9$0 = $181;
        continue;
       }
       $184 = ((($R7$0)) + 16|0);
       $185 = HEAP32[$184>>2]|0;
       $186 = ($185|0)==(0|0);
       if ($186) {
        $R7$0$lcssa = $R7$0;$RP9$0$lcssa = $RP9$0;
        break;
       } else {
        $R7$0 = $185;$RP9$0 = $184;
       }
      }
      $187 = HEAP32[(1760)>>2]|0;
      $188 = ($RP9$0$lcssa>>>0)<($187>>>0);
      if ($188) {
       _abort();
       // unreachable;
      } else {
       HEAP32[$RP9$0$lcssa>>2] = 0;
       $R7$1 = $R7$0$lcssa;
       break;
      }
     } else {
      $165 = (($mem) + ($8)|0);
      $166 = HEAP32[$165>>2]|0;
      $167 = HEAP32[(1760)>>2]|0;
      $168 = ($166>>>0)<($167>>>0);
      if ($168) {
       _abort();
       // unreachable;
      }
      $169 = ((($166)) + 12|0);
      $170 = HEAP32[$169>>2]|0;
      $171 = ($170|0)==($9|0);
      if (!($171)) {
       _abort();
       // unreachable;
      }
      $172 = ((($163)) + 8|0);
      $173 = HEAP32[$172>>2]|0;
      $174 = ($173|0)==($9|0);
      if ($174) {
       HEAP32[$169>>2] = $163;
       HEAP32[$172>>2] = $166;
       $R7$1 = $163;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $189 = ($161|0)==(0|0);
    if (!($189)) {
     $$sum12 = (($8) + 20)|0;
     $190 = (($mem) + ($$sum12)|0);
     $191 = HEAP32[$190>>2]|0;
     $192 = (2048 + ($191<<2)|0);
     $193 = HEAP32[$192>>2]|0;
     $194 = ($9|0)==($193|0);
     if ($194) {
      HEAP32[$192>>2] = $R7$1;
      $cond47 = ($R7$1|0)==(0|0);
      if ($cond47) {
       $195 = 1 << $191;
       $196 = $195 ^ -1;
       $197 = HEAP32[(1748)>>2]|0;
       $198 = $197 & $196;
       HEAP32[(1748)>>2] = $198;
       break;
      }
     } else {
      $199 = HEAP32[(1760)>>2]|0;
      $200 = ($161>>>0)<($199>>>0);
      if ($200) {
       _abort();
       // unreachable;
      }
      $201 = ((($161)) + 16|0);
      $202 = HEAP32[$201>>2]|0;
      $203 = ($202|0)==($9|0);
      if ($203) {
       HEAP32[$201>>2] = $R7$1;
      } else {
       $204 = ((($161)) + 20|0);
       HEAP32[$204>>2] = $R7$1;
      }
      $205 = ($R7$1|0)==(0|0);
      if ($205) {
       break;
      }
     }
     $206 = HEAP32[(1760)>>2]|0;
     $207 = ($R7$1>>>0)<($206>>>0);
     if ($207) {
      _abort();
      // unreachable;
     }
     $208 = ((($R7$1)) + 24|0);
     HEAP32[$208>>2] = $161;
     $$sum13 = (($8) + 8)|0;
     $209 = (($mem) + ($$sum13)|0);
     $210 = HEAP32[$209>>2]|0;
     $211 = ($210|0)==(0|0);
     do {
      if (!($211)) {
       $212 = ($210>>>0)<($206>>>0);
       if ($212) {
        _abort();
        // unreachable;
       } else {
        $213 = ((($R7$1)) + 16|0);
        HEAP32[$213>>2] = $210;
        $214 = ((($210)) + 24|0);
        HEAP32[$214>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum14 = (($8) + 12)|0;
     $215 = (($mem) + ($$sum14)|0);
     $216 = HEAP32[$215>>2]|0;
     $217 = ($216|0)==(0|0);
     if (!($217)) {
      $218 = HEAP32[(1760)>>2]|0;
      $219 = ($216>>>0)<($218>>>0);
      if ($219) {
       _abort();
       // unreachable;
      } else {
       $220 = ((($R7$1)) + 20|0);
       HEAP32[$220>>2] = $216;
       $221 = ((($216)) + 24|0);
       HEAP32[$221>>2] = $R7$1;
       break;
      }
     }
    }
   }
  } while(0);
  $222 = $133 | 1;
  $223 = ((($p$0)) + 4|0);
  HEAP32[$223>>2] = $222;
  $224 = (($p$0) + ($133)|0);
  HEAP32[$224>>2] = $133;
  $225 = HEAP32[(1764)>>2]|0;
  $226 = ($p$0|0)==($225|0);
  if ($226) {
   HEAP32[(1752)>>2] = $133;
   return;
  } else {
   $psize$1 = $133;
  }
 } else {
  $227 = $112 & -2;
  HEAP32[$111>>2] = $227;
  $228 = $psize$0 | 1;
  $229 = ((($p$0)) + 4|0);
  HEAP32[$229>>2] = $228;
  $230 = (($p$0) + ($psize$0)|0);
  HEAP32[$230>>2] = $psize$0;
  $psize$1 = $psize$0;
 }
 $231 = $psize$1 >>> 3;
 $232 = ($psize$1>>>0)<(256);
 if ($232) {
  $233 = $231 << 1;
  $234 = (1784 + ($233<<2)|0);
  $235 = HEAP32[1744>>2]|0;
  $236 = 1 << $231;
  $237 = $235 & $236;
  $238 = ($237|0)==(0);
  if ($238) {
   $239 = $235 | $236;
   HEAP32[1744>>2] = $239;
   $$pre = (($233) + 2)|0;
   $$pre57 = (1784 + ($$pre<<2)|0);
   $$pre$phiZ2D = $$pre57;$F16$0 = $234;
  } else {
   $$sum11 = (($233) + 2)|0;
   $240 = (1784 + ($$sum11<<2)|0);
   $241 = HEAP32[$240>>2]|0;
   $242 = HEAP32[(1760)>>2]|0;
   $243 = ($241>>>0)<($242>>>0);
   if ($243) {
    _abort();
    // unreachable;
   } else {
    $$pre$phiZ2D = $240;$F16$0 = $241;
   }
  }
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $244 = ((($F16$0)) + 12|0);
  HEAP32[$244>>2] = $p$0;
  $245 = ((($p$0)) + 8|0);
  HEAP32[$245>>2] = $F16$0;
  $246 = ((($p$0)) + 12|0);
  HEAP32[$246>>2] = $234;
  return;
 }
 $247 = $psize$1 >>> 8;
 $248 = ($247|0)==(0);
 if ($248) {
  $I18$0 = 0;
 } else {
  $249 = ($psize$1>>>0)>(16777215);
  if ($249) {
   $I18$0 = 31;
  } else {
   $250 = (($247) + 1048320)|0;
   $251 = $250 >>> 16;
   $252 = $251 & 8;
   $253 = $247 << $252;
   $254 = (($253) + 520192)|0;
   $255 = $254 >>> 16;
   $256 = $255 & 4;
   $257 = $256 | $252;
   $258 = $253 << $256;
   $259 = (($258) + 245760)|0;
   $260 = $259 >>> 16;
   $261 = $260 & 2;
   $262 = $257 | $261;
   $263 = (14 - ($262))|0;
   $264 = $258 << $261;
   $265 = $264 >>> 15;
   $266 = (($263) + ($265))|0;
   $267 = $266 << 1;
   $268 = (($266) + 7)|0;
   $269 = $psize$1 >>> $268;
   $270 = $269 & 1;
   $271 = $270 | $267;
   $I18$0 = $271;
  }
 }
 $272 = (2048 + ($I18$0<<2)|0);
 $273 = ((($p$0)) + 28|0);
 HEAP32[$273>>2] = $I18$0;
 $274 = ((($p$0)) + 16|0);
 $275 = ((($p$0)) + 20|0);
 HEAP32[$275>>2] = 0;
 HEAP32[$274>>2] = 0;
 $276 = HEAP32[(1748)>>2]|0;
 $277 = 1 << $I18$0;
 $278 = $276 & $277;
 $279 = ($278|0)==(0);
 L199: do {
  if ($279) {
   $280 = $276 | $277;
   HEAP32[(1748)>>2] = $280;
   HEAP32[$272>>2] = $p$0;
   $281 = ((($p$0)) + 24|0);
   HEAP32[$281>>2] = $272;
   $282 = ((($p$0)) + 12|0);
   HEAP32[$282>>2] = $p$0;
   $283 = ((($p$0)) + 8|0);
   HEAP32[$283>>2] = $p$0;
  } else {
   $284 = HEAP32[$272>>2]|0;
   $285 = ((($284)) + 4|0);
   $286 = HEAP32[$285>>2]|0;
   $287 = $286 & -8;
   $288 = ($287|0)==($psize$1|0);
   L202: do {
    if ($288) {
     $T$0$lcssa = $284;
    } else {
     $289 = ($I18$0|0)==(31);
     $290 = $I18$0 >>> 1;
     $291 = (25 - ($290))|0;
     $292 = $289 ? 0 : $291;
     $293 = $psize$1 << $292;
     $K19$052 = $293;$T$051 = $284;
     while(1) {
      $300 = $K19$052 >>> 31;
      $301 = (((($T$051)) + 16|0) + ($300<<2)|0);
      $296 = HEAP32[$301>>2]|0;
      $302 = ($296|0)==(0|0);
      if ($302) {
       $$lcssa = $301;$T$051$lcssa = $T$051;
       break;
      }
      $294 = $K19$052 << 1;
      $295 = ((($296)) + 4|0);
      $297 = HEAP32[$295>>2]|0;
      $298 = $297 & -8;
      $299 = ($298|0)==($psize$1|0);
      if ($299) {
       $T$0$lcssa = $296;
       break L202;
      } else {
       $K19$052 = $294;$T$051 = $296;
      }
     }
     $303 = HEAP32[(1760)>>2]|0;
     $304 = ($$lcssa>>>0)<($303>>>0);
     if ($304) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$$lcssa>>2] = $p$0;
      $305 = ((($p$0)) + 24|0);
      HEAP32[$305>>2] = $T$051$lcssa;
      $306 = ((($p$0)) + 12|0);
      HEAP32[$306>>2] = $p$0;
      $307 = ((($p$0)) + 8|0);
      HEAP32[$307>>2] = $p$0;
      break L199;
     }
    }
   } while(0);
   $308 = ((($T$0$lcssa)) + 8|0);
   $309 = HEAP32[$308>>2]|0;
   $310 = HEAP32[(1760)>>2]|0;
   $311 = ($309>>>0)>=($310>>>0);
   $not$ = ($T$0$lcssa>>>0)>=($310>>>0);
   $312 = $311 & $not$;
   if ($312) {
    $313 = ((($309)) + 12|0);
    HEAP32[$313>>2] = $p$0;
    HEAP32[$308>>2] = $p$0;
    $314 = ((($p$0)) + 8|0);
    HEAP32[$314>>2] = $309;
    $315 = ((($p$0)) + 12|0);
    HEAP32[$315>>2] = $T$0$lcssa;
    $316 = ((($p$0)) + 24|0);
    HEAP32[$316>>2] = 0;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $317 = HEAP32[(1776)>>2]|0;
 $318 = (($317) + -1)|0;
 HEAP32[(1776)>>2] = $318;
 $319 = ($318|0)==(0);
 if ($319) {
  $sp$0$in$i = (2200);
 } else {
  return;
 }
 while(1) {
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $320 = ($sp$0$i|0)==(0|0);
  $321 = ((($sp$0$i)) + 8|0);
  if ($320) {
   break;
  } else {
   $sp$0$in$i = $321;
  }
 }
 HEAP32[(1776)>>2] = -1;
 return;
}
function runPostSets() {
}
function _i64Subtract(a, b, c, d) {
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a - c)>>>0;
    h = (b - d)>>>0;
    h = (b - d - (((c>>>0) > (a>>>0))|0))>>>0; // Borrow one from high word to low word on underflow.
    return ((tempRet0 = h,l|0)|0);
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[((ptr)>>0)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[((ptr)>>0)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}
function _bitshift64Shl(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = (high << bits) | ((low&(ander << (32 - bits))) >>> (32 - bits));
      return low << bits;
    }
    tempRet0 = low << (bits - 32);
    return 0;
}
function _i64Add(a, b, c, d) {
    /*
      x = a + b*2^32
      y = c + d*2^32
      result = l + h*2^32
    */
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a + c)>>>0;
    h = (b + d + (((l>>>0) < (a>>>0))|0))>>>0; // Add carry from low word to high word on overflow.
    return ((tempRet0 = h,l|0)|0);
}
function _bitshift64Lshr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >>> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = 0;
    return (high >>> (bits - 32))|0;
}
function _memcpy(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}
function _bitshift64Ashr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = (high|0) < 0 ? -1 : 0;
    return (high >> (bits - 32))|0;
  }
function _llvm_cttz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = ((HEAP8[(((cttz_i8)+(x & 0xff))>>0)])|0);
    if ((ret|0) < 8) return ret|0;
    ret = ((HEAP8[(((cttz_i8)+((x >> 8)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = ((HEAP8[(((cttz_i8)+((x >> 16)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 16)|0;
    return (((HEAP8[(((cttz_i8)+(x >>> 24))>>0)])|0) + 24)|0;
  }

// ======== compiled code from system/lib/compiler-rt , see readme therein
function ___muldsi3($a, $b) {
  $a = $a | 0;
  $b = $b | 0;
  var $1 = 0, $2 = 0, $3 = 0, $6 = 0, $8 = 0, $11 = 0, $12 = 0;
  $1 = $a & 65535;
  $2 = $b & 65535;
  $3 = Math_imul($2, $1) | 0;
  $6 = $a >>> 16;
  $8 = ($3 >>> 16) + (Math_imul($2, $6) | 0) | 0;
  $11 = $b >>> 16;
  $12 = Math_imul($11, $1) | 0;
  return (tempRet0 = (($8 >>> 16) + (Math_imul($11, $6) | 0) | 0) + ((($8 & 65535) + $12 | 0) >>> 16) | 0, 0 | ($8 + $12 << 16 | $3 & 65535)) | 0;
}
function ___divdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $7$0 = 0, $7$1 = 0, $8$0 = 0, $10$0 = 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  $7$0 = $2$0 ^ $1$0;
  $7$1 = $2$1 ^ $1$1;
  $8$0 = ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, 0) | 0;
  $10$0 = _i64Subtract($8$0 ^ $7$0, tempRet0 ^ $7$1, $7$0, $7$1) | 0;
  return $10$0 | 0;
}
function ___remdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $10$0 = 0, $10$1 = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 16 | 0;
  $rem = __stackBase__ | 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, $rem) | 0;
  $10$0 = _i64Subtract(HEAP32[$rem >> 2] ^ $1$0, HEAP32[$rem + 4 >> 2] ^ $1$1, $1$0, $1$1) | 0;
  $10$1 = tempRet0;
  STACKTOP = __stackBase__;
  return (tempRet0 = $10$1, $10$0) | 0;
}
function ___muldi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $x_sroa_0_0_extract_trunc = 0, $y_sroa_0_0_extract_trunc = 0, $1$0 = 0, $1$1 = 0, $2 = 0;
  $x_sroa_0_0_extract_trunc = $a$0;
  $y_sroa_0_0_extract_trunc = $b$0;
  $1$0 = ___muldsi3($x_sroa_0_0_extract_trunc, $y_sroa_0_0_extract_trunc) | 0;
  $1$1 = tempRet0;
  $2 = Math_imul($a$1, $y_sroa_0_0_extract_trunc) | 0;
  return (tempRet0 = ((Math_imul($b$1, $x_sroa_0_0_extract_trunc) | 0) + $2 | 0) + $1$1 | $1$1 & 0, 0 | $1$0 & -1) | 0;
}
function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0;
  $1$0 = ___udivmoddi4($a$0, $a$1, $b$0, $b$1, 0) | 0;
  return $1$0 | 0;
}
function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 16 | 0;
  $rem = __stackBase__ | 0;
  ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) | 0;
  STACKTOP = __stackBase__;
  return (tempRet0 = HEAP32[$rem + 4 >> 2] | 0, HEAP32[$rem >> 2] | 0) | 0;
}
function ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  $rem = $rem | 0;
  var $n_sroa_0_0_extract_trunc = 0, $n_sroa_1_4_extract_shift$0 = 0, $n_sroa_1_4_extract_trunc = 0, $d_sroa_0_0_extract_trunc = 0, $d_sroa_1_4_extract_shift$0 = 0, $d_sroa_1_4_extract_trunc = 0, $4 = 0, $17 = 0, $37 = 0, $49 = 0, $51 = 0, $57 = 0, $58 = 0, $66 = 0, $78 = 0, $86 = 0, $88 = 0, $89 = 0, $91 = 0, $92 = 0, $95 = 0, $105 = 0, $117 = 0, $119 = 0, $125 = 0, $126 = 0, $130 = 0, $q_sroa_1_1_ph = 0, $q_sroa_0_1_ph = 0, $r_sroa_1_1_ph = 0, $r_sroa_0_1_ph = 0, $sr_1_ph = 0, $d_sroa_0_0_insert_insert99$0 = 0, $d_sroa_0_0_insert_insert99$1 = 0, $137$0 = 0, $137$1 = 0, $carry_0203 = 0, $sr_1202 = 0, $r_sroa_0_1201 = 0, $r_sroa_1_1200 = 0, $q_sroa_0_1199 = 0, $q_sroa_1_1198 = 0, $147 = 0, $149 = 0, $r_sroa_0_0_insert_insert42$0 = 0, $r_sroa_0_0_insert_insert42$1 = 0, $150$1 = 0, $151$0 = 0, $152 = 0, $154$0 = 0, $r_sroa_0_0_extract_trunc = 0, $r_sroa_1_4_extract_trunc = 0, $155 = 0, $carry_0_lcssa$0 = 0, $carry_0_lcssa$1 = 0, $r_sroa_0_1_lcssa = 0, $r_sroa_1_1_lcssa = 0, $q_sroa_0_1_lcssa = 0, $q_sroa_1_1_lcssa = 0, $q_sroa_0_0_insert_ext75$0 = 0, $q_sroa_0_0_insert_ext75$1 = 0, $q_sroa_0_0_insert_insert77$1 = 0, $_0$0 = 0, $_0$1 = 0;
  $n_sroa_0_0_extract_trunc = $a$0;
  $n_sroa_1_4_extract_shift$0 = $a$1;
  $n_sroa_1_4_extract_trunc = $n_sroa_1_4_extract_shift$0;
  $d_sroa_0_0_extract_trunc = $b$0;
  $d_sroa_1_4_extract_shift$0 = $b$1;
  $d_sroa_1_4_extract_trunc = $d_sroa_1_4_extract_shift$0;
  if (($n_sroa_1_4_extract_trunc | 0) == 0) {
    $4 = ($rem | 0) != 0;
    if (($d_sroa_1_4_extract_trunc | 0) == 0) {
      if ($4) {
        HEAP32[$rem >> 2] = ($n_sroa_0_0_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
        HEAP32[$rem + 4 >> 2] = 0;
      }
      $_0$1 = 0;
      $_0$0 = ($n_sroa_0_0_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$4) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    }
  }
  $17 = ($d_sroa_1_4_extract_trunc | 0) == 0;
  do {
    if (($d_sroa_0_0_extract_trunc | 0) == 0) {
      if ($17) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
          HEAP32[$rem + 4 >> 2] = 0;
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      if (($n_sroa_0_0_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0;
          HEAP32[$rem + 4 >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_1_4_extract_trunc >>> 0);
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_1_4_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $37 = $d_sroa_1_4_extract_trunc - 1 | 0;
      if (($37 & $d_sroa_1_4_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0 | $a$0 & -1;
          HEAP32[$rem + 4 >> 2] = $37 & $n_sroa_1_4_extract_trunc | $a$1 & 0;
        }
        $_0$1 = 0;
        $_0$0 = $n_sroa_1_4_extract_trunc >>> ((_llvm_cttz_i32($d_sroa_1_4_extract_trunc | 0) | 0) >>> 0);
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $49 = Math_clz32($d_sroa_1_4_extract_trunc | 0) | 0;
      $51 = $49 - (Math_clz32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
      if ($51 >>> 0 <= 30) {
        $57 = $51 + 1 | 0;
        $58 = 31 - $51 | 0;
        $sr_1_ph = $57;
        $r_sroa_0_1_ph = $n_sroa_1_4_extract_trunc << $58 | $n_sroa_0_0_extract_trunc >>> ($57 >>> 0);
        $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($57 >>> 0);
        $q_sroa_0_1_ph = 0;
        $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $58;
        break;
      }
      if (($rem | 0) == 0) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = 0 | $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$17) {
        $117 = Math_clz32($d_sroa_1_4_extract_trunc | 0) | 0;
        $119 = $117 - (Math_clz32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        if ($119 >>> 0 <= 31) {
          $125 = $119 + 1 | 0;
          $126 = 31 - $119 | 0;
          $130 = $119 - 31 >> 31;
          $sr_1_ph = $125;
          $r_sroa_0_1_ph = $n_sroa_0_0_extract_trunc >>> ($125 >>> 0) & $130 | $n_sroa_1_4_extract_trunc << $126;
          $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($125 >>> 0) & $130;
          $q_sroa_0_1_ph = 0;
          $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $126;
          break;
        }
        if (($rem | 0) == 0) {
          $_0$1 = 0;
          $_0$0 = 0;
          return (tempRet0 = $_0$1, $_0$0) | 0;
        }
        HEAP32[$rem >> 2] = 0 | $a$0 & -1;
        HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $66 = $d_sroa_0_0_extract_trunc - 1 | 0;
      if (($66 & $d_sroa_0_0_extract_trunc | 0) != 0) {
        $86 = (Math_clz32($d_sroa_0_0_extract_trunc | 0) | 0) + 33 | 0;
        $88 = $86 - (Math_clz32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        $89 = 64 - $88 | 0;
        $91 = 32 - $88 | 0;
        $92 = $91 >> 31;
        $95 = $88 - 32 | 0;
        $105 = $95 >> 31;
        $sr_1_ph = $88;
        $r_sroa_0_1_ph = $91 - 1 >> 31 & $n_sroa_1_4_extract_trunc >>> ($95 >>> 0) | ($n_sroa_1_4_extract_trunc << $91 | $n_sroa_0_0_extract_trunc >>> ($88 >>> 0)) & $105;
        $r_sroa_1_1_ph = $105 & $n_sroa_1_4_extract_trunc >>> ($88 >>> 0);
        $q_sroa_0_1_ph = $n_sroa_0_0_extract_trunc << $89 & $92;
        $q_sroa_1_1_ph = ($n_sroa_1_4_extract_trunc << $89 | $n_sroa_0_0_extract_trunc >>> ($95 >>> 0)) & $92 | $n_sroa_0_0_extract_trunc << $91 & $88 - 33 >> 31;
        break;
      }
      if (($rem | 0) != 0) {
        HEAP32[$rem >> 2] = $66 & $n_sroa_0_0_extract_trunc;
        HEAP32[$rem + 4 >> 2] = 0;
      }
      if (($d_sroa_0_0_extract_trunc | 0) == 1) {
        $_0$1 = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$0 = 0 | $a$0 & -1;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      } else {
        $78 = _llvm_cttz_i32($d_sroa_0_0_extract_trunc | 0) | 0;
        $_0$1 = 0 | $n_sroa_1_4_extract_trunc >>> ($78 >>> 0);
        $_0$0 = $n_sroa_1_4_extract_trunc << 32 - $78 | $n_sroa_0_0_extract_trunc >>> ($78 >>> 0) | 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
    }
  } while (0);
  if (($sr_1_ph | 0) == 0) {
    $q_sroa_1_1_lcssa = $q_sroa_1_1_ph;
    $q_sroa_0_1_lcssa = $q_sroa_0_1_ph;
    $r_sroa_1_1_lcssa = $r_sroa_1_1_ph;
    $r_sroa_0_1_lcssa = $r_sroa_0_1_ph;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = 0;
  } else {
    $d_sroa_0_0_insert_insert99$0 = 0 | $b$0 & -1;
    $d_sroa_0_0_insert_insert99$1 = $d_sroa_1_4_extract_shift$0 | $b$1 & 0;
    $137$0 = _i64Add($d_sroa_0_0_insert_insert99$0 | 0, $d_sroa_0_0_insert_insert99$1 | 0, -1, -1) | 0;
    $137$1 = tempRet0;
    $q_sroa_1_1198 = $q_sroa_1_1_ph;
    $q_sroa_0_1199 = $q_sroa_0_1_ph;
    $r_sroa_1_1200 = $r_sroa_1_1_ph;
    $r_sroa_0_1201 = $r_sroa_0_1_ph;
    $sr_1202 = $sr_1_ph;
    $carry_0203 = 0;
    while (1) {
      $147 = $q_sroa_0_1199 >>> 31 | $q_sroa_1_1198 << 1;
      $149 = $carry_0203 | $q_sroa_0_1199 << 1;
      $r_sroa_0_0_insert_insert42$0 = 0 | ($r_sroa_0_1201 << 1 | $q_sroa_1_1198 >>> 31);
      $r_sroa_0_0_insert_insert42$1 = $r_sroa_0_1201 >>> 31 | $r_sroa_1_1200 << 1 | 0;
      _i64Subtract($137$0, $137$1, $r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1) | 0;
      $150$1 = tempRet0;
      $151$0 = $150$1 >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1;
      $152 = $151$0 & 1;
      $154$0 = _i64Subtract($r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1, $151$0 & $d_sroa_0_0_insert_insert99$0, ((($150$1 | 0) < 0 ? -1 : 0) >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1) & $d_sroa_0_0_insert_insert99$1) | 0;
      $r_sroa_0_0_extract_trunc = $154$0;
      $r_sroa_1_4_extract_trunc = tempRet0;
      $155 = $sr_1202 - 1 | 0;
      if (($155 | 0) == 0) {
        break;
      } else {
        $q_sroa_1_1198 = $147;
        $q_sroa_0_1199 = $149;
        $r_sroa_1_1200 = $r_sroa_1_4_extract_trunc;
        $r_sroa_0_1201 = $r_sroa_0_0_extract_trunc;
        $sr_1202 = $155;
        $carry_0203 = $152;
      }
    }
    $q_sroa_1_1_lcssa = $147;
    $q_sroa_0_1_lcssa = $149;
    $r_sroa_1_1_lcssa = $r_sroa_1_4_extract_trunc;
    $r_sroa_0_1_lcssa = $r_sroa_0_0_extract_trunc;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = $152;
  }
  $q_sroa_0_0_insert_ext75$0 = $q_sroa_0_1_lcssa;
  $q_sroa_0_0_insert_ext75$1 = 0;
  $q_sroa_0_0_insert_insert77$1 = $q_sroa_1_1_lcssa | $q_sroa_0_0_insert_ext75$1;
  if (($rem | 0) != 0) {
    HEAP32[$rem >> 2] = 0 | $r_sroa_0_1_lcssa;
    HEAP32[$rem + 4 >> 2] = $r_sroa_1_1_lcssa | 0;
  }
  $_0$1 = (0 | $q_sroa_0_0_insert_ext75$0) >>> 31 | $q_sroa_0_0_insert_insert77$1 << 1 | ($q_sroa_0_0_insert_ext75$1 << 1 | $q_sroa_0_0_insert_ext75$0 >>> 31) & 0 | $carry_0_lcssa$1;
  $_0$0 = ($q_sroa_0_0_insert_ext75$0 << 1 | 0 >>> 31) & -2 | $carry_0_lcssa$0;
  return (tempRet0 = $_0$1, $_0$0) | 0;
}
// =======================================================================



  
function dynCall_iiii(index,a1,a2,a3) {
  index = index|0;
  a1=a1|0; a2=a2|0; a3=a3|0;
  return FUNCTION_TABLE_iiii[index&15](a1|0,a2|0,a3|0)|0;
}


function jsCall_iiii_0(a1,a2,a3) {
  a1=a1|0; a2=a2|0; a3=a3|0;
  return jsCall_iiii(0,a1|0,a2|0,a3|0)|0;
}



function jsCall_iiii_1(a1,a2,a3) {
  a1=a1|0; a2=a2|0; a3=a3|0;
  return jsCall_iiii(1,a1|0,a2|0,a3|0)|0;
}



function dynCall_vdddiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  index = index|0;
  a1=+a1; a2=+a2; a3=+a3; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0;
  FUNCTION_TABLE_vdddiiii[index&7](+a1,+a2,+a3,a4|0,a5|0,a6|0,a7|0);
}


function jsCall_vdddiiii_0(a1,a2,a3,a4,a5,a6,a7) {
  a1=+a1; a2=+a2; a3=+a3; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0;
  jsCall_vdddiiii(0,+a1,+a2,+a3,a4|0,a5|0,a6|0,a7|0);
}



function jsCall_vdddiiii_1(a1,a2,a3,a4,a5,a6,a7) {
  a1=+a1; a2=+a2; a3=+a3; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0;
  jsCall_vdddiiii(1,+a1,+a2,+a3,a4|0,a5|0,a6|0,a7|0);
}



function dynCall_vidddiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  index = index|0;
  a1=a1|0; a2=+a2; a3=+a3; a4=+a4; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0;
  FUNCTION_TABLE_vidddiiii[index&15](a1|0,+a2,+a3,+a4,a5|0,a6|0,a7|0,a8|0);
}


function jsCall_vidddiiii_0(a1,a2,a3,a4,a5,a6,a7,a8) {
  a1=a1|0; a2=+a2; a3=+a3; a4=+a4; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0;
  jsCall_vidddiiii(0,a1|0,+a2,+a3,+a4,a5|0,a6|0,a7|0,a8|0);
}



function jsCall_vidddiiii_1(a1,a2,a3,a4,a5,a6,a7,a8) {
  a1=a1|0; a2=+a2; a3=+a3; a4=+a4; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0;
  jsCall_vidddiiii(1,a1|0,+a2,+a3,+a4,a5|0,a6|0,a7|0,a8|0);
}



function dynCall_vi(index,a1) {
  index = index|0;
  a1=a1|0;
  FUNCTION_TABLE_vi[index&15](a1|0);
}


function jsCall_vi_0(a1) {
  a1=a1|0;
  jsCall_vi(0,a1|0);
}



function jsCall_vi_1(a1) {
  a1=a1|0;
  jsCall_vi(1,a1|0);
}



function dynCall_ii(index,a1) {
  index = index|0;
  a1=a1|0;
  return FUNCTION_TABLE_ii[index&7](a1|0)|0;
}


function jsCall_ii_0(a1) {
  a1=a1|0;
  return jsCall_ii(0,a1|0)|0;
}



function jsCall_ii_1(a1) {
  a1=a1|0;
  return jsCall_ii(1,a1|0)|0;
}



function dynCall_iddddddddddddd(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13) {
  index = index|0;
  a1=+a1; a2=+a2; a3=+a3; a4=+a4; a5=+a5; a6=+a6; a7=+a7; a8=+a8; a9=+a9; a10=+a10; a11=+a11; a12=+a12; a13=+a13;
  return FUNCTION_TABLE_iddddddddddddd[index&7](+a1,+a2,+a3,+a4,+a5,+a6,+a7,+a8,+a9,+a10,+a11,+a12,+a13)|0;
}


function jsCall_iddddddddddddd_0(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13) {
  a1=+a1; a2=+a2; a3=+a3; a4=+a4; a5=+a5; a6=+a6; a7=+a7; a8=+a8; a9=+a9; a10=+a10; a11=+a11; a12=+a12; a13=+a13;
  return jsCall_iddddddddddddd(0,+a1,+a2,+a3,+a4,+a5,+a6,+a7,+a8,+a9,+a10,+a11,+a12,+a13)|0;
}



function jsCall_iddddddddddddd_1(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13) {
  a1=+a1; a2=+a2; a3=+a3; a4=+a4; a5=+a5; a6=+a6; a7=+a7; a8=+a8; a9=+a9; a10=+a10; a11=+a11; a12=+a12; a13=+a13;
  return jsCall_iddddddddddddd(1,+a1,+a2,+a3,+a4,+a5,+a6,+a7,+a8,+a9,+a10,+a11,+a12,+a13)|0;
}



function dynCall_iiddddddddddddd(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14) {
  index = index|0;
  a1=a1|0; a2=+a2; a3=+a3; a4=+a4; a5=+a5; a6=+a6; a7=+a7; a8=+a8; a9=+a9; a10=+a10; a11=+a11; a12=+a12; a13=+a13; a14=+a14;
  return FUNCTION_TABLE_iiddddddddddddd[index&15](a1|0,+a2,+a3,+a4,+a5,+a6,+a7,+a8,+a9,+a10,+a11,+a12,+a13,+a14)|0;
}


function jsCall_iiddddddddddddd_0(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14) {
  a1=a1|0; a2=+a2; a3=+a3; a4=+a4; a5=+a5; a6=+a6; a7=+a7; a8=+a8; a9=+a9; a10=+a10; a11=+a11; a12=+a12; a13=+a13; a14=+a14;
  return jsCall_iiddddddddddddd(0,a1|0,+a2,+a3,+a4,+a5,+a6,+a7,+a8,+a9,+a10,+a11,+a12,+a13,+a14)|0;
}



function jsCall_iiddddddddddddd_1(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14) {
  a1=a1|0; a2=+a2; a3=+a3; a4=+a4; a5=+a5; a6=+a6; a7=+a7; a8=+a8; a9=+a9; a10=+a10; a11=+a11; a12=+a12; a13=+a13; a14=+a14;
  return jsCall_iiddddddddddddd(1,a1|0,+a2,+a3,+a4,+a5,+a6,+a7,+a8,+a9,+a10,+a11,+a12,+a13,+a14)|0;
}


function b0(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_iiii(0);return 0;
}
function b1(p0,p1,p2,p3,p4,p5,p6) {
 p0 = +p0;p1 = +p1;p2 = +p2;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0; nullFunc_vdddiiii(1);
}
function b2(p0,p1,p2,p3,p4,p5,p6,p7) {
 p0 = p0|0;p1 = +p1;p2 = +p2;p3 = +p3;p4 = p4|0;p5 = p5|0;p6 = p6|0;p7 = p7|0; nullFunc_vidddiiii(2);
}
function b3(p0) {
 p0 = p0|0; nullFunc_vi(3);
}
function b4(p0) {
 p0 = p0|0; nullFunc_ii(4);return 0;
}
function b5(p0,p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12) {
 p0 = +p0;p1 = +p1;p2 = +p2;p3 = +p3;p4 = +p4;p5 = +p5;p6 = +p6;p7 = +p7;p8 = +p8;p9 = +p9;p10 = +p10;p11 = +p11;p12 = +p12; nullFunc_iddddddddddddd(5);return 0;
}
function b6(p0,p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13) {
 p0 = p0|0;p1 = +p1;p2 = +p2;p3 = +p3;p4 = +p4;p5 = +p5;p6 = +p6;p7 = +p7;p8 = +p8;p9 = +p9;p10 = +p10;p11 = +p11;p12 = +p12;p13 = +p13; nullFunc_iiddddddddddddd(6);return 0;
}

// EMSCRIPTEN_END_FUNCS
var FUNCTION_TABLE_iiii = [b0,b0,jsCall_iiii_0,b0,jsCall_iiii_1,b0,b0,___stdout_write,___stdio_seek,b0,b0,___stdio_write,b0,b0,b0,b0];
var FUNCTION_TABLE_vdddiiii = [b1,b1,jsCall_vdddiiii_0,b1,jsCall_vdddiiii_1,b1,b1,b1];
var FUNCTION_TABLE_vidddiiii = [b2,b2,jsCall_vidddiiii_0,b2,jsCall_vidddiiii_1,b2,b2,b2,b2,b2,_proxy_surface_get_color,b2,b2,b2,b2,b2];
var FUNCTION_TABLE_vi = [b3,b3,jsCall_vi_0,b3,jsCall_vi_1,b3,b3,b3,b3,b3,b3,b3,_cleanup,b3,b3,b3];
var FUNCTION_TABLE_ii = [b4,b4,jsCall_ii_0,b4,jsCall_ii_1,b4,___stdio_close,b4];
var FUNCTION_TABLE_iddddddddddddd = [b5,b5,jsCall_iddddddddddddd_0,b5,jsCall_iddddddddddddd_1,b5,b5,b5];
var FUNCTION_TABLE_iiddddddddddddd = [b6,b6,jsCall_iiddddddddddddd_0,b6,jsCall_iiddddddddddddd_1,b6,b6,b6,b6,_proxy_surface_draw_dab,b6,b6,b6,b6,b6,b6];

  return { _i64Subtract: _i64Subtract, _stroke_to: _stroke_to, _free: _free, _i64Add: _i64Add, _init: _init, _new_brush: _new_brush, _memset: _memset, _set_brush_base_value: _set_brush_base_value, _malloc: _malloc, _bitshift64Lshr: _bitshift64Lshr, _memcpy: _memcpy, _set_brush_mapping_point: _set_brush_mapping_point, _set_brush_mapping_n: _set_brush_mapping_n, _reset_brush: _reset_brush, _bitshift64Shl: _bitshift64Shl, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, establishStackSpace: establishStackSpace, setThrew: setThrew, setTempRet0: setTempRet0, getTempRet0: getTempRet0, dynCall_iiii: dynCall_iiii, dynCall_vdddiiii: dynCall_vdddiiii, dynCall_vidddiiii: dynCall_vidddiiii, dynCall_vi: dynCall_vi, dynCall_ii: dynCall_ii, dynCall_iddddddddddddd: dynCall_iddddddddddddd, dynCall_iiddddddddddddd: dynCall_iiddddddddddddd };
})
// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
var real__i64Subtract = asm["_i64Subtract"]; asm["_i64Subtract"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__i64Subtract.apply(null, arguments);
};

var real__stroke_to = asm["_stroke_to"]; asm["_stroke_to"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__stroke_to.apply(null, arguments);
};

var real__free = asm["_free"]; asm["_free"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__free.apply(null, arguments);
};

var real__i64Add = asm["_i64Add"]; asm["_i64Add"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__i64Add.apply(null, arguments);
};

var real__new_brush = asm["_new_brush"]; asm["_new_brush"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__new_brush.apply(null, arguments);
};

var real__init = asm["_init"]; asm["_init"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__init.apply(null, arguments);
};

var real__set_brush_base_value = asm["_set_brush_base_value"]; asm["_set_brush_base_value"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__set_brush_base_value.apply(null, arguments);
};

var real__malloc = asm["_malloc"]; asm["_malloc"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__malloc.apply(null, arguments);
};

var real__set_brush_mapping_n = asm["_set_brush_mapping_n"]; asm["_set_brush_mapping_n"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__set_brush_mapping_n.apply(null, arguments);
};

var real__set_brush_mapping_point = asm["_set_brush_mapping_point"]; asm["_set_brush_mapping_point"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__set_brush_mapping_point.apply(null, arguments);
};

var real__bitshift64Lshr = asm["_bitshift64Lshr"]; asm["_bitshift64Lshr"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__bitshift64Lshr.apply(null, arguments);
};

var real__reset_brush = asm["_reset_brush"]; asm["_reset_brush"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__reset_brush.apply(null, arguments);
};

var real__bitshift64Shl = asm["_bitshift64Shl"]; asm["_bitshift64Shl"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__bitshift64Shl.apply(null, arguments);
};
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _stroke_to = Module["_stroke_to"] = asm["_stroke_to"];
var _free = Module["_free"] = asm["_free"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _new_brush = Module["_new_brush"] = asm["_new_brush"];
var _init = Module["_init"] = asm["_init"];
var _memset = Module["_memset"] = asm["_memset"];
var _set_brush_base_value = Module["_set_brush_base_value"] = asm["_set_brush_base_value"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _set_brush_mapping_n = Module["_set_brush_mapping_n"] = asm["_set_brush_mapping_n"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _set_brush_mapping_point = Module["_set_brush_mapping_point"] = asm["_set_brush_mapping_point"];
var _bitshift64Lshr = Module["_bitshift64Lshr"] = asm["_bitshift64Lshr"];
var _reset_brush = Module["_reset_brush"] = asm["_reset_brush"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_vdddiiii = Module["dynCall_vdddiiii"] = asm["dynCall_vdddiiii"];
var dynCall_vidddiiii = Module["dynCall_vidddiiii"] = asm["dynCall_vidddiiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_iddddddddddddd = Module["dynCall_iddddddddddddd"] = asm["dynCall_iddddddddddddd"];
var dynCall_iiddddddddddddd = Module["dynCall_iiddddddddddddd"] = asm["dynCall_iiddddddddddddd"];
;

Runtime.stackAlloc = asm['stackAlloc'];
Runtime.stackSave = asm['stackSave'];
Runtime.stackRestore = asm['stackRestore'];
Runtime.establishStackSpace = asm['establishStackSpace'];

Runtime.setTempRet0 = asm['setTempRet0'];
Runtime.getTempRet0 = asm['getTempRet0'];



// === Auto-generated postamble setup entry stuff ===


function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun']) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString(Module['thisProgram']), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);


  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    exit(ret, /* implicit = */ true);
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return; 

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (Module['_main'] && shouldRunNow) Module['callMain'](args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status, implicit) {
  if (implicit && Module['noExitRuntime']) {
    Module.printErr('exit(' + status + ') implicitly called by end of main(), but noExitRuntime, so not exiting the runtime (you can use emscripten_force_exit, if you want to force a true shutdown)');
    return;
  }

  if (Module['noExitRuntime']) {
    Module.printErr('exit(' + status + ') called, but noExitRuntime, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)');
  } else {

    ABORT = true;
    EXITSTATUS = status;
    STACKTOP = initialStackTop;

    exitRuntime();

    if (Module['onExit']) Module['onExit'](status);
  }

  if (ENVIRONMENT_IS_NODE) {
    // Work around a node.js bug where stdout buffer is not flushed at process exit:
    // Instead of process.exit() directly, wait for stdout flush event.
    // See https://github.com/joyent/node/issues/1669 and https://github.com/kripken/emscripten/issues/2582
    // Workaround is based on https://github.com/RReverser/acorn/commit/50ab143cecc9ed71a2d66f78b4aec3bb2e9844f6
    process['stdout']['once']('drain', function () {
      process['exit'](status);
    });
    console.log(' '); // Make sure to print something to force the drain event to occur, in case the stdout buffer was empty.
    // Work around another node bug where sometimes 'drain' is never fired - make another effort
    // to emit the exit status, after a significant delay (if node hasn't fired drain by then, give up)
    setTimeout(function() {
      process['exit'](status);
    }, 500);
  } else
  if (ENVIRONMENT_IS_SHELL && typeof quit === 'function') {
    quit(status);
  }
  // if we reach here, we must throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

var abortDecorators = [];

function abort(what) {
  if (what !== undefined) {
    Module.print(what);
    Module.printErr(what);
    what = JSON.stringify(what)
  } else {
    what = '';
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';

  var output = 'abort(' + what + ') at ' + stackTrace() + extra;
  if (abortDecorators) {
    abortDecorators.forEach(function(decorator) {
      output = decorator(output, what);
    });
  }
  throw output;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

Module["noExitRuntime"] = true;

run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}




  return Module;
};

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



var Bindings = (function(EmModuleFactory) {


    var createGetColorProxy = function(EM_Module, getColor) {
        return function(x, y, radius, r_ptr, g_ptr, b_ptr, a_ptr) {
            var result = getColor(x,y,radius);

            EM_Module.setValue(r_ptr, result[0], "float");
            EM_Module.setValue(g_ptr, result[1], "float");
            EM_Module.setValue(b_ptr, result[2], "float");
            EM_Module.setValue(a_ptr, result[3], "float");
        };
    };

    var loadBrush = function(brush) {
        var bindings = this;
        var settings = brush.settings;

        bindings.new_brush();

        forEachKeyIn(settings, function(settingName, setting) {
            bindings.set_brush_base_value(settingName, (setting.base_value || 0.0));

            forEachKeyIn(setting.inputs, function(inputName, input) {
                bindings.set_brush_mapping_n(settingName, inputName, (input.length));

                input.forEach(function(point, index) {
                    bindings.set_brush_mapping_point(settingName, inputName, index, point[0], point[1]);
                });
            });
        });

        bindings.reset_brush();
    };

    return function(drawDab, getColor) {
        var EM_Module = EmModuleFactory();

        var colorProxyPtr = EM_Module.Runtime.addFunction(createGetColorProxy(EM_Module, getColor));
        var drawDabProxyPtr = EM_Module.Runtime.addFunction(drawDab);

        EM_Module.ccall("init", "void", ["number", "number"], [drawDabProxyPtr, colorProxyPtr]);

        this.Module = EM_Module;
        this.stroke_to = EM_Module.cwrap("stroke_to", "void",
            ["number", "number", "number", "number", "number", "number"]);

        this.load_brush = bind(loadBrush, this);
        this.new_brush = EM_Module.cwrap("new_brush");
        this.reset_brush = EM_Module.cwrap("reset_brush");

        // Using the slower ccall() method, because cwrap() has a weird bug on FF when using strings :(
        this.set_brush_base_value = function(name, value) {
            EM_Module.ccall("set_brush_base_value", "void", ["string", "number"], [name, value]);
        };

        this.set_brush_mapping_n = function(name, mapping, n) {
            EM_Module.ccall("set_brush_mapping_n", "void", ["string", "string", "number"], [name, mapping, n]);
        };

        this.set_brush_mapping_point = function(name, mapping, index, x,y) {
            EM_Module.ccall("set_brush_mapping_point", "void",
                ["string", "string", "number", "number", "number"], [name, mapping, index, x,y]);
        }
    };

})(Module);


var Painter = (function(Bindings) {

    var canvasRenderer = {
        getColor : function(x,y, radius) {
            var image = this.getImageData(x, y, 1, 1);
            var pixel = image.data;

            pixel[0] /= 255;
            pixel[1] /= 255;
            pixel[2] /= 255;
            pixel[3] /= 255;

            return pixel;
        },

        createFill : function(ctx, radius, hardness, r,g,b,a) {
            var fill;

            if (hardness >= 1)
                return "rgba(" + r + "," + g + "," + b + "," + a + ")";

            fill = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            fill.addColorStop(hardness, "rgba(" + r + "," + g + "," + b + "," + a + ")");
            fill.addColorStop(1, "rgba(" + r + "," + g + "," + b + ",0)");

            return fill;
        },

        /* taken form https://github.com/yapcheahshen/brushlib.js by Yap Cheah Shen :)  */
        drawDab : function(x,y,radius,r,g,b, a, hardness, alpha_eraser, aspect_ratio, angle, lock_alpha, colorize) {
            if (a === 0)
                return;

            r = Math.floor(r*256);
            g = Math.floor(g*256);
            b = Math.floor(b*256);
            hardness = Math.max(hardness, 0);

            var height = (radius*2 / aspect_ratio) / 2;
            var width = (radius * 2*1.3) / 2;
            var fill = canvasRenderer.createFill(this, radius, hardness, r,g,b,a);

            this.save();
            this.beginPath();


            // HACK: eraser hack
            if ( alpha_eraser == 0)
                this.globalCompositeOperation = "destination-out";

            this.translate(x, y);
            this.rotate(90 + angle );
            this.moveTo(0,  - height);
            this.bezierCurveTo(width,  - height, width,  height, 0 , height);
            this.bezierCurveTo( - width,  height, - width,  - height,  0 ,  - height);
            this.fillStyle = fill;
            this.fill();

            this.closePath();
            this.restore();
        }
    };

    var Painter = function(bindings) {
        this._bindings = bindings;
    };

    // static
    Painter.fromCanvas = function(ctx) {
        ctx = isFunction(ctx.getContext) ? ctx.getContext("2d") : ctx;
        return new Painter(new Bindings(bind(canvasRenderer.drawDab, ctx),  bind(canvasRenderer.getColor, ctx)));
    };

    Painter.prototype.setBrush = function(brush) {
        this._bindings.load_brush(brush);
        return this;
    };

    Painter.prototype.setColor = function(r,g,b) {
        var hsv = Array.isArray(r) ? rgb2hsv.apply(null, r) : rgb2hsv(r,g,b);

        this._bindings.set_brush_base_value("color_h", hsv.h);
        this._bindings.set_brush_base_value("color_s", hsv.s);
        this._bindings.set_brush_base_value("color_v", hsv.v);

        return this;
    };

    Painter.prototype.newStroke = function(x,y) {
        this._bindings.reset_brush();
        return this.hover(x,y,10);
    }

    Painter.prototype.stroke = function(x,y, dt, pressure, xtilt, ytilt) {
        pressure = isNumber(pressure) ? pressure : 0.5;
        xtilt = (xtilt || 0.0);
        ytilt = (ytilt || 0.0);
        dt = (dt || 0.1);

        this._bindings.stroke_to(x,y, pressure, 0, ytilt, dt);
        return this;
    }

    Painter.prototype.hover = function(x,y, dt) {
        return this.stroke(x,y, dt, 0, 0, 0);
    }

    return Painter;

})(Bindings);

exports.INFO = Object.freeze(INFO);
exports.Painter = Painter;
exports.Bindings = Bindings;

}));