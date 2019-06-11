import { h, Component } from 'preact';
import { ColumnInfo, Side, Range, ComplexColumnInfo } from '../store/types';
import { ColGroup } from './colGroup';
import { cls, setCursorStyle, getCoordinateWithOffset } from '../helper/dom';
import { connect } from './hoc';
import { ColumnResizer } from './columnResizer';
import { DispatchProps } from '../dispatch/create';
import { getDataProvider } from '../instance';
import { DataProvider } from '../dataSource/types';
import { isRowHeader } from '../helper/column';
import { ComplexHeader } from './complexHeader';
import { HeaderCheckbox } from './headerCheckbox';
import { SortingButton } from './sortingButton';

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

  private handleDblClick = (ev: MouseEvent) => {
    ev.stopPropagation();
  };

  private handleMouseMove = (ev: MouseEvent) => {
    const [pageX, pageY] = getCoordinateWithOffset(ev.pageX, ev.pageY);
    this.props.dispatch('dragMoveHeader', { pageX, pageY });
  };

  private handleMouseDown = (ev: MouseEvent, name: string, sortable?: boolean) => {
    if (sortable) {
      return;
    }

    this.props.dispatch('mouseDownHeader', name);

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
    const areaStyle = { height: headerHeight + cellBorderWidth };
    const theadStyle = { height: headerHeight };

    return (
      <div
        class={cls('header-area')}
        style={areaStyle}
        ref={(el) => {
          this.el = el;
        }}
      >
        <table class={cls('table')}>
          <ColGroup side={side} useViewport={false} />
          {complexHeaderColumns.length ? (
            <ComplexHeader side={side} />
          ) : (
            <tbody>
              <tr style={theadStyle} onDblClick={this.handleDblClick}>
                {columns.map(({ name, header, sortable }, index) => (
                  <th
                    key={name}
                    data-column-name={name}
                    class={cls('cell', 'cell-header', [
                      !isRowHeader(name) && this.isSelected(index),
                      'cell-selected'
                    ])}
                    onMouseDown={(ev) => this.handleMouseDown(ev, name, sortable)}
                  >
                    {name === '_checked' ? <HeaderCheckbox /> : header}
                    {!!sortable && <SortingButton />}
                  </th>
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
    column: { visibleColumnsBySide, complexHeaderColumns },
    dimension: { headerHeight, cellBorderWidth },
    selection: { rangeBySide },
    viewport,
    id
  } = store;

  return {
    headerHeight,
    cellBorderWidth,
    columns: visibleColumnsBySide[side],
    scrollLeft: side === 'L' ? 0 : viewport.scrollLeft,
    dataProvider: getDataProvider(id),
    columnSelectionRange: rangeBySide && rangeBySide[side].column ? rangeBySide[side].column : null,
    complexHeaderColumns
  };
})(HeaderAreaComp);
