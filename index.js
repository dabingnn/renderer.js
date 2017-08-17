import enums from './lib/enums';
import { createMesh } from './lib/utils';

import Pass from './lib/renderer/pass';
import Technique from './lib/renderer/technique';
import Effect from './lib/renderer/effect';
import Mesh from './lib/renderer/mesh';

import Light from './lib/scene/light';
import Camera from './lib/scene/camera';
import Model from './lib/scene/model';
import Scene from './lib/scene/scene';

import Base from './lib/renderer/base';
import ProgramLib from './lib/program-lib/program-lib';

import Ray from './lib/shape/ray';
import Plane from './lib/shape/plane';
import Sphere from './lib/shape/sphere';
import Frustum from './lib/shape/frustum';

let renderer = {
  // functions
  createMesh,

  // classes
  Pass,
  Technique,
  Effect,
  Mesh,

  Light,
  Camera,
  Model,
  Scene,

  Base,
  ProgramLib,
  Ray,
  Plane,
  Sphere,
  Frustum,
};
Object.assign(renderer, enums);

export default renderer;