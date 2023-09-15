import { includes } from './common';

export const keyNameMap = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
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
  46: 'del',
} as const;

export const keyboardEventTypeMap = {
  move: 'move',
  edit: 'edit',
  remove: 'remove',
  select: 'select',
  clipboard: 'clipboard',
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
  paste: 'paste',
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
  'ctrl-shift-end': ['select', 'lastCell'],
};
export type KeyNameMapType = typeof keyNameMap;
export type KeyNameMap = KeyNameMapType & {
  [keyCode: number]: string | undefined;
};
export type KeyCodeType = keyof KeyNameMapType;
export type KeyNameType = KeyNameMapType[KeyCodeType];
export type KeyStrokeCommandType = keyof typeof keyStrokeCommandMap;
export type KeyboardEventType = keyof typeof keyboardEventTypeMap;
export type KeyboardEventCommandType = keyof typeof keyboardEventCommandMap;
export type TabCommandType = 'nextCell' | 'prevCell';
export type EnterCommandType =
  | TabCommandType
  | keyof Pick<typeof keyboardEventCommandMap, 'up' | 'down'>;

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
        keyStroke,
        type: commandInfo[0],
        command: commandInfo[1],
      }
    : {};
}

export function isNonPrintableKey(keyCode: number) {
  const keys: KeyNameType[] = [
    'shift',
    'ctrl',
    'esc',
    'left',
    'up',
    'right',
    'down',
    'pageUp',
    'pageDown',
    'end',
    'home',
  ];
  const key = (keyNameMap as KeyNameMap)[keyCode];

  return includes(keys, key);
}

export function isArrowKey(keyName: KeyStrokeCommandType) {
  return includes(['up', 'down', 'left', 'right'], keyName);
}
