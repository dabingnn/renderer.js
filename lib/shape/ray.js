import {vec3} from 'vmath';

export default class Ray {
  constructor() {
    this._origin = vec3.new(0, 0, 0);
    this._direction = vec3.new(0, 0, -1);
  }

  set origin(val) {
    vec3.normalize(this._origin, val)
  }

  get origin() {
    return this._origin;
  }

  set direction(val) {
    vec3.normalize(this._direction, val);
  }

  get direction() {
    return this._direction;
  }
}