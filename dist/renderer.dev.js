
/*
 * renderer.js v1.1.1
 * (c) 2017 @Johnny Wu
 * Released under the MIT License.
 */

var renderer = (function (gfx,vmath,memop) {
'use strict';

gfx = gfx && 'default' in gfx ? gfx['default'] : gfx;

var enums = {
  // perspective
  PP_PROJECTION: 0,
  PP_ORTHO: 1,

  // stages
  STAGE_OPAQUE:       0x00000001,
  STAGE_TRANSPARENT:  0x00000002,
  STAGE_SHADOWCAST:   0x00000004,

  // parameter type
  PARAM_INT:             0,
  PARAM_INT2:            1,
  PARAM_INT3:            2,
  PARAM_INT4:            3,
  PARAM_FLOAT:           4,
  PARAM_FLOAT2:          5,
  PARAM_FLOAT3:          6,
  PARAM_FLOAT4:          7,
  PARAM_COLOR3:          8,
  PARAM_COLOR4:          9,
  PARAM_MAT2:           10,
  PARAM_MAT3:           11,
  PARAM_MAT4:           12,
  PARAM_TEXTURE_2D:     13,
  PARAM_TEXTURE_CUBE:   14,
};

var Mesh = function Mesh(vb, ib, pt) {
  if ( pt === void 0 ) pt = gfx.PT_TRIANGLES;

  this._vertexBuffer = vb;
  this._indexBuffer = ib;
  this._primitiveType = pt;

  // TODO: this._aabb;
};

var Pass = function Pass(name) {
  this._programName = name;

  // cullmode
  this._cullMode = gfx.CULL_BACK;

  // blending
  this._blend = false;
  this._blendEq = gfx.BLEND_FUNC_ADD;
  this._blendAlphaEq = gfx.BLEND_FUNC_ADD;
  this._blendSrc = gfx.BLEND_ONE;
  this._blendDst = gfx.BLEND_ZERO;
  this._blendSrcAlpha = gfx.BLEND_ONE;
  this._blendDstAlpha = gfx.BLEND_ZERO;
  this._blendColor = 0xffffffff;

  // depth
  this._depthTest = false;
  this._depthWrite = false;
  this._depthFunc = gfx.DS_FUNC_LESS,

  // stencil
  this._stencilTest = false;
  // front
  this._stencilFuncFront = gfx.DS_FUNC_ALWAYS;
  this._stencilRefFront = 0;
  this._stencilMaskFront = 0xff;
  this._stencilFailOpFront = gfx.STENCIL_OP_KEEP;
  this._stencilZFailOpFront = gfx.STENCIL_OP_KEEP;
  this._stencilZPassOpFront = gfx.STENCIL_OP_KEEP;
  this._stencilWriteMaskFront = 0xff;
  // back
  this._stencilFuncBack = gfx.DS_FUNC_ALWAYS;
  this._stencilRefBack = 0;
  this._stencilMaskBack = 0xff;
  this._stencilFailOpBack = gfx.STENCIL_OP_KEEP;
  this._stencilZFailOpBack = gfx.STENCIL_OP_KEEP;
  this._stencilZPassOpBack = gfx.STENCIL_OP_KEEP;
  this._stencilWriteMaskBack = 0xff;
};

Pass.prototype.setCullMode = function setCullMode (cullMode) {
  this._cullMode = cullMode;
};

Pass.prototype.setBlend = function setBlend (
  blendEq,
  blendSrc,
  blendDst,
  blendAlphaEq,
  blendSrcAlpha,
  blendDstAlpha,
  blendColor
) {
    if ( blendEq === void 0 ) blendEq = gfx.BLEND_FUNC_ADD;
    if ( blendSrc === void 0 ) blendSrc = gfx.BLEND_ONE;
    if ( blendDst === void 0 ) blendDst = gfx.BLEND_ZERO;
    if ( blendAlphaEq === void 0 ) blendAlphaEq = gfx.BLEND_FUNC_ADD;
    if ( blendSrcAlpha === void 0 ) blendSrcAlpha = gfx.BLEND_ONE;
    if ( blendDstAlpha === void 0 ) blendDstAlpha = gfx.BLEND_ZERO;
    if ( blendColor === void 0 ) blendColor = 0xffffffff;

  this._blend = true;
  this._blendEq = blendEq;
  this._blendSrc = blendSrc;
  this._blendDst = blendDst;
  this._blendAlphaEq = blendAlphaEq;
  this._blendSrcAlpha = blendSrcAlpha;
  this._blendDstAlpha = blendDstAlpha;
  this._blendColor = blendColor;
};

Pass.prototype.setDepth = function setDepth (
  depthTest,
  depthWrite,
  depthFunc
) {
    if ( depthTest === void 0 ) depthTest = false;
    if ( depthWrite === void 0 ) depthWrite = false;
    if ( depthFunc === void 0 ) depthFunc = gfx.DS_FUNC_LESS;

  this._depthTest = depthTest;
  this._depthWrite = depthWrite;
  this._depthFunc = depthFunc;
};

Pass.prototype.setStencilFront = function setStencilFront (
  stencilFunc,
  stencilRef,
  stencilMask,
  stencilFailOp,
  stencilZFailOp,
  stencilZPassOp,
  stencilWriteMask
) {
    if ( stencilFunc === void 0 ) stencilFunc = gfx.DS_FUNC_ALWAYS;
    if ( stencilRef === void 0 ) stencilRef = 0;
    if ( stencilMask === void 0 ) stencilMask = 0xff;
    if ( stencilFailOp === void 0 ) stencilFailOp = gfx.STENCIL_OP_KEEP;
    if ( stencilZFailOp === void 0 ) stencilZFailOp = gfx.STENCIL_OP_KEEP;
    if ( stencilZPassOp === void 0 ) stencilZPassOp = gfx.STENCIL_OP_KEEP;
    if ( stencilWriteMask === void 0 ) stencilWriteMask = 0xff;

  this._stencilTest = true;
  this._stencilFuncFront = stencilFunc;
  this._stencilRefFront = stencilRef;
  this._stencilMaskFront = stencilMask;
  this._stencilFailOpFront = stencilFailOp;
  this._stencilZFailOpFront = stencilZFailOp;
  this._stencilZPassOpFront = stencilZPassOp;
  this._stencilWriteMaskFront = stencilWriteMask;
};

Pass.prototype.setStencilBack = function setStencilBack (
  stencilFunc,
  stencilRef,
  stencilMask,
  stencilFailOp,
  stencilZFailOp,
  stencilZPassOp,
  stencilWriteMask
) {
    if ( stencilFunc === void 0 ) stencilFunc = gfx.DS_FUNC_ALWAYS;
    if ( stencilRef === void 0 ) stencilRef = 0;
    if ( stencilMask === void 0 ) stencilMask = 0xff;
    if ( stencilFailOp === void 0 ) stencilFailOp = gfx.STENCIL_OP_KEEP;
    if ( stencilZFailOp === void 0 ) stencilZFailOp = gfx.STENCIL_OP_KEEP;
    if ( stencilZPassOp === void 0 ) stencilZPassOp = gfx.STENCIL_OP_KEEP;
    if ( stencilWriteMask === void 0 ) stencilWriteMask = 0xff;

  this._stencilTest = true;
  this._stencilFuncBack = stencilFunc;
  this._stencilRefBack = stencilRef;
  this._stencilMaskBack = stencilMask;
  this._stencilFailOpBack = stencilFailOp;
  this._stencilZFailOpBack = stencilZFailOp;
  this._stencilZPassOpBack = stencilZPassOp;
  this._stencilWriteMaskBack = stencilWriteMask;
};

var _genID = 0;

var Technique = function Technique(stages, parameters, passes, layer) {
  if ( layer === void 0 ) layer = 0;

  this._id = _genID++;
  this._stages = stages;
  this._parameters = parameters; // {name, type, size, val}
  this._passes = passes;
  this._layer = layer;
  // TODO: this._version = 'webgl' or 'webgl2' // ????
};

Technique.prototype.sortID = function sortID () {
  if (!this._passes.length) {
    return -1;
  }

  return (
    (this._passes.length & 0xf) << 24 |
    (this._passes[0]._program.id & 0xfff) << 12 |
    (this._id & 0xffff)
  ) >>> 0;
};

function createMesh(device, data) {
  if (!data.positions) {
    console.error('The data must have positions field');
    return null;
  }

  var verts = [];
  var vcount = data.positions.length / 3;

  for (var i = 0; i < vcount; ++i) {
    verts.push(data.positions[3 * i], data.positions[3 * i + 1], data.positions[3 * i + 2]);

    if (data.normals) {
      verts.push(data.normals[3 * i], data.normals[3 * i + 1], data.normals[3 * i + 2]);
    }

    if (data.uvs) {
      verts.push(data.uvs[2 * i], data.uvs[2 * i + 1]);
    }
  }

  var vfmt = [];
  vfmt.push({ name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 3 });
  if (data.normals) {
    vfmt.push({ name: gfx.ATTR_NORMAL, type: gfx.ATTR_TYPE_FLOAT32, num: 3 });
  }
  if (data.uvs) {
    vfmt.push({ name: gfx.ATTR_UV, type: gfx.ATTR_TYPE_FLOAT32, num: 2 });
  }

  var vb = new gfx.VertexBuffer(
    device,
    new gfx.VertexFormat(vfmt),
    gfx.USAGE_STATIC,
    new Float32Array(verts),
    vcount,
    false
  );

  var ib = null;
  if (data.indices) {
    ib = new gfx.IndexBuffer(
      device,
      gfx.INDEX_FMT_UINT16,
      gfx.USAGE_STATIC,
      new Uint16Array(data.indices),
      data.indices.length,
      false
    );
  }

  return new Mesh(vb, ib);
}

var _stageMap = {
  opaque: enums.STAGE_OPAQUE,
  transparent: enums.STAGE_TRANSPARENT,
  shadowcast: enums.STAGE_SHADOWCAST
};

var _paramTypeMap = {
  int: enums.PARAM_INT,
  int2: enums.PARAM_INT2,
  int3: enums.PARAM_INT3,
  int4: enums.PARAM_INT4,
  float: enums.PARAM_FLOAT,
  float2: enums.PARAM_FLOAT2,
  float3: enums.PARAM_FLOAT3,
  float4: enums.PARAM_FLOAT4,
  color3: enums.PARAM_COLOR3,
  color4: enums.PARAM_COLOR4,
  mat2: enums.PARAM_MAT2,
  mat3: enums.PARAM_MAT3,
  mat4: enums.PARAM_MAT4,
  tex2d: enums.PARAM_TEXTURE_2D,
  texcube: enums.PARAM_TEXTURE_CUBE
};

var _cullMap = {
  none: gfx.CULL_NONE,
  front: gfx.CULL_FRONT,
  back: gfx.CULL_BACK,
  front_and_back: gfx.CULL_FRONT_AND_BACK
};

var _blendFuncMap = {
  add: gfx.BLEND_FUNC_ADD,
  sub: gfx.BLEND_FUNC_SUBTRACT,
  reverse_sub: gfx.BLEND_FUNC_REVERSE_SUBTRACT
};

var _blendFactorMap = {
  zero: gfx.BLEND_ZERO,
  one: gfx.BLEND_ONE,
  src_color: gfx.BLEND_SRC_COLOR,
  one_minus_src_color: gfx.BLEND_ONE_MINUS_SRC_COLOR,
  dst_color: gfx.BLEND_DST_COLOR,
  one_minus_dst_color: gfx.BLEND_ONE_MINUS_DST_COLOR,
  src_alpha: gfx.BLEND_SRC_ALPHA,
  one_minus_src_alpha: gfx.BLEND_ONE_MINUS_SRC_ALPHA,
  dst_alpha: gfx.BLEND_DST_ALPHA,
  one_minus_dst_alpha: gfx.BLEND_ONE_MINUS_DST_ALPHA,
  constant_color: gfx.BLEND_CONSTANT_COLOR,
  one_minus_constant_color: gfx.BLEND_ONE_MINUS_CONSTANT_COLOR,
  constant_alpha: gfx.BLEND_CONSTANT_ALPHA,
  one_minus_constant_alpha: gfx.BLEND_ONE_MINUS_CONSTANT_ALPHA,
  src_alpha_saturate: gfx.BLEND_SRC_ALPHA_SATURATE
};

var _dsFuncMap = {
  never: gfx.DS_FUNC_NEVER,
  less: gfx.DS_FUNC_LESS,
  equal: gfx.DS_FUNC_EQUAL,
  lequal: gfx.DS_FUNC_LEQUAL,
  greater: gfx.DS_FUNC_GREATER,
  notequal: gfx.DS_FUNC_NOTEQUAL,
  gequal: gfx.DS_FUNC_GEQUAL,
  always: gfx.DS_FUNC_ALWAYS
};

var _stencilOpMap = {
  keep: gfx.STENCIL_OP_KEEP,
  zero: gfx.STENCIL_OP_ZERO,
  replace: gfx.STENCIL_OP_REPLACE,
  incr: gfx.STENCIL_OP_INCR,
  incr_wrap: gfx.STENCIL_OP_INCR_WRAP,
  decr: gfx.STENCIL_OP_DECR,
  decr_wrap: gfx.STENCIL_OP_DECR_WRAP,
  inver: gfx.STENCIL_OP_INVERT
};

// blend packing 'func src dst'
function _parseBlend(data, callback) {
  var words = data.split(' ');
  callback && callback(_blendFuncMap[words[0]], _blendFactorMap[words[1]], _blendFactorMap[words[2]]);
}

// stencil packing 'func ref mask failOP zfailOp passOp writeMask'
function _parseStencil(data, callback) {
  var words = data.split(' ');
  callback && callback(_dsFuncMap[words[0]], parseInt(words[1]), parseInt(words[2]),
    _stencilOpMap[words[3]], _stencilOpMap[words[4]], _stencilOpMap[words[5]], parseInt(words[6]));
}

// depth packing 'func write'
function _parseDepth(data, callback) {
  var words = data.split(' ');
  callback && callback(_dsFuncMap[words[0]], (words[1] === 'true'));
}

// program packing 'vertSourceIndex fragSourceInde'
function _parseProgram(data, callback) {
  var words = data.split(' ');
  callback && callback(parseInt(words[0]), parseInt(words[1]));
}

function parseMaterial(device, data) {
  var techniques = [];
  var mtl = data;
  mtl.techniques.forEach(function (techInfo) {
    // construct passes
    var passes = [];
    techInfo.passes.forEach(function (passInfo) {
      var program = null;
      _parseProgram(passInfo.program, function (vertIndex, fragIndex) {
        program = new gfx.Program(device, {
          vert: mtl.vertexShaders[vertIndex],
          frag: mtl.fragmentShaders[fragIndex],
        });
        program.link();
      });
      var pass = new Pass(program);
      // blend
      if (passInfo.blend) {
        pass._blend = true;
        _parseBlend(passInfo.blend, function (func, src, dst) {
          pass._blendEq = func;
          pass._blendSrc = src;
          pass._blendDst = dst;
        });
        if (passInfo.blendAlpha) {
          _parseBlend(passInfo.blendAlpha, function (func, src, dst) {
            pass._blendAlphaEq = func;
            pass._blendSrcAlpha = src;
            pass._blendDstAlpha = dst;
          });
        } else {
          pass._blendAlphaEq = pass._blendEq;
          pass._blendSrcAlpha = pass._blendSrc;
          pass._blendDstAlpha = pass._blendDst;
        }
        if (passInfo.blendColor) {
          pass._blendColor = parseInt(passInfo.blendColor);
        }
      }
      // cull
      if (passInfo.cull) {
        pass._cullMode = _cullMap[passInfo.cull];
      }
      // depth
      if (passInfo.depth) {
        pass._depthTest = true;
        _parseDepth(passInfo.depth, function (func, write) {
          pass._depthFunc = func;
          pass._depthWrite = write;
        });
      }
      // stencil
      if (passInfo.stencil) {
        pass._stencilTest = true;
        // "func ref mask failOp zFailOp zPassOp writeMask"
        _parseStencil(passInfo.stencil, function (func, ref, mask, failOp, zFailOp, zPassOp, writeMask) {
          pass._stencilFuncFront = func;
          pass._stencilRefFront = func;
          pass._stencilMaskFront = mask;
          pass._stencilFailOpFront = failOp;
          pass._stencilZFailOpFront = zFailOp;
          pass._stencilZPassOpFront = zPassOp;
          pass._stencilWriteMaskFront = writeMask;
        });

        if (passInfo.stencilBack) {
          _parseStencil(passInfo.stencilBack, function (func, ref, mask, failOp, zFailOp, zPassOp, writeMask) {
            pass._stencilFuncBack = func;
            pass._stencilRefBack = func;
            pass._stencilMaskBack = mask;
            pass._stencilFailOpBack = failOp;
            pass._stencilZFailOpBack = zFailOp;
            pass._stencilZPassOpBack = zPassOp;
            pass._stencilWriteMaskBack = writeMask;
          });
        } else {
          pass._stencilFuncBack = pass._stencilFuncFront;
          pass._stencilRefBack = pass._stencilRefFront;
          pass._stencilMaskBack = pass._stencilMaskFront;
          pass._stencilFailOpBack = pass._stencilFailOpFront;
          pass._stencilZFailOpBack = pass._stencilZFailOpFront;
          pass._stencilZPassOpBack = pass._stencilZPassOpFront;
          pass._stencilWriteMaskBack = pass._stencilWriteMaskFront;
        }
      }
      passes.push(pass);
    });
    var stage = 0;
    techInfo.stages.split(' ').forEach(function (stageInfo) {
      stage = stage | _stageMap[stageInfo];
    });
    var params = [];
    for (var paramKey in techInfo.parameters) {
      params.push({
        name: paramKey,
        type: _paramTypeMap[techInfo.parameters[paramKey].type]
      });
    }
    var tech = new Technique(
      stage,
      params,
      passes
    );
    techniques.push(tech);
  });

  return techniques;
}

var Material = function Material(techniques, values, opts) {
  if ( values === void 0 ) values = {};
  if ( opts === void 0 ) opts = {};

  this._techniques = techniques;
  this._values = values;
  this._options = opts;

  // TODO: check if params is valid for current technique???
};

Material.prototype.getTechnique = function getTechnique (stage) {
    var this$1 = this;

  for (var i = 0; i < this._techniques.length; ++i) {
    var tech = this$1._techniques[i];
    if (tech._stages & stage) {
      return tech;
    }
  }

  return null;
};

Material.prototype.getValue = function getValue (name) {
  return this._values[name];
};

Material.prototype.setValue = function setValue (name, value) {
  // TODO: check if params is valid for current technique???

  this._values[name] = value;
};

Material.prototype.getOption = function getOption (name) {
  return this._options[name];
};

Material.prototype.setOption = function setOption (name, value) {
  this._options[name] = value;
};

var Light = function Light() {
  this._node = null;
  this._color = vmath.color3.create();
};

Light.prototype.setNode = function setNode (node) {
  this._node = node;
};

var Camera = function Camera() {
  this._node = null;
  this._perspective = enums.PP_PROJECTION;

  // projection properties
  this._near = 0.01;
  this._far = 1000.0;
  this._fov = Math.PI/4.0; // vertical fov
  // this._aspect = 16.0/9.0; // DISABLE: use _rect.w/_rect.h

  // ortho properties
  this._orthoHeight = 10;

  // view properties
  this._rect = {
    x: 0, y: 0, w: 1, h: 1
  };
  this._scissor = {
    x: 0, y: 0, w: 1, h: 1
  };

  // clear options
  this._color = vmath.color4.create();
  // TODO: this._clearFlags

  // matrix
  this._view = vmath.mat4.create();
  this._proj = vmath.mat4.create();
  this._viewProj = vmath.mat4.create();
  this._invViewProj = vmath.mat4.create();
};

Camera.prototype.setNode = function setNode (node) {
  this._node = node;
};

Camera.prototype.updateMatrix = function updateMatrix () {
  // view matrix
  this._node.getWorldMatrix(this._view);
  vmath.mat4.invert(this._view, this._view);

  // projection matrix
  // TODO: if this._projDirty
  var aspect = this._rect.w / this._rect.h;
  if (this._perspective === enums.PP_PROJECTION) {
    vmath.mat4.perspective(this._proj,
      this._fov,
      aspect,
      this._near,
      this._far
    );
  } else {
    var x = this._orthoHeight * aspect;
    var y = this._orthoHeight;
    vmath.mat4.ortho(this._proj,
      -x, x, -y, y, this._near, this._far
    );
  }

  // view-projection
  vmath.mat4.mul(this._viewProj, this._proj, this._view);
  vmath.mat4.invert(this._invViewProj, this._viewProj);
};

var Model = function Model() {
  this._node = null;
  this._meshes = [];
  this._materials = [];
};

var prototypeAccessors = { meshCount: {} };

Model.prototype.setNode = function setNode (node) {
  this._node = node;
};

Model.prototype.addMesh = function addMesh (mesh) {
  if (this._meshes.indexOf(mesh) !== -1) {
    return;
  }
  this._meshes.push(mesh);
};

Model.prototype.addMaterial = function addMaterial (material) {
  if (this._materials.indexOf(material) !== -1) {
    return;
  }
  this._materials.push(material);
};

prototypeAccessors.meshCount.get = function () {
  return this._meshes.length;
};

Model.prototype.getDrawItem = function getDrawItem (out, index) {
  if (index >= this._meshes.length ) {
    out.node = null;
    out.mesh = null;
    out.material = null;

    return;
  }

  out.node = this._node;
  out.mesh = this._meshes[index];
  if (index < this._materials.length) {
    out.material = this._materials[index];
  } else {
    out.material = this._materials[this._materials.length-1];
  }
};

Object.defineProperties( Model.prototype, prototypeAccessors );

var Scene = function Scene() {
  this._lights = new memop.FixedArray(16);
  this._models = new memop.FixedArray(16);
};

Scene.prototype.addModel = function addModel (model) {
  var idx = this._models.indexOf(model);
  if (idx === -1) {
    this._models.push(model);
  }
};

Scene.prototype.removeModel = function removeModel (model) {
  var idx = this._models.indexOf(model);
  if (idx !== -1) {
    this._models.fastRemove(idx);
  }
};

/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

var mustache = {};

var objectToString = Object.prototype.toString;
var isArray = Array.isArray || function isArrayPolyfill(object) {
  return objectToString.call(object) === '[object Array]';
};

function isFunction(object) {
  return typeof object === 'function';
}

/**
 * More correct typeof string handling array
 * which normally returns typeof 'object'
 */
function typeStr(obj) {
  return isArray(obj) ? 'array' : typeof obj;
}

function escapeRegExp(string) {
  return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
}

/**
 * Null safe way of checking whether or not an object,
 * including its prototype, has a given property
 */
function hasProperty(obj, propName) {
  return obj != null && typeof obj === 'object' && (propName in obj);
}

// Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
// See https://github.com/janl/mustache.js/issues/189
var regExpTest = RegExp.prototype.test;
function testRegExp(re, string) {
  return regExpTest.call(re, string);
}

var nonSpaceRe = /\S/;
function isWhitespace(string) {
  return !testRegExp(nonSpaceRe, string);
}

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
    return entityMap[s];
  });
}

