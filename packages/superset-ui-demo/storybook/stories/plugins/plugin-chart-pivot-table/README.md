## @superset-ui/plugin-chart-pivot-table

This plugin provides Pivot Table for Superset.

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import PivotTableChartPlugin from '@kazakoff/plugin-chart-pivot-table';

new PivotTableChartPlugin().configure({ key: 'pivot-table-v2' }).register();
```

```js
<SuperChart
  chartType="pivot-table-v2"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```
