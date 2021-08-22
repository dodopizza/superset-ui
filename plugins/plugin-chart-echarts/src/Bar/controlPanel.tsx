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
import { t, validateNonEmpty } from '@superset-ui/core';
import { ControlPanelConfig, sections } from '@superset-ui/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    sections.legacyRegularTime,
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['metrics'],
        ['adhoc_filters'],
        ['groupby'],
        ['columns'],
        ['row_limit'],
        ['timeseries_limit_metric'],
        // [
        //   {
        //     name: 'order_desc',
        //     config: {
        //       type: 'CheckboxControl',
        //       label: t('Sort Descending'),
        //       default: true,
        //       description: t('Whether to sort descending or ascending'),
        //     },
        //   },
        // ],
        [
          {
            name: 'contribution',
            config: {
              type: 'CheckboxControl',
              label: t('Contribution'),
              default: false,
              description: t('Compute the contribution to the total'),
            },
          },
        ],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [
        // ['color_scheme'],
        [
          {
            name: 'isSeriesDate',
            config: {
              type: 'CheckboxControl',
              label: t('Is series date format'),
              renderTrigger: true,
              // TODO: move to a variable
              default: false,
              description: t('Temp solution'),
            },
          },
        ],
        [
          {
            name: 'showValues',
            config: {
              type: 'CheckboxControl',
              label: t('Show values'),
              renderTrigger: true,
              // TODO: move to a variable
              default: false,
              description: t('Show values for the chart without hovering'),
            },
          },
        ],
        [
          {
            name: 'stack',
            config: {
              type: 'CheckboxControl',
              label: t('Stack series'),
              renderTrigger: true,
              // TODO: move to a variable
              default: false,
              description: t('Stack series on top of each other'),
            },
          },
        ],
        [
          {
            name: 'show_legend',
            config: {
              type: 'CheckboxControl',
              label: t('Legend'),
              renderTrigger: true,
              // TODO: move to a variable
              default: false,
              description: t('Whether to display a legend for the chart'),
            },
          },
        ],
        [
          {
            name: 'order_bars',
            config: {
              type: 'CheckboxControl',
              label: t('Sort Bars'),
              default: false,
              renderTrigger: true,
              description: t('Sort bars by x labels.'),
            },
          },
        ],
        ['y_axis_format'],
      ],
    },
    // {
    //   label: t('X Axis'),
    //   expanded: true,
    //   // controlSetRows: [[xAxisLabel], [bottomMargin], [xTicksLayout], [reduceXTicks]],
    //   controlSetRows: [],
    // },
  ],
  controlOverrides: {
    groupby: {
      label: t('Series'),
      validators: [validateNonEmpty],
    },
    columns: {
      label: t('Breakdowns'),
      description: t('Defines how each series is broken down'),
    },
  },
};

export default config;
