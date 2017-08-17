let vmath = require('vmath');
let mat4 = vmath.mat4;

let tmp_mat4 = mat4.create();
let tmp_array16 = new Float32Array(16);

export default class Frustum {
  constructor() {
    this._projectionMatrix = mat4.create();
    this._viewMatrix = mat4.create();
    mat4.identity(this._viewMatrix);
    mat4.perspective(this._projectionMatrix, 90, 16 / 9, 0.1, 1000);

    this._planes = [];
    for (let i = 0; i < 6; i++)
      this._planes[i] = [];

    this.update(this._projectionMatrix, this._viewMatrix);
  }

  update(projectionMatrix, viewMatrix) {
    mat4.multiply(tmp_mat4, projectionMatrix, viewMatrix);
    mat4.array(tmp_array16, tmp_mat4);

    // Extract the numbers for the RIGHT plane
    this._planes[0][0] = tmp_array16[3] - tmp_array16[0];
    this._planes[0][1] = tmp_array16[7] - tmp_array16[4];
    this._planes[0][2] = tmp_array16[11] - tmp_array16[8];
    this._planes[0][3] = tmp_array16[15] - tmp_array16[12];
    // Normalize the result
    let t = Math.sqrt(this._planes[0][0] * this._planes[0][0] + this._planes[0][1] * this._planes[0][1] + this._planes[0][2] * this._planes[0][2]);
    this._planes[0][0] /= t;
    this._planes[0][1] /= t;
    this._planes[0][2] /= t;
    this._planes[0][3] /= t;

    // Extract the numbers for the LEFT plane
    this._planes[1][0] = tmp_array16[3] + tmp_array16[0];
    this._planes[1][1] = tmp_array16[7] + tmp_array16[4];
    this._planes[1][2] = tmp_array16[11] + tmp_array16[8];
    this._planes[1][3] = tmp_array16[15] + tmp_array16[12];
    // Normalize the result
    t = Math.sqrt(this._planes[1][0] * this._planes[1][0] + this._planes[1][1] * this._planes[1][1] + this._planes[1][2] * this._planes[1][2]);
    this._planes[1][0] /= t;
    this._planes[1][1] /= t;
    this._planes[1][2] /= t;
    this._planes[1][3] /= t;

    // Extract the BOTTOM plane
    this._planes[2][0] = tmp_array16[3] + tmp_array16[1];
    this._planes[2][1] = tmp_array16[7] + tmp_array16[5];
    this._planes[2][2] = tmp_array16[11] + tmp_array16[9];
    this._planes[2][3] = tmp_array16[15] + tmp_array16[13];
    // Normalize the result
    t = Math.sqrt(this._planes[2][0] * this._planes[2][0] + this._planes[2][1] * this._planes[2][1] + this._planes[2][2] * this._planes[2][2]);
    this._planes[2][0] /= t;
    this._planes[2][1] /= t;
    this._planes[2][2] /= t;
    this._planes[2][3] /= t;

    // Extract the TOP plane
    this._planes[3][0] = tmp_array16[3] - tmp_array16[1];
    this._planes[3][1] = tmp_array16[7] - tmp_array16[5];
    this._planes[3][2] = tmp_array16[11] - tmp_array16[9];
    this._planes[3][3] = tmp_array16[15] - tmp_array16[13];
    // Normalize the result
    t = Math.sqrt(this._planes[3][0] * this._planes[3][0] + this._planes[3][1] * this._planes[3][1] + this._planes[3][2] * this._planes[3][2]);
    this._planes[3][0] /= t;
    this._planes[3][1] /= t;
    this._planes[3][2] /= t;
    this._planes[3][3] /= t;

    // Extract the FAR plane
    this._planes[4][0] = tmp_array16[3] - tmp_array16[2];
    this._planes[4][1] = tmp_array16[7] - tmp_array16[6];
    this._planes[4][2] = tmp_array16[11] - tmp_array16[10];
    this._planes[4][3] = tmp_array16[15] - tmp_array16[14];
    // Normalize the result
    t = Math.sqrt(this._planes[4][0] * this._planes[4][0] + this._planes[4][1] * this._planes[4][1] + this._planes[4][2] * this._planes[4][2]);
    this._planes[4][0] /= t;
    this._planes[4][1] /= t;
    this._planes[4][2] /= t;
    this._planes[4][3] /= t;

    // Extract the NEAR plane
    this._planes[5][0] = tmp_array16[3] + tmp_array16[2];
    this._planes[5][1] = tmp_array16[7] + tmp_array16[6];
    this._planes[5][2] = tmp_array16[11] + tmp_array16[10];
    this._planes[5][3] = tmp_array16[15] + tmp_array16[14];
    // Normalize the result
    t = Math.sqrt(this._planes[5][0] * this._planes[5][0] + this._planes[5][1] * this._planes[5][1] + this._planes[5][2] * this._planes[5][2]);
    this._planes[5][0] /= t;
    this._planes[5][1] /= t;
    this._planes[5][2] /= t;
    this._planes[5][3] /= t;
  }

  containsPoint(point) {
    for (let p = 0; p < 6; p++) {
      if (this._planes[p][0] * point.x +
        this._planes[p][1] * point.y +
        this._planes[p][2] * point.z +
        this._planes[p][3] <= 0)
        return false;
    }
    return true;
  }

  containsSphere(sphere) {
    let c = 0;
    let d;
    let p;

    let sr = sphere.radius;
    let sc = sphere.center;
    let scx = sc.x;
    let scy = sc.y;
    let scz = sc.z;
    let planes = this._planes;
    let plane;

    for (p = 0; p < 6; p++) {
      plane = planes[p];
      d = plane[0] * scx + plane[1] * scy + plane[2] * scz + plane[3];
      if (d <= -sr)
        return 0;
      if (d > sr)
        c++;
    }

    return (c === 6) ? 2 : 1;
  }
}