var whiteRe = /\s*/;
var spaceRe = /\s+/;
var equalsRe = /\s*=/;
var curlyRe = /\s*\}/;
var tagRe = /#|\^|\/|>|\{|&|=|!/;

/**
 * Breaks up the given `template` string into a tree of tokens. If the `tags`
 * argument is given here it must be an array with two string values: the
 * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
 * course, the default is to use mustaches (i.e. mustache.tags).
 *
 * A token is an array with at least 4 elements. The first element is the
 * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
 * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
 * all text that appears outside a symbol this element is "text".
 *
 * The second element of a token is its "value". For mustache tags this is
 * whatever else was inside the tag besides the opening symbol. For text tokens
 * this is the text itself.
 *
 * The third and fourth elements of the token are the start and end indices,
 * respectively, of the token in the original template.
 *
 * Tokens that are the root node of a subtree contain two more elements: 1) an
 * array of tokens in the subtree and 2) the index in the original template at
 * which the closing tag for that section begins.
 */
function parseTemplate(template, tags) {
  if (!template)
    { return []; }

  var sections = [];     // Stack to hold section tokens
  var tokens = [];       // Buffer to hold the tokens
  var spaces = [];       // Indices of whitespace tokens on the current line
  var hasTag = false;    // Is there a {{tag}} on the current line?
  var nonSpace = false;  // Is there a non-space char on the current line?

  // Strips all whitespace tokens array for the current line
  // if there was a {{#tag}} on it and otherwise only space.
  function stripSpace() {
    if (hasTag && !nonSpace) {
      while (spaces.length)
        { delete tokens[spaces.pop()]; }
    } else {
      spaces = [];
    }

    hasTag = false;
    nonSpace = false;
  }

  var openingTagRe, closingTagRe, closingCurlyRe;
  function compileTags(tagsToCompile) {
    if (typeof tagsToCompile === 'string')
      { tagsToCompile = tagsToCompile.split(spaceRe, 2); }

    if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
      { throw new Error('Invalid tags: ' + tagsToCompile); }

    openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
    closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
    closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
  }

  compileTags(tags || mustache.tags);

  var scanner = new Scanner(template);

  var start, type, value, chr, token, openSection;
  while (!scanner.eos()) {
    start = scanner.pos;

    // Match any text between tags.
    value = scanner.scanUntil(openingTagRe);

    if (value) {
      for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
        chr = value.charAt(i);

        if (isWhitespace(chr)) {
          spaces.push(tokens.length);
        } else {
          nonSpace = true;
        }

        tokens.push(['text', chr, start, start + 1]);
        start += 1;

        // Check for whitespace on the current line.
        if (chr === '\n')
          { stripSpace(); }
      }
    }

    // Match the opening tag.
    if (!scanner.scan(openingTagRe))
      { break; }

    hasTag = true;

    // Get the tag type.
    type = scanner.scan(tagRe) || 'name';
    scanner.scan(whiteRe);

    // Get the tag value.
    if (type === '=') {
      value = scanner.scanUntil(equalsRe);
      scanner.scan(equalsRe);
      scanner.scanUntil(closingTagRe);
    } else if (type === '{') {
      value = scanner.scanUntil(closingCurlyRe);
      scanner.scan(curlyRe);
      scanner.scanUntil(closingTagRe);
      type = '&';
    } else {
      value = scanner.scanUntil(closingTagRe);
    }

    // Match the closing tag.
    if (!scanner.scan(closingTagRe))
      { throw new Error('Unclosed tag at ' + scanner.pos); }

    token = [type, value, start, scanner.pos];
    tokens.push(token);

    if (type === '#' || type === '^') {
      sections.push(token);
    } else if (type === '/') {
      // Check section nesting.
      openSection = sections.pop();

      if (!openSection)
        { throw new Error('Unopened section "' + value + '" at ' + start); }

      if (openSection[1] !== value)
        { throw new Error('Unclosed section "' + openSection[1] + '" at ' + start); }
    } else if (type === 'name' || type === '{' || type === '&') {
      nonSpace = true;
    } else if (type === '=') {
      // Set the tags for the next time around.
      compileTags(value);
    }
  }

  // Make sure there are no open sections when we're done.
  openSection = sections.pop();

  if (openSection)
    { throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos); }

  return nestTokens(squashTokens(tokens));
}

