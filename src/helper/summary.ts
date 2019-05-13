import { CellValue, SummaryValueMap } from '../store/types';

export function calculate(values: CellValue[]): SummaryValueMap {
  const cnt = values.length;
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;
  let sum = 0;
  let avg = 0;

  for (let i = 0; i < cnt; i += 1) {
    let value = Number(values[i]);
    if (isNaN(value)) {
      value = 0;
    }

    sum += value;
    if (min > value) {
      min = value;
    }
    if (max < value) {
      max = value;
    }
  }

  if (!cnt) {
    max = min = avg = 0;
  } else {
    avg = sum / cnt;
  }

  return { sum, min, max, avg, cnt };
}
