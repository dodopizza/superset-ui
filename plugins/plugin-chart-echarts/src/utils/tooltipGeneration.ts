const createElCircle = (color: string) => `<span
    style="
      display: inline-block;
      margin-right: 4px;
      border-radius: 10px;
      width: 10px;
      height: 10px;
      background-color: ${color};
    "></span>`;

const createElName = (name: string) => `<span
    style="
      font-size: 14px;
      color: #666;
      font-weight: 400;
      margin-left: 2px;
    ">${name}</span>`;

const createElValue = (value: string) => `<span
    style="
      float: right;
      margin-left: 20px;
      font-size: 14px;
      color: #666;
      font-weight: 900;
    ">${value}</span>`;

export const createTooltipElement = ({
  axisValueLabel,
  values,
}: {
  axisValueLabel: string;
  values: { value: string; seriesColor: string; serName: string }[];
}): string => {
  let finalValue = `
  <div style="margin: 0px 0 0; line-height: 1">
    <div style="font-size: 14px; color: #666; font-weight: 400; line-height: 1">
      ${axisValueLabel}
    </div>
    <div style="margin: 10px 0 0; line-height: 1">
  `;

  values.forEach(val => {
    if (val && val.value && val.serName) {
      finalValue = `${finalValue}
    <div style="margin: 0px 0 5px; line-height: 1">
      <div style="margin: 0px 0 0; line-height: 1">
        ${createElCircle(val.seriesColor)}${createElName(val.serName)}${createElValue(val.value)}
        <div style="clear: both"></div>
      </div>
      <div style="clear: both"></div>
      </div>
      <div style="clear: both"></div>
    `;
    }
  });

  finalValue = `${finalValue}
    </div>
      <div style="clear: both"></div>
    <div style="clear: both"></div>
  </div>
  `;

  return finalValue;
};