/**
 * Combines the values of consecutive text tokens in the given `tokens` array
 * to a single token.
 */
function squashTokens(tokens) {
  var squashedTokens = [];

  var token, lastToken;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];

    if (token) {
      if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
        lastToken[1] += token[1];
        lastToken[3] = token[3];
      } else {
        squashedTokens.push(token);
        lastToken = token;
      }
    }
  }

  return squashedTokens;
}

/**
 * Forms the given array of `tokens` into a nested tree structure where
 * tokens that represent a section have two additional items: 1) an array of
 * all tokens that appear in that section and 2) the index in the original
 * template that represents the end of that section.
 */
function nestTokens(tokens) {
  var nestedTokens = [];
  var collector = nestedTokens;
  var sections = [];

  var token, section;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];

    switch (token[0]) {
      case '#':
      case '^':
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case '/':
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
    }
  }

  return nestedTokens;
}

/**
 * A simple string scanner that is used by the template parser to find
 * tokens in template strings.
 */
function Scanner(string) {
  this.string = string;
  this.tail = string;
  this.pos = 0;
}

/**
 * Returns `true` if the tail is empty (end of string).
 */
Scanner.prototype.eos = function eos() {
  return this.tail === '';
};

/**
 * Tries to match the given regular expression at the current position.
 * Returns the matched text if it can match, the empty string otherwise.
 */
