
/*
 * renderer.js v1.1.0
 * (c) 2017 @Johnny Wu
 * Released under the MIT License.
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var gfx = _interopDefault(require('gfx'));
var vmath = require('vmath');
var memop = require('memop');

var initTextures = function (device) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  // default texture
  canvas.width = canvas.height = 128;
  context.fillStyle = '#ddd';
  context.fillRect(0, 0, 128, 128);
  context.fillStyle = '#555';
  context.fillRect(0, 0, 64, 64);
  context.fillStyle = '#555';
  context.fillRect(64, 64, 64, 64);

  var defaultTexture = new gfx.Texture2D(device, {
    images: [canvas],
    width: 128,
    height: 128,
    wrapS: gfx.WRAP_REPEAT,
    wrapT: gfx.WRAP_REPEAT,
    format: gfx.TEXTURE_FMT_RGB8,
    mipmap: true,
  });

  return {
    defaultTexture: defaultTexture,
    // defaultTextureCube, // TODO
  };
};

var initBuiltin = function (device) {
  var builtin = {};
  Object.assign(builtin, initTextures(device));

  return builtin;
};

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
  return new Int32Array(3);
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

var Renderer = (function () {
  function anonymous(device, builtin) {
    this._device = device;
    this._builtin = builtin;
    this._type2defaultValue = ( obj = {}, obj[enums.PARAM_INT] = 0, obj[enums.PARAM_INT2] = vmath.vec2.new(0, 0), obj[enums.PARAM_INT3] = vmath.vec3.new(0, 0, 0), obj[enums.PARAM_INT4] = vmath.vec4.new(0, 0, 0, 0), obj[enums.PARAM_FLOAT] = 0.0, obj[enums.PARAM_FLOAT2] = vmath.vec2.new(0, 0), obj[enums.PARAM_FLOAT3] = vmath.vec3.new(0, 0, 0), obj[enums.PARAM_FLOAT4] = vmath.vec4.new(0, 0, 0, 0), obj[enums.PARAM_COLOR3] = vmath.color3.new(0, 0, 0), obj[enums.PARAM_COLOR4] = vmath.color4.new(0, 0, 0, 1), obj[enums.PARAM_MAT2] = vmath.mat2.create(), obj[enums.PARAM_MAT3] = vmath.mat3.create(), obj[enums.PARAM_MAT4] = vmath.mat4.create(), obj[enums.PARAM_TEXTURE_2D] = builtin.defaultTexture, obj[enums.PARAM_TEXTURE_CUBE] = builtin.defaultTextureCube, obj );
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
  }

  anonymous.prototype._reset = function _reset () {
    this._drawItemsPools.reset();
    this._stageItemsPools.reset();
  };

  anonymous.prototype._render = function _render (camera, scene, stages) {
    var this$1 = this;

    var device = this._device;

    // TODO: use camera's clearFalgs
    device.setViewport(0, 0, camera._rect.w, camera._rect.h);
    device.clear({
      color: [0.5, 0.5, 0.5, 1],
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

  anonymous.prototype._draw = function _draw (item) {
    var this$1 = this;

    var device = this._device;
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

    var count = mesh._vertexBuffer.count;

    // vertex buffer
    device.setVertexBuffer(0, mesh._vertexBuffer);

    // index buffer
    if (mesh._indexBuffer) {
      device.setIndexBuffer(mesh._indexBuffer);
      count = mesh._indexBuffer.count;
    }

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
    for (var i = 0; i < technique._properties.length; ++i) {
      var prop = technique._properties[i];
      var param = material.getParameter(prop.name);

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

    // primitive type
    device.setPrimitiveType(mesh._primitiveType);

    // for each pass
    for (var i$1 = 0; i$1 < technique._passes.length; ++i$1) {
      var pass = technique._passes[i$1];

      // set program
      device.setProgram(pass._program);

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

  return anonymous;
}());

var _camPos = vmath.vec3.create();
var _camFwd = vmath.vec3.create();
var _v3_tmp1 = vmath.vec3.create();

var _a16_view = new Float32Array(16);
var _a16_proj = new Float32Array(16);
var _a16_viewProj = new Float32Array(16);

var ForwardRenderer = (function (Renderer$$1) {
  function anonymous(device, builtin) {
    Renderer$$1.call(this, device, builtin);

    this._stage2fn[enums.STAGE_OPAQUE] = this._opaqueStage.bind(this);
    this._stage2fn[enums.STAGE_TRANSPARENT] = this._transparentStage.bind(this);
  }

  if ( Renderer$$1 ) anonymous.__proto__ = Renderer$$1;
  anonymous.prototype = Object.create( Renderer$$1 && Renderer$$1.prototype );
  anonymous.prototype.constructor = anonymous;

  anonymous.prototype.render = function render (camera, scene) {
    this._reset();
    camera.updateMatrix();

    this._render(camera, scene, [
      enums.STAGE_OPAQUE,
      enums.STAGE_TRANSPARENT ]);
  };

  anonymous.prototype._opaqueStage = function _opaqueStage (camera, items) {
    var this$1 = this;

    // update uniforms
    this._device.setUniform('view', vmath.mat4.array(_a16_view, camera._view));
    this._device.setUniform('proj', vmath.mat4.array(_a16_proj, camera._proj));
    this._device.setUniform('viewProj', vmath.mat4.array(_a16_viewProj, camera._viewProj));

    // sort items
    items.sort(function (a, b) {
      a.technique.sortID() - b.technique.sortID();
    });

    // draw it
    for (var i = 0; i < items.length; ++i) {
      var item = items.data[i];
      this$1._draw(item);
    }
  };

  anonymous.prototype._transparentStage = function _transparentStage (camera, items) {
    var this$1 = this;

    // update uniforms
    this._device.setUniform('view', vmath.mat4.array(_a16_view, camera._view));
    this._device.setUniform('proj', vmath.mat4.array(_a16_proj, camera._proj));
    this._device.setUniform('viewProj', vmath.mat4.array(_a16_viewProj, camera._viewProj));

    // calculate zdist
    camera._node.getWorldPos(_camPos);
    vmath.vec3.set(_camFwd, -camera._view.m02, -camera._view.m06, -camera._view.m10);

    for (var i = 0; i < items.length; ++i) {
      var item = items.data[i];

      // TODO: we should use mesh center instead!
      item.node.getWorldPos(_v3_tmp1);

      vmath.vec3.sub(_v3_tmp1, _v3_tmp1, _camPos);
      item.zdist = vmath.vec3.dot(_v3_tmp1, _camFwd);
    }

    // sort items
    items.sort(function (a, b) {
      return b.zdist - a.zdist;
    });

    // draw it
    for (var i$1 = 0; i$1 < items.length; ++i$1) {
      var item$1 = items.data[i$1];
      this$1._draw(item$1);
    }
  };

  return anonymous;
}(Renderer));

// import DeferredRenderer from './lib/deferred';

/**
 * @param {Device} device
 * @param {Object} opts
 */
