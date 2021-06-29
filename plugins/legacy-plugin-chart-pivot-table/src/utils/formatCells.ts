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
import { formatNumber } from '@superset-ui/core';

/**
 *
 * @param arr - array of metrics
 * @param formatsObject - object with formats
 * @returns - a format as string or null
 */
const getCleanFormat = (arr: string[], formatsObject: Record<string, any>) =>
  arr.map(item => (formatsObject[item] ? formatsObject[item] : null)).filter(i => i)[0] || null;

/**
 *
 * @param value - value as string
 * @returns - '0' or original value
 */
const cleanUpZero = (value: string) => (value && Number(value) === 0 ? '0' : value);

function formatCellValue(
  i: number,
  cols: string[],
  tdText: string,
  columnFormats: any,
  numberFormat: string,
  dateRegex: RegExp,
  dateFormatter: any,
) {
  const metric: string = cols[i];

  const format: string = Array.isArray(metric)
    ? getCleanFormat(metric, columnFormats)
    : columnFormats[metric] || numberFormat || '.3s';

  let textContent: string = tdText;
  let sortAttributeValue: any = tdText;

  if (parseFloat(tdText)) {
    const parsedValue = parseFloat(tdText);
    textContent = formatNumber(format, parsedValue);
    sortAttributeValue = parsedValue;
  } else {
    const regexMatch = dateRegex.exec(tdText);
    if (regexMatch) {
      const date = new Date(parseFloat(regexMatch[1]));
      textContent = dateFormatter(date);
      sortAttributeValue = date;
    } else if (tdText === 'null') {
      textContent = '';
      sortAttributeValue = Number.NEGATIVE_INFINITY;
    }
  }

  const cleanedUpTextContent = cleanUpZero(textContent);

  return { textContent: cleanedUpTextContent, sortAttributeValue };
}

function formatDateCellValue(text: string, verboseMap: any, dateRegex: RegExp, dateFormatter: any) {
  const regexMatch = dateRegex.exec(text);
  let cellValue;
  if (regexMatch) {
    const date = new Date(parseFloat(regexMatch[1]));
    cellValue = dateFormatter(date);
  } else {
    cellValue = verboseMap[text] || text;
  }
  return cellValue;
}

export { formatCellValue, formatDateCellValue };