Scanner.prototype.scan = function scan(re) {
  var match = this.tail.match(re);

  if (!match || match.index !== 0)
    { return ''; }

  var string = match[0];

  this.tail = this.tail.substring(string.length);
  this.pos += string.length;

  return string;
};

/**
 * Skips all text until the given regular expression can be matched. Returns
 * the skipped string, which is the entire tail if no match can be made.
 */
Scanner.prototype.scanUntil = function scanUntil(re) {
  var index = this.tail.search(re), match;

  switch (index) {
    case -1:
      match = this.tail;
      this.tail = '';
      break;
    case 0:
      match = '';
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
  }

  this.pos += match.length;

  return match;
};

/**
 * Represents a rendering context by wrapping a view object and
 * maintaining a reference to the parent context.
 */
function Context(view, parentContext) {
  this.view = view;
  this.cache = { '.': this.view };
  this.parent = parentContext;
}

/**
 * Creates a new context using the given view with this context
 * as the parent.
 */
Context.prototype.push = function push(view) {
  return new Context(view, this);
};

/**
 * Returns the value of the given name in this context, traversing
 * up the context hierarchy if the value is absent in this context's view.
 */
Context.prototype.lookup = function lookup(name) {
  var cache = this.cache;

  var value;
  if (cache.hasOwnProperty(name)) {
    value = cache[name];
  } else {
    var context = this, names, index, lookupHit = false;

    while (context) {
      if (name.indexOf('.') > 0) {
        value = context.view;
        names = name.split('.');
        index = 0;

        /**
         * Using the dot notion path in `name`, we descend through the
         * nested objects.
         *
         * To be certain that the lookup has been successful, we have to
         * check if the last object in the path actually has the property
         * we are looking for. We store the result in `lookupHit`.
         *
         * This is specially necessary for when the value has been set to
         * `undefined` and we want to avoid looking up parent contexts.
         **/
        while (value != null && index < names.length) {
          if (index === names.length - 1)
            { lookupHit = hasProperty(value, names[index]); }

          value = value[names[index++]];
        }
      } else {
        value = context.view[name];
        lookupHit = hasProperty(context.view, name);
      }

      if (lookupHit)
        { break; }

      context = context.parent;
    }

    cache[name] = value;
  }

  if (isFunction(value))
    { value = value.call(this.view); }

  return value;
};

