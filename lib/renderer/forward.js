import { FramePool, RecyclePool } from 'memop';
import { vec3 } from 'vmath';
import { enums } from '../enums';

let _camPos = vec3.create();
let _camFwd = vec3.create();
let _itemPos = vec3.create();
let _v3_tmp1 = vec3.create();

export default class ForwardRenderer {
  constructor(device) {
    this._device = device;
    this._stage2fn = {
      [enums.STAGE_OPAQUE]: this._opaqueStage,
      [enums.STAGE_TRANSPARENT]: this._transparentStage,
    };

    this._drawItemsPool = new FramePool(() => {
      return new RecyclePool(() => {
        return {
          node: null,
          mesh: null,
          material: null,
        };
      }, 100);
    }, 16);

    this._stageItemsPool = new FramePool(() => {
      return new RecyclePool(() => {
        return {
          node: null,
          mesh: null,
          material: null,
          technique: null,
          zdist: -1,
        };
      }, 100);
    }, 16);
  }

  render(camera, scene) {
    this._reset();
    camera.updateMatrix();

    this._render(camera, scene, [
      enums.STAGE_OPAQUE,
      enums.STAGE_TRANSPARENT,
    ]);
  }

  _reset() {
    this._drawItemPools.reset();
    this._stageItemsPool.reset();
  }

  _render(camera, scene, stages) {
    // get all draw items
    let allDrawItems = this._drawItemPools.alloc();
    allDrawItems.reset();

    for (let i = 0; i < scene._models.length; ++i) {
      let model = scene._models[i];

      for (let m = 0; m < model.meshCount; ++m) {
        let drawItem = allDrawItems.add();
        model.getDrawItem(drawItem, m);
      }
    }

    // TODO: update frustum
    // TODO: visbility test
    // frustum.update(camera._viewProj);

    // dispatch draw items to different stage
    let stageInfos = []; // TODO: cache it ???

    for (let i = 0; i < stages.length; ++i) {
      let stage = stages[i];
      let stageItems = this._stageItemsPool.alloc();
      stageItems.reset();

      for (let i = 0; i < allDrawItems.length; ++i) {
        let drawItem = allDrawItems.data[i];
        let tech = drawItem.material.getTechnique(stage);

        if (tech) {
          let stageItem = stageItems.add();
          stageItem.node = drawItem.node;
          stageItem.mesh = drawItem.mesh;
          stageItem.material = drawItem.material;
          stageItem.technique = tech;
          stageItem.zdist = -1;
        }
      }

      stageInfos.push({
        stage: stage,
        items: stageItems,
      });
    }

    // render stages
    for (let i = 0; i < stageInfos.length; ++i) {
      let info = stageInfos[i];
      let fn = this._stage2fn[info.stage];

      fn(camera, info.stageItems);
    }
  }

  _opaqueStage(camera, items) {
    // update uniforms
    this._device.setUniform('view', camera._view);
    this._device.setUniform('proj', camera._proj);
    this._device.setUniform('viewProj', camera._viewProj);

    // sort items
    items.sort((a, b) => {
      a.technique.sortID() - b.technique.sortID();
    });

    // draw it
    for (let i = 0; i < items.length; ++i) {
      let item = items[i];
      this._draw(item);
    }
  }

  _transparentStage(camera, items) {
    // update uniforms
    this._device.setUniform('view', camera._view);
    this._device.setUniform('proj', camera._proj);
    this._device.setUniform('viewProj', camera._viewProj);

    // calculate zdist
    camera._node.getWorldPos(_camPos);
    vec3.set(_camFwd, camera._view.m02, camera._view.m12, camera._view.m22 );

    for (let i = 0; i < items.length; ++i) {
      let item = items.data[i];

      // TODO: we should use mesh center instead!
      item.node.getWorldPos(_itemPos);

      vec3.sub(_v3_tmp1, _itemPos, _camPos);
      item.zdist = vec3.dot(_v3_tmp1, _camFwd);
    }

    // sort items
    items.sort((a, b) => {
      return b.zdist - a.zdist;
    });

    // draw it
    for (let i = 0; i < items.length; ++i) {
      let item = items[i];
      this._draw(item);
    }
  }

  _draw(item) {
    const device = this._device;
    const mesh = item.mesh;
    const material = item.material;
    const technique = item.technique;
    const passes = technique.passes;
    let count = mesh._vertexBuffer.count;

    // vertex buffer
    device.setVertexBuffer(0, mesh._vertexBuffer);

    // index buffer
    if (mesh._indexBuffer) {
      device.setIndexBuffer(0, mesh._indexBuffer);
      count = mesh._indexBuffer.count;
    }

    // set uniforms
    for (let i = 0; i < technique._properties.length; ++i) {
      let prop = technique._properties[i];
      let param = material.getParameter(prop.name);
      if (!param) {
        console.warn(`Can not find material parameter ${prop.name}`);
        continue;
      }

      if (
        prop.type === enums.PARAM_SAMPLER_2D ||
        prop.type === enums.PARAM_SAMPLER_CUBE
      ) {
        device.setTexture(prop.name, param, prop.stage);
      } else {
        // TODO:
        // device.setUniform(prop.name, param);
      }
    }

    // primitive type
    device.setPrimitiveType(mesh._primitiveType);

    // for each pass
    for (let i = 0; i < passes.length; ++i) {
      let pass = passes[i];

      // set program
      device.setProgram(pass._program);

      // cull mode
      device.setCullMode(pass._cullMode);

      // blend
      if (pass._blend) {
        device.enableBlend();
        device.setBlendFuncSep(
          pass._blendSrc,
          pass._blendDst,
          pass._blendSrcAlpha,
          pass._blendDstAlpha
        );
        device.setBlendEqSep(
          pass._blendEq,
          pass._blendAlphaEq
        );
        device.setBlendColor32(pass._blendColor);
      }

      // depth test & write
      if (pass._depthTest) {
        device.enableDepthTest();
        device.setDepthFunc(pass._depthFunc);
      }
      if (pass._depthWrite) {
        device.enableDepthWrite();
      }

      // stencil
      if (pass._stencilTest) {
        device.enableStencilTest();

        // front
        device.setStencilFuncFront(
          pass._stencilFuncFront,
          pass._stencilRefFront,
          pass._stencilMaskFront
        );
        device.setStencilOpFront(
          pass._stencilFailOpFront,
          pass._stencilZFailOpFront,
          pass._stencilZPassOpFront,
          pass._stencilWriteMaskFront
        );

        // back
        device.setStencilFuncBack(
          pass._stencilFuncBack,
          pass._stencilRefBack,
          pass._stencilMaskBack
        );
        device.setStencilOpBack(
          pass._stencilFailOpBack,
          pass._stencilZFailOpBack,
          pass._stencilZPassOpBack,
          pass._stencilWriteMaskBack
        );
      }

      // draw pass
      device.draw(0, count);
    }
  }
}