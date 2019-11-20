import { h, Component } from 'preact';
import { cls, setCursorStyle, dataAttr } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';
import { Side, ColumnInfo, ComplexColumnInfo } from '../store/types';
import { includes, some } from '../helper/common';

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

type Props = OwnProps & StoreProps & DispatchProps;

const WIDTH = 7;
const HALF_WIDTH = 3;

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
          width: WIDTH,
          left: offset + width + cellBorderWidth - HALF_WIDTH
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

  private getResizableColumns() {
    return this.props.columns.filter(column => {
      const { resizable, name } = column;

      return resizable && !this.isHideChildColumns(name);
    });
  }

  public render({ headerHeight }: Props) {
    console.log(headerHeight);
    // @TODO: border 제거. 테스트용
    return (
      <div
        class={cls('column-resize-container')}
        style={`display: block; margin-top: -35px; height: ${headerHeight}px; border: 1px solid #ccc;`}
      >
        {this.getResizableColumns().map((_, index) => this.renderHandle(index))}
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
