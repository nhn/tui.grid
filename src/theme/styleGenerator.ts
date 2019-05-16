import { cls, ClassNameType } from '../helper/dom';
import {
  create,
  createClassRule,
  createNestedClassRule,
  buildAll,
  createWebkitScrollbarRules,
  createIEScrollbarRule
} from './cssRuleBuilder';
import {
  OptTableOutlineStyle,
  OptFrozenBorderStyle,
  OptCellFocusedStyle,
  OptScrollbarStyle,
  OptHeightResizeHandleStyle,
  OptPaginationStyle,
  OptSelectionLayerStyle,
  OptTableHeaderStyle,
  OptTableBodyStyle,
  OptTableSummaryStyle,
  OptCellStyle,
  OptBasicCellStyle,
  OptCellDummyStyle
} from './../types.d';

/**
 * Creates a rule string for background and text colors.
 * @param {String} className - class name
 * @param {Objecr} options - options
 * @returns {String}
 * @ignore
 */
function bgTextRuleString(className: ClassNameType, options: OptBasicCellStyle): string {
  const { background, text } = options;

  return createClassRule(className)
    .bg(background)
    .text(text)
    .build();
}

/**
 * Creates a rule string for background and border colors.
 * @param {String} className - class name
 * @param {Objecr} options - options
 * @returns {String}
 * @ignore
 */
function bgBorderRuleString(className: ClassNameType, options: OptPaginationStyle): string {
  const { background, border } = options;

  return createClassRule(className)
    .bg(background)
    .border(border)
    .build();
}

/**
 * Generates a css string for grid outline.
 * @param {Object} options - options
 * @returns {String}
 */
export function outline(options: OptTableOutlineStyle): string {
  const { border, showVerticalBorder } = options;
  const borderTopRule = createClassRule('border-line-top').bg(border);
  const borderBottomRule = createNestedClassRule(' .', ['no-scroll-x', 'border-line-bottom']).bg(
    border
  );
  let rules = [borderTopRule, borderBottomRule];
  let borderLeftRule, borderRightRule;
  if (showVerticalBorder) {
    borderLeftRule = createClassRule('border-line-left').bg(border);
    borderRightRule = createNestedClassRule(' .', ['no-scroll-y', 'border-line-right']).bg(border);
    rules = rules.concat([borderLeftRule, borderRightRule]);
  }

  return buildAll(rules);
}
/**
 * Generates a css string for border of frozen columns.
 * @param {Object} options - options
 * @returns {String}
 */
export function frozenBorder(options: OptFrozenBorderStyle): string {
  return createClassRule('frozen-border')
    .bg(options.border)
    .build();
}
/**
 * Generates a css string for scrollbars.
 * @param {Object} options - options
 * @returns {String}
 */
export function scrollbar(options: OptScrollbarStyle): string {
  const { border, emptySpace } = options;
  const webkitScrollbarRules = createWebkitScrollbarRules(`.${cls('container')}`, options);
  const ieScrollbarRule = createIEScrollbarRule(`.${cls('container')}`, options);
  const xInnerBorderRule = createClassRule('border-line-bottom').bg(border);
  const xOuterBorderRule = createClassRule('content-area').border(border);
  const yInnerBorderRule = createClassRule('scrollbar-y-inner-border').bg(border);
  const yOuterBorderRule = createClassRule('scrollbar-y-outer-border').bg(border);
  const spaceRightTopRule = createClassRule('scrollbar-right-top')
    .bg(emptySpace)
    .border(border);
  const spaceRightBottomRule = createClassRule('scrollbar-right-bottom')
    .bg(emptySpace)
    .border(border);
  const spaceLeftBottomRule = createClassRule('scrollbar-left-bottom')
    .bg(emptySpace)
    .border(border);
  const frozenBorderRule = createClassRule('scrollbar-frozen-border')
    .bg(emptySpace)
    .border(border);

  return buildAll([
    ...webkitScrollbarRules,
    ieScrollbarRule,
    xInnerBorderRule,
    xOuterBorderRule,
    yInnerBorderRule,
    yOuterBorderRule,
    spaceRightTopRule,
    spaceRightBottomRule,
    spaceLeftBottomRule,
    frozenBorderRule
  ]);
}
/**
 * Generates a css string for a resize-handle.
 * @param {Object} options - options
 * @returns {String}
 */
export function heightResizeHandle(options: OptHeightResizeHandleStyle): string {
  return bgBorderRuleString('height-resize-handle', options);
}
/**
 * Generates a css string for a pagination.
 * @param {Object} options - options
 * @returns {String}
 */
export function pagination(options: OptPaginationStyle): string {
  return bgBorderRuleString('pagination', options);
}
/**
 * Generates a css string for selection layers.
 * @param {Object} options - options
 * @returns {String}
 */
export function selection(options: OptSelectionLayerStyle): string {
  return bgBorderRuleString('layer-selection', options);
}
/**
 * Generates a css string for head area.
 * @param {Object} options - options
 * @returns {String}
 */
