import { FramePool, RecyclePool } from 'memop';
import enums from '../enums';
import { vec2, vec3, vec4, mat2, mat3, mat4, color3, color4 } from 'vmath';
import ProgramLib from '../program-lib/program-lib';

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

let _float64_pool = new FramePool(() => {
  return new Float32Array(64);
}, 8);

let _int2_pool = new FramePool(() => {
  return new Int32Array(2);
}, 8);

let _int3_pool = new FramePool(() => {
  return new Int32Array(3);
}, 8);

let _int4_pool = new FramePool(() => {
  return new Int32Array(4);
}, 8);

let _int64_pool = new FramePool(() => {
  return new Int32Array(64);
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

let _type2uniformArrayValue = {
  [enums.PARAM_INT]: {
    func (value) {
      let result = _int64_pool.alloc();
      for (let i = 0; i < value.length; ++i) {
        result[i] = value[i];
      }
      return result;
    },
    size: 1,
  },

  [enums.PARAM_INT2]: {
    func (value) {
      let result = _int64_pool.alloc();
      for (let i = 0; i < value.length; ++i) {
        result[2 * i] = value[i].x;
        result[2 * i + 1] = value[i].y;
      }
      return result;
    },
    size: 2,
  },

  [enums.PARAM_INT3]: {
    func: undefined,
    size: 3,
  },

  [enums.PARAM_INT4]: {
    func (value) {
      let result = _int64_pool.alloc();
      for (let i = 0; i < value.length; ++i) {
        let ivec4 = value[i];
        result[4 * i] = ivec4.x;
        result[4 * i + 1] = ivec4.y;
        result[4 * i + 2] = ivec4.z;
        result[4 * i + 3] = ivec4.w;
      }
      return result;
    },
    size: 4,
  },

  [enums.PARAM_FLOAT]: {
    func (value) {
      let result = _float64_pool.alloc();
      for (let i = 0; i < value.length; ++i) {
        result[i] = value[i];
      }
      return result;
    },
    size: 1
  },

  [enums.PARAM_FLOAT2]: {
    func (value) {
      let result = _float64_pool.alloc();
      for (let i = 0; i < value.length; ++i) {
        result[2 * i] = value[i].x;
        result[2 * i + 1] = value[i].y;
      }
      return result;
    },
    size: 2,
  },

  [enums.PARAM_FLOAT3]: {
    func: undefined,
    size: 3,
  },

  [enums.PARAM_FLOAT4]: {
    func (value) {
      let result = _float64_pool.alloc();
      for (let i = 0; i < value.length; ++i) {
        let fvec4 = value[i];
        result[4 * i] = fvec4.x;
        result[4 * i + 1] = fvec4.y;
        result[4 * i + 2] = fvec4.z;
        result[4 * i + 3] = fvec4.w;
      }
      return result;
    },
    size: 4,
  },

  [enums.PARAM_COLOR3]: {
    func: undefined,
    size: 3,
  },

  [enums.PARAM_COLOR4]: {
    func (value) {
      let result = _float64_pool.alloc();
      for (let i = 0; i < value.length; ++i) {
        let color4 = value[i];
        result[4 * i] = color4.r;
        result[4 * i + 1] = color4.g;
        result[4 * i + 2] = color4.b;
        result[4 * i + 3] = color4.a;
      }
      return result;
    },
    size: 4,
  },

  [enums.PARAM_MAT2]: {
    func (value) {
      let result = _float64_pool.alloc();
      for (let i = 0; i < value.length; ++i) {
        let mat2 = value[i];
        result[4 * i] = mat2.m00;
        result[4 * i + 1] = mat2.m01;
        result[4 * i + 2] = mat2.m02;
        result[4 * i + 3] = mat2.m03;
      }
      return result;
    },
    size: 4
  },

  [enums.PARAM_MAT3]: {
    func: undefined,
    size: 9
  },


  [enums.PARAM_MAT4]: {
    func (value) {
      let result = _float64_pool.alloc();
      for (let i = 0; i < value.length; ++i) {
        let mat4 = value[i];
        result[16 * i] = mat4.m00;
        result[16 * i + 1] = mat4.m01;
        result[16 * i + 2] = mat4.m02;
        result[16 * i + 3] = mat4.m03;
        result[16 * i + 4] = mat4.m04;
        result[16 * i + 5] = mat4.m05;
        result[16 * i + 6] = mat4.m06;
        result[16 * i + 7] = mat4.m07;
        result[16 * i + 8] = mat4.m08;
        result[16 * i + 9] = mat4.m09;
        result[16 * i + 10] = mat4.m10;
        result[16 * i + 11] = mat4.m11;
        result[16 * i + 12] = mat4.m12;
        result[16 * i + 13] = mat4.m13;
        result[16 * i + 14] = mat4.m14;
        result[16 * i + 15] = mat4.m15;
      }
      return result;
    },
    size: 16
  },

  // [enums.PARAM_TEXTURE_2D]: function (value) {
  // },

  // [enums.PARAM_TEXTURE_CUBE]: function (value) {
  // },
};

export default class Base {
  /**
   * @param {gfx.Device} device
   * @param {Object} opts
   * @param {gfx.Texture2D} opts.defaultTexture
   * @param {gfx.TextureCube} opts.defaultTextureCube
   * @param {Array} opts.programTemplates
   * @param {Object} opts.programChunks
   */
  constructor(device, opts) {
    this._device = device;
    this._programLib = new ProgramLib(device, opts.programTemplates, opts.programChunks);
    this._opts = opts;
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
      [enums.PARAM_TEXTURE_2D]: opts.defaultTexture,
      [enums.PARAM_TEXTURE_CUBE]: opts.defaultTextureCube,
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
      color: [0.3, 0.3, 0.3, 1],
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
    const programLib = this._programLib;
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
    _float64_pool.reset();
    _int2_pool.reset();
    _int3_pool.reset();
    _int4_pool.reset();
    _int64_pool.reset();

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
    for (let i = 0; i < technique._parameters.length; ++i) {
      let prop = technique._parameters[i];
      let param = material.getValue(prop.name);

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
        if (prop.size !== undefined) {
          if (prop.size !== param.length) {
            console.error(`The length of texture array (${param.length}) is not corrent(expect ${prop.size}).`);
            continue;
          }
          let slots = _int64_pool.alloc();
          for (let index = 0; index < param.length; ++index) {
            slots[index] = slot + index;
          }
          device.setTextureArray(prop.name, param, slots);
          slot = slot + prop.size;
        } else {
          device.setTexture(prop.name, param, slot);
          ++slot;
        }
      } else {
        let convertedValue;
        if (prop.size !== undefined) {
          let convertArray = _type2uniformArrayValue[prop.type];
          if (convertArray.func === undefined) {
            console.error('Uniform array of color3/int3/float3/mat3 can not be supportted!');
            continue;
          }
          if (prop.size * convertArray.size > 64) {
            console.error('Uniform array is too long!');
            continue;
          }
          convertedValue = convertArray.func(param);
        } else {
          let convertFn = _type2uniformValue[prop.type];
          convertedValue = convertFn(param);
        }
        device.setUniform(prop.name, convertedValue);
      }
    }

    // for each pass
    for (let i = 0; i < technique._passes.length; ++i) {
      let pass = technique._passes[i];
      let count = mesh._vertexBuffer.count;

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
      let program = programLib.getProgram(pass._programName, material._options);
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
  }
}