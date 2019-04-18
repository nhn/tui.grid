import { storiesOf } from '@storybook/html';
import Grid from '../src/grid';
import '../src/css/grid.css';

const stories = storiesOf('Basic Usage', module);

stories.add('Simple', () => {
  const el = document.createElement('div');
  const data = [
    {
      id: 1,
      name: 'Beautiful Lies',
      artist: 'Birdy',
      release: '2016.03.26',
      type: 'Deluxe',
      genre: 'Pop'
    },
    {
      id: 2,
      name: 'X',
      artist: 'Ed Sheeran',
      release: '2014.06.24',
      type: 'Deluxe',
      genre: 'Pop'
    },
    {
      id: 3,
      name: '21',
      artist: 'Adele',
      release: '2011.01.21',
      type: 'Deluxe',
      genre: 'Pop'
    }
  ];

  const columns = [
    { name: 'name' },
    { name: 'artist' },
    { name: 'type' },
    { name: 'release' },
    { name: 'genre' }
  ];
  const bodyHeight = 500;
  el.style.width = '80%';

  new Grid({ el, data, columns, bodyHeight });

  return el;
});
