(() => {
  let canvas = window.canvas;
  let device = window.device;
  let gfx = window.gfx;
  let renderer = window.renderer;
  let primitives = window.primitives;
  let sgraph = window.sgraph;
  let { vec3, color4 } = window.vmath;

  // create mesh
  let boxData = primitives.box(1, 1, 1, {
    widthSegments: 10,
    heightSegments: 10,
    lengthSegments: 10,
  });
  let meshBox = renderer.createMesh(device, boxData);

  // create material
  let program = new gfx.Program(device, {
    vert: `
      precision highp float;
      attribute vec3 a_position;
      attribute vec3 a_normal;
      attribute vec2 a_uv;

      uniform mat4 model, view, proj;

      varying vec2 uv;

      void main () {
        vec4 pos = proj * view * model * vec4(a_position, 1);
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
  let technique = new renderer.Technique(
    renderer.STAGE_OPAQUE, [
      { name: 'mainTexture', type: renderer.PARAM_TEXTURE_2D, },
      { name: 'color', type: renderer.PARAM_COLOR4, },
    ], [
      pass
    ]
  );
  let material = new renderer.Material(
    [technique],
    {
      // mainTexture: ???,
      color: color4.new(1.0, 0.0, 0.0, 1.0),
    }
  );

  // modelA
  let nodeA = new sgraph.Node('nodeA');
  nodeA.lpos = vec3.new(0, 0.5, 0);

  let modelA = new renderer.Model();
  modelA.addMesh(meshBox);
  modelA.addMaterial(material);
  modelA.setNode(nodeA);

  // camera
  let nodeCam = new sgraph.Node('nodeCam');
  nodeCam.lpos = vec3.new(10, 10, 10);
  nodeCam.lookAt(vec3.new(0,0,0));

  let cameraA = new renderer.Camera();
  cameraA._rect.w = canvas.width;
  cameraA._rect.h = canvas.height;
  cameraA.setNode(nodeCam);

  //
  let scene = new renderer.Scene();
  scene.addModel(modelA);

  let time = 0;
  let forward = new renderer.ForwardRenderer(device);

  // tick
  return function tick(dt) {
    time += dt;

    forward.render(cameraA, scene);
  };
})();