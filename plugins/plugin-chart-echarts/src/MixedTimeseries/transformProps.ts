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
/* eslint-disable camelcase */
import {
  AnnotationLayer,
  CategoricalColorNamespace,
  ChartProps,
  getNumberFormatter,
  isEventAnnotationLayer,
  isFormulaAnnotationLayer,
  isIntervalAnnotationLayer,
  isTimeseriesAnnotationLayer,
} from '@superset-ui/core';
import { EChartsOption, SeriesOption } from 'echarts';
import { DEFAULT_FORM_DATA, EchartsMixedTimeseriesFormData } from './types';
import { EchartsProps, ForecastSeriesEnum, ProphetValue } from '../types';
import { parseYAxisBound } from '../utils/controls';
import { dedupSeries, extractTimeseriesSeries, getLegendProps } from '../utils/series';
import { extractAnnotationLabels } from '../utils/annotation';
import {
  extractForecastSeriesContext,
  extractProphetValuesFromTooltipParams,
  formatProphetTooltipSeries,
  rebaseTimeseriesDatum,
} from '../utils/prophet';
import { defaultGrid, defaultTooltip, defaultYAxis } from '../defaults';
import {
  getPadding,
  getTooltipFormatter,
  getXAxisFormatter,
  transformEventAnnotation,
  transformFormulaAnnotation,
  transformIntervalAnnotation,
  transformSeries,
  transformTimeseriesAnnotation,
} from '../Timeseries/transformers';
import { TIMESERIES_CONSTANTS } from '../constants';

