## Event Flow for Superset

> `DODOIS: UNKNOWN`

### Usage

Configure `key`, which can be any `string`, and register the plugin. This `key` will be used to
lookup this chart throughout the app.

```js
import EventFlowChartPlugin from '@dodopizza/ssp-legacy-plugin-chart-event-flow';

new EventFlowChartPlugin().configure({ key: 'event-flow' }).register();
```

Then use it via `SuperChart`

```js
<SuperChart
  chartType="event-flow"
  width={600}
  height={600}
  formData={...}
  queriesData={[{
    data: {...},
  }]}
/>
```

#### Reference

> This plugin used to be `@superset-ui/legacy-plugin-chart-event-flow` [`0.18.0`]
