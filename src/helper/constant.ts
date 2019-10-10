export const defMinWidth = {
  ROW_HEADER: 40,
  COLUMN: 50
};

export const crlf = {
  CUSTOM_LF_SUBCHAR: '___tui_grid_lf___',
  CUSTOM_CR_SUBCHAR: '___tui_grid_cr___',
  LF: '\n',
  CR: '\r'
};

export const crlfRegexp = {
  CUSTOM_LF_REGEXP: new RegExp(crlf.CUSTOM_LF_SUBCHAR, 'g'),
  CUSTOM_CR_REGEXP: new RegExp(crlf.CUSTOM_CR_SUBCHAR, 'g')
};

export const time = {
  FILTER_DEBOUNCE_TIME: 50,
  ROW_HEIGHT_DEBOUNCE_TIME: 10,
  KEYDOWN_LOCK_TIME: 10
};

export const resizeHandle = {
  WIDTH: 7,
  HALF_WIDTH: 3
};

export const touch = {
  DOUBLE_TAP_DURATION: 200,
  TAP_THRESHOLD: 10
};

export const distance = {
  // Minimum distance (pixel) to detect if user wants to drag when moving mouse with button pressed.
  MIN_DISTANCE_FOR_DRAG: 10,
  DISTANCE_FROM_ICON_TO_LAYER: 9
};

export const DEF_ROW_HEADER_INPUT = '<input type="checkbox" name="_checked" />';
export const CLS_PREFIX = 'tui-grid-';
export const TREE_INDENT_WIDTH = 22;
