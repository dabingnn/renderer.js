import { enums } from './lib/enums';
import { createMesh, parseMaterial } from './lib/utils';

import Pass from './lib/resources/pass';
import Technique from './lib/resources/technique';
import Material from './lib/resources/material';
import Mesh from './lib/resources/mesh';

import Light from './lib/scene/light';
import Camera from './lib/scene/camera';
import Model from './lib/scene/model';
import Scene from './lib/scene/scene';

import Base from './lib/renderer/base';
import ProgramLib from './lib/program-lib/program-lib';

let renderer = {
  // functions
  createMesh,
  parseMaterial,

  // classes
  Pass,
  Technique,
  Material,
  Mesh,

  Light,
  Camera,
  Model,
  Scene,

  Base,
  ProgramLib,
};
Object.assign(renderer, enums);

export default renderer;