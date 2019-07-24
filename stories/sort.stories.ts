import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid, OptColumn } from '../src/types';
import { Omit } from 'utility-types';
import { sortData } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Sort', module);
stories.addDecorator(withKnobs);

function createDefaultOptions(): Omit<OptGrid, 'el'> {
  const data = sortData.slice();
  const columns: OptColumn[] = [
    {
      name: 'alphabetA',
      header: 'alphabetA(desc)',
      minWidth: 150,
      sortable: true,
      sortingType: 'desc',
      editor: 'text'
    },
    {
      name: 'alphabetB',
      header: 'alphabetB(asc)',
      minWidth: 150,
      sortable: true,
      sortingType: 'asc',
      editor: 'text'
    },
    {
      name: 'alphabetC',
      header: 'alphabetC(desc)',
      minWidth: 150,
      sortable: true,
      sortingType: 'desc',
      editor: 'text'
    },
    {
      name: 'numberA',
      header: 'numberA(asc)',
      minWidth: 150,
      sortable: true,
      sortingType: 'asc',
      editor: 'text'
    },
    {
      name: 'numberB',
      header: 'numberB(desc)',
      minWidth: 150,
      sortable: true,
      sortingType: 'desc',
      editor: 'text'
    }
  ];

  return { data, columns };
}

function createGrid(customOptions: Record<string, unknown> = {}) {
  const defaultOptions = createDefaultOptions();
  const options = { ...defaultOptions, ...customOptions };
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });

  return { el, grid };
}

stories.add(
  'sort',
  () => {
    const { el, grid } = createGrid();
    button('unsort()', () => grid.unsort());

    return el;
  },
  { html: { preventForcedRender: true } }
);
