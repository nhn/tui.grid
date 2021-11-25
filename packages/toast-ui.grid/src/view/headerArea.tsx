import { h, Component } from 'preact';
import { Side } from '@t/store/focus';
import { ColumnInfo, ComplexColumnInfo } from '@t/store/column';
import { Range } from '@t/store/selection';
import { ColGroup } from './colGroup';
import {
  cls,
  setCursorStyle,
  getCoordinateWithOffset,
  hasClass,
  findParentByClassName,
} from '../helper/dom';
import { connect } from './hoc';
import { ColumnResizer } from './columnResizer';
import { DispatchProps } from '../dispatch/create';
import { getInstance } from '../instance';
import { isDraggableColumn, isParentColumnHeader } from '../query/column';
import { ComplexHeader } from './complexHeader';
import { ColumnHeader } from './columnHeader';
import { RIGHT_MOUSE_BUTTON } from '../helper/constant';
import Grid from '../grid';
import {
  createDraggableColumnInfo,
  DraggableColumnInfo,
  getMovedPosAndIndexOfColumn,
  PosInfo,
} from '../query/draggable';
import { findOffsetIndex } from '../helper/common';
import GridEvent from '../event/gridEvent';
import { EventBus, getEventBus } from '../event/eventBus';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  headerHeight: number;
  cellBorderWidth: number;
  columns: ColumnInfo[];
  scrollLeft: number;
  grid: Grid;
  columnSelectionRange: Range | null;
  complexColumnHeaders: ComplexColumnInfo[];
  eventBus: EventBus;
}

type Props = OwnProps & StoreProps & DispatchProps;

interface MovedIndexInfo {
  index: number;
  columnName: string | null;
}

const DRAGGING_CLASS = 'dragging';

class HeaderAreaComp extends Component<Props> {
  private el?: HTMLElement;

  private container: HTMLElement | null = null;

  private dragColumnInfo: DraggableColumnInfo | null = null;

  private floatingColumnWidth: number | null = null;

  private startSelectedName: string | null = null;

  private offsetLeft: number | null = null;

  private movedIndexInfo: MovedIndexInfo | null = null;

  private handleDblClick = (ev: MouseEvent) => {
    ev.stopPropagation();
  };

  private getPosInfo(ev: MouseEvent, el: HTMLElement): PosInfo {
    const [pageX, pageY] = getCoordinateWithOffset(ev.pageX, ev.pageY);
    const { scrollTop, scrollLeft } = el;
    const { top, left } = el.getBoundingClientRect();

    return { pageX, pageY, left, top, scrollLeft, scrollTop };
  }

  private handleMouseMove = (ev: MouseEvent) => {
    const { store } = this.context;

    this.offsetLeft = ev.offsetX;

    const posInfo = this.getPosInfo(ev, this.el!);
    const { pageX, pageY, scrollTop, top } = posInfo;
    const {
      targetColumn: { name: currentColumnName },
    } = getMovedPosAndIndexOfColumn(store, posInfo, this.offsetLeft!);

    if (
      currentColumnName === this.startSelectedName &&
      isDraggableColumn(store, currentColumnName) &&
      findOffsetIndex(store.rowCoords.offsets, pageY - top + scrollTop) > 0
    ) {
      this.startToDragColumn(posInfo);
      return;
    }

    this.props.dispatch('dragMoveHeader', { pageX, pageY }, this.startSelectedName!);
  };

