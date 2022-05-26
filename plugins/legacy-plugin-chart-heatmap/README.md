## Heatmap for Superset

> `DODOIS: NOT FRIENDLY`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import HeatmapChartPlugin from '@dodopizza/ssp-legacy-plugin-chart-heatmap';

new HeatmapChartPlugin().configure({ key: 'heatmap' }).register();
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="heatmap"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

#### Reference

> This plugin used to be `@superset-ui/legacy-plugin-chart-heatmap` [`0.18.0`]
