'use strict';

(() => {
  const { vec3, mat4 } = window.vmath;
  const renderer = window.renderer;

  let _camPos = vec3.create();
  let _camFwd = vec3.create();
  let _v3_tmp1 = vec3.create();

  let _a16_view = new Float32Array(16);
  let _a16_proj = new Float32Array(16);
  let _a16_viewProj = new Float32Array(16);

  class SimpleRenderer extends renderer.Base {
    constructor(device, opts) {
      super(device, opts);

      this._stage2fn[renderer.STAGE_OPAQUE] = this._opaqueStage.bind(this);
      this._stage2fn[renderer.STAGE_TRANSPARENT] = this._transparentStage.bind(this);
    }

    render(camera, scene) {
      this._reset();
      camera.updateMatrix();

      this._render(camera, scene, [
        renderer.STAGE_OPAQUE,
        renderer.STAGE_TRANSPARENT,
      ]);
    }

    _opaqueStage(camera, items) {
      // update uniforms
      this._device.setUniform('view', mat4.array(_a16_view, camera._view));
      this._device.setUniform('proj', mat4.array(_a16_proj, camera._proj));
      this._device.setUniform('viewProj', mat4.array(_a16_viewProj, camera._viewProj));

      // sort items
      items.sort((a, b) => {
        if (a.technique._layer !== b.technique._layer) {
          return a.technique._layer - b.technique._layer;
        }

        return a.technique.sortID() - b.technique.sortID();
      });

      // draw it
      for (let i = 0; i < items.length; ++i) {
        let item = items.data[i];
        this._draw(item);
      }
    }

    _transparentStage(camera, items) {
      // update uniforms
      this._device.setUniform('view', mat4.array(_a16_view, camera._view));
      this._device.setUniform('proj', mat4.array(_a16_proj, camera._proj));
      this._device.setUniform('viewProj', mat4.array(_a16_viewProj, camera._viewProj));

      // calculate zdist
      camera._node.getWorldPos(_camPos);
      vec3.set(_camFwd, -camera._view.m02, -camera._view.m06, -camera._view.m10);

      for (let i = 0; i < items.length; ++i) {
        let item = items.data[i];

        // TODO: we should use mesh center instead!
        item.node.getWorldPos(_v3_tmp1);

        vec3.sub(_v3_tmp1, _v3_tmp1, _camPos);
        item.zdist = vec3.dot(_v3_tmp1, _camFwd);
      }

      // sort items
      items.sort((a, b) => {
        if (a.technique._layer !== b.technique._layer) {
          return a.technique._layer - b.technique._layer;
        }

        return b.zdist - a.zdist;
      });

      // draw it
      for (let i = 0; i < items.length; ++i) {
        let item = items.data[i];
        this._draw(item);
      }
    }
  }

  window.SimpleRenderer = SimpleRenderer;
})();