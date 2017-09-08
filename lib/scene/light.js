import { color3, mat4, mat3, vec3, toRadian } from 'vmath';
import enums from '../enums';

let _m4_tmp = mat4.create();
let _m3_tmp = mat3.create();
const _forward = vec3.new(0, 0, -1);
let _transformedLightDirection = vec3.create();

export default class Light {
  constructor() {
    this._poolID = -1;
    this._node = null;

    this._type = enums.LIGHT_DIRECTIONAL;

    this._color = color3.new(1, 1, 1);
    this._intensity = 1;

    // used for spot and point light
    this._range = 1;
    // used for spot light, default to 60 degrees
    this._spotAngle = toRadian(60);
    this._spotExp = 1;
    // cached for uniform
    this._directionUniform = new Float32Array(3);
    this._positionUniform = new Float32Array(3);
    this._colorUniform = new Float32Array([this._color.r * this._intensity, this._color.g * this._intensity, this._color.b * this._intensity]);
    this._spotUniform = new Float32Array([Math.cos(this._spotAngle * 0.5), this._spotExp]);
  }

  setNode(node) {
    this._node = node;
  }

  set color(val) {
    color3.copy(this._color, val);
    this._colorUniform[0] = val.r * this._intensity;
    this._colorUniform[1] = val.g * this._intensity;
    this._colorUniform[2] = val.b * this._intensity;
  }
  get color() {
    return this._color;
  }

  set intensity(val) {
    this._intensity = val;
    this._colorUniform[0] = val * this._color.r;
    this._colorUniform[1] = val * this._color.g;
    this._colorUniform[2] = val * this._color.b;
  }
  get intensity() {
    return this._intensity;
  }

  set type(tpe) {
    this._type = tpe;
  }
  get type() {
    return this._type;
  }

  set spotAngle(val) {
    this._spotAngle = val;
    this._spotUniform[0] = Math.cos(this._spotAngle * 0.5);
  }
  get spotAngle() {
    return this._spotAngle;
  }

  set spotExp(val) {
    this._spotExp = val;
    this._spotUniform[1] = val;
  }
  get spotExp() {
    return this._spotExp;
  }

  set range(tpe) {
    this._range = tpe;
  }
  get range() {
    return this._range;
  }

  _updateLightPositionAndDirection() {
    this._node.getWorldMatrix(_m4_tmp);
    mat3.fromMat4(_m3_tmp, _m4_tmp);
    vec3.transformMat3(_transformedLightDirection, _forward, _m3_tmp);
    vec3.array(this._directionUniform, _transformedLightDirection);
    let pos = this._positionUniform;
    pos[0] = _m4_tmp.m12;
    pos[1] = _m4_tmp.m13;
    pos[2] = _m4_tmp.m14;
  }

  update() {
    this._updateLightPositionAndDirection();
  }
}