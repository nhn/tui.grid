import { OptColumn, OptRow, OptHeader } from '../types/options';
import { HeaderRenderer, ColumnHeaderInfo, HeaderRendererProps } from '../types/renderer';
import Grid from '../src/grid';
import '../src/css/grid.css';

export default {
  title: 'Header',
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

  public render(props: HeaderRendererProps) {
    this.columnInfo = props.columnInfo;
    this.el.textContent = `custom_${this.columnInfo.name}`;
  }
}

function createGrid(options: Options) {
  const el = document.createElement('div');
  const columns = [{ name: 'name' }, { name: 'artist' }, { name: 'type' }];
  el.style.width = '800px';

  const grid = new Grid({
    el,
    columns,
    ...options,
  });

  return { el, grid };
}

export const alignAndVerticalAlign = () => {
  const header: OptHeader = {
    columns: [
      {
        name: 'artist',
        align: 'left',
        valign: 'top',
      },
      {
        name: 'type',
        align: 'right',
        valign: 'bottom',
      },
    ],
  };
  const { el } = createGrid({ header });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);
  rootEl.style.height = '400px';

  return rootEl;
};
const alignAndVerticalAlignNote = `
## Header Align and Vertical Align
- It's possible to specify align, valign in each column header
- name
  - align: \`center\`(default)
  - vertical align: \`middle\`(default)
- name
  - align: \`left\`
  - vertical align: \`top\`
- name
  - align: \`right\`
  - vertical align: \`bottom\`
`;

alignAndVerticalAlign.story = { parameters: { notes: alignAndVerticalAlignNote } };

export const complexColumnHeader = () => {
  const columns = [
    {
      header: 'Name',
      name: 'name',
    },
    {
      header: 'Artist',
      name: 'artist',
    },
    {
      header: 'Type',
      name: 'type',
    },
    {
      header: 'Release',
      name: 'release',
    },
    {
      header: 'Genre',
      name: 'genre',
    },
    {
      header: 'Price',
      name: 'price',
    },
    {
      header: 'Download',
      name: 'downloadCount',
    },
    {
      header: 'Listen',
      name: 'listenCount',
    },
  ];
  const header = {
    height: 200,
    complexColumns: [
      {
        header: 'Extra',
        name: 'mergeColumn2',
        childNames: ['type', 'release', 'genre'],
      },
      {
        header: 'Count',
        name: 'mergeColumn4',
        childNames: ['downloadCount', 'listenCount'],
      },
      {
        header: 'Album Info',
        name: 'mergeColumn5',
        childNames: ['price', 'mergeColumn2', 'mergeColumn4'],
      },
    ],
  };
  const { el } = createGrid({ header, columns });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);
  rootEl.style.height = '400px';

  return rootEl;
};
const complexColumnHeaderNote = `
## Complex Column Headers
- Create the merged parent header
- Extra: Parent of \`Type\`, \`Release\`, \`Genre\`
- Count: Parent of \`Download\`, \`Listen\`
- Album Info: Parent of \`Extra\`, \`Price\`, \`Count\`

`;

complexColumnHeader.story = { parameters: { notes: complexColumnHeaderNote } };

export const mergedColumnHeader = () => {
  const data = [{ name: 'P.D.A', artist: 'John legend', type: 'Deluxe' }];
  const header = {
    complexColumns: [
      {
        header: 'name',
        name: 'mergeColumn6',
        childNames: ['name', 'artist'],
        hideChildHeaders: true,
      },
    ],
  };
  const { el } = createGrid({ data, header });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);
  rootEl.style.height = '400px';

  return rootEl;
};
const mergedColumnHeaderNote = `
## Merged Column Header
- Merge the column headers without creating merged parent header
- UI for displaying the seperated data in one column header
- name: merged \`name\` and \`artist\`
`;

mergedColumnHeader.story = { parameters: { notes: mergedColumnHeaderNote } };

export const customColumnHeader = () => {
  const header: OptHeader = {
    columns: [
      {
        name: 'name',
        renderer: CustomRenderer,
      },
      {
        name: 'artist',
        renderer: CustomRenderer,
      },
      {
        name: 'type',
        renderer: CustomRenderer,
      },
    ],
  };
  const { el } = createGrid({ header });
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);
  rootEl.style.height = '400px';

  return rootEl;
};
const customColumnHeaderNote = `
## Custom Column Header
- Customizing the column header
`;

customColumnHeader.story = { parameters: { notes: customColumnHeaderNote } };