var create = function (device) {
  var builtin = initBuiltin(device);
  var forward = new ForwardRenderer(device, builtin);

  return {
    builtin: builtin,
    forward: forward,
  };
};

var Mesh = function Mesh(vb, ib, pt) {
  if ( pt === void 0 ) pt = gfx.PT_TRIANGLES;

  this._vertexBuffer = vb;
  this._indexBuffer = ib;
  this._primitiveType = pt;

  // TODO: this._aabb;
};

/**
 * @param {gfx.Device} device
 * @param {Object} data
 */
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

var Pass = function Pass(program) {
  this._program = program;

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

var Technique = function Technique(stages, props, passes) {
  this._id = _genID++;
  this._passes = passes;
  this._properties = props; // {name, type, size, val}
  this._stages = stages;
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

var Material = function Material(techniques, params) {
  if ( params === void 0 ) params = {};

  this._techniques = techniques;
  this._params = params;

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

Material.prototype.getParameter = function getParameter (name) {
  return this._params[name];
};

Material.prototype.setParameter = function setParameter (name, value) {
  // TODO: check if params is valid for current technique???

  this._params[name] = value;
};

var Light = (function () {
  function anonymous() {
    this._node = null;
    this._color = vmath.color3.create();
  }

  anonymous.prototype.setNode = function setNode (node) {
    this._node = node;
  };

  return anonymous;
}());

var Camera = (function () {
  function anonymous() {
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
  }

  anonymous.prototype.setNode = function setNode (node) {
    this._node = node;
  };

  anonymous.prototype.updateMatrix = function updateMatrix () {
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

  return anonymous;
}());

var Model = (function () {
  function anonymous() {
    this._node = null;
    this._meshes = [];
    this._materials = [];
  }

  var prototypeAccessors = { meshCount: {} };

  anonymous.prototype.setNode = function setNode (node) {
    this._node = node;
  };

  anonymous.prototype.addMesh = function addMesh (mesh) {
    if (this._meshes.indexOf(mesh) !== -1) {
      return;
    }
    this._meshes.push(mesh);
  };

  anonymous.prototype.addMaterial = function addMaterial (material) {
    if (this._materials.indexOf(material) !== -1) {
      return;
    }
    this._materials.push(material);
  };

  prototypeAccessors.meshCount.get = function () {
    return this._meshes.length;
  };

  anonymous.prototype.getDrawItem = function getDrawItem (out, index) {
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

  Object.defineProperties( anonymous.prototype, prototypeAccessors );

  return anonymous;
}());

var Scene = (function () {
  function anonymous() {
    this._lights = new memop.FixedArray(16);
    this._models = new memop.FixedArray(16);
  }

  anonymous.prototype.addModel = function addModel (model) {
    var idx = this._models.indexOf(model);
    if (idx === -1) {
      this._models.push(model);
    }
  };

  anonymous.prototype.removeModel = function removeModel (model) {
    var idx = this._models.indexOf(model);
    if (idx !== -1) {
      this._models.fastRemove(idx);
    }
  };

  return anonymous;
}());

var renderer = {
  // functions
  create: create,
  createMesh: createMesh,

  // classes
  Pass: Pass,
  Technique: Technique,
  Material: Material,
  Mesh: Mesh,

  Light: Light,
  Camera: Camera,
  Model: Model,
  Scene: Scene,

  Renderer: Renderer,
  ForwardRenderer: ForwardRenderer,
};
Object.assign(renderer, enums);

module.exports = renderer;
//# sourceMappingURL=renderer.js.map
