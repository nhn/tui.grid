import { Store } from '@t/store';
import { RowKey } from '@t/store/data';
import { findOffsetIndex, fromArray } from '../helper/common';
import { cls, dataAttr } from '../helper/dom';

interface PosInfo {
  pageY: number;
  top: number;
  scrollTop: number;
  container?: HTMLElement;
}

export interface DraggableInfo {
  row: HTMLElement;
  rowKey: RowKey;
  line: HTMLElement;
}

const EXCEED_RATIO = 0.8;

function createCells(cell: Element) {
  const el = document.createElement('div');
  el.className = cls('floating-cell');
  el.style.width = window.getComputedStyle(cell).width;

  for (let i = 0; i < cell.childNodes.length; i += 1) {
    // the cell is not complex structure, so there is no the performance problem
    el.appendChild(cell.childNodes[i].cloneNode(true));
  }

  return el;
}

function createFloatingDraggableRow(offsetTop: number, cells: Element[], treeColumnName?: string) {
  const cellElements = treeColumnName
    ? cells.filter((cell) => cell.getAttribute(dataAttr.COLUMN_NAME) === treeColumnName)
    : cells;
  // get original table row height
  const height = `${cells[0].parentElement!.clientHeight}px`;
  const row = document.createElement('div');

  row.className = cls('floating-row');
  row.style.height = height;
  row.style.lineHeight = height;
  row.style.top = `${offsetTop}px`;
  row.style.width = 'auto';

  cellElements.forEach((cell) => {
    row.appendChild(createCells(cell));
  });

  return row;
}

export function createDraggableInfo(store: Store, posInfo: PosInfo): DraggableInfo | null {
  const { data, column } = store;
  const { rawData, filters } = data;

  // if there is any filter condition, cannot drag the row
  if (!rawData.length || filters?.length) {
    return null;
  }

  const { offsetTop, index } = getMovedPosAndIndex(store, posInfo);
  const { rowKey } = rawData[index];
  const cells = fromArray(posInfo.container!.querySelectorAll(`[data-row-key="${rowKey}"]`));

  return {
    row: createFloatingDraggableRow(offsetTop, cells, column.treeColumnName),
    rowKey,
    line: createFloatingLine(),
  };
}

export function getMovedPosAndIndex(store: Store, { pageY, top, scrollTop }: PosInfo) {
  const { rowCoords, dimension, column } = store;
  const { headerHeight } = dimension;
  const offsetTop = pageY - top + scrollTop;
  let index = findOffsetIndex(rowCoords.offsets, offsetTop);

  if (!column.treeColumnName) {
    if (offsetTop - rowCoords.offsets[index] > rowCoords.heights[index] * EXCEED_RATIO) {
      index += 1;
    }
  }

  return {
    offsetTop: offsetTop - scrollTop + headerHeight,
    index,
    height: rowCoords.offsets[index] + headerHeight,
  };
}

export function createFloatingLine() {
  const line = document.createElement('div');

  line.style.position = 'absolute';
  line.style.height = '1px';
  line.style.width = 'calc(100% - 17px)';
  line.style.background = '#00a9ff';

  return line;
}
