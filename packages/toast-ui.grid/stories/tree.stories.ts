import Grid from '../src/grid';

import '../src/css/grid.css';

export default {
  title: 'Tree',
};

function createGrid() {
  const columns = [{ name: 'name' }, { name: 'artist' }];
  const data = [
    {
      name: 'Beautiful Lies',
      artist: 'Birdy',
      _attributes: {
        expanded: true,
      },
      _children: [
        {
          name: 'Blue Skies',
          artist: 'Lenka',
          _children: [],
        },
        {
          name: 'Chaos And The Calm',
          artist: 'James Bay',
          _attributes: {
            expanded: true,
          },
          _children: [
            {
              name: "I'm Not The Only One",
              artist: 'Sam Smith',
              _children: [
                {
                  id: 587871,
                  name: 'This Is Acting',
                  artist: 'Sia',
                  release: '2016.10.22',
                  type: 'EP',
                  typeCode: '2',
                  genre: 'Pop',
                  genreCode: '1',
                  grade: '3',
                  price: 20000,
                  downloadCount: 1000,
                  listenCount: 5000,
                },
                {
                  name: 'Following My Intuition',
                  artist: 'Craig David',
                },
              ],
            },
          ],
        },
        {
          name: 'The Magic Whip',
          artist: 'Blur',
        },
        {
          name: 'Blurryface',
          artist: 'Twenty One Pilots',
        },
      ],
    },
    {
      name: 'X',
      artist: 'Ed Sheeran',
    },
    {
      name: 'Moves Like Jagger',
      artist: 'Maroon5',
    },
  ];
  const el = document.createElement('div');
  el.style.width = '800px';

  const grid = new Grid({
    el,
    data,
    columns,
    treeColumnOptions: {
      name: 'name',
      useCascadingCheckbox: true,
    },
  });

  return { el, grid };
}

export const treeIcon = () => {
  const { el, grid } = createGrid();
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  grid.collapseAll();

  return rootEl;
};

const treeIconNote = `
## Tree Icon

- If child tree exists, row has a \`folder\` icon, otherwise it has a \`file\` icon.
`;
treeIcon.story = { parameters: { notes: treeIconNote } };

export const expandedAndCollapsed = () => {
  const { el } = createGrid();
  const rootEl = document.createElement('div');
  rootEl.appendChild(el);

  return rootEl;
};

const expandedAndCollapsedNote = `
## Expanded, Collpased Tree Node

- Expanded Tree Node
  - The folder icon is displayed as an \`opened\` and arrow icon points \`downward\` direction.
- Collpased Tree Node
  - The folder icon is displayed as a \`closed\` and arrow icon points \`rightward\` direction.
- The indentation is added for children nodes
`;
expandedAndCollapsed.story = { parameters: { notes: expandedAndCollapsedNote } };