export default function transformProps(chartProps: ChartProps): EchartsProps {
  const { width, height, formData, queriesData, datasource } = chartProps;
  const { metrics: chartPropsDatasourceMetrics } = datasource;
  const { annotation_data: annotationData_, data: data1 = [] } = queriesData[0];
  const { data: data2 = [] } = queriesData[1];
  const annotationData = annotationData_ || {};
  const { columnFormats } = datasource;

  const {
    area,
    areaB,
    annotationLayers,
    colorScheme,
    contributionMode,
    legendOrientation,
    legendType,
    logAxis,
    logAxisSecondary,
    markerEnabled,
    markerEnabledB,
    markerSize,
    markerSizeB,
    opacity,
    opacityB,
    minorSplitLine,
    seriesType,
    seriesTypeB,
    showLegend,
    showValuesA,
    showValuesB,
    stack,
    stackB,
    truncateYAxis,
    tooltipTimeFormat,
    xAxisShowMinLabel,
    xAxisShowMaxLabel,
    xAxisTimeFormat,
    yAxisBounds,
    yAxisIndex,
    yAxisIndexB,
    yAxisTitle,
    yAxisTitleSecondary,
    zoomable,
    richTooltip,
    xAxisLabelRotation,
  }: EchartsMixedTimeseriesFormData = { ...DEFAULT_FORM_DATA, ...formData };
  const { metrics, metricsB, groupby, groupbyB } = formData;
  let { yAxisFormat, yAxisFormatSecondary } = formData;

  const yAxisFormatOriginal = yAxisFormat;
  const yAxisFormatSecondaryOriginal = yAxisFormatSecondary;

  // eslint-disable-next-line no-console
  console.groupCollapsed('Custom fix by Dodo Engineering (fix/2586885, feat/2617781)');
  // eslint-disable-next-line no-console
  console.log('metrics:', columnFormats);
  // eslint-disable-next-line no-console
  console.log('groups:', 'A ->', groupby, 'B ->', groupbyB);
  // eslint-disable-next-line no-console
  console.log('yAxis:', 'A ->', yAxisFormatOriginal, 'B ->', yAxisFormatSecondaryOriginal);
  // eslint-disable-next-line no-console
  console.log('showValues:', 'A ->', showValuesA, 'B ->', showValuesB);
  // eslint-disable-next-line no-console
  console.groupEnd();

  const colorScale = CategoricalColorNamespace.getScale(colorScheme as string);
  const rawSeriesA = extractTimeseriesSeries(rebaseTimeseriesDatum(data1), {
    fillNeighborValue: stack ? 0 : undefined,
  });
  const rawSeriesB = extractTimeseriesSeries(rebaseTimeseriesDatum(data2), {
    fillNeighborValue: stackB ? 0 : undefined,
  });

  const series: SeriesOption[] = [];

  /**
   * Used for tooltip for d3 formating
   */
  const findMetricNameInArray = (metrics: string[], originalSName: string) => {
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
    metricName: findMetricNameInArray(sType === seriesType ? metrics : metricsB, sName),
    queryGroup: sType === seriesType ? 'A' : 'B',
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
  const getCorrectFormat = (
    sType: string,
    sName: string,
    yAxisFormat: string | undefined,
    yAxisFormatSecondary: string | undefined,
    groupArrayA: string[] | [],
    groupArrayB: string[] | [],
  ) => {
    /**
     * If there is a group present - we parse groups array with metrics names
     * to indetify what metrics are behind those metrics names
     */

    if (groupArrayA.length || groupArrayB.length) {
      const overrideMetricParams = getMetricNameFromGroups(sType, sName);
      const { metricName, queryGroup } = overrideMetricParams;
      return getD3OrOriginalFormat(
        queryGroup === 'A' ? yAxisFormat : yAxisFormatSecondary,
        metricName,
        columnFormats,
      );
    }

    return getD3OrOriginalFormat(
      sType === seriesType ? yAxisFormat : yAxisFormatSecondary,
      sName,
      columnFormats,
    );
  };

  /**
   * Needed for yAxis for d3 formating
   */
  const findMetric = (arr: any[], metricName: string) =>
    arr.filter(metric => metric.metric_name === metricName);

  if (!yAxisFormat && chartProps.datasource && chartPropsDatasourceMetrics) {
    metrics.forEach((metricName: string) => {
      const [foundMetric] = findMetric(chartPropsDatasourceMetrics, metricName);

      if (foundMetric && foundMetric.d3format) yAxisFormat = foundMetric.d3format;
      else yAxisFormat = null;
    });
  }

  if (!yAxisFormatSecondary && chartProps.datasource && chartPropsDatasourceMetrics) {
    metricsB.forEach((metricName: string) => {
      const [foundMetric] = findMetric(chartPropsDatasourceMetrics, metricName);

      if (foundMetric && foundMetric.d3format) yAxisFormatSecondary = foundMetric.d3format;
      else yAxisFormatSecondary = null;
    });
  }

  const primaryFormatter = getNumberFormatter(contributionMode ? ',.0%' : yAxisFormat);
  const secondaryFormatter = getNumberFormatter(contributionMode ? ',.0%' : yAxisFormatSecondary);

  rawSeriesA.forEach(entry => {
    const transformedSeries = transformSeries(entry, colorScale, {
      area,
      markerEnabled,
      markerSize,
      opacity,
      seriesType,
      stack,
      richTooltip,
      yAxisIndex,
    });
    if (transformedSeries) series.push(transformedSeries);
  });
  rawSeriesB.forEach(entry => {
    const transformedSeries = transformSeries(entry, colorScale, {
      area: areaB,
      markerEnabled: markerEnabledB,
      markerSize: markerSizeB,
      opacity: opacityB,
      seriesType: seriesTypeB,
      stack: stackB,
      richTooltip,
      yAxisIndex: yAxisIndexB,
    });
    if (transformedSeries) series.push(transformedSeries);
  });

  annotationLayers
    .filter((layer: AnnotationLayer) => layer.show)
    .forEach((layer: AnnotationLayer) => {
      if (isFormulaAnnotationLayer(layer))
        series.push(transformFormulaAnnotation(layer, data1, colorScale));
      else if (isIntervalAnnotationLayer(layer)) {
        series.push(...transformIntervalAnnotation(layer, data1, annotationData, colorScale));
      } else if (isEventAnnotationLayer(layer)) {
        series.push(...transformEventAnnotation(layer, data1, annotationData, colorScale));
      } else if (isTimeseriesAnnotationLayer(layer)) {
        series.push(...transformTimeseriesAnnotation(layer, markerSize, data1, annotationData));
      }
    });

  // yAxisBounds need to be parsed to replace incompatible values with undefined
  let [min, max] = (yAxisBounds || []).map(parseYAxisBound);

  // default to 0-100% range when doing row-level contribution chart
  if (contributionMode === 'row' && stack) {
    if (min === undefined) min = 0;
    if (max === undefined) max = 1;
  }

  const tooltipFormatter = getTooltipFormatter(tooltipTimeFormat);
  const xAxisFormatter = getXAxisFormatter(xAxisTimeFormat);

  const addYAxisLabelOffset = !!(yAxisTitle || yAxisTitleSecondary);
  const chartPadding = getPadding(showLegend, legendOrientation, addYAxisLabelOffset, zoomable);
  const alteredSeries = series.map((ser, index) => ({
    ...ser,
    label: {
      show: index === 0 ? showValuesA : showValuesB,
      formatter: (params: any) => {
        const prophetValue = [params];
        let finalValue;

        const prophetValues: Record<string, ProphetValue> = extractProphetValuesFromTooltipParams(
          prophetValue,
        );

        Object.keys(prophetValues).forEach(key => {
          const value = prophetValues[key];
          // falback format is defined
          let correctFormat = '.3s';

          if (value.seriesType && value.seriesName) {
            correctFormat = getCorrectFormat(
              value.seriesType,
              value.seriesName,
              yAxisFormatOriginal,
              yAxisFormatSecondaryOriginal,
              groupby,
              groupbyB,
            );
          }

          const formatFunction = getNumberFormatter(correctFormat);

          finalValue = formatFunction(value.observation);
        });
        return finalValue;
      },
    },
  }));

  const echartOptions: EChartsOption = {
    useUTC: true,
    grid: {
      ...defaultGrid,
      ...chartPadding,
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        showMinLabel: xAxisShowMinLabel,
        showMaxLabel: xAxisShowMaxLabel,
        formatter: xAxisFormatter,
        rotate: xAxisLabelRotation,
      },
    },
    yAxis: [
      {
        ...defaultYAxis,
        type: logAxis ? 'log' : 'value',
        min,
        max,
        minorTick: { show: true },
        minorSplitLine: { show: minorSplitLine },
        axisLabel: { formatter: primaryFormatter },
        scale: truncateYAxis,
        name: yAxisTitle,
      },
      {
        ...defaultYAxis,
        type: logAxisSecondary ? 'log' : 'value',
        min,
        max,
        minorTick: { show: true },
        splitLine: { show: false },
        minorSplitLine: { show: minorSplitLine },
        axisLabel: { formatter: secondaryFormatter },
        scale: truncateYAxis,
        name: yAxisTitleSecondary,
      },
    ],
    tooltip: {
      ...defaultTooltip,
      trigger: richTooltip ? 'axis' : 'item',
      formatter: (params: any) => {
        const value: number = !richTooltip ? params.value : params[0].value[0];
        const prophetValue = !richTooltip ? [params] : params;

        const rows: Array<string> = [`${tooltipFormatter(value)}`];
        const prophetValues: Record<string, ProphetValue> = extractProphetValuesFromTooltipParams(
          prophetValue,
        );

        Object.keys(prophetValues).forEach(key => {
          const value = prophetValues[key];
          // falback format is defined
          let correctFormat = '.3s';

          if (value.seriesType && value.seriesName) {
            correctFormat = getCorrectFormat(
              value.seriesType,
              value.seriesName,
              yAxisFormatOriginal,
              yAxisFormatSecondaryOriginal,
              groupby,
              groupbyB,
            );
          }

          const formatFunction = getNumberFormatter(correctFormat);

          rows.push(
            formatProphetTooltipSeries({
              ...value,
              seriesName: key,
              formatter: formatFunction,
            }),
          );
        });
        return rows.join('<br />');
      },
    },
    legend: {
      ...getLegendProps(legendType, legendOrientation, showLegend, zoomable),
      // @ts-ignore
      data: rawSeriesA
        .concat(rawSeriesB)
        .filter(
          entry =>
            extractForecastSeriesContext((entry.name || '') as string).type ===
            ForecastSeriesEnum.Observation,
        )
        .map(entry => entry.name || '')
        .concat(extractAnnotationLabels(annotationLayers, annotationData)),
    },
    // @ts-ignore
    series: dedupSeries(alteredSeries),
    toolbox: {
      show: zoomable,
      top: TIMESERIES_CONSTANTS.toolboxTop,
      right: TIMESERIES_CONSTANTS.toolboxRight,
      feature: {
        dataZoom: {
          yAxisIndex: false,
          title: {
            zoom: 'zoom area',
            back: 'restore zoom',
          },
        },
      },
    },
    dataZoom: zoomable
      ? [
          {
            type: 'slider',
            start: TIMESERIES_CONSTANTS.dataZoomStart,
            end: TIMESERIES_CONSTANTS.dataZoomEnd,
            bottom: TIMESERIES_CONSTANTS.zoomBottom,
          },
        ]
      : [],
  };

  return {
    echartOptions,
    width,
    height,
  };
}
