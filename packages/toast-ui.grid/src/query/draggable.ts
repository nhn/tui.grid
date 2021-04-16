import { Store } from '@t/store';
import { RowKey } from '@t/store/data';
import { findOffsetIndex, fromArray } from '../helper/common';
import { cls } from '../helper/dom';

interface PosInfo {
  pageY: number;
  top: number;
  scrollTop: number;
  container?: HTMLElement;
}

export interface DraggableInfo {
  row: HTMLElement;
  rowKey: RowKey;
}

const EXCEED_RATIO = 0.7;

function createFloatingDraggableRow(offsetTop: number, cells: Element[]) {
  const row = document.createElement('div');
  // get original table row height
  const height = `${cells[0].parentElement!.clientHeight}px`;

  row.className = cls('floating-row');
  row.style.height = height;
  row.style.lineHeight = height;
  row.style.top = `${offsetTop}px`;

  cells.forEach((cell) => {
    const el = document.createElement('div');
    el.className = cls('floating-cell');
    el.style.width = window.getComputedStyle(cell).width;

    for (let i = 0; i < cell.childNodes.length; i += 1) {
      // the cell is not complex structure, so there is no the performance problem
      el.appendChild(cell.childNodes[i].cloneNode(true));
    }

    row.appendChild(el);
  });

  return row;
}

export function createDraggableInfo(store: Store, posInfo: PosInfo): DraggableInfo | null {
  const { data } = store;
  const { rawData, filters } = data;

  // if there is any filter condition, cannot drag the row
  if (!rawData.length || filters?.length) {
    return null;
  }

  const { offsetTop, index } = getMovedPosAndIndex(store, posInfo);
  const { rowKey } = rawData[index];
  const cells = fromArray(posInfo.container!.querySelectorAll(`[data-row-key="${rowKey}"]`));

  return { row: createFloatingDraggableRow(offsetTop, cells), rowKey };
}

export function getMovedPosAndIndex(store: Store, { pageY, top, scrollTop }: PosInfo) {
  const { rowCoords, dimension } = store;
  const offsetTop = pageY - top + scrollTop;
  let index = findOffsetIndex(rowCoords.offsets, offsetTop);

  if (offsetTop - rowCoords.offsets[index] > rowCoords.heights[index] * EXCEED_RATIO) {
    index += 1;
  }

  return { offsetTop: offsetTop + dimension.headerHeight, index };
}
