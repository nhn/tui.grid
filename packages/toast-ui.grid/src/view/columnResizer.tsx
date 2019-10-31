import { h, Component } from 'preact';
import { cls, setCursorStyle, dataAttr } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';
import { Side, ColumnInfo, Range } from '../store/types';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  offsets: number[];
  widths: number[];
  columns: ColumnInfo[];
  cellBorderWidth: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

const WIDTH = 7;
const HALF_WIDTH = 3;

class ColumnResizerComp extends Component<Props> {
  private dragStartX = -1;

  private draggingWidth = -1;

  private draggingRange: Range = [-1, -1];

  private getWidthInRange = (range: Range) => {
    const { widths } = this.props;
    let width = 0;
    const [startIdx, endIdx] = range;

    for (let idx = startIdx; idx <= endIdx; idx += 1) {
      width += widths[idx];
    }

    return width;
  };

  private handleMouseDown = (ev: MouseEvent, range: Range) => {
    this.draggingRange = range;
    this.draggingWidth = this.getWidthInRange(range);
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

    this.props.dispatch('setColumnWidth', side, this.draggingRange, width);
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

  private renderHandle(startIdx: number) {
    const { columns, offsets, cellBorderWidth, widths } = this.props;
    const { name, resizable, headerColSpan } = columns[startIdx];
    if (!resizable || (headerColSpan && !headerColSpan.mainColumn)) {
      return null;
    }
    const endIdx = headerColSpan ? startIdx + headerColSpan.spanCount - 1 : startIdx;
    const totalCellBorderWidth = headerColSpan
      ? cellBorderWidth * headerColSpan.spanCount
      : cellBorderWidth;

    const offset = offsets[endIdx];
    const width = widths[endIdx];
    const attrs = {
      [dataAttr.COLUMN_INDEX]: startIdx,
      [dataAttr.COLUMN_NAME]: name
    };
    const range: Range = [startIdx, endIdx];

    return (
      <div
        class={cls('column-resize-handle')}
        title={''}
        {...attrs}
        style={{
          height: 33,
          width: WIDTH,
          left: offset + width + totalCellBorderWidth - HALF_WIDTH
        }}
        onMouseDown={ev => this.handleMouseDown(ev, range)}
      />
    );
  }

  public render({ columns }: Props) {
    return (
      <div
        class={cls('column-resize-container')}
        style="display: block; margin-top: -35px; height: 35px;"
      >
        {columns.map((_, index) => this.renderHandle(index))}
      </div>
    );
  }
}

export const ColumnResizer = connect<StoreProps, OwnProps>(
  ({ column, columnCoords, dimension }, { side }) => ({
    widths: columnCoords.widths[side],
    offsets: columnCoords.offsets[side],
    cellBorderWidth: dimension.cellBorderWidth,
    columns: column.visibleColumnsBySideWithRowHeader[side]
  })
)(ColumnResizerComp);
