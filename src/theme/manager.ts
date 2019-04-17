/**
 * @fileoverview theme manager
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

import { presetDefault, clean, striped } from './preset';
import { deepAssign } from '../helper/common';
import { appendStyleElement } from '../helper/dom';
import { OptPreset, OptTableAreaStyle, OptTableCellStyle } from './../types.d';
import * as styleGen from './styleGenerator';

export type ThemeOptionPresetNames = 'default' | 'striped' | 'clean';
type ThemeOptionsMapType = { [prop in ThemeOptionPresetNames]: OptPreset };

const STYLE_ELEMENT_ID = 'tui-grid-theme-style';

const presetOptions: ThemeOptionsMapType = {
  default: presetDefault,
  striped,
  clean
};

const styleGenMethodMap = {
  outline: styleGen.outline,
  frozenBorder: styleGen.frozenBorder,
  scrollbar: styleGen.scrollbar,
  heightResizeHandle: styleGen.heightResizeHandle,
  pagination: styleGen.pagination,
  selection: styleGen.selection
};

const styleGenAreaMethodMap = {
  header: styleGen.headArea,
  body: styleGen.bodyArea,
  summary: styleGen.summaryArea
};

const styleGenCellMethodMap = {
  normal: styleGen.cell,
  dummy: styleGen.cellDummy,
  editable: styleGen.cellEditable,
  head: styleGen.cellHead,
  rowHead: styleGen.cellRowHead,
  summary: styleGen.cellSummary,
  oddRow: styleGen.cellOddRow,
  evenRow: styleGen.cellEvenRow,
  required: styleGen.cellRequired,
  disabled: styleGen.cellDisabled,
  invalid: styleGen.cellInvalid,
  currentRow: styleGen.cellCurrentRow,
  selectedHead: styleGen.cellSelectedHead,
  selectedRowHead: styleGen.cellSelectedRowHead,
  focused: styleGen.cellFocused,
  focusedInactive: styleGen.cellFocusedInactive
};

/**
 * build css string with given options.
 * @param {Object} options - options
 * @returns {String}
 * @ignore
 */
function buildCssString(options: OptPreset): string {
  type KeyType = keyof (typeof styleGenMethodMap);
  type AreaKeyType = keyof (typeof styleGenAreaMethodMap);
  type CellKeyType = keyof (typeof styleGenCellMethodMap);

  const { area, cell } = options;
  let styles: string[] = [];

  Object.keys(styleGenMethodMap).map((key) => {
    const keyWithType = key as KeyType;
    const value = options[keyWithType];

    if (value) {
      const fn = styleGen[keyWithType] as Function;
      styles.push(fn(value));
    }
  });

  if (area) {
    Object.keys(styleGenAreaMethodMap).map((key) => {
      const keyWithType = key as AreaKeyType;
      const value = area[keyWithType];

      if (value) {
        const fn = styleGenAreaMethodMap[keyWithType] as Function;
        styles.push(fn(value));
      }
    });
  }

  if (cell) {
    Object.keys(styleGenCellMethodMap).map((key) => {
      const keyWithType = key as CellKeyType;
      const value = cell[keyWithType];

      if (value) {
        const fn = styleGenCellMethodMap[keyWithType] as Function;
        styles.push(fn(value));
      }
    });
  }

  return styles.join('');
}

/**
 * Set document style with given options.
 * @param {Object} options - options
 * @ignore
 */
function setDocumentStyle(options: OptPreset) {
  const cssString: string = buildCssString(options);
  const elem: HTMLElement | null = document.getElementById(STYLE_ELEMENT_ID);
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
  apply: function(themeName: ThemeOptionPresetNames, extOptions?: OptPreset) {
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
