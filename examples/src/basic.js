(() => {
  const {
    device,
    resl,
    gfx,
    renderer,
    primitives,
    sgraph,
  } = window;
  const { vec3, color4, quat, randomRange } = window.vmath;

  const orbit = window.orbit;
  const simpleRenderer = window.simpleRenderer;

  // create IA
  let boxData = primitives.box(1, 1, 1, {
    widthSegments: 1,
    heightSegments: 1,
    lengthSegments: 1,
  });
  let boxIA = renderer.createIA(device, boxData);

  // create effect
  let pass = new renderer.Pass('simple');
  // pass.setDepth(true, true);
  pass.setCullMode(gfx.CULL_FRONT);
  pass.setDepth(true, false);
  pass.setBlend(
    gfx.BLEND_FUNC_ADD,
    gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA,
    gfx.BLEND_FUNC_ADD,
    gfx.BLEND_ONE, gfx.BLEND_ONE
  );

  let pass1 = new renderer.Pass('simple');
  pass1.setDepth(true, false);
  pass1.setBlend(
    gfx.BLEND_FUNC_ADD,
    gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA,
    gfx.BLEND_FUNC_ADD,
    gfx.BLEND_ONE, gfx.BLEND_ONE
  );

  let technique = new renderer.Technique(
    ['transparent'],
    [
      { name: 'texture', type: renderer.PARAM_TEXTURE_2D },
      { name: 'color', type: renderer.PARAM_COLOR4, },
    ], [
      pass,
      pass1
    ]
  );
  let effect = new renderer.Effect(
    [technique],
    {
      color: color4.new(1.0, 1.0, 1.0, 0.6),
    },
    [
      { name: 'useTexture', value: true },
      { name: 'useColor', value: true },
    ]
  );

  resl({
    manifest: {
      image: {
        type: 'image',
        src: './assets/uv_checker_02.jpg'
      },
    },
    onDone (assets) {
      let image = assets.image;
      let texture = new gfx.Texture2D(device, {
        width : image.width,
        height: image.height,
        wrapS: gfx.WRAP_CLAMP,
        wrapT: gfx.WRAP_CLAMP,
        mipmap: true,
        images : [image]
      });
      effect.setValue('texture', texture);
    }
  });

  // scene
  let scene = new renderer.Scene();

  // models
  for (let i = 0; i < 100; ++i) {
    let node = new sgraph.Node('node');
    vec3.set(node.lpos,
      randomRange(-50, 50),
      randomRange(-10, 10),
      randomRange(-50, 50)
    );
    quat.fromEuler(node.lrot,
      randomRange(0, 360),
      randomRange(0, 360),
      randomRange(0, 360)
    );
    vec3.set(node.lscale,
      randomRange(1, 5),
      randomRange(1, 5),
      randomRange(1, 5)
    );

    let model = new renderer.Model();
    model.addInputAssembler(boxIA);

    model.addEffect(effect);
    model.setNode(node);

    scene.addModel(model);
  }

  // create grid
  let gridNode = new sgraph.Node('grid');
  let grid = window.createGrid(gridNode, 100, 100, 100 );
  scene.addModel(grid);

  // camera
  let camera = new renderer.Camera();
  camera.setNode(orbit._node);
  camera.setStages([
    'opaque',
    'transparent'
  ]);

  scene.addCamera(camera);

  let time = 0;

  // tick
  return function tick(dt) {
    time += dt;
    simpleRenderer.render(scene);
  };
})();