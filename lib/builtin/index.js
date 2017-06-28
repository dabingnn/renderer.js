import initTextures from './textures';

export default function (device) {
  let builtin = {};
  Object.assign(builtin, initTextures(device));

  return builtin;
}