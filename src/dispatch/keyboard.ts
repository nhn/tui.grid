import { Store, Column, Side } from '../store/types';
import { clamp } from '../helper/common';

const keyNameMap = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  17: 'ctrl',
  27: 'esc',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  65: 'a',
  67: 'c',
  86: 'v',
  32: 'space',
  33: 'pageUp',
  34: 'pageDown',
  36: 'home',
  35: 'end',
  46: 'del'
};

const keyboardEventTypeMap = {
  move: 'move',
  edit: 'edit',
  remove: 'remove',
  select: 'select',
  clipboard: 'clipboard'
};

const keyboardEventCommandMap = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  pageUp: 'pageUp',
  pageDown: 'pageDown',
  firstColumn: 'firstColumn',
  lastColumn: 'lastColumn',
  currentCell: 'currentCell',
  nextCell: 'nextCell',
  prevCell: 'prevCell',
  firstCell: 'firstCell',
  lastCell: 'lastCell',
  all: 'all',
  copy: 'copy',
  paste: 'paste'
};

/**
 * K-V object for matching keystroke and event command
 * K: keystroke (order : ctrl -> shift -> keyName)
 * V: [key event type, command]
 * @type {Object}
 * @ignore
 */
const keyStrokeCommandMap: {
  [key: string]: [KeyboardEventType] | [KeyboardEventType, KeyboardEventCommandType];
} = {
  up: ['move', 'up'],
  down: ['move', 'down'],
  left: ['move', 'left'],
  right: ['move', 'right'],
  pageUp: ['move', 'pageUp'],
  pageDown: ['move', 'pageDown'],
  home: ['move', 'firstColumn'],
  end: ['move', 'lastColumn'],
  enter: ['edit', 'currentCell'],
  space: ['edit', 'currentCell'],
  tab: ['edit', 'nextCell'],
  backspace: ['remove'],
  del: ['remove'],
  'shift-tab': ['edit', 'prevCell'],
  'shift-up': ['select', 'up'],
  'shift-down': ['select', 'down'],
  'shift-left': ['select', 'left'],
  'shift-right': ['select', 'right'],
  'shift-pageUp': ['select', 'pageUp'],
  'shift-pageDown': ['select', 'pageDown'],
  'shift-home': ['select', 'firstColumn'],
  'shift-end': ['select', 'lastColumn'],
  'ctrl-a': ['select', 'all'],
  'ctrl-c': ['clipboard', 'copy'],
  'ctrl-v': ['clipboard', 'paste'],
  'ctrl-home': ['move', 'firstCell'],
  'ctrl-end': ['move', 'lastCell'],
  'ctrl-shift-home': ['select', 'firstCell'],
  'ctrl-shift-end': ['select', 'lastCell']
};

type KeyCodeType = keyof typeof keyNameMap;
type KeyStrokeCommandType = keyof typeof keyStrokeCommandMap;
export type KeyboardEventType = keyof (typeof keyboardEventTypeMap);
export type KeyboardEventCommandType = keyof (typeof keyboardEventCommandMap);

/**
 * Returns the keyStroke string
 * @param {Event} ev - Keyboard event
 * @returns {String}
 * @ignore
 */
function getKeyStrokeString(ev: KeyboardEvent) {
  const keys = [];
  const keyCode = ev.keyCode as KeyCodeType;

  if (ev.ctrlKey || ev.metaKey) {
    keys.push('ctrl');
  }
  if (ev.shiftKey) {
    keys.push('shift');
  }
  keys.push(keyNameMap[keyCode]);

  return keys.join('-');
}

export function keyEventGenerate(ev: KeyboardEvent) {
  const keyStroke = getKeyStrokeString(ev) as KeyStrokeCommandType;
  const commandInfo = keyStrokeCommandMap[keyStroke];
  let keyEvent;

  if (commandInfo) {
    keyEvent = {
      type: commandInfo[0],
      command: commandInfo[1]
    };
  }

  return keyEvent;
}

function indexOfColumnName(columnName: string, side: Side, { visibleColumns }: Column) {
  let index = visibleColumns[side].findIndex((col) => col.title === columnName);

  if (side === 'R') {
    index += visibleColumns.L.length;
  }

  return index;
}

function getVisibleColumnNames({ visibleColumns }: Column) {
  return [...visibleColumns.L, ...visibleColumns.R];
}

