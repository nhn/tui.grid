import { Dictionary } from '@t/options';
import { ListItem } from '@t/store/column';

export const twoDepthData: Dictionary<ListItem[]> = {
  '01': [
    { text: '', value: '' },
    { text: 'Balad/Dance/Pop', value: '01_01' },
    { text: 'Hiphop/R&B', value: '01_02' },
    { text: 'Indie', value: '01_03' },
  ],
  '02': [
    { text: '', value: '' },
    { text: 'Pop', value: '02_01' },
    { text: 'Hiphop', value: '02_02' },
    { text: 'R&B', value: '02_03' },
  ],
  '03': [
    { text: '', value: '' },
    { text: 'OST', value: '03_01' },
    { text: 'Classic', value: '03_02' },
    { text: 'New Age', value: '03_03' },
  ],
};

export const threeDepthData: Dictionary<ListItem[]> = {
  '01_01': [
    { text: '', value: '' },
    { text: 'I Miss You', value: '01_01_0001' },
    { text: 'Russian Roulette', value: '01_01_0002' },
    { text: 'TT', value: '01_01_0003' },
    { text: 'Beautiful', value: '01_01_0004' },
    { text: 'KNOCK KNOCK', value: '01_01_0005' },
    { text: 'Rookie', value: '01_01_0006' },
    { text: 'Round And Round', value: '01_01_0007' },
  ],
  '01_02': [
    { text: '', value: '' },
    { text: 'BERMUDA TRIANGLE', value: '01_02_0001' },
    { text: 'Day Day', value: '01_02_0002' },
    { text: 'Bye bye my blue', value: '01_02_0003' },
    { text: 'Comedian', value: '01_02_0004' },
    { text: 'what2do', value: '01_02_0005' },
    { text: 'Bye bye my blue', value: '01_02_0006' },
    { text: 'I NEED U', value: '01_02_0007' },
  ],
  '01_03': [
    { text: '', value: '' },
    { text: 'Madeleine Love', value: '01_03_0001' },
    { text: 'Mood Indigo', value: '01_03_0002' },
    { text: "I Don't Wanna Love You", value: '01_03_0003' },
    { text: 'Come Back Home', value: '01_03_0004' },
    { text: 'MONSTER', value: '01_03_0005' },
    { text: 'Free Somebody', value: '01_03_0006' },
    { text: 'Vineyard', value: '01_03_0007' },
  ],
  '02_01': [
    { text: '', value: '' },
    { text: 'Cave Me In', value: '02_01_0001' },
    { text: 'Hello', value: '02_01_0002' },
    { text: 'When We Were Young', value: '02_01_0003' },
    { text: 'Stay With Me', value: '02_01_0004' },
    { text: "I'm Not The Only One", value: '02_01_0005' },
    { text: 'Youth', value: '02_01_0006' },
    { text: 'Love On Top', value: '02_01_0007' },
  ],
  '02_02': [
    { text: '', value: '' },
    { text: 'Love The Way You Lie', value: '02_02_0001' },
    { text: 'Flower Dance', value: '02_02_0002' },
    { text: 'I Feel It Coming', value: '02_02_0003' },
    { text: 'Love The Way You Lie', value: '02_02_0004' },
    { text: 'I Feel It Coming', value: '02_02_0005' },
    { text: 'GDFR', value: '02_02_0006' },
    { text: 'Love Me In Everything', value: '02_02_0007' },
  ],
  '02_03': [
    { text: '', value: '' },
    { text: 'Marry You', value: '02_03_0001' },
    { text: 'Hello', value: '02_03_0002' },
    { text: 'Coastal Love', value: '02_03_0003' },
    { text: 'Happy', value: '02_03_0004' },
    { text: 'If You Wonder', value: '02_03_0005' },
    { text: 'Want To Want Me', value: '02_03_0006' },
    { text: 'Get Lucky', value: '02_03_0007' },
  ],
  '03_01': [
    { text: '', value: '' },
    { text: 'City Of Stars', value: '03_01_0001' },
    { text: 'You Are My Everything', value: '03_01_0002' },
    { text: 'Summer Montage / Madeline', value: '03_01_0003' },
    { text: 'Memory', value: '03_01_0004' },
    { text: 'A Lovely Night', value: '03_01_0005' },
  ],
  '03_02': [
    { text: '', value: '' },
    { text: 'Ravel: Pavane Pour Une Infant Defunte', value: '03_02_0001' },
    { text: 'Elgar: Salut D`amour', value: '03_02_0002' },
    { text: 'Refuse', value: '03_02_0003' },
    { text: 'Liebestraume S541: No. 3 in A flat', value: '03_02_0004' },
    { text: 'Three Romances Op94: nr 2 in A', value: '03_02_0005' },
  ],
  '03_03': [
    { text: '', value: '' },
    { text: 'Kiss The Rain', value: '03_03_0001' },
    { text: 'Blind Film', value: '03_03_0002' },
    { text: 'Merry Christmas Mr.Lawrence', value: '03_03_0003' },
    { text: 'After The Play', value: '03_03_0004' },
    { text: 'River Flows In You', value: '03_03_0005' },
  ],
};

