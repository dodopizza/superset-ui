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
  t,
  ChartMetadata,
  ChartPlugin,
  Behavior,
  ChartProps,
  QueryFormData,
} from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from '../images/thumbnail.png';
import { PivotTableQueryFormData } from '../types';

const DODOIS = {
  friendly: 'DODOIS: FRIENDLY',
  notFriendly: 'DODOIS: NOT FRIENDLY',
  notStable: 'DODOIS: NOT STABLE',
  unknown: 'DODOIS: UNKNOWN',
};

const VIZ_PACKAGE_NAME = 'plugin-chart-pivot-table';
const VIZ_NAME = 'Pivot Table v2';
const VIZ_VERSION = '0.18.0';

const DODOIS_TAG = DODOIS.friendly;

// eslint-disable-next-line no-console
console.log(`[${VIZ_PACKAGE_NAME} - ${VIZ_NAME}]:${VIZ_VERSION} [${DODOIS_TAG}]`);

export default class PivotTableChartPlugin extends ChartPlugin<
  PivotTableQueryFormData,
  ChartProps<QueryFormData>
> {
  /**
   * The constructor is used to pass relevant metadata and callbacks that get
   * registered in respective registries that are used throughout the library
   * and application. A more thorough description of each property is given in
   * the respective imported file.
   *
   * It is worth noting that `buildQuery` and is optional, and only needed for
   * advanced visualizations that require either post processing operations
   * (pivoting, rolling aggregations, sorting etc) or submitting multiple queries.
   */
  constructor() {
    const metadata = new ChartMetadata({
      behaviors: [Behavior.INTERACTIVE_CHART],
      category: t('Table'),
      description: t(
        'Used to summarize a set of data by grouping together multiple statistics along two axes. Examples: Sales numbers by region and month, tasks by status and assignee, active users by age and location. Not the most visually stunning visualization, but highly informative and versatile.',
      ),
      name: t('Pivot Table v2'),
      tags: [t('Additive'), t('Report'), t('Tabular'), t('Popular'), DODOIS_TAG],
      thumbnail,
    });

    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('../PivotTableChart'),
      metadata,
      transformProps,
    });
  }
}
