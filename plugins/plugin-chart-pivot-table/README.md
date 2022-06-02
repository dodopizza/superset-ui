## Pivot Table v2 for Superset

> `DODOIS: FRIENDLY`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

After the development is finished, do not forget to change it back

```js
import PivotTableChartPlugin from '@dodopizza/ssp-plugin-chart-pivot-table';

new PivotTableChartPlugin().configure({ key: 'pivot-table-v2' }).register();
```

Then use it via `SuperChart`

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

#### Reference

> This plugin used to be `@superset-ui/plugin-chart-pivot-table` [`0.18.0`]