/**
 * A Writer knows how to take a stream of tokens and render them to a
 * string, given a context. It also maintains a cache of templates to
 * avoid the need to parse the same template twice.
 */
function Writer() {
  this.cache = {};
}

/**
 * Clears all cached templates in this writer.
 */
Writer.prototype.clearCache = function clearCache() {
  this.cache = {};
};

/**
 * Parses and caches the given `template` and returns the array of tokens
 * that is generated from the parse.
 */
Writer.prototype.parse = function parse(template, tags) {
  var cache = this.cache;
  var tokens = cache[template];

  if (tokens == null)
    { tokens = cache[template] = parseTemplate(template, tags); }

  return tokens;
};

/**
 * High-level method that is used to render the given `template` with
 * the given `view`.
 *
 * The optional `partials` argument may be an object that contains the
 * names and templates of partials that are used in the template. It may
 * also be a function that is used to load partial templates on the fly
 * that takes a single argument: the name of the partial.
 */
Writer.prototype.render = function render(template, view, partials) {
  var tokens = this.parse(template);
  var context = (view instanceof Context) ? view : new Context(view);
  return this.renderTokens(tokens, context, partials, template);
};

/**
 * Low-level method that renders the given array of `tokens` using
 * the given `context` and `partials`.
 *
 * Note: The `originalTemplate` is only ever used to extract the portion
 * of the original template that was contained in a higher-order section.
 * If the template doesn't use higher-order sections, this argument may
 * be omitted.
 */
Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate) {
  var this$1 = this;

  var buffer = '';

  var token, symbol, value;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    value = undefined;
    token = tokens[i];
    symbol = token[0];

    if (symbol === '#') { value = this$1.renderSection(token, context, partials, originalTemplate); }
    else if (symbol === '^') { value = this$1.renderInverted(token, context, partials, originalTemplate); }
    else if (symbol === '>') { value = this$1.renderPartial(token, context, partials, originalTemplate); }
    else if (symbol === '&') { value = this$1.unescapedValue(token, context); }
    else if (symbol === 'name') { value = this$1.escapedValue(token, context); }
    else if (symbol === 'text') { value = this$1.rawValue(token); }

    if (value !== undefined)
      { buffer += value; }
  }

  return buffer;
};

Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate) {
  var this$1 = this;

  var self = this;
  var buffer = '';
  var value = context.lookup(token[1]);

  // This function is used to render an arbitrary template
  // in the current context by higher-order sections.
  function subRender(template) {
    return self.render(template, context, partials);
  }

  if (!value) { return; }

  if (isArray(value)) {
    for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
      buffer += this$1.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
    }
  } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
    buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
  } else if (isFunction(value)) {
    if (typeof originalTemplate !== 'string')
      { throw new Error('Cannot use higher-order sections without the original template'); }

    // Extract the portion of the original template that the section contains.
    value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

    if (value != null)
      { buffer += value; }
  } else {
    buffer += this.renderTokens(token[4], context, partials, originalTemplate);
  }
  return buffer;
};

Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate) {
  var value = context.lookup(token[1]);

  // Use JavaScript's definition of falsy. Include empty arrays.
  // See https://github.com/janl/mustache.js/issues/186
  if (!value || (isArray(value) && value.length === 0))
    { return this.renderTokens(token[4], context, partials, originalTemplate); }
};

