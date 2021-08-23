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
import moment from 'moment';

import {
  DEFAULT_FORM_DATA,
  EchartsBarChartProps,
  EchartsBarFormData,
  // EchartsBarLabelType,
  BarChartTransformedProps,
} from './types';
import { DEFAULT_LEGEND_FORM_DATA } from '../types';
import { parseYAxisBound } from '../utils/controls';
import { createTooltipElement } from '../utils/tooltipGeneration';
// import { /* extractGroupbyLabel, */ getColtypesMapping } from '../utils/series';

export default function transformProps(chartProps: EchartsBarChartProps): BarChartTransformedProps {
  const { formData, height, queriesData, width, datasource } = chartProps;
  const { metrics: chartPropsDatasourceMetrics, columnFormats } = datasource;
  const { data = [] } = queriesData[0];
  // const coltypeMapping = getColtypesMapping(queriesData[0]);

  const {
    // colorScheme,
    // dateFormat,
    // showLabels,
    emitFilter,
    // numberFormat,

    showValues,
    stack,
    contribution = false,
    yAxisBounds,
    // showLegend = false,
    // orderBars = false,
    isSeriesDate,
  }: EchartsBarFormData = { ...DEFAULT_LEGEND_FORM_DATA, ...DEFAULT_FORM_DATA, ...formData };

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
  console.log('data', data);
  // eslint-disable-next-line no-console
  console.groupEnd();

  // TODO: fix this
  // @ts-ignore
  const finalMetrics: string[] = metrics
    ?.map((metric: any) => {
      if (typeof metric === 'string') return metric;
      return metric.label;
    })
    .filter(metricName => metricName);

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
  // const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);

  // console.log('colorFn', colorFn);

  const formatter = getNumberFormatter(contribution ? ',.0%' : yAxisFormat);

  const getValuesFromObj = (arr: string[] | number[] | undefined, obj: Record<string, any>) =>
    arr ? arr.map(propName => obj[propName] || null) : [null];

  const groupByArrayByObjKey = (xs: any, key: string) =>
    xs.reduce((rv: any, x: any) => {
      // eslint-disable-next-line
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});

  const convertToPercentages = function (arr: number[]) {
    const sum = arr.reduce((previousValue: any, currentValue: any) => previousValue + currentValue);
    const convertedValues = [] as any;

    arr.forEach(element => {
      convertedValues.push(element / sum);
    });
    return convertedValues;
  };

  const convertDate = (date: Date) => moment(date).format('YYYY-MM-DD');

  const addMissingData = (values: any[], expectedNames: string[]) => {
    const t = expectedNames.map(name => {
      const found = values.find(v => v.dataName === name);

      // we need to fill empty space with 0 values, or data will be shifted
      const fallbackObj = { dataName: name, dataValue: 0 };
      return found || fallbackObj;
    });
    return t;
  };

  const seriesesVals = [] as any;
  const seriesesValsOriginal = [] as any;

  const expectedDataNames = [] as any;

  const originalData = data
    .map(datum => {
      const value = getValuesFromObj(groupby, datum)[0];
      seriesesVals.push(isSeriesDate ? convertDate(new Date(value)) : value);
      seriesesValsOriginal.push(value);

      const groupedValues = groupby?.map(groupingKey => {
        // groupingKey = Date (series) -> only 1 supported now
        /**
         * preparing a name for the graph:
         * - SUM(SalesWithDiscount), Delivery|Dine-in|Takeaway
         * - count, Delivery|Dine-in|Takeaway
         */

        const values = finalMetrics.map(metricName => {
          const breakdownName = columns?.map(colName => datum[colName]);
          const finalBrName = breakdownName?.length ? breakdownName.join() : null;

          // when there is only 1 metric, no need to print it's name
          const dataName = finalMetrics.length > 1 ? `${metricName}, ${finalBrName}` : finalBrName;

          expectedDataNames.push(dataName);

          return {
            dataName,
            dataValue: datum[metricName] || 0,
            dataMetricName: metricName,
            [groupingKey]: datum[groupingKey],
          };
        });

        return values.flat();
      });

      return groupedValues?.flat();
    })
    .flat();

  const uniqExpectedDataNames = [...new Set(expectedDataNames)] as string[];

  console.group('1');
  console.log('originalData', originalData);
  console.log('uniqExpectedDataNames', uniqExpectedDataNames);
  console.groupEnd();

  // TODO: for now only 1 series is supported, hence - groupby[0]
  const groupByArrayDate = groupByArrayByObjKey(originalData, groupby[0]);

  const almostFinalValues = [] as any[];

  const transformForContribution = (arr: any[], groupBy: string) => {
    const groupedValues = groupByArrayByObjKey(arr, groupBy);

    const transformedDataArray = [] as any;

    Object.keys(groupedValues).forEach(key => {
      const values = groupedValues[key];
      const convertedValues = convertToPercentages(values.map((v: any) => v.dataValue));

      const newValues = values.map((v: any, index: number) => ({
        ...v,
        dataValue: convertedValues[index],
      }));

      transformedDataArray.push(newValues);
    });

    return transformedDataArray.flat();
  };

  Object.keys(groupByArrayDate).forEach(key => {
    const value = groupByArrayDate[key];

    const transformedWithContribution = contribution
      ? transformForContribution(value, 'dataMetricName')
      : value;

    const addMissingDataResult = addMissingData(transformedWithContribution, uniqExpectedDataNames);

    almostFinalValues.push(addMissingDataResult);
  });
  // TODO: make it pretty
  const uniqueSeriesNames = [...new Set(seriesesValsOriginal)].sort((a: any, b: any) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });

  // TODO: make it pretty
  const uniqueSeriesNamesDate = [...new Set(seriesesVals)].sort((a: any, b: any) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });

  const uniqFinalValues = [...new Set(almostFinalValues.flat())];
  const groupByArray = groupByArrayByObjKey(uniqFinalValues, 'dataName');

  const finalyParsedData = [] as any;

  Object.keys(groupByArray).forEach(key => {
    const value = groupByArray[key];

    const pureObject = {
      data: value.map((vv: any) => vv.dataValue),
      name: value[0].dataName,
    } as any;

    finalyParsedData.push(pureObject);
  });

  const sorted = finalyParsedData.sort((a: any, b: any) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  console.group('2');
  console.log('uniqFinalValues', uniqFinalValues);
  console.log('groupByArray', groupByArray);
  console.log('finalyParsedData', finalyParsedData);
  console.log('sorted', sorted);
  console.groupEnd();

  // TODO: legend
  // const namesForLegend = [] as any;
  // console.log('namesForLegend', namesForLegend);

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

  const getSeries = (preparedSeriesData: { name: any; data: any[] }[]) =>
    preparedSeriesData.map(ser => ({
      data: ser.data,
      name: ser.name,
      type: 'bar',
      stack: stack ? 'total' : '',
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

          const formatFunction = getNumberFormatter(contribution ? ',.0%' : correctFormat);
          const value = formatFunction(data);

          return value;
        },
      },
      clip: true,
    }));

  const series: any[] = getSeries(sorted);

  console.group('3');
  console.log('uniqueSeriesNames', uniqueSeriesNames);
  console.log('series', series);
  console.groupEnd();

  // yAxisBounds need to be parsed to replace incompatible values with undefined
  let [min, max] = (yAxisBounds || []).map(parseYAxisBound);

  // default to 0-100% range when doing row-level contribution chart
  if (contribution && stack) {
    if (min === undefined) min = 0;
    if (max === undefined) max = 1;
  }

  const dataZoomConfig = [
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
  ];

  const echartOptions: EChartsOption = {
    grid: {
      top: '5%',
    },
    // legend: {
    //   data: showLegend ? namesForLegend.map((v: any) => v.key) : [],
    //   align: 'auto',
    // },
    // @ts-ignore
    dataZoom: dataZoomConfig,
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

          const formatFunction = getNumberFormatter(contribution ? ',.0%' : correctFormat);

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
    // @ts-ignore
    xAxis: {
      type: 'category',
      data: isSeriesDate ? uniqueSeriesNamesDate : uniqueSeriesNames,
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
    contribution,
  } as any;
}
