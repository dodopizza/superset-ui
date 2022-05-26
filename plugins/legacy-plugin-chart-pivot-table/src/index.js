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
import { t, ChartMetadata, ChartPlugin } from '@superset-ui/core';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import controlPanel from './controlPanel';

const DODOIS = {
  friendly: 'DODOIS: FRIENDLY',
  notFriendly: 'DODOIS: NOT FRIENDLY',
  notStable: 'DODOIS: NOT STABLE',
  unknown: 'DODOIS: UNKNOWN',
};

const VIZ_PACKAGE_NAME = 'legacy-plugin-chart-pivot-table';
const VIZ_NAME = 'Pivot Table';
const VIZ_VERSION = '0.18.0';

const DODOIS_TAG = DODOIS.notFriendly;

// eslint-disable-next-line no-console
console.log(`[${VIZ_PACKAGE_NAME} - ${VIZ_NAME}]:${VIZ_VERSION} [${DODOIS_TAG}]`);

const metadata = new ChartMetadata({
  category: t('Table'),
  description: t(`Used to summarize a set of data by grouping together multiple statistics along two axes. Examples: Sales numbers by region and month, tasks by status and assignee, active users by age and location.

  This chart is being deprecated and we recommend checking out Pivot Table V2 instead!`),
  name: t('Pivot Table'),
  tags: [t('Legacy'), DODOIS_TAG],
  thumbnail,
  useLegacyApi: true,
});

export default class PivotTableChartPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./ReactPivotTable.js'),
      metadata,
      transformProps,
      controlPanel,
    });
  }
}
