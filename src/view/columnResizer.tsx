import { h, Component } from 'preact';
import { cls, setCursorStyle, dataAttr } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';
import { Side, ColumnInfo } from '../store/types';

export const HANDLE_WIDTH = 7;
export const HANDLE_WIDTH_HALF = 3;

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

class ColumnResizerComp extends Component<Props> {
  private dragStartX = -1;

  private draggingWidth = -1;

  private draggingIndex = -1;

  private handleMouseDown = (ev: MouseEvent, index: number) => {
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
    setCursorStyle('');
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.clearDocumentEvents);
    document.removeEventListener('selectstart', this.handleSelectStart);
  };

  public componentWillUnmount() {
    this.clearDocumentEvents();
  }

  private renderHandle(index: number) {
    const { columns, offsets, cellBorderWidth, widths } = this.props;
    const { name, resizable } = columns[index];
    if (!resizable) {
      return null;
    }

    const offset = offsets[index];
    const width = widths[index];
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
          height: 33,
          width: HANDLE_WIDTH,
          left: offset + width + cellBorderWidth - HANDLE_WIDTH_HALF
        }}
        onMouseDown={(ev) => this.handleMouseDown(ev, index)}
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
