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
import React, { useMemo } from 'react';
import { styled, AdhocMetric, getNumberFormatter, useTheme } from '@superset-ui/core';
// @ts-ignore
import PivotTable from '@superset-ui/react-pivottable/PivotTable';
// @ts-ignore
import { sortAs, aggregatorTemplates } from '@superset-ui/react-pivottable/Utilities';
import '@superset-ui/react-pivottable/pivottable.css';
import { PivotTableProps, PivotTableStylesProps, MetricsLayoutEnum } from './types';

const Styles = styled.div<PivotTableStylesProps>`
  ${({ height, width, margin }) => `
      margin: ${margin}px;
      height: ${height - margin * 2}px;
      width: ${width - margin * 2}px;
 `}
`;

const PivotTableWrapper = styled.div`
  height: 100%;
  max-width: fit-content;
  overflow: auto;
`;

const METRIC_KEY = 'metric';

const aggregatorsFactory = (formatter: any) => ({
  Count: aggregatorTemplates.count(formatter),
  'Count Unique Values': aggregatorTemplates.countUnique(formatter),
  'List Unique Values': aggregatorTemplates.listUnique(', ', formatter),
  Sum: aggregatorTemplates.sum(formatter),
  Average: aggregatorTemplates.average(formatter),
  Median: aggregatorTemplates.median(formatter),
  'Sample Variance': aggregatorTemplates.var(1, formatter),
  'Sample Standard Deviation': aggregatorTemplates.stdev(1, formatter),
  Minimum: aggregatorTemplates.min(formatter),
  Maximum: aggregatorTemplates.max(formatter),
  First: aggregatorTemplates.first(formatter),
  Last: aggregatorTemplates.last(formatter),
  'Sum as Fraction of Total': aggregatorTemplates.fractionOf(
    aggregatorTemplates.sum(),
    'total',
    formatter,
  ),
  'Sum as Fraction of Rows': aggregatorTemplates.fractionOf(
    aggregatorTemplates.sum(),
    'row',
    formatter,
  ),
  'Sum as Fraction of Columns': aggregatorTemplates.fractionOf(
    aggregatorTemplates.sum(),
    'col',
    formatter,
  ),
  'Count as Fraction of Total': aggregatorTemplates.fractionOf(
    aggregatorTemplates.count(),
    'total',
    formatter,
  ),
  'Count as Fraction of Rows': aggregatorTemplates.fractionOf(
    aggregatorTemplates.count(),
    'row',
    formatter,
  ),
  'Count as Fraction of Columns': aggregatorTemplates.fractionOf(
    aggregatorTemplates.count(),
    'col',
    formatter,
  ),
});

const addZero = (number: number) => number.toString().padStart(2, '0');
const getFullYear = (timestamp: Date) => new Date(timestamp).getFullYear();
const getMonth = (timestamp: Date) => new Date(timestamp).getMonth();
const getDate = (timestamp: Date) => new Date(timestamp).getDate();

const convertDate = (date: Date) => {
  const dateObj = new Date(date);
  return `${getFullYear(dateObj)}-${addZero(getMonth(dateObj) + 1)}-${addZero(getDate(dateObj))}`;
};
// TODO: Math.abs is to consider dates before 1970 (-157766400000)
const isValidDate = (str: number) => Date.parse(String(new Date(Math.abs(str)))) > 0;

// TODO: remove eslint-disable when click callbacks are implemented
/* eslint-disable @typescript-eslint/no-unused-vars */
const clickCellCallback = (
  e: MouseEvent,
  value: number,
  filters: Record<string, any>,
  pivotData: Record<string, any>,
) => {
  // TODO: Implement a callback
};

const clickColumnHeaderCallback = (
  e: MouseEvent,
  value: string,
  filters: Record<string, any>,
  pivotData: Record<string, any>,
  isSubtotal: boolean,
  isGrandTotal: boolean,
) => {
  // TODO: Implement a callback
};

const clickRowHeaderCallback = (
  e: MouseEvent,
  value: string,
  filters: Record<string, any>,
  pivotData: Record<string, any>,
  isSubtotal: boolean,
  isGrandTotal: boolean,
) => {
  // TODO: Implement a callback
};

