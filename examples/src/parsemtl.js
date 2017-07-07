(() => {
  const {
    canvas,
    device,
    resl,
    gfx,
    renderer,
    primitives,
    sgraph,
  } = window;
  const { vec3, color4, quat, randomRange } = window.vmath;

  const orbit = window.orbit;
  let rsys = renderer.create(device);

  // create mesh
  let boxData = primitives.box(1, 1, 1, {
    widthSegments: 1,
    heightSegments: 1,
    lengthSegments: 1,
  });
  let meshBox = renderer.createMesh(device, boxData);

  // scene
  let scene = new renderer.Scene();

  function addModelstoScene(material) {
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
      model.addMesh(meshBox);

      model.addMaterial(material);
      model.setNode(node);

      scene.addModel(model);
    }
  }

  resl({
    manifest: {
      mtl: {
        type: 'text',
        src: './assets/mtl.json',
        parser: JSON.parse
      },
      image: {
        type: 'image',
        src: './assets/uv_checker_01.jpg'
      },
    },
    onDone(assets) {
      let image = assets.image;
      let texture = new gfx.Texture2D(device, {
        width: image.width,
        height: image.height,
        wrapS: gfx.WRAP_CLAMP,
        wrapT: gfx.WRAP_CLAMP,
        mipmap: true,
        images: [image]
      });
      let techniques = renderer.parseMaterial(device, assets.mtl);
      let material = new renderer.Material(
        techniques,
        {
          mainTexture: texture,
          color: color4.new(1.0, 1.0, 1.0, 0.6),
        }
      );
      addModelstoScene(material);
    }
  });

  // create grid
  let gridNode = new sgraph.Node('grid');
  let grid = window.createGrid(gridNode, 100, 100, 100);
  scene.addModel(grid);

  // camera
  let camera = new renderer.Camera();
  camera.setNode(orbit._node);

  let time = 0;

  // tick
  return function tick(dt) {
    time += dt;

    camera._rect.w = canvas.width;
    camera._rect.h = canvas.height;

    rsys.forward.render(camera, scene);
  };
})();