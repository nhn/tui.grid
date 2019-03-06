import { storiesOf } from '@storybook/html';
import Grid from '../src/grid';

const stories = storiesOf('TOAST UI Grid', module);

stories.add('Basic Usage', () => {
  const el = document.createElement('div');
  const data = [
    {
      id: 1,
      name: 'Beautiful Lies',
      artist: 'Birdy',
      release: '2016.03.26',
      type: 'Deluxe'
    },
    {
      id: 2,
      name: 'X',
      artist: 'Ed Sheeran',
      release: '2014.06.24',
      type: 'Deluxe'
    },
    {
      id: 3,
      name: '21',
      artist: 'Adele',
      release: '2011.01.21',
      type: 'Deluxe'
    }
  ];
  const columns = [
    {
      title: "Name",
      name: "name",
    },
    {
      title: "Artist",
      name: "artist",
    },
    {
      title: "Type",
      name: "type",
    },
    {
      title: "Release",
      name: "release"
    },
    {
      title: "Genre",
      name: "genre"
    }
  ];

  const grid = new Grid({ el, data, columns });

  return el;
});
