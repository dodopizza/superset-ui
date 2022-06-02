/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regardin
 * g copyright ownership.  The ASF licenses this file
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
import { Behavior, ChartMetadata, ChartPlugin, t } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';
import example1 from './images/treemap_v2_1.png';
import example2 from './images/treemap_v2_2.jpg';
import { EchartsTreemapChartProps, EchartsTreemapFormData } from './types';

const DODOIS = {
  friendly: 'DODOIS: FRIENDLY',
  notFriendly: 'DODOIS: NOT FRIENDLY',
  notStable: 'DODOIS: NOT STABLE',
  unknown: 'DODOIS: UNKNOWN',
};

const VIZ_PACKAGE_NAME = 'ssp-plugin-chart-echarts';
const VIZ_NAME = 'Treemap v2';
const VIZ_VERSION = '0.1.1';

const DODOIS_TAG = DODOIS.friendly;

// eslint-disable-next-line no-console
console.log(`[${VIZ_PACKAGE_NAME} - ${VIZ_NAME}]:${VIZ_VERSION} [${DODOIS_TAG}]`);

export default class EchartsTreemapChartPlugin extends ChartPlugin<
  EchartsTreemapFormData,
  EchartsTreemapChartProps
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
    super({
      buildQuery,
      controlPanel,
      loadChart: () => import('./EchartsTreemap'),
      metadata: new ChartMetadata({
        behaviors: [Behavior.INTERACTIVE_CHART],
        category: t('Part of a Whole'),
        credits: ['https://echarts.apache.org'],
        description: t(
          'Show hierarchical relationships of data, with with the value represented by area, showing proportion and contribution to the whole.',
        ),
        exampleGallery: [{ url: example1 }, { url: example2 }],
        name: t('Treemap v2'),
        tags: [
          t('Aesthetic'),
          t('Categorical'),
          t('Comparison'),
          t('ECharts'),
          t('Multi-Levels'),
          t('Percentages'),
          t('Proportional'),
          DODOIS_TAG,
        ],
        thumbnail,
      }),
      transformProps,
    });
  }
}
