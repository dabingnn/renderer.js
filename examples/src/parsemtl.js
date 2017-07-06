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

  // create material
  let program = new gfx.Program(device, {
    vert: `
      precision highp float;
      attribute vec3 a_position;
      attribute vec3 a_normal;
      attribute vec2 a_uv;

      uniform mat4 model, viewProj;

      varying vec2 uv;

      void main () {
        vec4 pos = viewProj * model * vec4(a_position, 1);
        uv = a_uv;

        gl_Position = pos;
      }
    `,
    frag: `
      precision highp float;
      uniform sampler2D mainTexture;
      uniform vec4 color;

      varying vec2 uv;

      void main () {
        gl_FragColor = texture2D(mainTexture, uv) * color;

        if (!gl_FrontFacing) {
          gl_FragColor *= 0.4;
        }
      }
    `,
  });
  program.link();

  let pass = new renderer.Pass(program);
  // pass.setDepth(true, true);
  pass.setDepth(true, false);
  pass.setBlend(
    gfx.BLEND_FUNC_ADD,
    gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA,
    gfx.BLEND_FUNC_ADD,
    gfx.BLEND_ONE, gfx.BLEND_ONE
  );
  let technique = new renderer.Technique(
    renderer.STAGE_TRANSPARENT,
    [
      { name: 'mainTexture', type: renderer.PARAM_TEXTURE_2D },
      { name: 'color', type: renderer.PARAM_COLOR4, },
    ], [
      pass
    ]
  );

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