import { cls, ClassNameType } from '../helper/dom';
import {
  create,
  createClassRule,
  createNestedClassRule,
  buildAll,
  createWebkitScrollbarRules,
  createIEScrollbarRule,
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
  OptCellDummyStyle,
  OptRowHoverStyle,
} from '@t/options';

function bgTextRuleString(className: ClassNameType, options: OptBasicCellStyle): string {
  const { background, text } = options;

  return createClassRule(className).bg(background).text(text).build();
}

function bgBorderRuleString(className: ClassNameType, options: OptPaginationStyle): string {
  const { background, border } = options;

  return createClassRule(className).bg(background).border(border).build();
}

export function outline(options: OptTableOutlineStyle): string {
  const { border, showVerticalBorder } = options;
  const borderTopRule = createClassRule('border-line-top').add('border-top', `1px solid ${border}`);
  const borderBottomRule = createNestedClassRule(' .', ['no-scroll-x', 'border-line-bottom']).add(
    'border-bottom',
    `1px solid ${border}`
  );
  let rules = [borderTopRule, borderBottomRule];
  let borderLeftRule, borderRightRule;
  if (showVerticalBorder) {
    borderLeftRule = createClassRule('border-line-left').add('border-left', `1px solid ${border}`);
    borderRightRule = createNestedClassRule(' .', ['no-scroll-y', 'border-line-right']).add(
      'border-right',
      `1px solid ${border}`
    );
    rules = rules.concat([borderLeftRule, borderRightRule]);
  }

  return buildAll(rules);
}

export function frozenBorder(options: OptFrozenBorderStyle): string {
  return createClassRule('frozen-border').bg(options.border).build();
}

export function scrollbar(options: OptScrollbarStyle): string {
  const { border, emptySpace } = options;
  const webkitScrollbarRules = createWebkitScrollbarRules(`.${cls('container')}`, options);
  const ieScrollbarRule = createIEScrollbarRule(`.${cls('container')}`, options);
  const xInnerBorderRule = createClassRule('border-line-bottom').add(
    'border-bottom',
    `1px solid ${border}`
  );
  const xOuterBorderRule = createClassRule('content-area').border(border);
  const yInnerBorderRule = createClassRule('scrollbar-y-inner-border').bg(border);
  const yOuterBorderRule = createClassRule('scrollbar-y-outer-border').bg(border);
  const spaceRightTopRule = createClassRule('scrollbar-right-top').bg(emptySpace).border(border);
  const spaceRightBottomRule = createClassRule('scrollbar-right-bottom')
    .bg(emptySpace)
    .border(border);
  const spaceLeftBottomRule = createClassRule('scrollbar-left-bottom')
    .bg(emptySpace)
    .border(border);
  const frozenBorderRule = createClassRule('scrollbar-frozen-border').bg(emptySpace).border(border);

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
    frozenBorderRule,
  ]);
}

export function heightResizeHandle(options: OptHeightResizeHandleStyle): string {
  return bgBorderRuleString('height-resize-handle', options);
}

export function pagination(options: OptPaginationStyle): string {
  return bgBorderRuleString('pagination', options);
}

export function selection(options: OptSelectionLayerStyle): string {
  return bgBorderRuleString('layer-selection', options);
}

export function headerArea(options: OptTableHeaderStyle): string {
  return createClassRule('header-area').bg(options.background).border(options.border).build();
}

export function bodyArea(options: OptTableBodyStyle): string {
  return createClassRule('body-area').bg(options.background).build();
}

export function summaryArea(options: OptTableSummaryStyle): string {
  const { border, background } = options;
  const contentAreaRule = createClassRule('summary-area').bg(background).border(border);
  const bodyAreaRule = createNestedClassRule(' .', ['has-summary-top', 'body-area']).border(border);

  return buildAll([contentAreaRule, bodyAreaRule]);
}

export function cell(options: OptCellStyle): string {
  return createClassRule('cell')
    .bg(options.background)
    .border(options.border)
    .borderWidth(options)
    .text(options.text)
    .build();
}

export function cellHeader(options: OptCellStyle): string {
  const { background, border, text } = options;
  const tableRule = createNestedClassRule(' .', [
    'show-lside-area',
    'lside-area',
    'header-area',
    'table',
  ]).verticalBorderStyle(options, 'right');
  const cellRule = createClassRule('cell-header')
    .bg(background)
    .border(border)
    .borderWidth(options)
    .text(text);

  return buildAll([tableRule, cellRule]);
}

export function cellRowHeader(options: OptCellStyle): string {
  const { background, border, text } = options;
  const tableRule = createNestedClassRule(' .', [
    'show-lside-area',
    'lside-area',
    'body-area',
    'table',
  ]).verticalBorderStyle(options, 'right');
  const cellRule = createClassRule('cell-row-header')
    .bg(background)
    .border(border)
    .borderWidth(options)
    .text(text);

  return buildAll([tableRule, cellRule]);
}

export function cellSummary(options: OptCellStyle): string {
  const { background, border, text } = options;
  const tableRule = createNestedClassRule(' .', [
    'show-lside-area',
    'lside-area',
    'summary-area',
    'table',
  ]).verticalBorderStyle(options, 'right');
  const cellRule = createClassRule('cell-summary')
    .bg(background)
    .border(border)
    .borderWidth(options)
    .text(text);

  return buildAll([tableRule, cellRule]);
}

export function rowEven(options: OptBasicCellStyle): string {
  return create('.tui-grid-row-even>td').bg(options.background).build();
}

export function rowOdd(options: OptBasicCellStyle): string {
  return create('.tui-grid-row-odd>td').bg(options.background).build();
}

export function rowHover(options: OptRowHoverStyle): string {
  return create('.tui-grid-row-hover>.tui-grid-cell').bg(options.background).build();
}

export function rowDummy(options: OptCellDummyStyle): string {
  return bgTextRuleString('cell-dummy', options);
}

export function cellSelectedHeader(options: OptBasicCellStyle): string {
  return createNestedClassRule('.', ['cell-header', 'cell-selected'])
    .bg(options.background)
    .text(options.text)
    .build();
}

export function cellSelectedRowHeader(options: OptBasicCellStyle): string {
  return createNestedClassRule('.', ['cell-row-header', 'cell-selected'])
    .bg(options.background)
    .text(options.text)
    .build();
}

export function cellFocused(options: OptCellFocusedStyle): string {
  const { border } = options;
  const focusLayerRule = createClassRule('layer-focus-border').bg(border);
  const editingLayerRule = createClassRule('layer-editing').border(border);

  return buildAll([focusLayerRule, editingLayerRule]);
}

export function cellFocusedInactive(options: OptCellFocusedStyle): string {
  return createNestedClassRule(' .', ['layer-focus-deactive', 'layer-focus-border'])
    .bg(options.border)
    .build();
}

export function cellEditable(options: OptBasicCellStyle): string {
  return bgTextRuleString('cell-editable', options);
}

export function cellRequired(options: OptBasicCellStyle): string {
  return bgTextRuleString('cell-required', options);
}

export function cellDisabled(options: OptBasicCellStyle): string {
  return bgTextRuleString('cell-disabled', options);
}

export function cellInvalid(options: OptBasicCellStyle): string {
  const { background, text } = options;

  return createNestedClassRule('.', ['cell-invalid', 'cell']).bg(background).text(text).build();
}

export function cellCurrentRow(options: OptBasicCellStyle): string {
  return bgTextRuleString('cell-current-row', options);
}
