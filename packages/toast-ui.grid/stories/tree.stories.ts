import Grid from '../src/grid';
import { OptGrid } from '../src/types';
import { Omit } from 'utility-types';
import { data } from '../samples/tree';

import '../src/css/grid.css';

export default {
  title: 'tree'
};

const columns = [{ name: 'name' }, { name: 'artist' }];

function createGrid(options: Omit<OptGrid, 'el'>) {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, bodyHeight: 400, ...options });

  return { el, grid };
}

function clickCheckbox() {
  setTimeout(() => {
    const input = document.querySelectorAll('[data-column-name=_checked] input')[3] as HTMLElement;
    input.click();
  });
}

export const basic = () => {
  const { el } = createGrid({
    data,
    columns,
    rowHeaders: ['rowNum', 'checkbox'],
    treeColumnOptions: {
      name: 'name',
      useCascadingCheckbox: true
    }
  });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  clickCheckbox();

  return rootEl;
};

const basicNote = `
## Tree

- If child tree exists, row has a \`folder\` icon, otherwise it has a \`file\` icon.
- If the folder tree is open, the icon looks like an open folder. 
`;
basic.story = { parameters: { notes: basicNote } };
