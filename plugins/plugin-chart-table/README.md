## Table chart for Superset

> `DODOIS: FRIENDLY`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import TableChartPlugin from '@dodopizza/ssp-plugin-chart-table';

new TableChartPlugin().configure({ key: 'table' }).register();
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="table"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

#### Reference

> This plugin used to be `@superset-ui/plugin-chart-table` [`0.18.0`]
