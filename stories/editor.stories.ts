import { storiesOf } from '@storybook/html';
import Grid from '../src/grid';
import { data } from '../samples/basic';
import '../src/css/grid.css';

const stories = storiesOf('Cell Editor', module);

function createGrid(options: any) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, ...options });
  return { el, grid };
}

const columns = [{ name: 'name' }, { name: 'artist' }, { name: 'type' }];

stories.add('Text', () => {
  const { el } = createGrid({
    data,
    columns: columns.map((col) => ({
      ...col,
      editor: 'text'
    })),
    bodyHeight: 400
  });

  return el;
});
