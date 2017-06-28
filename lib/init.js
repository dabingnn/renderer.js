import initBuiltin from './builtin/index';

import ForwardRenderer from './renderer/forward';
// import DeferredRenderer from './lib/deferred';

/**
 * @param {Device} device
 * @param {Object} opts
 */
export default function (device) {
  let builtin = initBuiltin(device);
  let forward = new ForwardRenderer(device, builtin);

  return {
    builtin,
    forward,
  };
}