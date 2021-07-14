import { pick } from 'lodash';
import { ChartProps } from '@superset-ui/core';
import { HookProps, FormDataProps } from '../components/Line/Line';

export default function transformProps(chartProps: ChartProps) {
  const { width, height, queriesData } = chartProps;
  const { data } = queriesData[0];
  const formData = chartProps.formData as FormDataProps;
  const hooks = chartProps.hooks as HookProps;

  // eslint-disable-next-line no-console
  console.groupCollapsed('Custom fix by Dodo Engineering (feat/2587073-line)');
  // eslint-disable-next-line no-console
  // console.log('metrics:', columnFormats);
  // // eslint-disable-next-line no-console
  // console.log('series:', 'A ->', seriesType, 'B ->', seriesTypeB);
  // // eslint-disable-next-line no-console
  // console.log('groups:', 'A ->', groupby, 'B ->', groupbyB);
  // // eslint-disable-next-line no-console
  // console.log('yAxis:', 'A ->', yAxisFormatOriginal, 'B ->', yAxisFormatSecondaryOriginal);
  // // eslint-disable-next-line no-console
  console.groupEnd();
  /**
   * Use type-check to make sure the field names are expected ones
   * and only pick these fields to pass to the chart.
   */
  const fieldsFromFormData: (keyof FormDataProps)[] = ['encoding', 'margin', 'theme'];

  const fieldsFromHooks: (keyof HookProps)[] = [
    'TooltipRenderer',
    'LegendRenderer',
    'LegendGroupRenderer',
    'LegendItemRenderer',
    'LegendItemMarkRenderer',
    'LegendItemLabelRenderer',
  ];

  return {
    data,
    width,
    height,
    ...pick(formData, fieldsFromFormData),
    ...pick(hooks, fieldsFromHooks),
  };
}
