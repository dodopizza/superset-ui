## Time Table for Superset

> `DODOIS: NOT FRIENDLY`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import TimeTableChartPlugin from '@dodopizza/ssp-legacy-plugin-chart-time-table';

new TimeTableChartPlugin().configure({ key: 'time-table' }).register();
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="time-table"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

#### Reference

> This plugin used to be `@superset-ui/legacy-plugin-chart-time-table` [`0.18.0`]
