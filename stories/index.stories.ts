import { storiesOf } from '@storybook/html';
import Grid from '../src/grid';
import '../src/css/grid.css';
import '../src/css/theme.css';

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
    {
      title: "Name",
      name: "name",
      width: 100
    },
    {
      title: "Artist",
      name: "artist",
      width: 100
    },
    {
      title: "Type",
      name: "type",
      width: 100
    },
    {
      title: "Release",
      name: "release",
      width: 100
    },
    {
      title: "Genre",
      name: "genre",
      width: 100
    }
  ];
  const width = 800;
  const bodyHeight = 500;

  const grid = new Grid({ el, data, columns, width, bodyHeight });

  return el;
});