export function headArea(options: OptTableHeaderStyle): string {
  return createClassRule('head-area')
    .bg(options.background)
    .border(options.border)
    .build();
}
/**
 * Generates a css string for body area.
 * @param {Object} options - options
 * @returns {String}
 */
export function bodyArea(options: OptTableBodyStyle): string {
  return createClassRule('body-area')
    .bg(options.background)
    .build();
}
/**
 * Generates a css string for summary area.
 * @param {Object} options - options
 * @returns {String}
 */
export function summaryArea(options: OptTableSummaryStyle): string {
  const { border, background } = options;
  const contentAreaRule = createClassRule('summary-area')
    .bg(background)
    .border(border);
  const bodyAreaRule = createNestedClassRule(' .', ['has-summary-top', 'body-area']).border(border);

  return buildAll([contentAreaRule, bodyAreaRule]);
}
/**
 * Generates a css string for table cells.
 * @param {Object} options - options
 * @returns {String}
 */
export function cell(options: OptCellStyle): string {
  return createClassRule('cell')
    .bg(options.background)
    .border(options.border)
    .borderWidth(options)
    .text(options.text)
    .build();
}
/*
 * Generates a css string for head cells.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellHead(options: OptCellStyle): string {
  const { background, border, text } = options;
  const tableRule = createNestedClassRule(' .', [
    'show-lside-area',
    'lside-area',
    'head-area',
    'table'
  ]).verticalBorderStyle(options, 'right');
  const cellRule = createClassRule('cell-head')
    .bg(background)
    .border(border)
    .borderWidth(options)
    .text(text);

  return buildAll([tableRule, cellRule]);
}
/*
 * Generates a css string for row's head cells.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellRowHead(options: OptCellStyle): string {
  const { background, border, text } = options;
  const tableRule = createNestedClassRule(' .', [
    'show-lside-area',
    'lside-area',
    'body-area',
    'table'
  ]).verticalBorderStyle(options, 'right');
  const cellRule = createClassRule('cell-row-head')
    .bg(background)
    .border(border)
    .borderWidth(options)
    .text(text);

  return buildAll([tableRule, cellRule]);
}
/*
 * Generates a css string for summary cells.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellSummary(options: OptCellStyle): string {
  const { background, border, text } = options;
  const tableRule = createNestedClassRule(' .', [
    'show-lside-area',
    'lside-area',
    'summary-area',
    'table'
  ]).verticalBorderStyle(options, 'right');
  const cellRule = createClassRule('cell-summary')
    .bg(background)
    .border(border)
    .borderWidth(options)
    .text(text);

  return buildAll([tableRule, cellRule]);
}
/**
 * Generates a css string for the cells in even rows.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellEvenRow(options: OptBasicCellStyle): string {
  return create('.tui-grid-row-even>td')
    .bg(options.background)
    .build();
}
/**
 * Generates a css string for the cells in odd rows.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellOddRow(options: OptBasicCellStyle): string {
  return create('.tui-grid-row-odd>td')
    .bg(options.background)
    .build();
}
/**
 * Generates a css string for selected head cells.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellSelectedHead(options: OptBasicCellStyle): string {
  return createNestedClassRule('.', ['cell-head', 'cell-selected'])
    .bg(options.background)
    .text(options.text)
    .build();
}
/**
 * Generates a css string for selected row head cells.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellSelectedRowHead(options: OptBasicCellStyle): string {
  return createNestedClassRule('.', ['cell-row-head', 'cell-selected'])
    .bg(options.background)
    .text(options.text)
    .build();
}
/**
 * Generates a css string for focused cell.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellFocused(options: OptCellFocusedStyle): string {
  const { border } = options;
  const focusLayerRule = createClassRule('layer-focus-border').bg(border);
  const editingLayerRule = createClassRule('layer-editing').border(border);

  return buildAll([focusLayerRule, editingLayerRule]);
}
/**
 * Generates a css string for focus inactive cell.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellFocusedInactive(options: OptCellFocusedStyle): string {
  return createNestedClassRule(' .', ['layer-focus-deactive', 'layer-focus-border'])
    .bg(options.border)
    .build();
}
/**
 * Generates a css string for editable cells.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellEditable(options: OptBasicCellStyle): string {
  return bgTextRuleString('cell-editable', options);
}
/**
 * Generates a css string for required cells.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellRequired(options: OptBasicCellStyle): string {
  return bgTextRuleString('cell-required', options);
}
/**
 * Generates a css string for disabled cells.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellDisabled(options: OptBasicCellStyle): string {
  return bgTextRuleString('cell-disabled', options);
}
/**
 * Generates a css string for dummy cells.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellDummy(options: OptCellDummyStyle): string {
  return bgTextRuleString('cell-dummy', options);
}
/**
 * Generates a css string for invalid cells.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellInvalid(options: OptBasicCellStyle): string {
  return bgTextRuleString('cell-invalid', options);
}
/**
 * Generates a css string for cells in a current row.
 * @param {Object} options - options
 * @returns {String}
 */
export function cellCurrentRow(options: OptBasicCellStyle): string {
  return bgTextRuleString('cell-current-row', options);
}
