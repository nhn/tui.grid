import { fromArray, isNull } from './common';
import { Range } from '../store/types';

export interface WindowWithClipboard extends Window {
  clipboardData?: DataTransfer | null;
}

export type ClassNameType =
  | 'body-area'
  | 'body-container'
  | 'border-line'
  | 'border-line-top'
  | 'border-line-left'
  | 'border-line-right'
  | 'border-line-bottom'
  | 'btn-text'
  | 'btn-sorting'
  | 'btn-sorting-up'
  | 'btn-sorting-down'
  | 'btn-filter'
  | 'btn-filter-active'
  | 'btn-close'
  | 'btn-excel-download'
  | 'btn-excel-icon'
  | 'btn-excel-page'
  | 'btn-excel-all'
  | 'btn-tree'
  | 'cell'
  | 'cell-content'
  | 'cell-header'
  | 'cell-row-header'
  | 'cell-summary'
  | 'cell-row-odd'
  | 'cell-row-even'
  | 'cell-editable'
  | 'cell-dummy'
  | 'cell-required'
  | 'cell-disabled'
  | 'cell-selected'
  | 'cell-invalid'
  | 'cell-ellipsis'
  | 'cell-current-row'
  | 'cell-content-editor'
  | 'cell-main-button'
  | 'cell-has-input'
  | 'cell-has-tree'
  | 'clipboard'
  | 'column-resize-container'
  | 'column-resize-handle'
  | 'column-resize-handle-last'
  | 'container'
  | 'content-before'
  | 'content-after'
  | 'content-input'
  | 'content-text'
  | 'content-area'
  | 'date-icon'
  | 'datepicker-input-container'
  | 'datepicker-input'
  | 'frozen-border'
  | 'frozen-border-top'
  | 'frozen-border-bottom'
  | 'filter-btn'
  | 'filter-btn-apply'
  | 'filter-btn-clear'
  | 'filter-btn-container'
  | 'filter-container'
  | 'filter-dropdown'
  | 'filter-input'
  | 'filter-comparator-container'
  | 'filter-comparator-checked'
  | 'filter-comparator'
  | 'filter-list-container'
  | 'filter-list'
  | 'filter-list-item'
  | 'filter-list-item-checked'
  | 'filter-icon'
  | 'header-area'
  | 'height-resize-handle'
  | 'layer-focus'
  | 'layer-focus-border'
  | 'layer-state'
  | 'layer-state-content'
  | 'layer-state-loading'
  | 'layer-focus-deactive'
  | 'layer-editing'
  | 'layer-datepicker'
  | 'lside-area'
  | 'layer-selection'
  | 'rside-area'
  | 'row-odd'
  | 'row-even'
  | 'row-hidden'
  | 'row-header-checkbox'
  | 'row-hover'
  | 'no-scroll-x'
  | 'no-scroll-y'
  | 'pagination'
  | 'height-resize-handle'
  | 'height-resize-bar'
  | 'has-summary-top'
  | 'has-summary-bottom'
  | 'show-lside-area'
  | 'scrollbar-frozen-border'
  | 'scrollbar-left-bottom'
  | 'scrollbar-y-inner-border'
  | 'scrollbar-y-outer-border'
  | 'scrollbar-right-top'
  | 'scrollbar-right-bottom'
  | 'scrollbar-left-bottom'
  | 'scrollbar-left-top'
  | 'summary-area'
  | 'table-container'
  | 'table'
  | 'tree-wrapper-relative'
  | 'tree-wrapper-valign-center'
  | 'tree-extra-content'
  | 'tree-depth'
  | 'tree-button-expand'
  | 'tree-button-collapse'
  | 'tree-icon';

const CLS_PREFIX = 'tui-grid-';

export const dataAttr = {
  ROW_KEY: 'data-row-key',
  COLUMN_NAME: 'data-column-name',
  COLUMN_INDEX: 'data-column-index',
  GRID_ID: 'data-grid-id'
};

