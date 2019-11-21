import Grid from '../src/grid';
import '../src/css/grid.css';

export default {
  title: 'Focus'
};

function blur(el: HTMLElement) {
  setTimeout(() => {
    (el.querySelector('.tui-grid-clipboard') as HTMLElement).focus();
    (el.querySelector('.tui-grid-clipboard') as HTMLElement).blur();
  });
}

const data = [
  { name: 'Beautiful Lies', artist: 'Birdy', type: 'Deluxe' },
  { name: 'X', artist: 'Ed Sheeran', type: 'Deluxe' },
  {
    name: 'Moves Like Jagger',
    artist: 'Maroon5',
    type: 'Single'
  }
];
const columns = [{ name: 'name' }, { name: 'artist' }, { name: 'type' }];

function createGrid() {
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({ el, data, columns });

  return { el, grid };
}

export const activeFocus = () => {
  const { el, grid } = createGrid();
  grid.focusAt(2, 2);
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);
  rootEl.style.height = '400px';

  return rootEl;
};

export const inactiveFocus = () => {
  const { el, grid } = createGrid();
  const rootEl = document.createElement('div');

  rootEl.appendChild(el);

  grid.focusAt(2, 2);
  blur(el);

  return rootEl;
};
