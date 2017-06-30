import { FramePool, RecyclePool } from 'memop';
import { enums } from '../enums';
import { vec2, vec3, vec4, mat2, mat3, mat4, color3, color4 } from 'vmath';

let _m3_tmp = mat3.create();
let _m4_tmp = mat4.create();

let _stageInfos = new FramePool(() => {
  return {
    stage: null,
    items: null,
  };
}, 8);

let _float2_pool = new FramePool(() => {
  return new Float32Array(2);
}, 8);

let _float3_pool = new FramePool(() => {
  return new Float32Array(3);
}, 8);

let _float4_pool = new FramePool(() => {
  return new Float32Array(4);
}, 8);

let _float9_pool = new FramePool(() => {
  return new Float32Array(9);
}, 8);

let _float16_pool = new FramePool(() => {
  return new Float32Array(16);
}, 8);

let _int2_pool = new FramePool(() => {
  return new Int32Array(2);
}, 8);

let _int3_pool = new FramePool(() => {
  return new Int32Array(3);
}, 8);

let _int4_pool = new FramePool(() => {
  return new Int32Array(3);
}, 8);

let _type2uniformValue = {
  [enums.PARAM_INT]: function (value) {
    return value;
  },

  [enums.PARAM_INT2]: function (value) {
    return vec2.array(_int2_pool.alloc(), value);
  },

  [enums.PARAM_INT3]: function (value) {
    return vec3.array(_int3_pool.alloc(), value);
  },

  [enums.PARAM_INT4]: function (value) {
    return vec4.array(_int4_pool.alloc(), value);
  },

  [enums.PARAM_FLOAT]: function (value) {
    return value;
  },

  [enums.PARAM_FLOAT2]: function (value) {
    return vec2.array(_float2_pool.alloc(), value);
  },

  [enums.PARAM_FLOAT3]: function (value) {
    return vec3.array(_float3_pool.alloc(), value);
  },

  [enums.PARAM_FLOAT4]: function (value) {
    return vec4.array(_float4_pool.alloc(), value);
  },

  [enums.PARAM_COLOR3]: function (value) {
    return color3.array(_float3_pool.alloc(), value);
  },

  [enums.PARAM_COLOR4]: function (value) {
    return color4.array(_float4_pool.alloc(), value);
  },

  [enums.PARAM_MAT2]: function (value) {
    return mat2.array(_float4_pool.alloc(), value);
  },

  [enums.PARAM_MAT3]: function (value) {
    return mat3.array(_float9_pool.alloc(), value);
  },

  [enums.PARAM_MAT4]: function (value) {
    return mat4.array(_float16_pool.alloc(), value);
  },

  // [enums.PARAM_TEXTURE_2D]: function (value) {
  // },

  // [enums.PARAM_TEXTURE_CUBE]: function (value) {
  // },
};

