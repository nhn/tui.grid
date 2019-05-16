import { CellIndex, Store } from '../store/types';
import { clamp } from './common';

export const keyNameMap = {
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

export const keyboardEventTypeMap = {
  move: 'move',
  edit: 'edit',
  remove: 'remove',
  select: 'select',
  clipboard: 'clipboard'
};

export const keyboardEventCommandMap = {
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
export const keyStrokeCommandMap: {
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

export type KeyCodeType = keyof typeof keyNameMap;
export type KeyStrokeCommandType = keyof typeof keyStrokeCommandMap;
export type KeyboardEventType = keyof (typeof keyboardEventTypeMap);
export type KeyboardEventCommandType = keyof (typeof keyboardEventCommandMap);

/**
 * Returns the keyStroke string
 * @param {Event} ev - Keyboard event
 * @returns {String}
 * @ignore
 */
export function getKeyStrokeString(ev: KeyboardEvent): KeyStrokeCommandType {
  const keys = [];
  const { keyCode, ctrlKey, metaKey, shiftKey } = ev;

  if (ctrlKey || metaKey) {
    keys.push('ctrl');
  }
  if (shiftKey) {
    keys.push('shift');
  }

  if (keyCode in keyNameMap) {
    keys.push(keyNameMap[keyCode as KeyCodeType]);
  }

  return keys.join('-');
}

export function keyEventGenerate(ev: KeyboardEvent) {
  const keyStroke = getKeyStrokeString(ev);
  const commandInfo = keyStrokeCommandMap[keyStroke];

  return commandInfo
    ? {
        type: commandInfo[0],
        command: commandInfo[1]
      }
    : {};
}

function findOffsetIndex(offsets: number[], cellBorderWidth: number, position: number) {
  position += cellBorderWidth * 2;

  const idx = offsets.findIndex((offset) => offset - cellBorderWidth > position);

  return idx >= 0 ? idx - 1 : offsets.length - 1;
}

function getPageMovedPosition(
  rowIndex: number,
  offsets: number[],
  bodyHeight: number,
  isPrevDir: boolean
) {
  const distance = isPrevDir ? -bodyHeight : bodyHeight;

  return offsets[rowIndex] + distance;
}

function getPageMovedIndex(offsets: number[], cellBorderWidth: number, movedPosition: number) {
  const movedIndex = findOffsetIndex(offsets, cellBorderWidth, movedPosition);

  return clamp(movedIndex, 0, offsets.length - 1);
}

// @TODO: 👇 store를 사용하는 함수들 helper에서 다른곳으로 코드 이동 필요
export function getNextCellIndex(
  store: Store,
  command: KeyboardEventCommandType,
  [rowIndex, columnIndex]: CellIndex
): CellIndex {
  const {
    data: { viewData },
    column: { visibleColumns },
    dimension: { bodyHeight, cellBorderWidth },
    rowCoords: { offsets }
  } = store;

  switch (command) {
    case 'up':
      rowIndex -= 1;
      break;
    case 'down':
      rowIndex += 1;
      break;
    case 'left':
      columnIndex -= 1;
      break;
    case 'right':
      columnIndex += 1;
      break;
    case 'firstCell':
      columnIndex = 0;
      rowIndex = 0;
      break;
    case 'lastCell':
      columnIndex = visibleColumns.length - 1;
      rowIndex = viewData.length - 1;
      break;
    case 'pageUp': {
      const movedPosition = getPageMovedPosition(rowIndex, offsets, bodyHeight, true);
      rowIndex = getPageMovedIndex(offsets, cellBorderWidth, movedPosition);
      break;
    }
    case 'pageDown': {
      const movedPosition = getPageMovedPosition(rowIndex, offsets, bodyHeight, false);
      rowIndex = getPageMovedIndex(offsets, cellBorderWidth, movedPosition);
      break;
    }
    case 'firstColumn':
      columnIndex = 0;
      break;
    case 'lastColumn':
      columnIndex = visibleColumns.length - 1;
      break;
    default:
      break;
  }

  rowIndex = clamp(rowIndex, 0, viewData.length - 1);
  columnIndex = clamp(columnIndex, 0, visibleColumns.length - 1);

  return [rowIndex, columnIndex];
}
