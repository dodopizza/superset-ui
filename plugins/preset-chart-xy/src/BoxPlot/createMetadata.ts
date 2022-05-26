import { t, ChartMetadata } from '@superset-ui/core';
import thumbnail from './images/thumbnail.png';

// eslint-disable-next-line no-console
console.log('THIS PLUGIN [BOX PLOT from preset-chart-xy] IS NOT USED');

export default function createMetadata(useLegacyApi = false) {
  return new ChartMetadata({
    category: t('Distribution'),
    description: '',
    name: t('Box Plot'),
    thumbnail,
    useLegacyApi,
  });
}
