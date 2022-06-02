## Echarts for Superset

> EchartsBarChartPlugin - `DODOIS: FRIENDLY`

> EchartsPieChartPlugin - `DODOIS: FRIENDLY`

> EchartsBoxPlotChartPlugin - `DODOIS: UNKNOWN`

> EchartsAreaChartPlugin - `DODOIS: FRIENDLY`

> EchartsTimeseriesChartPlugin - `DODOIS: FRIENDLY`

> EchartsTimeseriesBarChartPlugin - `DODOIS: FRIENDLY`

> EchartsTimeseriesLineChartPlugin - `DODOIS: FRIENDLY`

> EchartsTimeseriesScatterChartPlugin - `DODOIS: FRIENDLY`

> EchartsTimeseriesSmoothLineChartPlugin - `DODOIS: FRIENDLY`

> EchartsTimeseriesStepChartPlugin - `DODOIS: FRIENDLY`

> EchartsGraphChartPlugin - `DODOIS: FRIENDLY`

> EchartsGaugeChartPlugin - `DODOIS: FRIENDLY`

> EchartsRadarChartPlugin - `DODOIS: FRIENDLY`

> EchartsFunnelChartPlugin - `DODOIS: FRIENDLY`

> EchartsTreemapChartPlugin - `DODOIS: FRIENDLY`

> EchartsMixedTimeseriesChartPlugin - `DODOIS: FRIENDLY`

> EchartsTreeChartPlugin - `DODOIS: UNKNOWN`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import {
  EchartsBarChartPlugin,
  EchartsPieChartPlugin,
  EchartsBoxPlotChartPlugin,
  EchartsAreaChartPlugin,
  EchartsTimeseriesChartPlugin,
  EchartsTimeseriesBarChartPlugin,
  EchartsTimeseriesLineChartPlugin,
  EchartsTimeseriesScatterChartPlugin,
  EchartsTimeseriesSmoothLineChartPlugin,
  EchartsTimeseriesStepChartPlugin,
  EchartsGraphChartPlugin,
  EchartsGaugeChartPlugin,
  EchartsRadarChartPlugin,
  EchartsFunnelChartPlugin,
  EchartsTreemapChartPlugin,
  EchartsMixedTimeseriesChartPlugin,
  EchartsTreeChartPlugin,
} from '@superset-ui/ssp-plugin-chart-echarts';

new EchartsBarChartPlugin().configure({ key: 'echarts_bar' }),
new EchartsPieChartPlugin().configure({ key: 'pie' }),
new EchartsBoxPlotChartPlugin().configure({ key: 'box_plot' }),
new EchartsAreaChartPlugin().configure({ key: 'echarts_area' }),
new EchartsTimeseriesChartPlugin().configure({ key: 'echarts_timeseries' }),
new EchartsTimeseriesBarChartPlugin().configure({ key: 'echarts_timeseries_bar' }),
new EchartsTimeseriesLineChartPlugin().configure({ key: 'echarts_timeseries_line' }),
new EchartsTimeseriesScatterChartPlugin().configure({ key: 'echarts_timeseries_scatter' }),
new EchartsTimeseriesSmoothLineChartPlugin().configure({ key: 'echarts_timeseries_smooth' }),
new EchartsTimeseriesStepChartPlugin().configure({ key: 'echarts_timeseries_step' }),
new EchartsGraphChartPlugin().configure({ key: 'graph_chart' }),
new EchartsGaugeChartPlugin().configure({ key: 'gauge_chart' }),
new EchartsRadarChartPlugin().configure({ key: 'radar' }),
new EchartsFunnelChartPlugin().configure({ key: 'funnel' }),
new EchartsTreemapChartPlugin().configure({ key: 'treemap_v2' }),
new EchartsMixedTimeseriesChartPlugin().configure({ key: 'mixed_timeseries' }),
new EchartsTreeChartPlugin().configure({ key: 'tree_chart' }),
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="echarts-ts"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

#### Reference

> This plugin used to be `@superset-ui/plugin-chart-echarts` [`0.18.0`]
