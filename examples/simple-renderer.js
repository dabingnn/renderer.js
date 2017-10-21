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

  renderer.addStage('opaque');
  renderer.addStage('transparent');

  class SimpleRenderer extends renderer.Base {
    constructor(device, opts) {
      super(device, opts);

      this._registerStage('opaque', this._opaqueStage.bind(this));
      this._registerStage('transparent', this._transparentStage.bind(this));
    }

    render(scene) {
      let canvas = this._device._gl.canvas;
      this._reset();

      for (let i = 0; i < scene._cameras.length; ++i) {
        let view = this._requestView();
        scene._cameras.data[i].extractView(view, canvas.width, canvas.height);
      }

      for (let i = 0; i < this._viewPools.length; ++i) {
        let view = this._viewPools.data[i];
        this._render(view, scene, [
          'opaque',
          'transparent'
        ]);
      }
    }

    _opaqueStage(view, items) {
      // update uniforms
      this._device.setUniform('view', mat4.array(_a16_view, view._matView));
      this._device.setUniform('proj', mat4.array(_a16_proj, view._matProj));
      this._device.setUniform('viewProj', mat4.array(_a16_viewProj, view._matViewProj));

      // sort items
      items.sort((a, b) => {
        return a.technique._layer - b.technique._layer;
      });

      // draw it
      for (let i = 0; i < items.length; ++i) {
        let item = items.data[i];
        this._draw(item);
      }
    }

    _transparentStage(view, items) {
      // update uniforms
      this._device.setUniform('view', mat4.array(_a16_view, view._matView));
      this._device.setUniform('proj', mat4.array(_a16_proj, view._matProj));
      this._device.setUniform('viewProj', mat4.array(_a16_viewProj, view._matViewProj));

      // calculate zdist
      view.getPosition(_camPos);
      view.getForward(_camFwd);

      for (let i = 0; i < items.length; ++i) {
        let item = items.data[i];
        item.node.getWorldPos(_v3_tmp1);

        vec3.sub(_v3_tmp1, _v3_tmp1, _camPos);
        item.key = vec3.dot(_v3_tmp1, _camFwd); // zdist
      }

      // sort items
      items.sort((a, b) => {
        if (a.technique._layer !== b.technique._layer) {
          return a.technique._layer - b.technique._layer;
        }

        return b.key - a.key;
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