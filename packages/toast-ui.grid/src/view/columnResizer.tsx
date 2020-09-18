import { h, Component } from 'preact';
import { Side } from '@t/store/focus';
import { ColumnInfo, ComplexColumnInfo } from '@t/store/column';
import { Range } from '@t/store/selection';
import { Dictionary } from '@t/options';
import { cls, setCursorStyle, dataAttr } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';
import { findProp, findPropIndex, includes, some, sum } from '../helper/common';
import {
  getChildHeaderCount,
  getComplexColumnsHierarchy,
  getHierarchyMaxRowCount,
} from '../query/column';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  offsets: number[];
  widths: number[];
  columns: ColumnInfo[];
  cellBorderWidth: number;
  complexColumns: ComplexColumnInfo[];
  headerHeight: number;
  allColumnMap: Dictionary<ColumnInfo>;
}

interface ResizerInfo {
  name: string;
  header: string;
  height: number;
  width: number;
  offsetX: number;
  offsetY: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

const WIDTH = 7;
const HALF_WIDTH = 3;

class ColumnResizerComp extends Component<Props> {
  private dragStartX = -1;

  private draggingRange: Range = [-1, -1];

  private draggingWidths: number[] = [];

  private handleMouseDown = (ev: MouseEvent, name: string) => {
    const range = this.getComplexHeaderRange(name);
    this.draggingRange = range;
    this.dragStartX = ev.pageX;
    this.draggingWidths = this.props.widths.slice(range[0], range[1] + 1);

    setCursorStyle('col-resize');
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.clearDocumentEvents);
    document.addEventListener('selectstart', this.handleSelectStart);
  };

  private handleSelectStart = (ev: Event) => {
    ev.preventDefault();
  };

  private handleMouseMove = (ev: MouseEvent) => {
    const { side, dispatch } = this.props;
    const resizeAmount = ev.pageX - this.dragStartX;

    dispatch('setColumnWidth', side, this.draggingRange, resizeAmount, this.draggingWidths);
  };

  private clearDocumentEvents = () => {
    setCursorStyle('');
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.clearDocumentEvents);
    document.removeEventListener('selectstart', this.handleSelectStart);
  };

  public componentWillUnmount() {
    this.clearDocumentEvents();
  }

  private renderHandle(info: ResizerInfo, index: number) {
    const { name, height, offsetX, offsetY, width, header } = info;

    const attrs = {
      [dataAttr.COLUMN_INDEX]: index,
      [dataAttr.COLUMN_NAME]: name,
    };

    return (
      <div
        class={cls('column-resize-handle')}
        title={header}
        {...attrs}
        style={{
          height,
          width: WIDTH,
          left: offsetX + width - HALF_WIDTH,
          bottom: offsetY,
        }}
        onMouseDown={(ev) => this.handleMouseDown(ev, name)}
      />
    );
  }

  private isHideChildColumns(name: string) {
    return some(
      (item) => includes(item.childNames, name) && !!item.hideChildHeaders,
      this.props.complexColumns
    );
  }

  private findComplexColumnStartIndex(name: string): number {
    const { columns, complexColumns, allColumnMap } = this.props;
    const idx = findPropIndex('name', name, columns);

    if (idx === -1 && !allColumnMap[name].hidden) {
      const complexColumn = findProp('name', name, complexColumns)!;
      return this.findComplexColumnStartIndex(complexColumn.childNames[0]);
    }

    return idx;
  }

  private findComplexColumnEndIndex(name: string): number {
    const { columns, complexColumns, allColumnMap } = this.props;
    const idx = findPropIndex('name', name, columns);

    if (idx === -1 && !allColumnMap[name].hidden) {
      const { childNames } = findProp('name', name, complexColumns)!;
      return this.findComplexColumnEndIndex(childNames[childNames.length - 1]);
    }

    return idx;
  }

  private getComplexHeaderRange(name: string): Range {
    const { columns, complexColumns } = this.props;
    const index = findPropIndex('name', name, columns);
    if (index === -1) {
      let startIndex = Number.MAX_VALUE;
      let endIndex = Number.MIN_VALUE;
      const { childNames } = findProp('name', name, complexColumns)!;
      childNames.forEach((childName) => {
        startIndex = Math.min(startIndex, this.findComplexColumnStartIndex(childName));
        endIndex = Math.max(startIndex, this.findComplexColumnEndIndex(childName));
      });

      return [startIndex, endIndex];
    }

    return [index, index];
  }

  private getResizerCoords(name: string) {
    const { offsets, widths, columns, cellBorderWidth, complexColumns } = this.props;
    const [startIndex, endIndex] = this.getComplexHeaderRange(name);
    const count = getChildHeaderCount(columns, complexColumns, name);
    const cellBorder = count ? count * cellBorderWidth : cellBorderWidth;

    return {
      width: sum(widths.slice(startIndex, endIndex + 1)),
      offsetX: offsets[startIndex] + cellBorder,
    };
  }

  private getResizableColumnsInfo() {
    const { columns, complexColumns, headerHeight } = this.props;
    const hierarchies = getComplexColumnsHierarchy(columns, complexColumns);
    const maxLen = getHierarchyMaxRowCount(hierarchies);
    const defaultHeight = headerHeight / maxLen;
    const nameMap: Dictionary<boolean> = {};
    const resizerInfo: ResizerInfo[] = [];

    hierarchies.forEach((cols) => {
      const len = cols.length;
      let offsetY = headerHeight;
      cols.forEach((col, idx) => {
        const { resizable, name, header } = col;
        const height = idx === len - 1 ? defaultHeight * (maxLen - len + 1) : defaultHeight;
        offsetY -= height;

        if (resizable && !this.isHideChildColumns(name) && !nameMap[name]) {
          resizerInfo.push({
            name,
            header,
            height,
            offsetY,
            ...this.getResizerCoords(name),
          });
          nameMap[name] = true;
        }
      });
    });

    return resizerInfo;
  }

  public render() {
    return (
      <div
        class={cls('column-resize-container')}
        style="display: block; margin-top: -35px; height: 35px;"
      >
        {this.getResizableColumnsInfo().map((info, index) => this.renderHandle(info, index))}
      </div>
    );
  }
}

export const ColumnResizer = connect<StoreProps, OwnProps>(
  ({ column, columnCoords, dimension }, { side }) => ({
    widths: columnCoords.widths[side],
    offsets: columnCoords.offsets[side],
    headerHeight: dimension.headerHeight,
    cellBorderWidth: dimension.cellBorderWidth,
    columns: column.visibleColumnsBySideWithRowHeader[side],
    complexColumns: column.complexColumnHeaders,
    allColumnMap: column.allColumnMap,
  })
)(ColumnResizerComp);
