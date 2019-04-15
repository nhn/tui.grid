/**
 * @fileoverview theme manager
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

import { presetDefault, clean, striped } from './preset';
import { deepAssign } from '../helper/common';
import { appendStyleElement } from '../helper/dom';
import { OptPreset } from './../types.d';
import { HeightResizeHandle } from './../view/heightResizeHandle';
import styleGen from './styleGenerator';

const STYLE_ELEMENT_ID = 'tui-grid-theme-style';

type QueryResultType = HTMLElement | null;

interface ThemeOptionsMap {
  [key: string]: OptPreset;
}

// @FIXME: 상수명 그대로 가져갈 건지?
const presetOptions: ThemeOptionsMap = {
  default: presetDefault,
  striped,
  clean
};

/**
 * build css string with given options.
 * @param {Object} options - options
 * @returns {String}
 * @ignore
 */
function buildCssString(options: OptPreset): string {
  const {
    outline,
    frozenBorder,
    scrollbar,
    heightResizeHandle,
    pagination,
    selection,
    area,
    cell
  } = options;

  let styles: string[] | string = [
    styleGen.outline(outline),
    styleGen.frozenBorder(frozenBorder),
    styleGen.scrollbar(scrollbar),
    styleGen.heightResizeHandle(heightResizeHandle),
    styleGen.pagination(pagination),
    styleGen.selection(selection),
  ];

  if (area) {
    const {header, body, summary} = area;

    styles = styles.concat([
      styleGen.headArea(header),
      styleGen.bodyArea(body),
      styleGen.summaryArea(summary)
    ]);
  }

  if (cell) {
    const {
      normal,
      dummy,
      editable,
      head,
      rowHead,
      summary,
      oddRow,
      evenRow,
      required,
      disabled,
      invalid,
      currentRow,
      selectedHead,
      selectedRowHead,
      focused,
      focusedInactive
    } = cell;

    styles = styles.concat([
      styleGen.cell(normal),
      styleGen.cellDummy(dummy),
      styleGen.cellEditable(editable),
      styleGen.cellHead(head),
      styleGen.cellRowHead(rowHead),
      styleGen.cellSummary(summary),
      styleGen.cellOddRow(oddRow),
      styleGen.cellEvenRow(evenRow),
      styleGen.cellRequired(required),
      styleGen.cellDisabled(disabled),
      styleGen.cellInvalid(invalid),
      styleGen.cellCurrentRow(currentRow),
      styleGen.cellSelectedHead(selectedHead),
      styleGen.cellSelectedRowHead(selectedRowHead),
      styleGen.cellFocused(focused),
      styleGen.cellFocusedInactive(focusedInactive)
    ]);
  }
  return styles.join('');
}

/**
 * Set document style with given options.
 * @param {Object} options - options
 * @ignore
 */
function setDocumentStyle(options: object) {
  const cssString: string = buildCssString(options);
  const elem: QueryResultType = document.getElementById(STYLE_ELEMENT_ID);
  if (elem) {
    (elem.parentNode as HTMLElement).removeChild(elem);
  }
  appendStyleElement(STYLE_ELEMENT_ID, cssString);
}

export default {
  /**
   * Creates a style element using theme options identified by given name,
   * and appends it to the document.
   * @param {String} themeName - preset theme name
   * @param {Object} extOptions - if exist, extend preset theme options with it.
   */
  apply: function(themeName: string, extOptions?: OptPreset) {
    let options = presetOptions[themeName];
    if (!options) {
      options = presetOptions.default;
    }
    if (extOptions) {
      options = deepAssign(options, extOptions);
    }

    setDocumentStyle(options);
  },

  /**
   * Returns whether the style of a theme is applied.
   * @returns {Boolean}
   */
  isApplied: function(): boolean {
    return !!document.getElementById(STYLE_ELEMENT_ID);
  }
};
