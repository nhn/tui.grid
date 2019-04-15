/**
 * @fileoverview css style generator
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */
import { cls } from '../helper/common';
import {
  createClassRule,
  createClassComposeRule,
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
function bgTextRuleString(className: string, options: OptBasicCellStyle): string {
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
function bgBorderRuleString(className: string, options: OptPaginationStyle): string {
  const { background, border } = options;

  return createClassRule(className)
    .bg(background)
    .border(border)
    .build();
}

export = {
  /**
   * Generates a css string for grid outline.
   * @param {Object} options - options
   * @returns {String}
   */
  outline: function(options?: OptTableOutlineStyle): string {
    if (!options) {
      return '';
    }
    const { border, showVerticalBorder } = options;
    const borderTopRule = createClassRule(cls('border-line-top')).bg(border);
    const borderBottomRule = createClassComposeRule(' .', [
      cls('no-scroll-x'),
      cls('border-line-bottom')
    ]).bg(border);
    let rules = [borderTopRule, borderBottomRule];
    let borderLeftRule, borderRightRule;
    if (showVerticalBorder) {
      borderLeftRule = createClassRule(cls('border-line-left')).bg(border);
      borderRightRule = createClassComposeRule(' .', [
        cls('no-scroll-y'),
        cls('border-line-right')
      ]).bg(border);
      rules = rules.concat([borderLeftRule, borderRightRule]);
    }

    return buildAll(rules);
  },
  /**
   * Generates a css string for border of frozen columns.
   * @param {Object} options - options
   * @returns {String}
   */
  frozenBorder: function(options?: OptFrozenBorderStyle): string {
    return options
      ? createClassRule(cls('frozen-border'))
          .bg(options.border)
          .build()
      : '';
  },
  /**
   * Generates a css string for scrollbars.
   * @param {Object} options - options
   * @returns {String}
   */
  scrollbar: function(options?: OptScrollbarStyle): string {
    if (!options) {
      return '';
    }
    const { border, emptySpace } = options;
    const webkitScrollbarRules = createWebkitScrollbarRules(`.${cls('container')}`, options);
    const ieScrollbarRule = createIEScrollbarRule(`.${cls('container')}`, options);
    const xInnerBorderRule = createClassRule(cls('border-line-bottom')).bg(border);
    const xOuterBorderRule = createClassRule(cls('content-area')).border(border);
    const yInnerBorderRule = createClassRule(cls('scrollbar-y-inner-border')).bg(border);
    const yOuterBorderRule = createClassRule(cls('scrollbar-y-outer-border')).bg(border);
    const spaceRightTopRule = createClassRule(cls('scrollbar-right-top'))
      .bg(emptySpace)
      .border(border);
    const spaceRightBottomRule = createClassRule(cls('scrollbar-right-bottom'))
      .bg(emptySpace)
      .border(border);
    const spaceLeftBottomRule = createClassRule(cls('scrollbar-left-bottom'))
      .bg(emptySpace)
      .border(border);
    const frozenBorderRule = createClassRule(cls('scrollbar-frozen-border'))
      .bg(emptySpace)
      .border(border);

    return buildAll(
      webkitScrollbarRules.concat([
        ieScrollbarRule,
        xInnerBorderRule,
        xOuterBorderRule,
        yInnerBorderRule,
        yOuterBorderRule,
        spaceRightTopRule,
        spaceRightBottomRule,
        spaceLeftBottomRule,
        frozenBorderRule
      ])
    );
  },
  /**
   * Generates a css string for a resize-handle.
   * @param {Object} options - options
   * @returns {String}
   */
  heightResizeHandle: function(options?: OptHeightResizeHandleStyle): string {
    return options ? bgBorderRuleString(cls('height-resize-handle'), options) : '';
  },
  /**
   * Generates a css string for a pagination.
   * @param {Object} options - options
   * @returns {String}
   */
  pagination: function(options?: OptPaginationStyle): string {
    return options ? bgBorderRuleString(cls('pagination'), options) : '';
  },
  /**
   * Generates a css string for selection layers.
   * @param {Object} options - options
   * @returns {String}
   */
  selection: function(options?: OptSelectionLayerStyle): string {
    return options ? bgBorderRuleString(cls('layer-selection'), options) : '';
  },
  /**
   * Generates a css string for head area.
   * @param {Object} options - options
   * @returns {String}
   */
  headArea: function(options?: OptTableHeaderStyle): string {
    return options
      ? createClassRule(cls('head-area'))
          .bg(options.background)
          .border(options.border)
          .build()
      : '';
  },
  /**
   * Generates a css string for body area.
   * @param {Object} options - options
   * @returns {String}
   */
  bodyArea: function(options?: OptTableBodyStyle): string {
    return options
      ? createClassRule(cls('body-area'))
          .bg(options.background)
          .build()
      : '';
  },
  /**
   * Generates a css string for summary area.
   * @param {Object} options - options
   * @returns {String}
   */
  summaryArea: function(options?: OptTableSummaryStyle): string {
    if (!options) {
      return '';
    }
    const { border, background } = options;
    const contentAreaRule = createClassRule(cls('summary-area'))
      .bg(background)
      .border(border);
    const bodyAreaRule = createClassComposeRule(' .', [
      cls('has-summary-top'),
      cls('body-area')
    ]).border(border);

    return buildAll([contentAreaRule, bodyAreaRule]);
  },
  /**
   * Generates a css string for table cells.
   * @param {Object} options - options
   * @returns {String}
   */
  cell: function(options?: OptCellStyle): string {
    return options
      ? createClassRule(cls('cell'))
          .bg(options.background)
          .border(options.border)
          .borderWidth(options)
          .text(options.text)
          .build()
      : '';
  },
  /*
   * Generates a css string for head cells.
   * @param {Object} options - options
   * @returns {String}
   */
  cellHead: function(options?: OptCellStyle): string {
    if (!options) {
      return '';
    }
    const { background, border, text } = options;
    const tableRule = createClassComposeRule(' .', [
      cls('show-lside-area'),
      cls('lside-area'),
      cls('head-area'),
      cls('table')
    ]).verticalBorderStyle(options, 'right');
    const cellRule = createClassRule(cls('cell-head'))
      .bg(background)
      .border(border)
      .borderWidth(options)
      .text(text);

    return buildAll([tableRule, cellRule]);
  },
  /*
   * Generates a css string for row's head cells.
   * @param {Object} options - options
   * @returns {String}
   */
  cellRowHead: function(options?: OptCellStyle): string {
    if (!options) {
      return '';
    }
    const { background, border, text } = options;
    const tableRule = createClassComposeRule(' .', [
      cls('show-lside-area'),
      cls('lside-area'),
      cls('body-area'),
      cls('table')
    ]).verticalBorderStyle(options, 'right');
    const cellRule = createClassRule(cls('cell-row-head'))
      .bg(background)
      .border(border)
      .borderWidth(options)
      .text(text);

    return buildAll([tableRule, cellRule]);
  },
  /*
   * Generates a css string for summary cells.
   * @param {Object} options - options
   * @returns {String}
   */
  cellSummary: function(options?: OptCellStyle): string {
    if (!options) {
      return '';
    }
    const { background, border, text } = options;
    const tableRule = createClassComposeRule(' .', [
      cls('show-lside-area'),
      cls('lside-area'),
      cls('summary-area'),
      cls('table')
    ]).verticalBorderStyle(options, 'right');
    const cellRule = createClassRule(cls('cell-summary'))
      .bg(background)
      .border(border)
      .borderWidth(options)
      .text(text);

    return buildAll([tableRule, cellRule]);
  },
  /**
   * Generates a css string for the cells in even rows.
   * @param {Object} options - options
   * @returns {String}
   */
  cellEvenRow: function(options?: OptBasicCellStyle): string {
    return options
      ? createClassComposeRule('>', [cls('row-even'), 'td'])
          .bg(options.background)
          .build()
      : '';
  },
  /**
   * Generates a css string for the cells in odd rows.
   * @param {Object} options - options
   * @returns {String}
   */
  cellOddRow: function(options?: OptBasicCellStyle): string {
    return options
      ? createClassComposeRule('>', [cls('row-odd'), 'td'])
          .bg(options.background)
          .build()
      : '';
  },
  /**
   * Generates a css string for selected head cells.
   * @param {Object} options - options
   * @returns {String}
   */
  cellSelectedHead: function(options?: OptBasicCellStyle): string {
    return options
      ? createClassComposeRule('.', [cls('cell-head'), cls('cell-selected')])
          .bg(options.background)
          .text(options.text)
          .build()
      : '';
  },
  /**
   * Generates a css string for selected row head cells.
   * @param {Object} options - options
   * @returns {String}
   */
  cellSelectedRowHead: function(options?: OptBasicCellStyle): string {
    return options
      ? createClassComposeRule('.', [cls('cell-row-head'), cls('cell-selected')])
          .bg(options.background)
          .text(options.text)
          .build()
      : '';
  },
  /**
   * Generates a css string for focused cell.
   * @param {Object} options - options
   * @returns {String}
   */
  cellFocused: function(options?: OptCellFocusedStyle): string {
    if (!options) {
      return '';
    }
    const { border } = options;
    const focusLayerRule = createClassRule(cls('layer-focus-border')).bg(border);
    const editingLayerRule = createClassRule(cls('layer-editing')).border(border);

    return buildAll([focusLayerRule, editingLayerRule]);
  },
  /**
   * Generates a css string for focus inactive cell.
   * @param {Object} options - options
   * @returns {String}
   */
  cellFocusedInactive: function(options?: OptCellFocusedStyle): string {
    return options
      ? createClassComposeRule(' .', [cls('layer-focus-deactive'), cls('layer-focus-border')])
          .bg(options.border)
          .build()
      : '';
  },
  /**
   * Generates a css string for editable cells.
   * @param {Object} options - options
   * @returns {String}
   */
  cellEditable: function(options?: OptBasicCellStyle): string {
    return options ? bgTextRuleString(cls('cell-editable'), options) : '';
  },
  /**
   * Generates a css string for required cells.
   * @param {Object} options - options
   * @returns {String}
   */
  cellRequired: function(options?: OptBasicCellStyle): string {
    return options ? bgTextRuleString(cls('cell-required'), options) : '';
  },
  /**
   * Generates a css string for disabled cells.
   * @param {Object} options - options
   * @returns {String}
   */
  cellDisabled: function(options?: OptBasicCellStyle): string {
    return options ? bgTextRuleString(cls('cell-disabled'), options) : '';
  },
  /**
   * Generates a css string for dummy cells.
   * @param {Object} options - options
   * @returns {String}
   */
  cellDummy: function(options?: OptCellDummyStyle): string {
    return options ? bgTextRuleString(cls('cell-dummy'), options) : '';
  },
  /**
   * Generates a css string for invalid cells.
   * @param {Object} options - options
   * @returns {String}
   */
  cellInvalid: function(options?: OptBasicCellStyle): string {
    return options ? bgTextRuleString(cls('cell-invalid'), options) : '';
  },
  /**
   * Generates a css string for cells in a current row.
   * @param {Object} options - options
   * @returns {String}
   */
  cellCurrentRow: function(options?: OptBasicCellStyle): string {
    return options ? bgTextRuleString(cls('cell-current-row'), options) : '';
  }
};