function isValidRowKeyRange(rowKey: number, viewDataLength: number) {
  return rowKey < 0 || rowKey > viewDataLength - 1;
}

function findRowKey({ focus, data }: Store, offset: number) {
  const curRowKey = focus.rowKey!;
  let rowKey = curRowKey + offset;

  if (isValidRowKeyRange(rowKey, data.viewData.length)) {
    rowKey = curRowKey!;
  }

  return rowKey;
}

function findOffsetIndex(store: Store, position: number) {
  const {
    rowCoords: { offsets },
    dimension: { cellBorderWidth }
  } = store;

  position += cellBorderWidth * 2;

  return offsets.findIndex((offset) => offset - cellBorderWidth > position) - 1;
}

function getPageMovedIndex(store: Store, isPrevDir: boolean) {
  const {
    focus: { rowIndex },
    data: { viewData },
    rowCoords: { offsets }
  } = store;
  let {
    dimension: { bodyHeight }
  } = store;

  if (isPrevDir) {
    bodyHeight = -bodyHeight;
  }

  const movedIndex = findOffsetIndex(store, offsets[rowIndex!] + bodyHeight);

  return clamp(movedIndex, 0, viewData.length - 1);
}

function getPageMovedRowKey(store: Store, isPrevDir: boolean) {
  const {
    focus: { rowIndex }
  } = store;

  const prevPageRowIndex = getPageMovedIndex(store, isPrevDir);
  const offset = prevPageRowIndex - rowIndex!;

  return findRowKey(store, offset);
}

function prevRowKey(store: Store) {
  return findRowKey(store, -1);
}

function nextRowKey(store: Store) {
  return findRowKey(store, 1);
}

function firstRowKey() {
  return 0;
}

function lastRowKey({ data: { viewData } }: Store) {
  return viewData.length - 1;
}

function prevPageMovedRowKey(store: Store) {
  return getPageMovedRowKey(store, true);
}

function nextPageMovedRowKey(store: Store) {
  return getPageMovedRowKey(store, false);
}

function isValidColumnRange(columnIndex: number, columnLength: number) {
  return columnIndex < 0 || columnIndex > columnLength - 1;
}

function findColumnName({ focus, column }: Store, offset: number) {
  const { columnName, side } = focus;
  const curColumnIndex = indexOfColumnName(columnName!, side!, column);
  const visibleColumnNames = getVisibleColumnNames(column);
  let columnIndex = curColumnIndex + offset;

  if (isValidColumnRange(columnIndex, visibleColumnNames.length)) {
    columnIndex = curColumnIndex;
  }

  return visibleColumnNames[columnIndex].title;
}

function prevColumnName(store: Store) {
  return findColumnName(store, -1);
}

function nextColumnName(store: Store) {
  return findColumnName(store, 1);
}

function firstColumnName({ column }: Store) {
  return getVisibleColumnNames(column)[0].title;
}

function lastColumnName({ column }: Store) {
  const visibleColumnNames = getVisibleColumnNames(column);

  return visibleColumnNames[visibleColumnNames.length - 1].title;
}

export function moveFocus(store: Store, command: KeyboardEventCommandType) {
  const { focus } = store;

  let rowKey = focus.rowKey!;
  let columnName = focus.columnName!;

  switch (command) {
    case 'up':
      rowKey = prevRowKey(store);
      break;
    case 'down':
      rowKey = nextRowKey(store);
      break;
    case 'left':
      columnName = prevColumnName(store);
      break;
    case 'right':
      columnName = nextColumnName(store);
      break;
    case 'firstCell':
      columnName = firstColumnName(store);
      rowKey = firstRowKey();
      break;
    case 'lastCell':
      columnName = lastColumnName(store);
      rowKey = lastRowKey(store);
      break;
    case 'pageUp':
      rowKey = prevPageMovedRowKey(store);
      break;
    case 'pageDown':
      rowKey = nextPageMovedRowKey(store);
      break;
    case 'firstColumn':
      columnName = firstColumnName(store);
      break;
    case 'lastColumn':
      columnName = lastColumnName(store);
      break;
    default:
      break;
  }

  focus.rowKey = rowKey;
  focus.columnName = columnName;
}

export function editFocus(store: Store, command: KeyboardEventCommandType) {
  console.log(store, command);
}

export function selectFocus(store: Store, command: KeyboardEventCommandType) {
  console.log(store, command);
}

export function removeFocus(store: Store) {
  console.log(store);
}
