import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/tree';

import '../src/css/grid.css';

const stories = storiesOf('Tree', module);
stories.addDecorator(withKnobs);

const columns = [
  {
    name: 'name',
    editor: 'text',
    _attribute: {
      expanded: false
    }
  },
  { name: 'artist' },
  { name: 'type' }
];

function alertObjectToJson(obj: object, useSpace?: boolean) {
  alert(JSON.stringify(obj, null, useSpace ? '\t' : null));
}

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, bodyHeight: 400, ...options });

  return { el, grid };
}

stories.add(
  'tree column',
  () => {
    const { el, grid } = createGrid({
      data,
      columns,
      rowHeaders: ['_number'],
      treeColumnOptions: {
        name: 'name'
      }
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);

    button(`expand(2)`, () => grid.expand(2));
    button(`collapse(2)`, () => grid.collapse(2));

    button(`expand(2, true)`, () => grid.expand(2, true));
    button(`collapse(2, true)`, () => grid.collapse(2, true));

    button(`expandAll`, () => grid.expandAll());
    button(`collapseAll`, () => grid.collapseAll());

    button(`getDepth(3)`, () => alert(grid.getDepth(3)));

    button(`getAncestorRows(3)`, () => alertObjectToJson(grid.getAncestorRows(3), true));
    button(`getDecendentRows(0)`, () => alertObjectToJson(grid.getDecendentRows(0), true));
    button(`getParentRow(2)`, () => alertObjectToJson(grid.getParentRow(2), true));
    button(`getChildRows(0)`, () => alertObjectToJson(grid.getChildRows(0), true));

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
