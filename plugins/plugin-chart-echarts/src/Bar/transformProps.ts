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
    contribution = false,
    yAxisBounds,
    // showLegend,
    isSeriesDate,
    orderBars = false,
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
  // const colorFn = CategoricalColorNamespace.getScale(colorScheme as string);

  // console.log('colorFn', colorFn);

  const formatter = getNumberFormatter(contribution ? ',.0%' : yAxisFormat);

  const getValuesFromObj = (arr: string[] | number[] | undefined, obj: Record<string, any>) =>
    arr ? arr.map(propName => obj[propName] || null) : [null];

  const getKeysFromObj = (arr: string[] | undefined, obj: Record<string, any>) =>
    arr ? arr.map(propName => (obj[propName] ? propName : null)) : [null];

  const groupByArrayByObjKey = (xs: any, key: string) =>
    xs.reduce((rv: any, x: any) => {
      // eslint-disable-next-line
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});

  const transformedData: BarSeriesOption[] = data.map(datum => {
    console.log('datum', datum);

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

  const ifContribuition = (v: any) => {
    console.log('v', contribution, v, v / 100);
    return contribution ? v / 100 : v;
  };

  const convertDate = (date: Date) => moment(date).format('YYYY-MM-DD');

  const seriesesVals = [] as any;
  const seriesesValsOriginal = [] as any;

  // const metricsVals = [] as any;

  const transformedDataNew: any[] = data.map(datum => {
    const metricsNames = getKeysFromObj(finalMetrics, datum);
    const breakdownsNames = getKeysFromObj(columns, datum);
    const seriesesNames = getKeysFromObj(groupby, datum);
    const v = getValuesFromObj(groupby, datum)[0];
    // 2021-03-08
    // 1619049600000
    // 2004
    seriesesVals.push(isSeriesDate ? convertDate(new Date(v)) : v);
    seriesesValsOriginal.push(v);

    // metricsVals.push(getValuesFromObj(finalMetrics, datum)[0]);

    return {
      values: datum,
      metricsNames,
      breakdownsNames,
      seriesesNames,
    };
  });

  console.log('transformedDataNew', transformedDataNew);

  // let objj = {} as any;
  const uniqueSeriesNames = [...new Set(seriesesValsOriginal)].sort((a: any, b: any) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });

  const uniqueSeriesNamesDate = [...new Set(seriesesVals)].sort((a: any, b: any) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });

  // console.log('uniqueSeriesNames', uniqueSeriesNames);
  // console.log('uniqueSeriesNamesDate', uniqueSeriesNamesDate);

  const transformedDataFinal: any[] = data.map(datum => {
    console.log('datum', datum);
    return finalMetrics?.map(metricName => {
      let name = datum[metricName] && finalMetrics.length > 1 ? `${metricName}` : '';
      const values = [] as any[];
      const valuesExtended = [] as any[];

      columns?.forEach(columnName => {
        if (datum[columnName])
          name = name ? `${name}, ${datum[columnName]}` : `${datum[columnName]}`;
      });

      groupby.forEach(gr => {
        uniqueSeriesNames.forEach(t => {
          // t = 2004
          // gr = year

          if (datum[gr] === t) {
            values.push(datum[metricName]);
            valuesExtended.push({ [gr]: t, v: datum[metricName] });
          } else {
            values.push(null);
            valuesExtended.push({ [gr]: t, v: null });
          }
        });
      });

      return {
        name,
        data: values,
        temp: valuesExtended,
      };
    });
  });

  const mergeArrays = (arrays: any[]) => {
    // console.log('arrays', arrays);
    const tempArr = [];

    const allLengths = arrays.map(innerArr => innerArr.length);
    const length = Math.max(...allLengths);
    // eslint-disable-next-line
    for (let i = 0; i < arrays.length; i++) {
      // eslint-disable-next-line
      for (let j = 0; j < arrays[i].length; j++) {
        if (arrays[i][j] !== null) {
          tempArr[j] = arrays[i][j];
        }
      }
    }

    if (tempArr.length < length) {
      // eslint-disable-next-line
      for (let i = 0; i < length; i++) {
        if (!tempArr[i]) tempArr[i] = null;
      }
    }

    // console.log('tempArr', tempArr);
    // console.log('+++');

    return tempArr;
  };

  console.log('____');
  const uniqFinalValues = [...new Set(transformedDataFinal.flat())];

  const t = groupByArrayByObjKey(uniqFinalValues, 'name');
  const finalFinalData = [] as any;

  Object.keys(t).forEach(key => {
    const value = t[key];

    const preparedObj = {
      data: mergeArrays(value.map((vv: any) => vv.data)),
      name: value[0].name,
    } as any;

    console.log('preparedObj', preparedObj);

    finalFinalData.push(preparedObj);
  });

  console.log('__ finalFinalData __', finalFinalData);

  const sorted = finalFinalData.sort((a: any, b: any) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  // console.log('uniqFinalValues', uniqFinalValues);
  console.log('sorted', sorted);
  console.log('____');

  let alteredTransformedData = {};

  transformedData.forEach((data: any) => {
    const dataName = data.name;
    // @ts-ignore
    const columnName = getValuesFromObj(columns, data.value).join(', ');
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

  Object.keys(alteredTransformedData).forEach(key => {
    // @ts-ignore
    const value = alteredTransformedData[key];
    Object.keys(value).forEach(keyV => {
      const val = value[keyV];
      namesForLegend.push({ key: keyV, [groupby[0]]: val[groupby[0]] });
    });
    seriesNames.push(key);
  });

  namesForLegend = namesForLegend.sort((a: any, b: any) => {
    if (a[groupby[0]] < b[groupby[0]]) return -1;
    if (a[groupby[0]] > b[groupby[0]]) return 1;
    return 0;
  });

  seriesNames = orderBars
    ? seriesNames.sort((a: any, b: any) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      })
    : seriesNames;

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

  const convertToPercentages = (arr: any[], max: number) => arr.map(d => ((100 * d) / max) | 0);

  const getSeries = (sorted: { name: any; data: any[] }[]) =>
    sorted.map(ser => ({
      data: contribution ? convertToPercentages(ser.data, Math.max(...ser.data)) : ser.data,
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
  console.log('series', series);

  // yAxisBounds need to be parsed to replace incompatible values with undefined
  let [min, max] = (yAxisBounds || []).map(parseYAxisBound);

  // default to 0-100% range when doing row-level contribution chart
  if (contribution && stack) {
    if (min === undefined) min = 0;
    if (max === undefined) max = 1;
  }

  console.log('min, max', min, max);

  const dataZoomConfig = !contribution
    ? [
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
      ]
    : [];

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
      data: isSeriesDate ? uniqueSeriesNamesDate : seriesNames,
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
