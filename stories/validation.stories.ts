import { storiesOf } from '@storybook/html';
import { withKnobs, button } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/basic';

import '../src/css/grid.css';

const stories = storiesOf('Validation', module);
stories.addDecorator(withKnobs);

function alertObjectToJson(obj: object, useSpace?: boolean) {
  alert(JSON.stringify(obj, null, useSpace ? '\t' : null));
}

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, bodyHeight: 300, ...options });

  return { el, grid };
}

stories.add(
  'validate value required',
  () => {
    const { el, grid } = createGrid({
      data,
      columns: [
        { name: 'name', validation: { required: true } },
        { name: 'artist', validation: { required: false } },
        { name: 'downloadCount' },
        { name: 'listenCount' }
      ]
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);

    button(`setValue(0, 'name', '')`, () => grid.setValue(0, 'name', ''));
    button(`setValue(0, 'artist', '')`, () => grid.setValue(0, 'artist', ''));

    button(`setValue(2, 'name', '')`, () => grid.setValue(2, 'name', ''));
    button(`setValue(2, 'artist', '')`, () => grid.setValue(2, 'artist', ''));

    button('validate()', () => alertObjectToJson(grid.validate(), true));

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'validate string data type',
  () => {
    const { el, grid } = createGrid({
      data,
      columns: [
        { name: 'name', validation: { dataType: 'string' } },
        { name: 'artist', validation: { required: true, dataType: 'string' } },
        { name: 'downloadCount' },
        { name: 'listenCount' }
      ]
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);

    button(`setValue(0, 'name', 'foo')`, () => grid.setValue(0, 'name', 'foo'));
    button(`setValue(0, 'name', '100')`, () => grid.setValue(0, 'name', '100'));
    button(`setValue(0, 'name', 10)`, () => grid.setValue(0, 'name', 10));
    button(`setValue(0, 'name', false)`, () => grid.setValue(0, 'name', false));

    button(`setValue(2, 'artist', 'foo')`, () => grid.setValue(2, 'artist', 'foo'));
    button(`setValue(2, 'artist', '100')`, () => grid.setValue(2, 'artist', '100'));
    button(`setValue(2, 'artist', 10)`, () => grid.setValue(2, 'artist', 10));
    button(`setValue(2, 'artist', false)`, () => grid.setValue(2, 'artist', false));

    button('validate()', () => alertObjectToJson(grid.validate(), true));

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'validate number type',
  () => {
    const { el, grid } = createGrid({
      data,
      columns: [
        { name: 'name' },
        { name: 'artist' },
        { name: 'downloadCount', validation: { dataType: 'number' } },
        { name: 'listenCount', validation: { required: true, dataType: 'number' } }
      ]
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);

    button(`setValue(0, 'downloadCount', 'foo')`, () => grid.setValue(0, 'downloadCount', 'foo'));
    button(`setValue(0, 'downloadCount', '100')`, () => grid.setValue(0, 'downloadCount', '100'));
    button(`setValue(0, 'downloadCount', 10)`, () => grid.setValue(0, 'downloadCount', 10));
    button(`setValue(0, 'downloadCount', false)`, () => grid.setValue(0, 'downloadCount', false));

    button(`setValue(2, 'listenCount', 'foo')`, () => grid.setValue(2, 'listenCount', 'foo'));
    button(`setValue(2, 'listenCount', '100')`, () => grid.setValue(2, 'listenCount', '100'));
    button(`setValue(2, 'listenCount', 10)`, () => grid.setValue(2, 'listenCount', 10));
    button(`setValue(2, 'listenCount', false)`, () => grid.setValue(2, 'listenCount', false));

    button('validate()', () => alertObjectToJson(grid.validate(), true));

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);

stories.add(
  'use editor',
  () => {
    const { el, grid } = createGrid({
      data,
      columns: [
        { name: 'name', editor: 'text', validation: { required: true } },
        { name: 'artist', editor: 'text', validation: { dataType: 'string' } },
        { name: 'downloadCount', editor: 'text', validation: { dataType: 'number' } },
        { name: 'listenCount' }
      ]
    });
    const rootEl = document.createElement('div');
    rootEl.appendChild(el);

    button('validate()', () => alertObjectToJson(grid.validate(), true));

    return rootEl;
  },
  { html: { preventForcedRender: true } }
);
