export default {
  // projection
  PROJ_PERSPECTIVE: 0,
  PROJ_ORTHO: 1,

  // stages
  STAGE_OPAQUE:       0x00000001,
  STAGE_TRANSPARENT:  0x00000002,
  STAGE_SHADOWCAST:   0x00000004,

  // lights
  LIGHT_DIRECTIONAL: 0,
  LIGHT_POINT: 1,
  LIGHT_SPOT: 2,

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
