## Technique

```
  technique = {
    stages: STAGE_OPAQUE|STAGE_SHADOW_CAST,
    [
      name: 'diffuse', type: PARAM_TEXTURE_2D, stage: 0,
      name: 'specular', type: PARAM_TEXTURE_2D, stage: 1,
    ],
    [
      pass_0: {
        program: program_0,
        render-states: { ... }
      },

      pass_1: {
        program: program_1,
        render-states: { ... }
      },
    ]
  }
```