export default class {
  constructor(device, builtin) {
    this._device = device;
    this._builtin = builtin;
    this._type2defaultValue = {
      [enums.PARAM_INT]: 0,
      [enums.PARAM_INT2]: vec2.new(0, 0),
      [enums.PARAM_INT3]: vec3.new(0, 0, 0),
      [enums.PARAM_INT4]: vec4.new(0, 0, 0, 0),
      [enums.PARAM_FLOAT]: 0.0,
      [enums.PARAM_FLOAT2]: vec2.new(0, 0),
      [enums.PARAM_FLOAT3]: vec3.new(0, 0, 0),
      [enums.PARAM_FLOAT4]: vec4.new(0, 0, 0, 0),
      [enums.PARAM_COLOR3]: color3.new(0, 0, 0),
      [enums.PARAM_COLOR4]: color4.new(0, 0, 0, 1),
      [enums.PARAM_MAT2]: mat2.create(),
      [enums.PARAM_MAT3]: mat3.create(),
      [enums.PARAM_MAT4]: mat4.create(),
      [enums.PARAM_TEXTURE_2D]: builtin.defaultTexture,
      [enums.PARAM_TEXTURE_CUBE]: builtin.defaultTextureCube,
    };
    this._stage2fn = {};

    this._drawItemsPools = new FramePool(() => {
      return new RecyclePool(() => {
        return {
          node: null,
          mesh: null,
          material: null,
        };
      }, 100);
    }, 16);

    this._stageItemsPools = new FramePool(() => {
      return new RecyclePool(() => {
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

  _reset() {
    this._drawItemsPools.reset();
    this._stageItemsPools.reset();
  }

  _render(camera, scene, stages) {
    const device = this._device;

    // TODO: use camera's clearFalgs
    device.setViewport(0, 0, camera._rect.w, camera._rect.h);
    device.clear({
      color: [0.5, 0.5, 0.5, 1],
      depth: 1
    });

    // get all draw items
    let allDrawItems = this._drawItemsPools.alloc();
    allDrawItems.reset();

    for (let i = 0; i < scene._models.length; ++i) {
      let model = scene._models.data[i];

      for (let m = 0; m < model.meshCount; ++m) {
        let drawItem = allDrawItems.add();
        model.getDrawItem(drawItem, m);
      }
    }

    // TODO: update frustum
    // TODO: visbility test
    // frustum.update(camera._viewProj);

    // dispatch draw items to different stage
    _stageInfos.reset();

    for (let i = 0; i < stages.length; ++i) {
      let stage = stages[i];
      let stageItems = this._stageItemsPools.alloc();
      stageItems.reset();

      for (let j = 0; j < allDrawItems.length; ++j) {
        let drawItem = allDrawItems.data[j];
        let tech = drawItem.material.getTechnique(stage);

        if (tech) {
          let stageItem = stageItems.add();
          stageItem.node = drawItem.node;
          stageItem.mesh = drawItem.mesh;
          stageItem.material = drawItem.material;
          stageItem.technique = tech;
          stageItem.zdist = -1;
        }
      }

      let stageInfo = _stageInfos.alloc();
      stageInfo.stage = stage;
      stageInfo.items = stageItems;
    }

    // render stages
    for (let i = 0; i < _stageInfos.length; ++i) {
      let info = _stageInfos.data[i];
      let fn = this._stage2fn[info.stage];

      fn(camera, info.items);
    }
  }

  _draw(item) {
    const device = this._device;
    const node = item.node;
    const mesh = item.mesh;
    const material = item.material;
    const technique = item.technique;

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

    let count = mesh._vertexBuffer.count;

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
    device.setUniform('model', mat4.array(_float16_pool.alloc(), _m4_tmp));

    mat3.transpose(_m3_tmp, mat3.invert(_m3_tmp, mat3.fromMat4(_m3_tmp, _m4_tmp)));
    device.setUniform('normalMatrix', mat3.array(_float9_pool.alloc(), _m3_tmp));
    // }

    // set technique uniforms
    let slot = 0;
    for (let i = 0; i < technique._properties.length; ++i) {
      let prop = technique._properties[i];
      let param = material.getParameter(prop.name);

      if (param === undefined) {
        param = prop.val;
      }

      if (param === undefined) {
        param = this._type2defaultValue[prop.type];
      }

      if (param === undefined) {
        console.warn(`Failed to set technique property ${prop.name}, value not found.`);
        continue;
      }

      if (
        prop.type === enums.PARAM_TEXTURE_2D ||
        prop.type === enums.PARAM_TEXTURE_CUBE
      ) {
        device.setTexture(prop.name, param, slot);
        ++slot;
      } else {
        let convertFn = _type2uniformValue[prop.type];
        let convertedValue = convertFn(param);
        device.setUniform(prop.name, convertedValue);
      }
    }

    // primitive type
    device.setPrimitiveType(mesh._primitiveType);

    // for each pass
    for (let i = 0; i < technique._passes.length; ++i) {
      let pass = technique._passes[i];

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
  }
}