import gfx from 'gfx';
import Mesh from './resources/mesh';

/**
 * @param {gfx.Device} device
 * @param {Object} data
 */
export function createMesh(device, data) {
  if (!data.positions) {
    console.error('The data must have positions field');
    return null;
  }

  let verts = [];
  let vcount = data.positions.length / 3;

  for (let i = 0; i < vcount; ++i) {
    verts.push(data.positions[3 * i], data.positions[3 * i + 1], data.positions[3 * i + 2]);

    if (data.normals) {
      verts.push(data.normals[3 * i], data.normals[3 * i + 1], data.normals[3 * i + 2]);
    }

    if (data.uvs) {
      verts.push(data.uvs[2 * i], data.uvs[2 * i + 1]);
    }
  }

  let vfmt = [];
  vfmt.push({ name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 3 });
  if (data.normals) {
    vfmt.push({ name: gfx.ATTR_NORMAL, type: gfx.ATTR_TYPE_FLOAT32, num: 3 });
  }
  if (data.uvs) {
    vfmt.push({ name: gfx.ATTR_UV, type: gfx.ATTR_TYPE_FLOAT32, num: 2 });
  }

  let vb = new gfx.VertexBuffer(
    device,
    new gfx.VertexFormat(vfmt),
    gfx.USAGE_STATIC,
    new Float32Array(verts),
    vcount,
    false
  );

  let ib = null;
  if (data.indices) {
    ib = new gfx.IndexBuffer(
      device,
      gfx.INDEX_FMT_UINT16,
      gfx.USAGE_STATIC,
      new Uint16Array(data.indices),
      data.indices.length,
      false
    );
  }

  return new Mesh(vb, ib);
}