Writer.prototype.renderPartial = function renderPartial(token, context, partials) {
  if (!partials) { return; }

  var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
  if (value != null)
    { return this.renderTokens(this.parse(value), context, partials, value); }
};

Writer.prototype.unescapedValue = function unescapedValue(token, context) {
  var value = context.lookup(token[1]);
  if (value != null)
    { return value; }
};

Writer.prototype.escapedValue = function escapedValue(token, context) {
  var value = context.lookup(token[1]);
  if (value != null)
    { return mustache.escape(value); }
};

Writer.prototype.rawValue = function rawValue(token) {
  return token[1];
};

mustache.name = 'mustache.js';
mustache.version = '2.3.0';
mustache.tags = ['{{', '}}'];

// All high-level mustache.* functions use this writer.
var defaultWriter = new Writer();

/**
 * Clears all cached templates in the default writer.
 */
mustache.clearCache = function clearCache() {
  return defaultWriter.clearCache();
};

/**
 * Parses and caches the given template in the default writer and returns the
 * array of tokens it contains. Doing this ahead of time avoids the need to
 * parse templates on the fly as they are rendered.
 */
mustache.parse = function parse(template, tags) {
  return defaultWriter.parse(template, tags);
};

/**
 * Renders the `template` with the given `view` and `partials` using the
 * default writer.
 */
mustache.render = function render(template, view, partials) {
  if (typeof template !== 'string') {
    throw new TypeError('Invalid template! Template should be a "string" ' +
      'but "' + typeStr(template) + '" was given as the first ' +
      'argument for mustache#render(template, view, partials)');
  }

  return defaultWriter.render(template, view, partials);
};

// This is here for backwards compatibility with 0.4.x.,
/*eslint-disable */ // eslint wants camel cased function name
mustache.to_html = function to_html(template, view, partials, send) {
  /*eslint-enable*/

  var result = mustache.render(template, view, partials);

  if (isFunction(send)) {
    send(result);
  } else {
    return result;
  }
};

// Export the escaping function so that the user may override it.
// See https://github.com/janl/mustache.js/issues/244
mustache.escape = escapeHtml;

// Export these mainly for testing, but also for advanced usage.
mustache.Scanner = Scanner;
mustache.Context = Context;
mustache.Writer = Writer;

var builtinChunks = {
  'skinning.vert': 'attribute vec4 a_weight;\nattribute vec4 a_joint;\nuniform sampler2D u_bonesTexture;\nuniform float u_bonesTextureSize;\nmat4 getBoneMatrix(const in float i) {\n  float size = u_bonesTextureSize;\n  float j = i * 4.0;\n  float x = mod(j, size);\n  float y = floor(j / size);\n  float dx = 1.0 / size;\n  float dy = 1.0 / size;\n  y = dy * (y + 0.5);\n  vec4 v1 = texture2D(u_bonesTexture, vec2(dx * (x + 0.5), y));\n  vec4 v2 = texture2D(u_bonesTexture, vec2(dx * (x + 1.5), y));\n  vec4 v3 = texture2D(u_bonesTexture, vec2(dx * (x + 2.5), y));\n  vec4 v4 = texture2D(u_bonesTexture, vec2(dx * (x + 3.5), y));\n  return mat4(v1, v2, v3, v4);\n}\nmat4 skinMatrix() {\n  return\n    getBoneMatrix(a_joint.x) * a_weight.x +\n    getBoneMatrix(a_joint.y) * a_weight.y +\n    getBoneMatrix(a_joint.z) * a_weight.z +\n    getBoneMatrix(a_joint.w) * a_weight.w\n    ;\n}',
  'unpack-normal.frag': 'vec3 unpackNormal(vec4 nmap) {\n  return nmap.xyz * 2.0 - 1.0;\n}',
};

var builtinTemplates = [
  {
    name: 'simple',
    vert: '\nattribute vec3 a_position;\nuniform mat4 model;\nuniform mat4 viewProj;\n{{#useTexture}}\n  attribute vec2 a_uv;\n  varying vec2 uv;\n{{/useTexture}}\nvoid main () {\n  vec4 pos = viewProj * model * vec4(a_position, 1);\n  {{#useTexture}}\n    uv = a_uv;\n  {{/useTexture}}\n  gl_Position = pos;\n}',
    frag: '\n{{#useTexture}}\n  uniform sampler2D mainTexture;\n  varying vec2 uv;\n{{/useTexture}}\n{{#useColor}}\n  uniform vec4 color;\n{{/useColor}}\nvoid main () {\n  vec4 o = vec4(1, 1, 1, 1);\n  {{#useTexture}}\n    o *= texture2D(mainTexture, uv);\n  {{/useTexture}}\n  {{#useColor}}\n    o *= color;\n  {{/useColor}}\n  if (!gl_FrontFacing) {\n    o.rgb *= 0.5;\n  }\n  gl_FragColor = o;\n}',
    options: [
      { name: 'useTexture', },
      { name: 'useColor', } ],
  } ];

var ProgramLib = function ProgramLib(device, templates, chunks) {
  var this$1 = this;
  if ( templates === void 0 ) templates = [];
  if ( chunks === void 0 ) chunks = {};

  this._device = device;
  this._precision = "precision highp float;\n";

  // register templates
  this._templates = {};
  for (var i = 0; i < builtinTemplates.length; ++i) {
    var tmpl = builtinTemplates[i];
    this$1.define(tmpl.name, tmpl.vert, tmpl.frag, tmpl.options);
  }
  for (var i$1 = 0; i$1 < templates.length; ++i$1) {
    var tmpl$1 = templates[i$1];
    this$1.define(tmpl$1.name, tmpl$1.vert, tmpl$1.frag, tmpl$1.options);
  }

  // register chunks
  this._chunks = {};
  Object.assign(this._chunks, builtinChunks);
  Object.assign(this._chunks, chunks);

  this._cache = {};
};

/**
 * @param {string} name
 * @param {string} template
 * @param {Array} options
 *
 * @example:
 * programLib.define('foobar', vertTmpl, fragTmpl, [
 *   { name: 'shadow' },
 *   { name: 'lightCount', min: 1, max: 4 }
 * ]);
 */
