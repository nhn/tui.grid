import { storiesOf } from '@storybook/html';
import { withKnobs, radios } from '@storybook/addon-knobs';
import Grid from '../src/grid';
import '../src/css/grid.css';
import { OptColumn } from '../src/types';

const stories = storiesOf('Theme', module);
stories.addDecorator(withKnobs);

function createGridWithTheme(options) {
  const { preset, extOptions } = options;
  const data = [
    {
      c1: '100013',
      c2: 'Mustafa Cosme',
      c3: 291232
    },
    {
      c1: '201212',
      c2: 'Gunnar Fausto',
      c3: 32123
    },
    {
      c1: '241221',
      c2: 'Junior Morgan',
      c3: 88823
    },
    {
      c1: '991232',
      c2: 'Tódor Ingo',
      c3: 9981
    },
    {
      c1: '299921',
      c2: 'Zezé Obadiah',
      c3: 140212
    },
    {
      c1: '772193',
      c2: 'Alfwin Damir',
      c3: 30012
    },
    {
      c1: '991232',
      c2: 'Feroz Fredrik',
      c3: 111023
    },
    {
      c1: '572812',
      c2: 'Archer Beniamino',
      c3: 229123
    },
    {
      c1: '310832',
      c2: 'Dado Shaul',
      c3: 123
    },
    {
      c1: '321232',
      c2: 'Svetoslav Eder',
      c3: 81252
    },
    {
      c1: '229123',
      c2: 'Lauri Gligor',
      c3: 230923
    },
    {
      c1: '589282',
      c2: 'Ruben Bèr',
      c3: 11523
    },
    {
      c1: '321234',
      c2: 'Vicenç Hadrien',
      c3: 29912
    },
    {
      c1: '632123',
      c2: 'Borna Rochus',
      c3: 62842
    },

    {
      c1: '122123',
      c2: 'Kristijonas Tate',
      c3: 199823
    },
    {
      c1: '211232',
      c2: 'Kumara Archimedes',
      c3: 112522
    },
    {
      c1: '487297',
      c2: 'Hershel Radomil',
      c3: 399123
    },
    {
      c1: '232123',
      c2: 'Toma Levan',
      c3: 231253
    },
    {
      c1: '828723',
      c2: 'Njord Thoko',
      c3: 89123
    }
  ];
  const columns: OptColumn[] = [
    {
      header: 'ID',
      name: 'c1',
      align: 'center',
      editor: 'text'
    },
    {
      header: 'Name',
      defaultValue: 2,
      name: 'c2',
      align: 'center',
      editor: 'text'
    },
    {
      header: 'Score',
      name: 'c3',
      align: 'center',
      editor: 'text'
    }
  ];
  const bodyHeight = 500;
  const el = document.createElement('div');
  el.style.width = '80%';

  const grid = new Grid({
    el,
    data,
    columns,
    bodyHeight,
    rowHeight: 35
  });

  Grid.applyTheme(preset, extOptions);

  return { el, grid };
}

stories.add('preset', () => {
  const condition = radios(
    'theme',
    { default: 'default', striped: 'striped', clean: 'clean' },
    'clean'
  );

  const { el } = createGridWithTheme({ preset: condition });

  return el;
});

stories.add('customTheme', () => {
  const customTheme = {
    grid: {
      background: '#fff',
      border: '#fff',
      text: '#039'
    },
    selection: {
      background: '#86A8E7',
      border: '#5FFBF1'
    },
    toolbar: {
      border: '#ffeba1',
      background: '#fff'
    },
    scrollbar: {
      background: '#fff',
      thumb: '#ccc',
      active: '#D16BA5'
    },
    cell: {
      normal: {
        background: '#e8edff',
        border: '#fff'
      },
      header: {
        background: '#b9c9fe',
        border: '#aabcfe',
        text: '#039'
      },
      editable: {
        background: '#fbfbfb'
      },
      selectedHeader: {
        background: '#d8d8d8'
      },
      focused: {
        border: '#ff9b7d'
      },
      disabled: {
        text: '#b0b0b0'
      },
      evenRow: {
        background: '#fff'
      },
      currentRow: {
        background: '#e0ffe0'
      }
    }
  };

  const { el } = createGridWithTheme({ preset: 'custom', extOptions: customTheme });

  return el;
});
