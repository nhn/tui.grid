import { presetDefault, clean, striped } from './preset';
import { deepMergedCopy } from '../helper/common';
import { appendStyleElement } from '../helper/dom';
import { OptPreset } from '@t/options';
import * as styleGen from './styleGenerator';

export type ThemeOptionPresetNames = 'default' | 'striped' | 'clean';
type ThemeOptionsMapType = { [prop in ThemeOptionPresetNames]: OptPreset };

const STYLE_ELEMENT_ID = 'tui-grid-theme-style';

const presetOptions: ThemeOptionsMapType = {
  default: presetDefault,
  striped,
  clean,
};

const styleGenMethodMap = {
  outline: styleGen.outline,
  frozenBorder: styleGen.frozenBorder,
  scrollbar: styleGen.scrollbar,
  heightResizeHandle: styleGen.heightResizeHandle,
  pagination: styleGen.pagination,
  selection: styleGen.selection,
};

const styleGenAreaMethodMap = {
  header: styleGen.headerArea,
  body: styleGen.bodyArea,
  summary: styleGen.summaryArea,
};

const styleGenRowMethodMap = {
  odd: styleGen.rowOdd,
  even: styleGen.rowEven,
  dummy: styleGen.rowDummy,
  hover: styleGen.rowHover,
};

const styleGenCellMethodMap = {
  normal: styleGen.cell,
  editable: styleGen.cellEditable,
  header: styleGen.cellHeader,
  rowHeader: styleGen.cellRowHeader,
  summary: styleGen.cellSummary,
  required: styleGen.cellRequired,
  disabled: styleGen.cellDisabled,
  invalid: styleGen.cellInvalid,
  selectedHeader: styleGen.cellSelectedHeader,
  selectedRowHeader: styleGen.cellSelectedRowHeader,
  focused: styleGen.cellFocused,
  focusedInactive: styleGen.cellFocusedInactive,
  // deprecate
  oddRow: styleGen.rowOdd,
  evenRow: styleGen.rowEven,
  currentRow: styleGen.cellCurrentRow,
  dummy: styleGen.rowDummy,
};

function buildCssString(options: OptPreset): string {
  type KeyType = keyof typeof styleGenMethodMap;
  type AreaKeyType = keyof typeof styleGenAreaMethodMap;
  type RowKeyType = keyof typeof styleGenRowMethodMap;
  type CellKeyType = keyof typeof styleGenCellMethodMap;

  const { area, cell, row } = options;
  const styles: string[] = [];

  Object.keys(styleGenMethodMap).forEach((key) => {
    const keyWithType = key as KeyType;
    const value = options[keyWithType];

    if (value) {
      const fn = styleGen[keyWithType];
      styles.push(fn(value));
    }
  });

  if (area) {
    Object.keys(styleGenAreaMethodMap).forEach((key) => {
      const keyWithType = key as AreaKeyType;
      const value = area[keyWithType];

      if (value) {
        const fn = styleGenAreaMethodMap[keyWithType];
        styles.push(fn(value));
      }
    });
  }

  if (cell) {
    Object.keys(styleGenCellMethodMap).forEach((key) => {
      const keyWithType = key as CellKeyType;
      const value = cell[keyWithType];

      if (value) {
        const fn = styleGenCellMethodMap[keyWithType];
        styles.push(fn(value));
      }
    });
  }

  if (row) {
    // Written later to override the row style in cell style
    Object.keys(styleGenRowMethodMap).forEach((key) => {
      const keyWithType = key as RowKeyType;
      const value = row[keyWithType];
      if (value) {
        const fn = styleGenRowMethodMap[keyWithType];
        styles.push(fn(value));
      }
    });
  }

  return styles.join('');
}

function setDocumentStyle(options: OptPreset) {
  const cssString = buildCssString(options);
  const elem = document.getElementById(STYLE_ELEMENT_ID);
  if (elem && elem.parentNode) {
    elem.parentNode.removeChild(elem);
  }
  appendStyleElement(STYLE_ELEMENT_ID, cssString);
}

export default {
  /**
   * Creates a style element using theme options identified by given name,
   * and appends it to the document.
   * @param themeName - preset theme name
   * @param extOptions - if exist, extend preset theme options with it.
   */
  apply(themeName: ThemeOptionPresetNames, extOptions?: OptPreset) {
    let options = presetOptions[themeName];
    if (!options) {
      options = presetOptions['default'];
    }
    if (extOptions) {
      options = deepMergedCopy(options, extOptions);
    }

    setDocumentStyle(options);
  },

  /**
   * Returns whether the style of a theme is applied.
   */
  isApplied() {
    return !!document.getElementById(STYLE_ELEMENT_ID);
  },
};