ProgramLib.prototype.define = function define (name, vert, frag, options) {
  if (this._templates[name]) {
    console.warn(("Failed to define shader " + name + ": already exists."));
    return;
  }

  // calculate option mask offset
  var offset = 0;
  var loop = function ( i ) {
    var op = options[i];
    op._offset = offset;

    var cnt = 1;

    if (op.min !== undefined && op.max !== undefined) {
      cnt = Math.ceil((op.max - op.min) * 0.5);

      op._map = function (value) {
        return (value - this._min) << op._offset;
      }.bind(op);
    } else {
      op._map = function (value) {
        if (value) {
          return 1 << op._offset;
        }
        return 0;
      }.bind(op);
    }

    offset += cnt;

    op._offset = offset;
  };

    for (var i = 0; i < options.length; ++i) loop( i );

  vert = this._precision + vert;
  frag = this._precision + frag;

  // pre-parse the vs and fs template to speed up `mustache.render()` method
  mustache.parse(vert);
  mustache.parse(frag);

  // store it
  this._templates[name] = {
    name: name,
    vert: vert,
    frag: frag,
    options: options
  };
};

/**
 * @param {string} name
 * @param {Object} options
 */
ProgramLib.prototype.getKey = function getKey (name, options) {
  var key = 0;
  var tmpl = this._templates[name];
  for (var i = 0; i < tmpl.options.length; ++i) {
    var tmplOpts = tmpl.options[i];
    var value = options[tmplOpts.name];
    if (value === undefined) {
      continue;
    }

    key |= tmplOpts._map(value);
  }

  return key;
};

/**
 * @param {string} name
 * @param {Object} options
 */
ProgramLib.prototype.getProgram = function getProgram (name, options) {
  var key = this.getKey(name, options);
  var program = this._cache[key];
  if (program) {
    return program;
  }

  // add includes to option
  options.chunks = this._chunks;

  // get template
  var tmpl = this._templates[name];
  var vert = mustache.render(tmpl.vert, options);
  var frag = mustache.render(tmpl.frag, options);

  program = new gfx.Program(this._device, {
    vert: vert,
    frag: frag
  });
  program.link();
  this._cache[key] = program;

  return program;
};

var _m3_tmp = vmath.mat3.create();
var _m4_tmp = vmath.mat4.create();

var _stageInfos = new memop.FramePool(function () {
  return {
    stage: null,
    items: null,
  };
}, 8);

var _float2_pool = new memop.FramePool(function () {
  return new Float32Array(2);
}, 8);

var _float3_pool = new memop.FramePool(function () {
  return new Float32Array(3);
}, 8);

var _float4_pool = new memop.FramePool(function () {
  return new Float32Array(4);
}, 8);

var _float9_pool = new memop.FramePool(function () {
  return new Float32Array(9);
}, 8);

var _float16_pool = new memop.FramePool(function () {
  return new Float32Array(16);
}, 8);

var _int2_pool = new memop.FramePool(function () {
  return new Int32Array(2);
}, 8);

var _int3_pool = new memop.FramePool(function () {
  return new Int32Array(3);
}, 8);

var _int4_pool = new memop.FramePool(function () {
  return new Int32Array(4);
}, 8);

var _type2uniformValue = {};
_type2uniformValue[enums.PARAM_INT] = function (value) {
    return value;
  };
_type2uniformValue[enums.PARAM_INT2] = function (value) {
    return vmath.vec2.array(_int2_pool.alloc(), value);
  };
_type2uniformValue[enums.PARAM_INT3] = function (value) {
    return vmath.vec3.array(_int3_pool.alloc(), value);
  };
_type2uniformValue[enums.PARAM_INT4] = function (value) {
    return vmath.vec4.array(_int4_pool.alloc(), value);
  };
_type2uniformValue[enums.PARAM_FLOAT] = function (value) {
    return value;
  };
_type2uniformValue[enums.PARAM_FLOAT2] = function (value) {
    return vmath.vec2.array(_float2_pool.alloc(), value);
  };
_type2uniformValue[enums.PARAM_FLOAT3] = function (value) {
    return vmath.vec3.array(_float3_pool.alloc(), value);
  };
_type2uniformValue[enums.PARAM_FLOAT4] = function (value) {
    return vmath.vec4.array(_float4_pool.alloc(), value);
  };
_type2uniformValue[enums.PARAM_COLOR3] = function (value) {
    return vmath.color3.array(_float3_pool.alloc(), value);
  };
_type2uniformValue[enums.PARAM_COLOR4] = function (value) {
    return vmath.color4.array(_float4_pool.alloc(), value);
  };
_type2uniformValue[enums.PARAM_MAT2] = function (value) {
    return vmath.mat2.array(_float4_pool.alloc(), value);
  };
_type2uniformValue[enums.PARAM_MAT3] = function (value) {
    return vmath.mat3.array(_float9_pool.alloc(), value);
  };
_type2uniformValue[enums.PARAM_MAT4] = function (value) {
    return vmath.mat4.array(_float16_pool.alloc(), value);
  };

var Base = function Base(device, opts) {
  this._device = device;
  this._programLib = new ProgramLib(device, opts.programTemplates, opts.programChunks);
  this._opts = opts;
  this._type2defaultValue = ( obj = {}, obj[enums.PARAM_INT] = 0, obj[enums.PARAM_INT2] = vmath.vec2.new(0, 0), obj[enums.PARAM_INT3] = vmath.vec3.new(0, 0, 0), obj[enums.PARAM_INT4] = vmath.vec4.new(0, 0, 0, 0), obj[enums.PARAM_FLOAT] = 0.0, obj[enums.PARAM_FLOAT2] = vmath.vec2.new(0, 0), obj[enums.PARAM_FLOAT3] = vmath.vec3.new(0, 0, 0), obj[enums.PARAM_FLOAT4] = vmath.vec4.new(0, 0, 0, 0), obj[enums.PARAM_COLOR3] = vmath.color3.new(0, 0, 0), obj[enums.PARAM_COLOR4] = vmath.color4.new(0, 0, 0, 1), obj[enums.PARAM_MAT2] = vmath.mat2.create(), obj[enums.PARAM_MAT3] = vmath.mat3.create(), obj[enums.PARAM_MAT4] = vmath.mat4.create(), obj[enums.PARAM_TEXTURE_2D] = opts.defaultTexture, obj[enums.PARAM_TEXTURE_CUBE] = opts.defaultTextureCube, obj );
  var obj;
  this._stage2fn = {};

  this._drawItemsPools = new memop.FramePool(function () {
    return new memop.RecyclePool(function () {
      return {
        node: null,
        mesh: null,
        material: null,
      };
    }, 100);
  }, 16);

  this._stageItemsPools = new memop.FramePool(function () {
    return new memop.RecyclePool(function () {
      return {
        node: null,
        mesh: null,
        material: null,
        technique: null,
        zdist: -1,
      };
    }, 100);
  }, 16);
};

