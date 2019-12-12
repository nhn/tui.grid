import { h, Component } from 'preact';
import { ColumnInfo, Side, Range, ComplexColumnInfo } from '../store/types';
import { ColGroup } from './colGroup';
import { cls, setCursorStyle, getCoordinateWithOffset, hasClass, findParent } from '../helper/dom';
import { connect } from './hoc';
import { ColumnResizer } from './columnResizer';
import { DispatchProps } from '../dispatch/create';
import { getInstance } from '../instance';
import { isParentColumnHeader } from '../query/column';
import { ComplexHeader } from './complexHeader';
import { ColumnHeader } from './columnHeader';
import Grid from '../grid';

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
}

type Props = OwnProps & StoreProps & DispatchProps;

class HeaderAreaComp extends Component<Props> {
  private el?: HTMLElement;

  private startSelectedName: string | null = null;

  private handleDblClick = (ev: MouseEvent) => {
    ev.stopPropagation();
  };

  private handleMouseMove = (ev: MouseEvent) => {
    const [pageX, pageY] = getCoordinateWithOffset(ev.pageX, ev.pageY);
    this.props.dispatch('dragMoveHeader', { pageX, pageY }, this.startSelectedName!);
  };

  private handleMouseDown = (ev: MouseEvent) => {
    const { dispatch, complexColumnHeaders } = this.props;
    const target = ev.target as HTMLElement;

    if (
      findParent(target, 'cell-row-header') ||
      hasClass(target, 'btn-sorting') ||
      hasClass(target, 'btn-filter')
    ) {
      return;
    }

    let name = target.getAttribute('data-column-name')!;

    if (!name) {
      const parent = findParent(target, 'cell-header');
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
        ref={el => {
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
    id
  } = store;

  return {
    headerHeight,
    cellBorderWidth,
    columns: visibleColumnsBySideWithRowHeader[side],
    scrollLeft: side === 'L' ? 0 : viewport.scrollLeft,
    grid: getInstance(id),
    columnSelectionRange: rangeBySide && rangeBySide[side].column ? rangeBySide[side].column : null,
    complexColumnHeaders
  };
})(HeaderAreaComp);
