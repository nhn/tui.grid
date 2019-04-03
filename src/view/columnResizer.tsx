import { h, Component } from 'preact';
import { cls } from '../helper/common';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';
import { Side, Column } from '../store/types';

const HANDLE_WIDTH = 7;
const HANDLE_WIDTH_HALF = 3;

interface OwnProps {
  side: Side;
}

interface StoreProps {
  offsets: number[];
  widths: number[];
  columns: Column[];
}

type Props = OwnProps & StoreProps & DispatchProps;

class ColumnResizerComp extends Component<Props> {
  dragStartX = -1;
  draggingWidth = -1;
  draggingIndex = -1;

  handleMouseDown = (ev: MouseEvent, index: number) => {
    this.draggingIndex = index;
    this.draggingWidth = this.props.widths[index];
    this.dragStartX = ev.pageX;

    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('selectstart', this.handleSelectStart);
  };

  handleSelectStart = (ev: Event) => {
    ev.preventDefault();
  };

  handleMouseMove = (ev: MouseEvent) => {
    const width = this.draggingWidth + ev.pageX - this.dragStartX;

    this.props.dispatch('setColumnWidth', this.draggingIndex, width);
  };

  handleMouseUp = () => {
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('selectstart', this.handleSelectStart);
  };

  render({ columns, offsets, widths }: Props) {
    return (
      <div
        class={cls('column-resize-container')}
        style="display: block; margin-top: -35px; height: 35px;"
      >
        {columns.map((column, index) => (
          <div
            data-column-index={index}
            data-column-name={column.name}
            class={cls('column-resize-handle')}
            title={column.name}
            style={{
              width: `${HANDLE_WIDTH}px`,
              height: '33px',
              display: 'block',
              left: `${offsets[index] + widths[index] - HANDLE_WIDTH_HALF}px`
            }}
            onMouseDown={(ev) => this.handleMouseDown(ev, index)}
          />
        ))}
      </div>
    );
  }
}

export const ColumnResizer = connect<StoreProps, OwnProps, DispatchProps>(
  ({ viewport, columnCoords }, { side }) => ({
    widths: side === 'L' ? [] : columnCoords.widths,
    offsets: side === 'L' ? [] : columnCoords.offsets,
    columns: side === 'L' ? viewport.colsL : viewport.colsR
  })
)(ColumnResizerComp);