Base.prototype._reset = function _reset () {
  this._drawItemsPools.reset();
  this._stageItemsPools.reset();
};

Base.prototype._render = function _render (camera, scene, stages) {
    var this$1 = this;

  var device = this._device;

  // TODO: use camera's clearFalgs
  device.setViewport(0, 0, camera._rect.w, camera._rect.h);
  device.clear({
    color: [0.3, 0.3, 0.3, 1],
    depth: 1
  });

  // get all draw items
  var allDrawItems = this._drawItemsPools.alloc();
  allDrawItems.reset();

  for (var i = 0; i < scene._models.length; ++i) {
    var model = scene._models.data[i];

    for (var m = 0; m < model.meshCount; ++m) {
      var drawItem = allDrawItems.add();
      model.getDrawItem(drawItem, m);
    }
  }

  // TODO: update frustum
  // TODO: visbility test
  // frustum.update(camera._viewProj);

  // dispatch draw items to different stage
  _stageInfos.reset();

  for (var i$1 = 0; i$1 < stages.length; ++i$1) {
    var stage = stages[i$1];
    var stageItems = this$1._stageItemsPools.alloc();
    stageItems.reset();

    for (var j = 0; j < allDrawItems.length; ++j) {
      var drawItem$1 = allDrawItems.data[j];
      var tech = drawItem$1.material.getTechnique(stage);

      if (tech) {
        var stageItem = stageItems.add();
        stageItem.node = drawItem$1.node;
        stageItem.mesh = drawItem$1.mesh;
        stageItem.material = drawItem$1.material;
        stageItem.technique = tech;
        stageItem.zdist = -1;
      }
    }

    var stageInfo = _stageInfos.alloc();
    stageInfo.stage = stage;
    stageInfo.items = stageItems;
  }

  // render stages
  for (var i$2 = 0; i$2 < _stageInfos.length; ++i$2) {
    var info = _stageInfos.data[i$2];
    var fn = this$1._stage2fn[info.stage];

    fn(camera, info.items);
  }
};

Base.prototype._draw = function _draw (item) {
    var this$1 = this;

  var device = this._device;
  var programLib = this._programLib;
  var node = item.node;
  var mesh = item.mesh;
  var material = item.material;
  var technique = item.technique;

  // reset the pool
  // NOTE: we can use drawCounter optimize this
  // TODO: should be configurable
  _float2_pool.reset();
  _float3_pool.reset();
  _float4_pool.reset();
  _float9_pool.reset();
  _float16_pool.reset();
  _int2_pool.reset();
  _int3_pool.reset();
  _int4_pool.reset();

  // set common uniforms
  // TODO: try commit this depends on material
  // {
  node.getWorldMatrix(_m4_tmp);
  device.setUniform('model', vmath.mat4.array(_float16_pool.alloc(), _m4_tmp));

  vmath.mat3.transpose(_m3_tmp, vmath.mat3.invert(_m3_tmp, vmath.mat3.fromMat4(_m3_tmp, _m4_tmp)));
  device.setUniform('normalMatrix', vmath.mat3.array(_float9_pool.alloc(), _m3_tmp));
  // }

  // set technique uniforms
  var slot = 0;
  for (var i = 0; i < technique._parameters.length; ++i) {
    var prop = technique._parameters[i];
    var param = material.getValue(prop.name);

    if (param === undefined) {
      param = prop.val;
    }

    if (param === undefined) {
      param = this$1._type2defaultValue[prop.type];
    }

    if (param === undefined) {
      console.warn(("Failed to set technique property " + (prop.name) + ", value not found."));
      continue;
    }

    if (
      prop.type === enums.PARAM_TEXTURE_2D ||
      prop.type === enums.PARAM_TEXTURE_CUBE
    ) {
      device.setTexture(prop.name, param, slot);
      ++slot;
    } else {
      var convertFn = _type2uniformValue[prop.type];
      var convertedValue = convertFn(param);
      device.setUniform(prop.name, convertedValue);
    }
  }

  // for each pass
  for (var i$1 = 0; i$1 < technique._passes.length; ++i$1) {
    var pass = technique._passes[i$1];
    var count = mesh._vertexBuffer.count;

    // set vertex buffer
    device.setVertexBuffer(0, mesh._vertexBuffer);

    // set index buffer
    if (mesh._indexBuffer) {
      device.setIndexBuffer(mesh._indexBuffer);
      count = mesh._indexBuffer.count;
    }

    // set primitive type
    device.setPrimitiveType(mesh._primitiveType);

    // set program
    var program = programLib.getProgram(pass._programName, material._options);
    device.setProgram(program);

    // cull mode
    device.setCullMode(pass._cullMode);

    // blend
    if (pass._blend) {
      device.enableBlend();
      device.setBlendFuncSep(
        pass._blendSrc,
        pass._blendDst,
        pass._blendSrcAlpha,
        pass._blendDstAlpha
      );
      device.setBlendEqSep(
        pass._blendEq,
        pass._blendAlphaEq
      );
      device.setBlendColor32(pass._blendColor);
    }

    // depth test & write
    if (pass._depthTest) {
      device.enableDepthTest();
      device.setDepthFunc(pass._depthFunc);
    }
    if (pass._depthWrite) {
      device.enableDepthWrite();
    }

    // stencil
    if (pass._stencilTest) {
      device.enableStencilTest();

      // front
      device.setStencilFuncFront(
        pass._stencilFuncFront,
        pass._stencilRefFront,
        pass._stencilMaskFront
      );
      device.setStencilOpFront(
        pass._stencilFailOpFront,
        pass._stencilZFailOpFront,
        pass._stencilZPassOpFront,
        pass._stencilWriteMaskFront
      );

      // back
      device.setStencilFuncBack(
        pass._stencilFuncBack,
        pass._stencilRefBack,
        pass._stencilMaskBack
      );
      device.setStencilOpBack(
        pass._stencilFailOpBack,
        pass._stencilZFailOpBack,
        pass._stencilZPassOpBack,
        pass._stencilWriteMaskBack
      );
    }

    // draw pass
    device.draw(0, count);
  }
};

var renderer = {
  // functions
  createMesh: createMesh,
  parseMaterial: parseMaterial,

  // classes
  Pass: Pass,
  Technique: Technique,
  Material: Material,
  Mesh: Mesh,

  Light: Light,
  Camera: Camera,
  Model: Model,
  Scene: Scene,

  Base: Base,
  ProgramLib: ProgramLib,
};
Object.assign(renderer, enums);

return renderer;

}(window.gfx,window.vmath,window.memop));
//# sourceMappingURL=renderer.dev.js.map
