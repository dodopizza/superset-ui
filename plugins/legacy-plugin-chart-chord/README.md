## Chord Diagram for Superset

> `DODOIS: NOT FRIENDLY`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import ChordChartPlugin from '@dodopizza/ssp-legacy-plugin-chart-chord';

new ChordChartPlugin().configure({ key: 'chord' }).register();
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="chord"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

#### Reference

> This plugin used to be `@superset-ui/legacy-plugin-chart-chord` [`0.18.0`]
