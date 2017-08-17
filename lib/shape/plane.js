import { vec3 } from 'vmath';

let tmp_vec3 = vec3.create();
export default class Plane {
  constructor() {
    this._normal = vec3.new(0, 1, 0);
    this._point = vec3.new(0, 0, 0);
  }

  set normal(val) {
    vec3.normalize(this._normal, val);
  }
  get normal() {
    return this._normal;
  }

  set point(val) {
    vec3.copy(this._point, val);
  }
  get point() {
    return this._point;
  }

  intersectsRay(ray, point) {
    let pointToOrigin = vec3.subtract(tmp_vec3, this._point, ray.origin);
    let t = vec3.dot(this._normal, pointToOrigin) / vec3.dot(this._normal, ray.direction);
    let intersects = t >= 0;

    if (intersects && point) {
      vec3.copy(point, ray.direction);
      vec3.scale(point, point, t);
      vec3.add(point, point, ray.origin);
    }

    return intersects;
  }

  intersectsLine(start, end, point) {
    let d = - vec3.dot(this._normal, this._point);
    let d0 = vec3.dot(this._normal, start) + d;
    let d1 = vec3.dot(this._normal, end) + d;

    let t = d0 / (d0 - d1);
    let intersects = t >= 0 && t <= 1;
    if (intersects && point) {
      vec3.lerp(point, start, end, t);
    }

    return intersects;
  }
}