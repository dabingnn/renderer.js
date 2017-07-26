import { color3, mat4, vec4 } from 'vmath';
import enums from '../enums';

let _nodeMatrix = mat4.create();
const _defaultLightDirectional = vec4.new(0, 0, -1, 0);
let _transformedLightDirection = vec4.new();
let _angleToRadian = Math.PI / 180;
function _angleCosine(angle) {
  return Math.cos(angle * _angleToRadian);
}

export default class Light {
  constructor() {
    this._node = null;
    this._type = enums.LIGHT_DIRECTIONAL;

    this._color = color3.create(1, 1, 1);
    this._intensity = 1;

    // used for spot and point light
    this._range = 1;
    // used for spot light
    this._spotAngle = 60;
    this._spotExp = 1;
    // cached for uniform
    this._directionUniform = new Float32Array(3);
    this._positionUniform = new Float32Array(3);
    this._colorUniform = new Float32Array([this._color.r * this._intensity, this._color.g * this._intensity, this._color.b * this._intensity]);
    this._spotUniform = new Float32Array([_angleCosine(this._spotAngle * 0.5), this._spotExp]);
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
    this._spotUniform[0] = _angleCosine(this._spotAngle * 0.5);
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
    this._node.getWorldMatrix(_nodeMatrix);
    vec4.transformMat4(_transformedLightDirection, _defaultLightDirectional, _nodeMatrix);
    let dir = this._directionUniform;
    dir[0] = _transformedLightDirection.x;
    dir[1] = _transformedLightDirection.y;
    dir[2] = _transformedLightDirection.z;
    let pos = this._positionUniform;
    pos[0] = _nodeMatrix.m12;
    pos[1] = _nodeMatrix.m13;
    pos[2] = _nodeMatrix.m14;
  }

  update() {
    this._updateLightPositionAndDirection();
  }
}