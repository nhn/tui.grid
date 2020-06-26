import Grid from '../src/grid';
import { OptGrid, OptSummaryData } from '../types/options';
import { SummaryValueMap } from '../types/store/summary';
import '../src/css/grid.css';

export default {
  title: 'Summary',
};

function createDefaultSummaryOption() {
  const summary = {
    height: 40,
    columnContent: {
      price: {
        template(valueMap: SummaryValueMap) {
          return `MAX: ${valueMap.max}<br>MIN: ${valueMap.min}`;
        },
      },
      downloadCount: {
        template(valueMap: SummaryValueMap) {
          return `TOTAL: ${valueMap.sum}<br>AVG: ${valueMap.avg.toFixed(2)}`;
        },
      },
    },
  };
  return summary as OptSummaryData;
}

function createDefaultOptions(): Omit<OptGrid, 'el'> {
  const data = [
    {
      price: 10000,
      downloadCount: 1000,
    },
    {
      price: 20000,
      downloadCount: 1000,
    },
    {
      price: 7000,
      downloadCount: 1000,
    },
    {
      price: 25000,
      downloadCount: 200,
    },
    {
      price: 15000,
      downloadCount: 1000,
    },
  ];
  const columns = [
    { name: 'price', minWidth: 150 },
    { name: 'downloadCount', minWidth: 150 },
  ];
  const summary = createDefaultSummaryOption();

  return { data, columns, summary };
}

function createGrid(customOptions: Record<string, unknown> = {}) {
  const defaultOptions = createDefaultOptions();
  const options = { ...defaultOptions, ...customOptions };
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

export const positionTop = () => {
  const summary = createDefaultSummaryOption();
  summary.position = 'top';
  const { el } = createGrid({ summary });

  return el;
};

const positionTopNote = `
## Summary Position

- Summary can be positioned \`top\` or \`bottom\`.
- Default value is \`bottom\`. 

`;
positionTop.story = { parameters: { notes: positionTopNote } };

export const positionBottom = () => {
  const summary = createDefaultSummaryOption();
  summary.position = 'bottom';
  const { el } = createGrid({ summary });

  return el;
};
