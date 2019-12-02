import { h, Component } from 'preact';
import { cls, setCursorStyle, dataAttr } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';
import { Side, ColumnInfo, ComplexColumnInfo } from '../store/types';
import { findProp, findPropIndex, includes, some } from '../helper/common';
import {
  getCellBorder,
  getComplexColumnsHierarchy,
  getHierarchyMaxRowCount
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
}

interface ResizerInfo {
  name: string;
  height: number;
  width: number;
  offsetX: number;
  offsetY: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

const WIDTH = 7;
const HALF_WIDTH = 3;

class ColumnResizerComp extends Component<Props> {
  // @TODO: 지울거야
  private isClick = -1;

  private dragStartX = -1;

  private draggingWidth = -1;

  private draggingIndex = -1;

  private handleMouseDown = (ev: MouseEvent, index: number) => {
    this.isClick = index;
    this.draggingIndex = index;
    this.draggingWidth = this.props.widths[index];
    this.dragStartX = ev.pageX;

    setCursorStyle('col-resize');
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.clearDocumentEvents);
    document.addEventListener('selectstart', this.handleSelectStart);
  };

  private handleSelectStart = (ev: Event) => {
    ev.preventDefault();
  };

  private handleMouseMove = (ev: MouseEvent) => {
    const width = this.draggingWidth + ev.pageX - this.dragStartX;
    const { side } = this.props;

    this.props.dispatch('setColumnWidth', side, this.draggingIndex, width);
  };

  private clearDocumentEvents = () => {
    this.isClick = -1;
    setCursorStyle('');
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.clearDocumentEvents);
    document.removeEventListener('selectstart', this.handleSelectStart);
  };

  public componentWillUnmount() {
    this.clearDocumentEvents();
  }

  private renderHandle(info: ResizerInfo, index: number) {
    const { name, height, offsetX, offsetY, width } = info;

    const attrs = {
      [dataAttr.COLUMN_INDEX]: index,
      [dataAttr.COLUMN_NAME]: name
    };

    return (
      <div
        class={cls('column-resize-handle')}
        title={''}
        {...attrs}
        style={{
          height,
          width: WIDTH,
          left: offsetX + width - HALF_WIDTH,
          bottom: offsetY,
          backgroundColor: this.isClick === index && '#00ff66'
        }}
        onMouseDown={ev => this.handleMouseDown(ev, index)}
      />
    );
  }

  private isHideChildColumns(name: string) {
    const { complexColumns } = this.props;

    return some(item => {
      return includes(item.childNames, name) && !!item.hideChildHeaders;
    }, complexColumns);
  }

  private findComplexColumnStartIndex(name: string): number {
    const { columns, complexColumns } = this.props;
    const idx = findPropIndex('name', name, columns);

    if (idx === -1) {
      const { childNames } = findProp('name', name, complexColumns)!;
      return this.findComplexColumnStartIndex(childNames[0]);
    }

    return idx;
  }

  private findComplexColumnEndIndex(name: string): number {
    const { columns, complexColumns } = this.props;
    const idx = findPropIndex('name', name, columns);

    if (idx === -1) {
      const { childNames } = findProp('name', name, complexColumns)!;
      return this.findComplexColumnEndIndex(childNames[childNames.length - 1]);
    }

    return idx;
  }

  private getComplexHeaderRange(name: string) {
    const { columns, complexColumns } = this.props;
    const index = findPropIndex('name', name, columns);
    if (index === -1) {
      // @TODO: complex column 순회하면서 최솟값 갱신. childNames가 순서대로 되어있을 거란 보장이 없음.
      let startIndex = Number.MAX_VALUE;
      let endIndex = Number.MIN_VALUE;
      const { childNames } = findProp('name', name, complexColumns)!;
      childNames.forEach(childName => {
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

    return {
      width: widths.slice(startIndex, endIndex + 1).reduce((a, b) => a + b),
      offsetX: offsets[startIndex] + getCellBorder(columns, complexColumns, name, cellBorderWidth)
    };
  }

  private getResizableColumnsInfo() {
    const { columns, complexColumns, headerHeight } = this.props;
    const hierarchies = getComplexColumnsHierarchy(columns, complexColumns);
    const maxLen = getHierarchyMaxRowCount(hierarchies);
    const defaultHeight = headerHeight / maxLen;
    // @TODO: 타입 분리 필요
    const nameMap = {} as { [key: string]: boolean };
    const resizerInfo = [] as ResizerInfo[];

    hierarchies.forEach(cols => {
      const len = cols.length;
      let offsetY = headerHeight;
      cols.forEach((col, idx) => {
        const { resizable, name } = col;
        const height = idx === len - 1 ? defaultHeight * (maxLen - len + 1) : defaultHeight;
        offsetY -= height;

        if (resizable && !this.isHideChildColumns(name) && !nameMap[name]) {
          resizerInfo.push({
            name,
            height,
            offsetY,
            ...this.getResizerCoords(name)
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
        style={`display: block; margin-top: -35px; height: 35px;`}
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
    complexColumns: column.complexColumnHeaders
  })
)(ColumnResizerComp);