  private handleMouseDown = (ev: MouseEvent) => {
    const { dispatch, complexColumnHeaders } = this.props;
    const target = ev.target as HTMLElement;

    if (
      findParentByClassName(target, 'cell-row-header') ||
      hasClass(target, 'btn-sorting') ||
      hasClass(target, 'btn-filter') ||
      ev.button === RIGHT_MOUSE_BUTTON
    ) {
      return;
    }

    let name = target.getAttribute('data-column-name')!;

    if (!name) {
      const parent = findParentByClassName(target, 'cell-header');
      if (parent) {
        name = parent.getAttribute('data-column-name')!;
      }
    }

    const parentHeader = isParentColumnHeader(complexColumnHeaders, name);

    this.startSelectedName = name;
    dispatch('mouseDownHeader', name, parentHeader);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.clearDocumentEvents);
    document.addEventListener('selectstart', this.handleSelectStart);
  };

  private clearDocumentEvents = () => {
    this.props.dispatch('dragEnd');

    setCursorStyle('');
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.clearDocumentEvents);
    document.removeEventListener('selectstart', this.handleSelectStart);
  };

  private handleSelectStart = (ev: Event) => {
    ev.preventDefault();
  };

  private isSelected(index: number) {
    const { columnSelectionRange } = this.props;
    if (!columnSelectionRange) {
      return false;
    }
    const [start, end] = columnSelectionRange;
    return index >= start && index <= end;
  }

  private startToDragColumn = (posInfo: PosInfo) => {
    const { dispatch } = this.props;
    this.container = this.el?.parentElement?.parentElement!;

    posInfo.container = this.container;

    const draggableInfo = createDraggableColumnInfo(this.context.store, posInfo);
    const { column, columnName } = draggableInfo;

    const gridEvent = new GridEvent({ columnName, floatingColumn: column });
    /**
     * Occurs when starting to drag the column
     * @event Grid#dragStart
     * @property {Grid} instance - Current grid instance
     * @property {string} columnName - The column name of the column to drag
     * @property {HTMLElement} floatingColumn - The floating column DOM element
     */
    this.props.eventBus.trigger('dragStart', gridEvent);

    if (!gridEvent.isStopped()) {
      this.container.appendChild(column);

      this.floatingColumnWidth = column.clientWidth;
      this.dragColumnInfo = draggableInfo;

      dispatch('addColumnClassName', columnName, DRAGGING_CLASS);
      dispatch('setFocusInfo', null, null, false);
      dispatch('initSelection');

      document.removeEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mousemove', this.dragColumn);
      document.addEventListener('mouseup', this.dropColumn);
    }
  };

  private dragColumn = (ev: MouseEvent) => {
    const posInfo = this.getPosInfo(ev, this.el!);
    const { index, offsetLeft, targetColumn } = getMovedPosAndIndexOfColumn(
      this.context.store,
      posInfo,
      this.offsetLeft!,
      this.floatingColumnWidth!
    );

    const { column, columnName } = this.dragColumnInfo!;
    column.style.left = `${offsetLeft}px`;

    this.movedIndexInfo = { index, columnName: targetColumn.name };
    this.props.dispatch('moveColumn', columnName, index);

    const gridEvent = new GridEvent({
      columnName,
      targetColumnName: targetColumn.name,
    });

    /**
     * Occurs when dragging the column
     * @event Grid#drag
     * @property {Grid} instance - Current grid instance
     * @property {string} columnName - The column name of the dragging column
     * @property {string} targetColumnName - The column name of the column at current dragging position
     */
    this.props.eventBus.trigger('drag', gridEvent);
  };

  private dropColumn = () => {
    const { columnName } = this.dragColumnInfo!;

    if (this.movedIndexInfo) {
      const { index, columnName: targetColumnName } = this.movedIndexInfo;

      const gridEvent = new GridEvent({
        columnName,
        targetColumnName,
      });

      /**
       * Occurs when dropping the column
       * @event Grid#drop
       * @property {Grid} instance - Current grid instance
       * @property {string} columnName - The column name of the dragging column
       * @property {string} targetColumnName - The column name of the column at current dragging position
       */
      this.props.eventBus.trigger('drop', gridEvent);

      if (!gridEvent.isStopped()) {
        this.props.dispatch('moveColumn', columnName, index);
      }
    }

    this.props.dispatch('removeColumnClassName', this.dragColumnInfo!.columnName!, DRAGGING_CLASS);

    this.clearDraggableInfo();
  };

  private clearDraggableInfo = () => {
    this.container!.removeChild(this.dragColumnInfo!.column);
    this.dragColumnInfo = null;
    this.container = null;
    this.floatingColumnWidth = null;
    this.offsetLeft = null;
    this.movedIndexInfo = null;

    document.removeEventListener('mousemove', this.dragColumn);
    document.removeEventListener('mouseup', this.dropColumn);
  };

  public componentDidUpdate() {
    this.el!.scrollLeft = this.props.scrollLeft;
  }

  public render() {
    const { columns, headerHeight, side, complexColumnHeaders, grid } = this.props;
    const headerHeightStyle = { height: headerHeight };

    return (
      <div
        class={cls('header-area')}
        style={headerHeightStyle}
        ref={(el) => {
          this.el = el;
        }}
      >
        <table class={cls('table')} onMouseDown={this.handleMouseDown}>
          <ColGroup side={side} useViewport={false} />
          {complexColumnHeaders.length ? (
            <ComplexHeader side={side} grid={grid} />
          ) : (
            <tbody>
              <tr style={headerHeightStyle} onDblClick={this.handleDblClick}>
                {columns.map((columnInfo, index) => (
                  <ColumnHeader
                    key={columnInfo.name}
                    columnInfo={columnInfo}
                    selected={this.isSelected(index)}
                    grid={grid}
                  />
                ))}
              </tr>
            </tbody>
          )}
        </table>
        <ColumnResizer side={side} />
      </div>
    );
  }
}

export const HeaderArea = connect<StoreProps, OwnProps>((store, { side }) => {
  const {
    column: { visibleColumnsBySideWithRowHeader, complexColumnHeaders },
    dimension: { headerHeight, cellBorderWidth },
    selection: { rangeBySide },
    viewport,
    id,
  } = store;

  return {
    headerHeight,
    cellBorderWidth,
    columns: visibleColumnsBySideWithRowHeader[side],
    scrollLeft: side === 'L' ? 0 : viewport.scrollLeft,
    grid: getInstance(id),
    columnSelectionRange: rangeBySide && rangeBySide[side].column ? rangeBySide[side].column : null,
    complexColumnHeaders,
    eventBus: getEventBus(id),
  };
})(HeaderAreaComp);
