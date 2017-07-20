## Technique

```javascript
  technique = {
    // stages
    stages: STAGE_OPAQUE|STAGE_SHADOW_CAST,

    // parameters
    [
      name: 'diffuse', type: PARAM_TEXTURE_2D, stage: 0,
      name: 'specular', type: PARAM_TEXTURE_2D, stage: 1,
    ],

    // passes
    [
      pass_0: {
        program: 'simple',
        render-states: { ... }
      },

      pass_1: {
        program: 'simple',
        render-states: { ... }
      },
    ]
  }
```