export default function PivotTableChart(props: PivotTableProps) {
  const {
    data,
    height,
    width,
    groupbyRows,
    groupbyColumns,
    metrics,
    // tableRenderer,
    colOrder,
    rowOrder,
    aggregateFunction,
    transposePivot,
    rowSubtotalPosition,
    colSubtotalPosition,
    colTotals,
    rowTotals,
    valueFormat,
    verboseMap,
    columnFormats,
    metricsLayout,
    combineMetric,
    columnsObjects,
  } = props;

  const findElementByKey = (arr: any[], elementName: string, key: string) =>
    arr.filter(el => el[key] === elementName);

  const columnsAndRowsWithTypes = [] as { name: string; type: string }[];

  groupbyRows.forEach(rowName => {
    const found = findElementByKey(columnsObjects, rowName, 'column_name');
    if (found && found[0]) {
      columnsAndRowsWithTypes.push({ name: rowName, type: found[0].type });
    }
  });

  groupbyColumns.forEach(columnName => {
    const found = findElementByKey(columnsObjects, columnName, 'column_name');
    if (found && found[0]) {
      columnsAndRowsWithTypes.push({ name: columnName, type: found[0].type });
    }
  });

  const theme = useTheme();
  const defaultFormatter = getNumberFormatter(valueFormat);
  const columnFormatsArray = Object.entries(columnFormats);
  const hasCustomMetricFormatters = columnFormatsArray.length > 0;
  const metricFormatters =
    hasCustomMetricFormatters &&
    Object.fromEntries(
      columnFormatsArray.map(([metric, format]) => [metric, getNumberFormatter(format)]),
    );

  const metricNames = useMemo(
    () =>
      metrics.map((metric: string | AdhocMetric) =>
        typeof metric === 'string' ? metric : (metric.label as string),
      ),
    [metrics],
  );

  // TODO: add d3 format from metrics
  const transformObjectValue = (
    obj: Record<string, any>,
    columnsAndRows: { name: string; type: string }[],
  ) => {
    let finalObject = { ...obj };
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const found = findElementByKey(columnsAndRows, key, 'name');
      if (found && found[0]) {
        const foundElement = found[0];
        finalObject = {
          ...finalObject,
          [key]:
          // TODO: need to check this properly, probably there are more types with dates
            foundElement.type === 'TIMESTAMP WITHOUT TIME ZONE'
              ? isValidDate(value)
                ? convertDate(value)
                : value
              : value,
        };
      }
    });
    return finalObject;
  };

  const alteredData = data.map((d: any) => transformObjectValue(d, columnsAndRowsWithTypes));

  const unpivotedData = useMemo(
    () =>
      alteredData.reduce(
        // @ts-ignore
        (acc: Record<string, any>[], record: Record<string, any>) => [
          ...acc,
          ...metricNames
            .map((name: string) => ({
              ...record,
              [METRIC_KEY]: name,
              value: record[name],
            }))
            .filter(record => record.value !== null),
        ],
        [],
      ),
    [alteredData, metricNames],
  );

  let [rows, cols] = transposePivot ? [groupbyColumns, groupbyRows] : [groupbyRows, groupbyColumns];

  if (metricsLayout === MetricsLayoutEnum.ROWS) {
    rows = combineMetric ? [...rows, METRIC_KEY] : [METRIC_KEY, ...rows];
  } else {
    cols = combineMetric ? [...cols, METRIC_KEY] : [METRIC_KEY, ...cols];
  }

  return (
    <Styles height={height} width={width} margin={theme.gridUnit * 4}>
      <PivotTableWrapper>
        <PivotTable
          data={unpivotedData}
          rows={rows}
          cols={cols}
          aggregatorsFactory={aggregatorsFactory}
          defaultFormatter={defaultFormatter}
          customFormatters={
            hasCustomMetricFormatters ? { [METRIC_KEY]: metricFormatters } : undefined
          }
          aggregatorName={aggregateFunction}
          vals={['value']}
          rendererName="Table With Subtotal"
          colOrder={colOrder}
          rowOrder={rowOrder}
          sorters={{
            metric: sortAs(metricNames),
          }}
          tableOptions={{
            clickCallback: clickCellCallback,
            clickRowHeaderCallback,
            clickColumnHeaderCallback,
            colTotals,
            rowTotals,
          }}
          subtotalOptions={{
            colSubtotalDisplay: { displayOnTop: colSubtotalPosition },
            rowSubtotalDisplay: { displayOnTop: rowSubtotalPosition },
          }}
          namesMapping={verboseMap}
        />
      </PivotTableWrapper>
    </Styles>
  );
}
