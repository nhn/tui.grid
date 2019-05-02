import { Store, Row, Side, VisibleColumns } from '../store/types';
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

// @TODO: 현재는 전부 FOCUS가 존재한다는 가정하에 이동되고 있음. FOCUS가 없을 떄 Grid에서 이벤트가 발생할 경우 대비 필요

interface ColumnInfo {
  columnName: string | null;
  side: Side | null;
  visibleColumns: VisibleColumns;
}

interface PageInfo {
  rowKey: number | null;
  rowIndex: number | null;
  offsets: number[];
  viewData: Row[];
  cellBorderWidth: number;
  bodyHeight: number;
}

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

function indexOfColumnName(columnName: string, side: Side, visibleColumns: VisibleColumns) {
  let index = visibleColumns[side].findIndex((col) => col.name === columnName);

  if (side === 'R') {
    index += visibleColumns.L.length;
  }

  return index;
}

export function getVisibleColumnNames(visibleColumns: VisibleColumns) {
  return [...visibleColumns.L, ...visibleColumns.R];
}

function isValidRowKeyRange(rowKey: number, viewDataLength: number) {
  return rowKey < 0 || rowKey > viewDataLength - 1;
}

function findRowKey(rowKey: number, viewDataLen: number, offset: number) {
  let newKey = rowKey! + offset;

  if (isValidRowKeyRange(newKey, viewDataLen)) {
    newKey = rowKey;
  }

  return newKey;
}

function findOffsetIndex(offsets: number[], cellBorderWidth: number, position: number) {
  position += cellBorderWidth * 2;

  const idx = offsets.findIndex((offset) => offset - cellBorderWidth > position);

  return idx >= 0 ? idx - 1 : offsets.length - 1;
}

function getPageMovedIndex(pageInfo: PageInfo, isPrevDir: boolean) {
  const { rowIndex, offsets, viewData, cellBorderWidth } = pageInfo;
  let { bodyHeight } = pageInfo;

  if (isPrevDir) {
    bodyHeight = -bodyHeight;
  }

  const movedIndex = findOffsetIndex(offsets, cellBorderWidth, offsets[rowIndex!] + bodyHeight);

  return clamp(movedIndex, 0, viewData.length - 1);
}

function getPageMovedRowKey(pageInfo: PageInfo, isPrevDir: boolean) {
  const { rowKey, rowIndex, viewData } = pageInfo;
  const prevPageRowIndex = getPageMovedIndex(pageInfo, isPrevDir);
  const offset = prevPageRowIndex - rowIndex!;

  return findRowKey(rowKey!, viewData.length, offset);
}

function prevRowKey(rowKey: number, viewDataLen: number) {
  return findRowKey(rowKey, viewDataLen, -1);
}

function nextRowKey(rowKey: number, viewDataLen: number) {
  return findRowKey(rowKey, viewDataLen, 1);
}

function firstRowKey() {
  return 0;
}

function lastRowKey(viewDataLen: number) {
  return viewDataLen - 1;
}

function prevPageMovedRowKey(pageInfo: PageInfo) {
  return getPageMovedRowKey(pageInfo, true);
}

function nextPageMovedRowKey(pageInfo: PageInfo) {
  return getPageMovedRowKey(pageInfo, false);
}

function isValidColumnRange(columnIndex: number, columnLength: number) {
  return columnIndex < 0 || columnIndex > columnLength - 1;
}

function findColumnName({ columnName, side, visibleColumns }: ColumnInfo, offset: number) {
  const curColumnIndex = indexOfColumnName(columnName!, side!, visibleColumns);
  const visibleColumnNames = getVisibleColumnNames(visibleColumns);
  let columnIndex = curColumnIndex + offset;

  if (isValidColumnRange(columnIndex, visibleColumnNames.length)) {
    columnIndex = curColumnIndex;
  }

  return visibleColumnNames[columnIndex].name;
}

function prevColumnName(columnInfo: ColumnInfo) {
  return findColumnName(columnInfo, -1);
}

function nextColumnName(columnInfo: ColumnInfo) {
  return findColumnName(columnInfo, 1);
}

function firstColumnName(visibleColumns: VisibleColumns) {
  return getVisibleColumnNames(visibleColumns)[0].name;
}

function lastColumnName(visibleColumns: VisibleColumns) {
  const visibleColumnNames = getVisibleColumnNames(visibleColumns);

  return visibleColumnNames[visibleColumnNames.length - 1].name;
}

export function moveFocus(store: Store, command: KeyboardEventCommandType) {
  const {
    focus,
    data: { viewData },
    column: { visibleColumns },
    dimension: { bodyHeight, cellBorderWidth },
    rowCoords: { offsets }
  } = store;
  const { side, rowIndex } = focus;
  let { rowKey, columnName } = focus;

  const pageInfo = {
    rowKey,
    rowIndex,
    offsets,
    viewData,
    cellBorderWidth,
    bodyHeight
  };

  const columnInfo = {
    columnName,
    side,
    visibleColumns
  };

  switch (command) {
    case 'up':
      rowKey = prevRowKey(rowKey!, viewData.length);
      break;
    case 'down':
      rowKey = nextRowKey(rowKey!, viewData.length);
      break;
    case 'left':
      columnName = prevColumnName(columnInfo);
      break;
    case 'right':
      columnName = nextColumnName(columnInfo);
      break;
    case 'firstCell':
      columnName = firstColumnName(visibleColumns);
      rowKey = firstRowKey();
      break;
    case 'lastCell':
      columnName = lastColumnName(visibleColumns);
      rowKey = lastRowKey(viewData.length);
      break;
    case 'pageUp':
      rowKey = prevPageMovedRowKey(pageInfo);
      break;
    case 'pageDown':
      rowKey = nextPageMovedRowKey(pageInfo);
      break;
    case 'firstColumn':
      columnName = firstColumnName(visibleColumns);
      break;
    case 'lastColumn':
      columnName = lastColumnName(visibleColumns);
      break;
    default:
      break;
  }

  focus.active = true;
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