export const data = [
  // initial data
  {
    category1: '',
    category2: '',
    category3: '',
    category4: '',
  },
  {
    category1: '02',
    category2: '02_03',
    category3: '02_03_0001',
    category4: '01',
  },
  {
    category1: '03',
    category2: '03_01',
    category3: '03_01_0001',
    category4: '02',
  },
];

export const orderedRelationColumns = [
  {
    header: 'Category1',
    name: 'category1',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [
          { text: '', value: '' },
          { text: 'Domestic', value: '01' },
          { text: 'Overseas', value: '02' },
          { text: 'Etc', value: '03' },
        ],
      },
    },
    relations: [
      {
        targetNames: ['category2'],
        listItems({ value }: { value: string }) {
          return twoDepthData[value];
        },
        editable({ value }: { value: string }) {
          return value !== '01';
        },
        disabled({ value }: { value: string }) {
          return !value;
        },
      },
    ],
  },
  {
    header: 'Category2',
    name: 'category2',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [],
      },
    },
    relations: [
      {
        targetNames: ['category3'],
        listItems({ value }: { value: string }) {
          return threeDepthData[value];
        },
        editable({ value }: { value: string }) {
          return value !== '01_02';
        },
        disabled({ value }: { value: string }) {
          return !value;
        },
      },
    ],
  },
  {
    header: 'Category3',
    name: 'category3',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [],
      },
    },
  },
  {
    header: 'No relation',
    name: 'category4',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [
          { text: 'Select', value: '' },
          { text: 'no', value: '01' },
          { text: 'relation', value: '02' },
        ],
      },
    },
  },
];

export const unorderedRelationColumns1 = [
  {
    header: 'Category2',
    name: 'category2',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [],
      },
    },
    relations: [
      {
        targetNames: ['category3'],
        listItems({ value }: { value: string }) {
          return threeDepthData[value];
        },
        editable({ value }: { value: string }) {
          return value !== '01_02';
        },
        disabled({ value }: { value: string }) {
          return !value;
        },
      },
    ],
  },
  {
    header: 'Category1',
    name: 'category1',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [
          { text: '', value: '' },
          { text: 'Domestic', value: '01' },
          { text: 'Overseas', value: '02' },
          { text: 'Etc', value: '03' },
        ],
      },
    },
    relations: [
      {
        targetNames: ['category2'],
        listItems({ value }: { value: string }) {
          return twoDepthData[value];
        },
        editable({ value }: { value: string }) {
          return value !== '01';
        },
        disabled({ value }: { value: string }) {
          return !value;
        },
      },
    ],
  },
  {
    header: 'No relation',
    name: 'category4',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [
          { text: 'Select', value: '' },
          { text: 'no', value: '01' },
          { text: 'relation', value: '02' },
        ],
      },
    },
  },
  {
    header: 'Category3',
    name: 'category3',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [],
      },
    },
  },
];

export const unorderedRelationColumns2 = [
  {
    header: 'Category2',
    name: 'category2',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [],
      },
    },
    relations: [
      {
        targetNames: ['category3'],
        listItems({ value }: { value: string }) {
          return threeDepthData[value];
        },
        editable({ value }: { value: string }) {
          return value !== '01_02';
        },
        disabled({ value }: { value: string }) {
          return !value;
        },
      },
    ],
  },
  {
    header: 'No relation',
    name: 'category4',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [
          { text: 'Select', value: '' },
          { text: 'no', value: '01' },
          { text: 'relation', value: '02' },
        ],
      },
    },
  },
  {
    header: 'Category3',
    name: 'category3',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [],
      },
    },
  },
  {
    header: 'Category1',
    name: 'category1',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: [
          { text: '', value: '' },
          { text: 'Domestic', value: '01' },
          { text: 'Overseas', value: '02' },
          { text: 'Etc', value: '03' },
        ],
      },
    },
    relations: [
      {
        targetNames: ['category2'],
        listItems({ value }: { value: string }) {
          return twoDepthData[value];
        },
        editable({ value }: { value: string }) {
          return value !== '01';
        },
        disabled({ value }: { value: string }) {
          return !value;
        },
      },
    ],
  },
];
