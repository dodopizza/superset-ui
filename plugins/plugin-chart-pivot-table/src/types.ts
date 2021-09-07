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
  QueryFormData,
  DataRecord,
  AdhocMetric,
  DataRecordValue,
  JsonObject,
  TimeFormatter,
  NumberFormatter,
  QueryFormMetric,
} from '@superset-ui/core';

export interface PivotTableStylesProps {
  height: number;
  width: number;
  margin: number;
}

export type DateFormatter = TimeFormatter | NumberFormatter | ((value: DataRecordValue) => string);
export type SelectedFiltersType = Record<string, DataRecordValue[]>;

interface PivotTableCustomizeProps {
  groupbyRows: string[];
  groupbyColumns: string[];
  metrics: (string | AdhocMetric)[];
  tableRenderer: string;
  colOrder: string;
  rowOrder: string;
  aggregateFunction: string;
  transposePivot: boolean;
  combineMetric: boolean;
  rowSubtotalPosition: boolean;
  colSubtotalPosition: boolean;
  colTotals: boolean;
  rowTotals: boolean;
  valueFormat: string;
  emitFilter?: boolean;
  selectedFilters?: SelectedFiltersType;
  verboseMap: JsonObject;
  columnFormats: JsonObject;
  metricsLayout?: MetricsLayoutEnum;
  metricColorFormatters: any;
  dateFormatters: Record<string, DateFormatter | undefined>;
  timeseries_limit_metric: QueryFormMetric[] | QueryFormMetric | null;
  order_desc: boolean;
  columnsObjects: {
    column_name: string;
    description: string | null;
    expression: string;
    filterable: boolean;
    groupby: boolean;
    id: number;
    is_dttm: boolean;
    python_date_format: string | null;
    type: string;
  }[];
}

export type PivotTableQueryFormData = QueryFormData &
  PivotTableStylesProps &
  PivotTableCustomizeProps;

export type PivotTableProps = PivotTableStylesProps &
  PivotTableCustomizeProps & {
    data: DataRecord[];
  };

export enum MetricsLayoutEnum {
  ROWS = 'ROWS',
  COLUMNS = 'COLUMNS',
}
