## Big Number for Superset

> Big Number: `DODOIS: NOT STABLE` Big Number with Trendline: `DODOIS: NOT STABLE`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import {
  BigNumberChartPlugin,
  BigNumberTotalChartPlugin,
} from '@dodopizza/ssp-legacy-preset-chart-big-number';

new BigNumberChartPlugin().configure({ key: 'big_number' }), // (Big Number with Trendline)
new BigNumberTotalChartPlugin().configure({ key: 'big_number_total' }), // Big Number
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="big-number"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

#### Reference

> This plugin used to be `@superset-ui/legacy-preset-chart-big-number` [`0.18.0`]