export function cls(...names: (ClassNameType | [boolean, ClassNameType])[]) {
  const result = [];

  for (const name of names) {
    let className: string | null;
    if (Array.isArray(name)) {
      className = name[0] ? name[1] : null;
    } else {
      className = name;
    }

    if (className) {
      result.push(`${CLS_PREFIX}${className}`);
    }
  }

  return result.join(' ');
}

export function hasClass(el: HTMLElement, className: ClassNameType) {
  return el.className.split(' ').indexOf(cls(className)) !== -1;
}

export function findParentByTagName(el: HTMLElement, tagName: string) {
  let currentEl: HTMLElement | null = el;
  while (currentEl && currentEl.tagName.toLowerCase() !== tagName) {
    currentEl = currentEl.parentElement;
  }

  return currentEl;
}

export function findParent(el: HTMLElement, className: ClassNameType) {
  let currentEl: HTMLElement | null = el;
  while (currentEl && !hasClass(currentEl, className)) {
    currentEl = currentEl.parentElement;
  }

  return currentEl;
}

export function getCellAddress(el: HTMLElement) {
  const cellElement = findParentByTagName(el, 'td');

  if (!cellElement) {
    return null;
  }
  const rowKey = cellElement.getAttribute(dataAttr.ROW_KEY);
  const columnName = cellElement.getAttribute(dataAttr.COLUMN_NAME) as string;

  if (isNull(rowKey)) {
    return null;
  }

  return {
    rowKey: Number(rowKey),
    columnName
  };
}

/**
 * create style element and append it into the head element.
 * @param {String} id - element id
 * @param {String} cssString - css string
 */
export function appendStyleElement(id: string, cssString: string) {
  const style = document.createElement('style') as HTMLStyleElement;

  style.type = 'text/css';
  style.id = id;
  style.appendChild(document.createTextNode(cssString));

  document.getElementsByTagName('head')[0].appendChild(style);
}

export function setCursorStyle(type: string) {
  document.body.style.cursor = type;
}

export function getCoordinateWithOffset(pageX: number, pageY: number) {
  const pageXWithOffset = pageX - window.pageXOffset;
  const pageYWithOffset = pageY - window.pageYOffset;

  return [pageXWithOffset, pageYWithOffset];
}

function setDataInSpanRange(
  value: string,
  data: string[][],
  colspanRange: Range,
  rowspanRange: Range
) {
  const [startColspan, endColspan] = colspanRange;
  const [startRowspan, endRowspan] = rowspanRange;

  for (let rowIdx = startRowspan; rowIdx < endRowspan; rowIdx += 1) {
    for (let columnIdx = startColspan; columnIdx < endColspan; columnIdx += 1) {
      data[rowIdx][columnIdx] = startRowspan === rowIdx && startColspan === columnIdx ? value : ' ';
    }
  }
}

export function convertTableToData(rows: HTMLCollectionOf<HTMLTableRowElement>) {
  const data: string[][] = [];
  let colspanRange: Range, rowspanRange: Range;

  for (let index = 0; index < rows.length; index += 1) {
    data[index] = [];
  }

  fromArray(rows).forEach((tr, rowIndex) => {
    let columnIndex = 0;

    fromArray(tr.cells).forEach(td => {
      const text = td.textContent || td.innerText;

      while (data[rowIndex][columnIndex]) {
        columnIndex += 1;
      }

      colspanRange = [columnIndex, columnIndex + (td.colSpan || 1)];
      rowspanRange = [rowIndex, rowIndex + (td.rowSpan || 1)];

      setDataInSpanRange(text, data, colspanRange, rowspanRange);
      columnIndex = colspanRange[1];
    });
  });

  return data;
}

export function isSupportWindowClipboardData() {
  return !!(window as WindowWithClipboard).clipboardData;
}

export function setClipboardSelection(node: ChildNode) {
  if (node) {
    const range = document.createRange();
    const selection = window.getSelection();
    selection!.removeAllRanges();
    range.selectNodeContents(node);
    selection!.addRange(range);
  }
}
