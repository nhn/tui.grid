import { deepMergedCopy } from '../helper/common';

export const presetDefault = {
  selection: {
    background: '#00A9ff',
    border: '#00a9ff',
  },
  heightResizeHandle: {
    border: '#fff',
    background: '#fff',
  },
  pagination: {
    border: 'transparent',
    background: 'transparent',
  },
  scrollbar: {
    border: '#eee',
    background: '#fff',
    emptySpace: '#f9f9f9',
    thumb: '#ddd',
    active: '#ddd',
  },
  outline: {
    border: '#aaa',
    showVerticalBorder: false,
  },
  frozenBorder: {
    border: '#aaa',
  },
  area: {
    header: {
      border: '#ccc',
      background: '#fff',
    },
    body: {
      background: '#fff',
    },
    summary: {
      border: '#eee',
      background: '#fff',
    },
  },
  cell: {
    normal: {
      background: '#f4f4f4',
      border: '#eee',
      text: '#333',
      showVerticalBorder: false,
      showHorizontalBorder: true,
    },
    header: {
      background: '#fff',
      border: '#eee',
      text: '#222',
      showVerticalBorder: true,
      showHorizontalBorder: true,
    },
    rowHeader: {
      background: '#fff',
      border: '#eee',
      text: '#333',
      showVerticalBorder: false,
      showHorizontalBorder: true,
    },
    summary: {
      background: '#fff',
      border: '#eee',
      text: '#333',
      showVerticalBorder: false,
    },
    selectedHeader: {
      background: '#e5f6ff',
    },
    selectedRowHeader: {
      background: '#e5f6ff',
    },
    focused: {
      border: '#00a9ff',
    },
    focusedInactive: {
      border: '#aaa',
    },
    required: {
      background: '#fffdeb',
    },
    editable: {
      background: '#fff',
    },
    disabled: {
      background: '#f9f9f9',
      text: '#c1c1c1',
    },
    dummy: {
      background: '#fff',
    },
    invalid: {
      background: '#ffe5e5',
    },
    evenRow: {},
    oddRow: {},
    currentRow: {},
  },
  rowHover: {
    background: 'none',
  },
};

export const clean = deepMergedCopy(presetDefault, {
  outline: {
    border: '#eee',
    showVerticalBorder: false,
  },
  frozenBorder: {
    border: '#ddd',
  },
  area: {
    header: {
      border: '#eee',
      background: '#f9f9f9',
    },
    body: {
      background: '#fff',
    },
    summary: {
      border: '#fff',
      background: '#fff',
    },
  },
  cell: {
    normal: {
      background: '#fff',
      border: '#eee',
      showVerticalBorder: false,
      showHorizontalBorder: false,
    },
    header: {
      background: '#f9f9f9',
      border: '#eee',
      showVerticalBorder: true,
      showHorizontalBorder: true,
    },
    rowHeader: {
      border: '#eee',
      showVerticalBorder: false,
      showHorizontalBorder: false,
    },
  },
});

export const striped = deepMergedCopy(presetDefault, {
  outline: {
    border: '#eee',
    showVerticalBorder: false,
  },
  frozenBorder: {
    border: '#ccc',
  },
  area: {
    header: {
      border: '#fff',
      background: '#eee',
    },
    body: {
      background: '#fff',
    },
    summary: {
      border: '#fff',
      background: '#fff',
    },
  },
  cell: {
    normal: {
      background: '#fff',
      border: '#fff',
      showVerticalBorder: false,
      showHorizontalBorder: false,
    },
    header: {
      background: '#eee',
      border: '#fff',
      showVerticalBorder: true,
      showHorizontalBorder: true,
    },
    rowHeader: {
      border: '#fff',
      showVerticalBorder: false,
      showHorizontalBorder: false,
    },
    oddRow: {
      background: '#fff',
    },
    evenRow: {
      background: '#f4f4f4',
    },
  },
});
