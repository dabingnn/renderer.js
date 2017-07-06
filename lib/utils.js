import gfx from 'gfx';
import Mesh from './resources/mesh';
import Pass from './resources/pass';
import Technique from './resources/technique';
import { enums } from './enums';

/**
 * @param {gfx.Device} device
 * @param {Object} data
 */
export function createMesh(device, data) {
  if (!data.positions) {
    console.error('The data must have positions field');
    return null;
  }

  let verts = [];
  let vcount = data.positions.length / 3;

  for (let i = 0; i < vcount; ++i) {
    verts.push(data.positions[3 * i], data.positions[3 * i + 1], data.positions[3 * i + 2]);

    if (data.normals) {
      verts.push(data.normals[3 * i], data.normals[3 * i + 1], data.normals[3 * i + 2]);
    }

    if (data.uvs) {
      verts.push(data.uvs[2 * i], data.uvs[2 * i + 1]);
    }
  }

  let vfmt = [];
  vfmt.push({ name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 3 });
  if (data.normals) {
    vfmt.push({ name: gfx.ATTR_NORMAL, type: gfx.ATTR_TYPE_FLOAT32, num: 3 });
  }
  if (data.uvs) {
    vfmt.push({ name: gfx.ATTR_UV, type: gfx.ATTR_TYPE_FLOAT32, num: 2 });
  }

  let vb = new gfx.VertexBuffer(
    device,
    new gfx.VertexFormat(vfmt),
    gfx.USAGE_STATIC,
    new Float32Array(verts),
    vcount,
    false
  );

  let ib = null;
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

let stageMap = {
  STAGE_OPAQUE: enums.STAGE_OPAQUE,
  STAGE_TRANSPARENT: enums.STAGE_TRANSPARENT,
  STAGE_SHADOWCAST: enums.STAGE_SHADOWCAST
};

let paramTypeMap = {
  'int': enums.PARAM_INT,
  'int2': enums.PARAM_INT2,
  'int3': enums.PARAM_INT3,
  'int4': enums.PARAM_INT4,
  'float': enums.PARAM_FLOAT,
  'float2': enums.PARAM_FLOAT2,
  'float3': enums.PARAM_FLOAT3,
  'float4': enums.PARAM_FLOAT4,
  'color3': enums.PARAM_COLOR3,
  'color4': enums.PARAM_COLOR4,
  'mat2': enums.PARAM_MAT2,
  'mat3': enums.PARAM_MAT3,
  'mat4': enums.PARAM_MAT4,
  'tex_2d': enums.PARAM_TEXTURE_2D,
  'tex_cube': enums.PARAM_TEXTURE_CUBE
};

let cullMap = {
  none: gfx.CULL_NONE,
  front: gfx.CULL_FRONT,
  back: gfx.CULL_BACK,
  front_and_back: gfx.CULL_FRONT_AND_BACK
};

let blendFuncMap = {
  add: gfx.BLEND_FUNC_ADD,
  sub: gfx.BLEND_FUNC_SUBTRACT,
  reverse_sub: gfx.BLEND_FUNC_REVERSE_SUBTRACT
};

let blendFactorMap = {
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

let dsFuncMap = {
  never: gfx.DS_FUNC_NEVER,
  less: gfx.DS_FUNC_LESS,
  equal: gfx.DS_FUNC_EQUAL,
  lequal: gfx.DS_FUNC_LEQUAL,
  greater: gfx.DS_FUNC_GREATER,
  notequal: gfx.DS_FUNC_NOTEQUAL,
  gequal: gfx.DS_FUNC_GEQUAL,
  always: gfx.DS_FUNC_ALWAYS
};

let stencilOpMap = {
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
let parseBlend = function (data, callback) {
  let words = data.split(' ');
  callback && callback(blendFuncMap[words[0]], blendFactorMap[words[1]], blendFactorMap[words[2]]);
};
// stencil packing 'func ref mask failOP zfailOp passOp writeMask'
let parseStencil = function (data, callback) {
  let words = data.split(' ');
  callback && callback(dsFuncMap[words[0]], parseInt(words[1]), parseInt(words[2]),
    stencilOpMap[words[3]], stencilOpMap[words[4]], stencilOpMap[words[5]], parseInt(words[6]));
};

// depth packing 'func write'
let parseDepth = function (data, callback) {
  let words = data.split(' ');
  callback && callback(dsFuncMap[words[0]], (words[1] === 'true'));
};

// program packing 'vertSourceIndex fragSourceInde'
let parseProgram = function (data, callback) {
  let words = data.split(' ');
  callback && callback(parseInt(words[0]), parseInt(words[1]));
};

// param packing 'type name type name ...'
let parseTechniqueParams = function (data) {
  let params = [];
  let words = data.split(' ');
  let wordIndex = 0;
  while (wordIndex + 1 < words.length) {
    params.push({
      name: words[wordIndex + 1],
      type: paramTypeMap[words[wordIndex]],
    });
    wordIndex += 2;
  }

  return params;
};

export function parseMaterial(device, data) {
  let techniques = [];
  let mtl = data;
  mtl.techniques.forEach(techInfo => {
    //construct passes
    let passes = [];
    techInfo.passes.forEach(passInfo => {
      let program = null;
      parseProgram(passInfo['program'], (vertIndex, fragIndex) => {
        program = new gfx.Program(device, {
          vert: mtl.vertexShaders[vertIndex],
          frag: mtl.fragmentShaders[fragIndex],
        });
        program.link();
      });
      let pass = new Pass(program);
      // blend
      if (passInfo['blend']) {
        pass._blend = true;
        parseBlend(passInfo['blend'], (func, src, dst) => {
          pass._blendEq = func;
          pass._blendSrc = src;
          pass._blendDst = dst;
        });
        if (passInfo['blendAlpha']) {
          parseBlend(passInfo['blendAlpha'], (func, src, dst) => {
            pass._blendAlphaEq = func;
            pass._blendSrcAlpha = src;
            pass._blendDstAlpha = dst;
          });
        } else {
          pass._blendAlphaEq = pass._blendEq;
          pass._blendSrcAlpha = pass._blendSrc;
          pass._blendDstAlpha = pass._blendDst;
        }
        if (passInfo['blendColor']) {
          pass._blendColor = parseInt(passInfo['blendColor']);
        }
      }
      // cull
      if (passInfo['cull']) {
        pass._cullMode = cullMap[passInfo['cull']];
      }
      // depth
      if (passInfo['depth']) {
        pass._depthTest = true;
        parseDepth(passInfo['depth'], (func, write) => {
          pass._depthFunc = func;
          pass._depthWrite = write;
        })
      }
      // stencil
      if (passInfo['stencil']) {
        pass._stencilTest = true;
        // "func ref mask failOp zFailOp zPassOp writeMask"
        parseStencil(passInfo['stencil'], (func, ref, mask, failOp, zFailOp, zPassOp, writeMask) => {
          pass._stencilFuncFront = func;
          pass._stencilRefFront = func;
          pass._stencilMaskFront = mask;
          pass._stencilFailOpFront = failOp;
          pass._stencilZFailOpFront = zFailOp;
          pass._stencilZPassOpFront = zPassOp;
          pass._stencilWriteMaskFront = writeMask;
        });

        if (passInfo['stencilBack']) {
          parseStencil(passInfo['stencilBack'], (func, ref, mask, failOp, zFailOp, zPassOp, writeMask) => {
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
    let stage = 0;
    techInfo.stages.split(' ').forEach(stageInfo => {
      stage = stage | stageMap[stageInfo];
    });

    let tech = new Technique(
      stage,
      parseTechniqueParams(techInfo.parameters),
      passes
    );
    techniques.push(tech);
  });

  return techniques;
}