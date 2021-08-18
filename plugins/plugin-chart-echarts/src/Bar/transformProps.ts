/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  // CategoricalColorNamespace,
  // DataRecordValue,
  // getMetricLabel,
  getNumberFormatter,
  getTimeFormatter,
  // NumberFormats,
  // NumberFormatter,
} from '@superset-ui/core';
import { EChartsOption, BarSeriesOption } from 'echarts';
import { uniq, props } from 'ramda';
import {
  DEFAULT_FORM_DATA as DEFAULT_PIE_FORM_DATA,
  EchartsBarChartProps,
  EchartsBarFormData,
  // EchartsBarLabelType,
  BarChartTransformedProps,
} from './types';
import { DEFAULT_LEGEND_FORM_DATA } from '../types';
import { parseYAxisBound } from '../utils/controls';
import { createTooltipElement } from '../utils/tooltipGeneration';
import { extractGroupbyLabel, getColtypesMapping } from '../utils/series';

export default function transformProps(chartProps: EchartsBarChartProps): BarChartTransformedProps {
  const { formData, height, queriesData, width, datasource } = chartProps;
  const { metrics: chartPropsDatasourceMetrics, columnFormats } = datasource;
  const { data = [] } = queriesData[0];
  const coltypeMapping = getColtypesMapping(queriesData[0]);

  const {
    // colorScheme,
    dateFormat,
    // showLabels,
    emitFilter,
    // numberFormat,

    showValues,
    stack,
    contribution,
    yAxisBounds,
    showLegend,
  }: EchartsBarFormData = { ...DEFAULT_LEGEND_FORM_DATA, ...DEFAULT_PIE_FORM_DATA, ...formData };

  const { metrics, groupby, columns } = formData;
  let { yAxisFormat } = formData;
  const yAxisFormatOriginal = yAxisFormat;

  // eslint-disable-next-line no-console
  console.groupCollapsed('Custom fix by Dodo Engineering (feat-2666390)');
  // eslint-disable-next-line no-console
  console.log('metric: =>', metrics);
  // eslint-disable-next-line no-console
  console.log('columns (breakdowns):', '->', columns);
  // eslint-disable-next-line no-console
  console.log('groupby (series):', '->', groupby);
  // eslint-disable-next-line no-console
  console.log('formData', formData);
  // eslint-disable-next-line no-console
  console.groupEnd();

  // TODO: fix this
  const finalMetrics = metrics?.map((metric: any) => {
    if (typeof metric === 'string') {
      return metric;
    }
    return metric.label;
  });

  /**
   * Needed for yAxis for d3 formating
   */
  const findMetric = (arr: any[], metricName: string) =>
    arr.filter(metric => metric.metric_name === metricName);

  if (!yAxisFormat && chartProps.datasource && chartPropsDatasourceMetrics && metrics) {
    // @ts-ignore
    metrics.forEach((metricName: string) => {
      const [foundMetric] = findMetric(chartPropsDatasourceMetrics, metricName);
      if (foundMetric && foundMetric.d3format) yAxisFormat = foundMetric.d3format;
    });
  }

  const formatter = getNumberFormatter(contribution ? ',.0%' : yAxisFormat);

  const transformedData: BarSeriesOption[] = data.map(datum => {
    const name = extractGroupbyLabel({
      datum,
      groupby,
      coltypeMapping,
      timeFormatter: getTimeFormatter(dateFormat),
    });

    return {
      value: datum,
      name,
    };
  });

  let alteredTransformedData = {};

  console.log('transformedData', transformedData);

  transformedData.forEach((data: any) => {
    const dataName = data.name;
    // @ts-ignore
    const columnName = props(columns, data.value).join(', ');
    const dataValue = data.value;

    alteredTransformedData = {
      ...alteredTransformedData,
      [dataName]: {
        // @ts-ignore
        ...alteredTransformedData[dataName],
        ...data[dataValue],
        [columnName]: {
          ...dataValue,
        },
      },
    };
  });

  console.log('alteredTransformedData', alteredTransformedData);

  let seriesNames = [] as any;
  let namesForLegend = [] as any;

  const anotherDataGrouping = [] as any;

  Object.keys(alteredTransformedData).forEach(key => {
    // @ts-ignore
    const value = alteredTransformedData[key];
    Object.keys(value).forEach(keyV => {
      const val = value[keyV];
      namesForLegend.push({ key: keyV, [groupby[0]]: val[groupby[0]] });
      anotherDataGrouping.push({ key: keyV, value: val });
    });
    seriesNames.push(key);
  });

  namesForLegend = namesForLegend.sort((a: any, b: any) => {
    if (a[groupby[0]] < b[groupby[0]]) return -1;
    if (a[groupby[0]] > b[groupby[0]]) return 1;
    return 0;
  });

  seriesNames = seriesNames.sort((a: any, b: any) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });

  console.log('anotherDataGrouping', anotherDataGrouping);
  console.log('namesForLegend', namesForLegend);
  console.log('seriesNames', seriesNames);

  /**
   * Used for tooltip for d3 formating
   */
  const findMetricNameInArray = (metrics: any[], originalSName: string) => {
    let metricName = originalSName;

    // We either get ['count'] or ['count', 'LA'] or ['LA', '2003']
    const srsNames = originalSName.split(',');

    // we default the metric name to the metrics[0] A or B
    if (srsNames.length === 1) metricName = metrics[0];
    if (metrics.length === 1) metricName = metrics[0];
    else {
      // we find the metric name in array
      metrics.forEach((metr: string) => {
        const index = srsNames?.indexOf(metr);
        if (index >= 0 && srsNames) metricName = srsNames[index];
      });
    }

    return metricName;
  };

  const getMetricNameFromGroups = (sType: string, sName: string) => ({
    // @ts-ignore
    metricName: findMetricNameInArray(metrics, sName),
  });

  const getD3OrOriginalFormat = (
    originalFormat: string | undefined,
    metricName: string,
    columnFormats?: {
      [key: string]: string;
    },
  ) => (!originalFormat ? (columnFormats ? columnFormats[metricName] : '') : originalFormat);

  /**
   * If there is a group in a query, we need to identify to which type A or B this group
   * and metric belongs to.
   */
  const getCorrectFormat = (sType: string, sName: string, yAxisFormat: string | undefined) => {
    /**
     * If there is a group present - we parse groups array with metrics names
     * to indetify what metrics are behind those metrics names
     */

    const overrideMetricParams = getMetricNameFromGroups(sType, sName);
    const { metricName } = overrideMetricParams;
    const tt = getD3OrOriginalFormat(yAxisFormat, metricName, columnFormats);
    return tt;
  };

  const alterDataWithBreakdowns = (
    realValue: any, // [{ year: 2005, state: 'CA', status: 'In Process', count: 2 }]
    needed: string[], // ['2003', '2004', '2005']
    breakdowns: string[] | undefined, // ['state', 'status']
    metrics: string[], // ['count']
    groupby: string[], // ['year']
  ) => {
    const final = [realValue] as any;
    needed.forEach((n: any) => {
      const v = realValue[groupby[0]] && realValue[groupby[0]] === n ? realValue : null;
      if (v) final.push(v);
      else {
        let breakValues = { [metrics[0]]: 0 } as any;
        if (breakdowns && breakdowns.length) {
          breakdowns.forEach((br: string) => {
            breakValues = { ...breakValues, [br]: null };
          });
        }
        groupby.forEach((grName: string) => {
          breakValues = { ...breakValues, [grName]: n };
        });
        final.push(breakValues);
      }
    });

    return uniq(final).sort((a: any, b: any) => {
      if (a[groupby[0]] < b[groupby[0]]) return -1;
      if (a[groupby[0]] > b[groupby[0]]) return 1;
      return 0;
    });
  };

  const getSeries = (
    seriesNames: any,
    groupby: any,
    metrics: any,
    breakdowns: string[] | undefined,
    anotherDataGrouping: any,
  ) => {
    const parsedData = [] as any;

    anotherDataGrouping.forEach((dt: any) => {
      parsedData.push({
        key: dt.key,
        data: alterDataWithBreakdowns(dt.value, seriesNames, breakdowns, metrics, groupby),
      });
    });

    console.log('parsedData', parsedData);

    return parsedData.map((ser: { data: any[]; key: string }) => ({
      data: ser.data.map((v: any) => v[metrics[0]]),
      name: ser.key,
      type: 'bar',
      stack,
      emphasis: {
        focus: 'series',
      },
      label: {
        show: showValues,
        position: 'top',
        formatter: (params: any) => {
          const { data, seriesType, seriesName } = params;
          if (data === 0) return '';

          let correctFormat = '.3s';
          if (seriesType && seriesName) {
            correctFormat = getCorrectFormat(seriesType, seriesName, yAxisFormatOriginal);
          }

          const formatFunction = getNumberFormatter(correctFormat);
          const value = formatFunction(data);

          return value;
        },
      },
      clip: true,
    }));
  };

  const series: any[] = getSeries(seriesNames, groupby, finalMetrics, columns, anotherDataGrouping);
  console.log('series', series);

  // yAxisBounds need to be parsed to replace incompatible values with undefined
  let [min, max] = (yAxisBounds || []).map(parseYAxisBound);

  // default to 0-100% range when doing row-level contribution chart
  if (contribution && stack) {
    if (min === undefined) min = 0;
    if (max === undefined) max = 1;
  }

  const echartOptions: EChartsOption = {
    grid: {
      top: '5%',
    },
    legend: {
      data: showLegend ? namesForLegend.map((v: any) => v.key) : [],
      align: 'auto',
    },
    dataZoom: [
      {
        show: true,
        start: 0,
        end: 100,
      },
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        show: true,
        yAxisIndex: 0,
        filterMode: 'empty',
        width: 30,
        height: '80%',
        showDataShadow: false,
        right: 30,
      },
    ],
    calculable: true,
    tooltip: {
      trigger: 'axis', // item
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const { axisValueLabel } = params[0];

        const values = params.map((p: any) => {
          let correctFormat = '.3s';
          correctFormat = getCorrectFormat(p.seriesType, p.seriesName, yAxisFormatOriginal);

          const formatFunction = getNumberFormatter(correctFormat);

          return {
            value: p.data ? formatFunction(p.data) : '',
            seriesColor: p.color,
            serName: p.seriesName,
          };
        });

        return createTooltipElement({ axisValueLabel, values });
      },
    },
    series,
    xAxis: {
      type: 'category',
      data: seriesNames,
    },
    yAxis: {
      type: 'value',
      min,
      max,
      axisLabel: { formatter },
    },
  };

  return {
    formData,
    width,
    height,
    echartOptions,
    emitFilter,
    groupby,
  } as any;
}
