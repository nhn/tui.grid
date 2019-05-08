import { h, Component } from 'preact';
import { cls } from '../helper/dom';
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

    document.body.style.cursor = 'col-resize';
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
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.clearDocumentEvents);
    document.removeEventListener('selectstart', this.handleSelectStart);
  };

  public componentWillUnmount() {
    this.clearDocumentEvents();
  }

  private renderHandle(index: number) {
    const { columns, offsets, widths } = this.props;
    const { name, resizable } = columns[index];
    const offset = offsets[index];
    const width = widths[index];

    if (!resizable) {
      return null;
    }

    return (
      <div
        data-column-index={index}
        data-column-name={name}
        class={cls('column-resize-handle')}
        title={''}
        style={{
          height: 33,
          width: HANDLE_WIDTH,
          left: offset + width - HANDLE_WIDTH_HALF
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
  ({ column, columnCoords }, { side }) => ({
    widths: columnCoords.widths[side],
    offsets: columnCoords.offsets[side],
    columns: column.visibleColumnsBySide[side]
  })
)(ColumnResizerComp);
