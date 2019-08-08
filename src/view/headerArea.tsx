import { h, Component } from 'preact';
import { ColumnInfo, Side, Range, ComplexColumnInfo } from '../store/types';
import { ColGroup } from './colGroup';
import { cls, setCursorStyle, getCoordinateWithOffset, hasClass, findParent } from '../helper/dom';
import { connect } from './hoc';
import { ColumnResizer } from './columnResizer';
import { DispatchProps } from '../dispatch/create';
import { getDataProvider } from '../instance';
import { DataProvider } from '../dataSource/types';
import { isParentColumnHeader, isRowHeader, isCheckboxColumn } from '../helper/column';
import { ComplexHeader } from './complexHeader';
import { HeaderCheckbox } from './headerCheckbox';
import { SortingButton } from './sortingButton';
import { SortingOrder } from './sortingOrder';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  headerHeight: number;
  cellBorderWidth: number;
  columns: ColumnInfo[];
  scrollLeft: number;
  dataProvider: DataProvider;
  columnSelectionRange: Range | null;
  complexHeaderColumns: ComplexColumnInfo[];
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
    const { dispatch, complexHeaderColumns } = this.props;
    const name = (ev.target as HTMLElement).getAttribute('data-column-name')!;
    const parentHeader = isParentColumnHeader(complexHeaderColumns, name);
    const target = ev.target as HTMLElement;

    if (findParent(target, 'cell-row-header') || hasClass(target, 'btn-sorting')) {
      return;
    }

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
    const { columns, headerHeight, cellBorderWidth, side, complexHeaderColumns } = this.props;
    const headerHeightStyle = { height: headerHeight + cellBorderWidth };

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
          {complexHeaderColumns.length ? (
            <ComplexHeader side={side} />
          ) : (
            <tbody>
              <tr style={headerHeightStyle} onDblClick={this.handleDblClick}>
                {columns.map(
                  (
                    { name, header, sortable, headerAlign: textAlign, headerVAlign: verticalAlign },
                    index
                  ) => (
                    <th
                      key={name}
                      data-column-name={name}
                      style={{ textAlign, verticalAlign, padding: '4px 5px' }}
                      class={cls(
                        'cell',
                        'cell-header',
                        [!isRowHeader(name) && this.isSelected(index), 'cell-selected'],
                        [isRowHeader(name), 'cell-row-header']
                      )}
                    >
                      {isCheckboxColumn(name) ? <HeaderCheckbox /> : header}
                      {!!sortable && <SortingButton columnName={name} />}
                      {!!sortable && <SortingOrder columnName={name} />}
                    </th>
                  )
                )}
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
    column: { visibleColumnsBySideWithRowHeader, complexHeaderColumns },
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
    dataProvider: getDataProvider(id),
    columnSelectionRange: rangeBySide && rangeBySide[side].column ? rangeBySide[side].column : null,
    complexHeaderColumns
  };
})(HeaderAreaComp);
