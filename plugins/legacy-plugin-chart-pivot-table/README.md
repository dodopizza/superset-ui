## Pivot Table for Superset

> `DODOIS: NOT FRIENDLY`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import PivottableChartPlugin from '@dodopizza/ssp-legacy-plugin-chart-pivot-table';

new PivottableChartPlugin().configure({ key: 'pivot-table' }).register();
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="pivot-table"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

#### Reference

> This plugin used to be `@superset-ui/legacy-plugin-chart-pivot-table` [`0.18.0`]
