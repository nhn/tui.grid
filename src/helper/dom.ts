const CLS_PREFIX = 'tui-grid-';

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
  | 'btn-excel-download'
  | 'btn-excel-icon'
  | 'btn-excel-page'
  | 'btn-excel-all'
  | 'btn-tree'
  | 'cell'
  | 'cell-content'
  | 'cell-head'
  | 'cell-row-head'
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
  | 'frozen-border'
  | 'frozen-border-top'
  | 'frozen-border-bottom'
  | 'head-area'
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

export type AttributeKey =
  | 'data-row-key'
  | 'data-column-name'
  | 'data-column-index'
  | 'data-edit-type'
  | 'data-grid-id';

export type Attributes = { [key in AttributeKey]?: number | string };

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
  return el.className.split(' ').indexOf(cls(className)) >= 0;
}

export function findParent(el: HTMLElement, className: ClassNameType) {
  let currentEl: HTMLElement | null = el;
  while (currentEl && !hasClass(currentEl, className)) {
    currentEl = currentEl.parentElement;
  }

  return currentEl;
}

export function getCellAddress(el: HTMLElement) {
  const cellElement = findParent(el, 'cell');

  if (!cellElement) {
    return null;
  }
  const rowKey = Number(cellElement.getAttribute('data-row-key'));
  const columnName = cellElement.getAttribute('data-column-name') as string;

  return { rowKey, columnName };
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
