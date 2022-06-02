## Parallel Coordinates for Superset

> `DODOIS: NOT FRIENDLY`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import ParallelCoordinatesChartPlugin from '@dodopizza/ssp-legacy-plugin-chart-parallel-coordinates';

new ParallelCoordinatesChartPlugin().configure({ key: 'parallel-coordinates' }).register();
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="parallel-coordinates"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

#### Reference

> This plugin used to be `@superset-ui/legacy-plugin-chart-parallel-coordinates` [`0.18.0`]
