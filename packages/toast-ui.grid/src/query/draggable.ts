import { Store } from '@t/store';
import { RowKey, ViewRow, Row } from '@t/store/data';
import { findOffsetIndex, fromArray } from '../helper/common';
import { cls } from '../helper/dom';
import { findIndexByRowKey } from './data';

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
  targetRow?: Row;
}

const EXCEED_RATIO = 0.8;

function createRow(height: string) {
  const row = document.createElement('div');

  row.className = cls('floating-row');
  row.style.height = height;
  row.style.lineHeight = height;
  row.style.width = 'auto';

  return row;
}

function createCells(cell: Element) {
  const childLen = cell.childNodes.length;
  const el = document.createElement('div');
  el.className = cls('floating-cell');
  el.style.width = window.getComputedStyle(cell).width;

  for (let i = 0; i < childLen; i += 1) {
    // the cell is not complex structure, so there is no the performance problem
    el.appendChild(cell.childNodes[i].cloneNode(true));
  }

  return el;
}

function createTreeCell(treeColumnName: string, viewRow: ViewRow) {
  const cell = document.createElement('div');
  const iconStyle = viewRow.treeInfo!.leaf ? '' : 'background-position: -39px -35px';

  const span = document.createElement('span');
  span.className = cls('floating-tree-cell-content');
  span.textContent = String(viewRow.valueMap[treeColumnName].value);

  cell.className = cls('floating-tree-cell');
  cell.innerHTML = `
    <span class="${cls('tree-icon')}">
      <i style="${iconStyle}"></i>
    </span>
  `;
  cell.appendChild(span);

  return cell;
}

function createFloatingDraggableRow(
  store: Store,
  rowKey: RowKey,
  offsetTop: number,
  posInfo: PosInfo
) {
  const { data, column, id } = store;
  const { treeColumnName } = column;
  const cells = fromArray(posInfo.container!.querySelectorAll(`[data-row-key="${rowKey}"]`));

  // get original table row height
  const height = `${cells[0].parentElement!.clientHeight}px`;
  const row = createRow(height);

  row.style.top = `${offsetTop}px`;

  if (treeColumnName) {
    const index = findIndexByRowKey(data, column, id, rowKey);
    const viewRow = data.viewData[index];

    row.appendChild(createTreeCell(treeColumnName, viewRow));
  } else {
    cells.forEach((cell) => {
      row.appendChild(createCells(cell));
    });
  }

  return row;
}

export function createDraggableInfo(store: Store, posInfo: PosInfo): DraggableInfo | null {
  const { data, dimension } = store;
  const { rawData, filters } = data;

  // if there is any filter condition, cannot drag the row
  if (!rawData.length || filters?.length) {
    return null;
  }

  const { offsetTop, index } = getMovedPosAndIndex(store, posInfo);
  const { rowKey } = rawData[index];

  return {
    row: createFloatingDraggableRow(store, rowKey, offsetTop, posInfo),
    rowKey,
    line: createFloatingLine(dimension.scrollYWidth),
  };
}

export function getMovedPosAndIndex(store: Store, { pageY, top, scrollTop }: PosInfo) {
  const { rowCoords, dimension, column, data } = store;
  const { headerHeight } = dimension;
  const offsetTop = pageY - top + scrollTop;
  let index = findOffsetIndex(rowCoords.offsets, offsetTop);

  if (!column.treeColumnName) {
    if (offsetTop - rowCoords.offsets[index] > rowCoords.heights[index] * EXCEED_RATIO) {
      index += 1;
    }
  }

  return {
    index,
    offsetTop: offsetTop - scrollTop + headerHeight,
    height: rowCoords.offsets[index] - scrollTop + headerHeight,
    targetRow: data.rawData[index],
  };
}

export function createFloatingLine(scrollYWidth: number) {
  const line = document.createElement('div');

  line.className = cls('floating-line');
  line.style.width = `calc(100% - ${scrollYWidth}px)`;

  return line;
}
