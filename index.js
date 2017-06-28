import create from './lib/init';
import { enums } from './lib/enums';
import { createMesh } from './lib/utils';

import Pass from './lib/resources/pass';
import Technique from './lib/resources/technique';
import Material from './lib/resources/material';
import Mesh from './lib/resources/mesh';

import Light from './lib/scene/light';
import Camera from './lib/scene/camera';
import Model from './lib/scene/model';
import Scene from './lib/scene/scene';

import Renderer from './lib/renderer/base';
import ForwardRenderer from './lib/renderer/forward';

let renderer = {
  // functions
  create,
  createMesh,

  // classes
  Pass,
  Technique,
  Material,
  Mesh,

  Light,
  Camera,
  Model,
  Scene,

  Renderer,
  ForwardRenderer,
};
Object.assign(renderer, enums);

export default renderer;