import enums from './lib/enums';
import { createIA } from './lib/utils';
import config from './lib/config';

import Pass from './lib/renderer/pass';
import Technique from './lib/renderer/technique';
import Effect from './lib/renderer/effect';
import InputAssembler from './lib/renderer/input-assembler';

import Light from './lib/scene/light';
import Camera from './lib/scene/camera';
import Model from './lib/scene/model';
import Scene from './lib/scene/scene';

import Base from './lib/renderer/base';
import ProgramLib from './lib/program-lib/program-lib';

let renderer = {
  // config
  addStage: config.addStage,

  // utils
  createIA,

  // classes
  Pass,
  Technique,
  Effect,
  InputAssembler,

  Light,
  Camera,
  Model,
  Scene,

  Base,
  ProgramLib,
};
Object.assign(renderer, enums);

export default renderer;