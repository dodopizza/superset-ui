## Treemap for Superset

> `DODOIS: NOT FRIENDLY`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import TreemapChartPlugin from '@dodopizza/ssp-legacy-plugin-chart-treemap';

new TreemapChartPlugin().configure({ key: 'treemap' }).register();
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="treemap"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

#### Reference

> This plugin used to be `@superset-ui/legacy-plugin-chart-treemap` [`0.18.0`]
