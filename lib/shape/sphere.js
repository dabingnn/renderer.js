import {vec3} from 'vmath';

let tmp_vec3_a = vec3.create();
let tmp_vec3_b = vec3.create();

export default class Sphere {
  constructor() {
    this._center = vec3.new(0, 0, 0);
    this._radius = 0.5;
  }

  set center(val) {
    vec3.copy(this._center, val);
  }
  get center() {
    return this._center;
  }

  set radius(val) {
    this._radius = val;
  }
  get radius() {
    return this._radius;
  }

  containsPoint(point) {
    vec3.subtract(tmp_vec3_a, point, this._center);
    let lenSq = vec3.squaredLength(tmp_vec3_a);
    let r = this._radius;
    return lenSq < r * r;
  }

  intersectsBoundingSphere(sphere) {
    vec3.subtract(tmp_vec3_a, sphere._center, this._center);
    let totalRadius = sphere._radius + this._radius;

    if (vec3.squaredLength(tmp_vec3_a) <= totalRadius * totalRadius) {
      return true;
    }

    return false;
  }

  intersectsRay(ray, point) {
    vec3.copy(tmp_vec3_a. ray.origin);
    vec3.subtract(tmp_vec3_a, tmp_vec3_a, this._center);
    vec3.copy(tmp_vec3_b, ray.direction);
    vec3.normalize(tmp_vec3_b);
    let b = vec3.dot(tmp_vec3_a, tmp_vec3_b);
    let c = vec3.dot(tmp_vec3_a, tmp_vec3_a) - this._radius * this._radius;

    // exit if ray's origin outside of sphere (c > 0) and ray pointing away from s (b > 0)
    if (c > 0 && b > 0)
      return null;

    var discr = b * b - c;
    // a negative discriminant corresponds to ray missing sphere
    if (discr < 0)
      return false;

    // ray intersects sphere, compute smallest t value of intersection
    var t = Math.abs(-b - Math.sqrt(discr));

    // if t is negative, ray started inside sphere so clamp t to zero
    if (point) {
      vec3.copy(point, ray.direction);
      vec3.scale(point, t);
      vec3.add(point, point, ray.origin);
    }

    return true;
  }

  // todo: add aabb intersection if it is needed
}
