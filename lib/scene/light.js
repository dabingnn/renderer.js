import { color3, mat4, vec4 } from 'vmath';
import enums from '../enums';

let nodeMatrix = mat4.create();
const defaultLightDirectional = vec4.new(0, 0, -1, 0);
let transformedLightDirection = vec4.new();
let angleToRadian = Math.PI / 180;
function angleCosine(angle) {
  return Math.cos(angle * angleToRadian);
}
export default class Light {
  constructor() {
    this._node = null;
    this._type = enums.LIGHT_DIRECTIONAL;
    this._color = color3.create(1, 1, 1);
    this._range = 1;
    this._innerAngle = 30;
    this._outterAngle = 45;
    // cached for uniform
    this._directionUniform = new Float32Array(3);
    this._positionUniform = new Float32Array(3);
    this._colorUniform = new Float32Array([1, 1, 1]);
    this._coneUniform = new Float32Array([angleCosine(30), angleCosine(45)]);
  }

  setNode(node) {
    this._node = node;
  }

  set color(val) {
    color3.copy(this._color, val);
    this._colorUniform[0] = val.r;
    this._colorUniform[1] = val.g;
    this._colorUniform[2] = val.b;
  }

  get color() {
    return this._color;
  }

  set type(tpe) {
    this._type = tpe;
  }
  get type() {
    return this._type;
  }

  set range(tpe) {
    this._range = tpe;
  }
  get range() {
    return this._range;
  }

  _updateLightPositionAndDirection() {
    this._node.getWorldMatrix(nodeMatrix);
    vec4.transformMat4(transformedLightDirection, defaultLightDirectional, nodeMatrix);
    let dir = this._directionUniform;
    dir[0] = transformedLightDirection.x;
    dir[1] = transformedLightDirection.y;
    dir[2] = transformedLightDirection.z;
    let pos = this._positionUniform;
    pos[0] = nodeMatrix.m12;
    pos[1] = nodeMatrix.m13;
    pos[2] = nodeMatrix.m14;
  }

  update() {
    this._updateLightPositionAndDirection();
  }
}