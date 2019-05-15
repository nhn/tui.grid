import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid, OptSummaryData, OptSummaryValueMap } from '../src/types';
import { Omit } from 'utility-types';
import { data as sampleData } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Summary', module);
stories.addDecorator(withKnobs);

function createDefaultSummaryOption() {
  const summary = {
    height: 40,
    columnContent: {
      price: {
        template(valueMap: OptSummaryValueMap) {
          return `MAX: ${valueMap.max}<br>MIN: ${valueMap.min}`;
        }
      },
      downloadCount: {
        template(valueMap: OptSummaryValueMap) {
          return `TOTAL: ${valueMap.sum}<br>AVG: ${valueMap.avg.toFixed(2)}`;
        }
      }
    }
  };
  return summary as OptSummaryData;
}

function createDefaultOptions(): Omit<OptGrid, 'el'> {
  const data = sampleData.slice();
  const columns = [
    { name: 'name', minWidth: 150 },
    { name: 'artist', minWidth: 150 },
    { name: 'type', minWidth: 150 },
    { name: 'genre', minWidth: 150 },
    { name: 'price', minWidth: 150 },
    { name: 'downloadCount', minWidth: 150 }
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

stories
  .add('no height', () => {
    const summary = createDefaultSummaryOption();
    summary.height = 0;
    const { el } = createGrid({ summary });

    return el;
  })
  .add('With resizable columns', () => {
    const options = createDefaultOptions();
    options.columns = options.columns.map((column) => ({ ...column, resizable: true }));
    const { el } = createGrid(options);

    return el;
  })
  .add('With editable columns', () => {
    const options = createDefaultOptions();
    options.columns = options.columns.map((column) => ({
      ...column,
      editor: 'text'
    }));
    const { el } = createGrid(options);

    return el;
  })
  .add('With frozen columns', () => {
    const options = createDefaultOptions();
    options.columnOptions = { frozenCount: 2 };
    const { el } = createGrid(options);

    return el;
  })
  .add('setSummaryColumnContent()', () => {
    const options = createDefaultOptions();
    const { el, grid } = createGrid(options);

    button('setSummaryColumnContent -> price(static)', () =>
      grid.setSummaryColumnContent('price', 'this is static')
    );
    button('setSummaryColumnContent -> price(auto calculate)', () =>
      grid.setSummaryColumnContent('price', {
        template(valueMap: OptSummaryValueMap) {
          return `auto calculate: ${valueMap.sum}`;
        }
      })
    );
    button('setSummaryColumnContent -> price(no auto calculate)', () =>
      grid.setSummaryColumnContent('price', {
        template(valueMap: OptSummaryValueMap) {
          return `auto calculate: ${valueMap.sum}`;
        },
        useAutoSummary: false
      })
    );
    button('setSummaryColumnContent -> name(static)', () =>
      grid.setSummaryColumnContent('name', 'this is new static')
    );

    return el;
  });

storiesOf('Summary/position', module)
  .add('Top', () => {
    const summary = createDefaultSummaryOption();
    summary.position = 'top';
    const { el } = createGrid({ summary });

    return el;
  })
  .add('Bottom', () => {
    const options = createDefaultOptions();
    const { el } = createGrid(options);

    return el;
  });

storiesOf('Summary/Column content', module).add('With static data', () => {
  const summary = createDefaultSummaryOption();
  summary.columnContent.price = 'this is static';
  const { el } = createGrid({ summary });

  return el;
});

storiesOf('Summary/Column content/useAutoSummary: false', module)
  .add('With static data', () => {
    const summary = createDefaultSummaryOption();
    summary.columnContent.price = {
      useAutoSummary: false,
      template() {
        return 'this is static';
      }
    };

    const { el } = createGrid({ summary });

    return el;
  })
  .add('With template function', () => {
    const summary = createDefaultSummaryOption();
    summary.columnContent.price = {
      useAutoSummary: false,
      template(valueMap) {
        return `no auto calculate: ${valueMap.sum}`;
      }
    };

    const { el } = createGrid({ summary });

    return el;
  });

storiesOf('Summary/Default content', module)
  .add('With static data', () => {
    const summary = createDefaultSummaryOption();
    summary.defaultContent = 'this is default';
    const { el } = createGrid({ summary });

    return el;
  })
  .add('With template function', () => {
    const summary = createDefaultSummaryOption();
    summary.defaultContent = {
      template(valueMap: OptSummaryValueMap) {
        return `auto calculate: ${valueMap.sum}`;
      }
    };
    const { el } = createGrid({ summary });

    return el;
  });
