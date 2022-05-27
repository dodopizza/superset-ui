## NVD3 vizualizations for Superset

> AreaChartPlugin - `DODOIS: XXXXXX`

> BarChartPlugin - `DODOIS: XXXXXX`

> BubbleChartPlugin - `DODOIS: XXXXXX`

> BulletChartPlugin - `DODOIS: XXXXXX`

> CompareChartPlugin - `DODOIS: XXXXXX`

> DistBarChartPlugin - `DODOIS: XXXXXX`

> DualLineChartPlugin - `DODOIS: XXXXXX`

> LineChartPlugin - `DODOIS: XXXXXX`

> LineMultiChartPlugin - `DODOIS: XXXXXX`

> TimePivotChartPlugin - `DODOIS: XXXXXX`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import {
  AreaChartPlugin,
  BarChartPlugin,
  BubbleChartPlugin,
  BulletChartPlugin,
  CompareChartPlugin,
  DistBarChartPlugin,
  DualLineChartPlugin,
  LineChartPlugin,
  LineMultiChartPlugin,
  TimePivotChartPlugin,
} from '@superset-ui/ssp-legacy-preset-chart-nvd3';

new AreaChartPlugin().configure({ key: 'area' }).register();
new LineChartPlugin().configure({ key: 'line' }).register();
...
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="line"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

#### Reference

> This plugin used to be `@superset-ui/legacy-preset-chart-nvd3` [`0.18.0`]
