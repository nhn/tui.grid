import Grid from '../src/grid';
import { OptHeader, OptColumn, OptRow } from '../src/types';
import '../src/css/grid.css';
import { HeaderRenderer, ColumnHeaderInfo, HeaderRendererProps } from '../src/renderer/types';

export default {
  title: 'Header'
};

type Options = {
  data?: OptRow[];
  columns?: OptColumn[];
  header?: OptHeader;
};

class CustomRenderer implements HeaderRenderer {
  private el: HTMLElement;

  private columnInfo: ColumnHeaderInfo;

  public constructor(props: HeaderRendererProps) {
    this.columnInfo = props.columnInfo;
    const el = document.createElement('div');

    el.className = 'custom';
    el.textContent = `custom_${this.columnInfo.name}`;
    el.style.fontSize = '18px';
    el.style.fontStyle = 'italic';

    this.el = el;
  }

  public getElement() {
    return this.el;
  }
}

function createGrid(options: Options) {
  const el = document.createElement('div');
  const columns = [{ name: 'name' }, { name: 'artist' }, { name: 'type' }];
  el.style.width = '800px';

  const grid = new Grid({
    el,
    columns,
    ...options
  });

  return { el, grid };
}

export const alignAndVerticalAlign = () => {
  const header: OptHeader = {
    columns: [
      {
        name: 'artist',
        align: 'left',
        valign: 'top'
      },
      {
        name: 'type',
        align: 'right',
        valign: 'bottom'
      }
    ]
  };
  const { el } = createGrid({ header });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);
  rootEl.style.height = '400px';

  return rootEl;
};

export const complexColumnHeader = () => {
  const columns = [
    {
      header: 'Name',
      name: 'name'
    },
    {
      header: 'Artist',
      name: 'artist'
    },
    {
      header: 'Type',
      name: 'type'
    },
    {
      header: 'Release',
      name: 'release'
    },
    {
      header: 'Genre',
      name: 'genre'
    },
    {
      header: 'Price',
      name: 'price'
    },
    {
      header: 'Download',
      name: 'downloadCount'
    },
    {
      header: 'Listen',
      name: 'listenCount'
    }
  ];
  const header = {
    height: 200,
    complexColumns: [
      {
        header: 'Extra',
        name: 'mergeColumn2',
        childNames: ['type', 'release', 'genre']
      },
      {
        header: 'Detail',
        name: 'mergeColumn3',
        childNames: ['mergeColumn6', 'mergeColumn2']
      },
      {
        header: 'Count',
        name: 'mergeColumn4',
        childNames: ['downloadCount', 'listenCount']
      },
      {
        header: 'Album Info',
        name: 'mergeColumn5',
        childNames: ['price', 'mergeColumn3', 'mergeColumn4']
      }
    ]
  };
  const { el } = createGrid({ header, columns });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);
  rootEl.style.height = '400px';

  return rootEl;
};

export const mergedColumnHeader = () => {
  const data = [{ name: 'P.D.A', artist: 'John legend', type: 'Deluxe' }];
  const header = {
    complexColumns: [
      {
        header: 'name',
        name: 'mergeColumn6',
        childNames: ['name', 'artist'],
        hideChildHeaders: true
      }
    ]
  };
  const { el } = createGrid({ data, header });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);
  rootEl.style.height = '400px';

  return rootEl;
};

export const customColumnHeader = () => {
  const header = {
    columns: [
      {
        name: 'name',
        renderer: CustomRenderer
      },
      {
        name: 'artist',
        renderer: CustomRenderer
      },
      {
        name: 'type',
        renderer: CustomRenderer
      }
    ]
  };
  const { el } = createGrid({ header });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);
  rootEl.style.height = '400px';

  return rootEl;
};
