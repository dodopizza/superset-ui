## Histogram for Superset

> `DODOIS: NOT FRIENDLY`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import HistogramChartPlugin from '@dodopizza/ssp-legacy-plugin-chart-histogram';

new HistogramChartPlugin().configure({ key: 'histogram' }).register();
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="histogram"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

#### Reference

> This plugin used to be `@superset-ui/legacy-plugin-chart-histogram` [`0.18.0`]
