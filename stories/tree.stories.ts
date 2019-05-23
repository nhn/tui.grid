import { storiesOf } from '@storybook/html';
import { withKnobs } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/tree';

import '../src/css/grid.css';

const stories = storiesOf('Tree', module);
stories.addDecorator(withKnobs);

const columns = [{ name: 'name' }, { name: 'artist' }, { name: 'type' }];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, bodyHeight: 400, ...options });

  return { el, grid };
}

stories.add('tree column', () => {
  const { el } = createGrid({
    data: data.slice(0, 7),
    columns,
    rowHeaders: ['_number'],
    treeColumnOptions: {
      name: 'name'
    }
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
});
