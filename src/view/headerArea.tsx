import { h, Component } from 'preact';
import { ColumnInfo, Side, SortOptions, Range } from '../store/types';
import { ColGroup } from './colGroup';
import {
  cls,
  hasClass,
  findParent,
  setCursorStyle,
  getCoordinateWithOffset,
  dataAttr
} from '../helper/dom';
import { connect } from './hoc';
import { ColumnResizer } from './columnResizer';
import { DispatchProps } from '../dispatch/create';
import { getDataProvider } from '../instance';
import { DataProvider } from '../dataSource/types';
import { isRowHeader } from '../helper/column';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  headerHeight: number;
  cellBorderWidth: number;
  columns: ColumnInfo[];
  scrollLeft: number;
  hasRowHeaderCheckbox: boolean;
  checkedAllRows: boolean;
  sortOptions: SortOptions;
  disabled: boolean;
  dataProvider: DataProvider;
  columnSelectionRange: Range | null;
}

type Props = OwnProps & StoreProps & DispatchProps;

class HeaderAreaComp extends Component<Props> {
  private el?: HTMLElement;

  private handleChange = (ev: Event) => {
    const target = ev.target as HTMLInputElement;
    const { dispatch } = this.props;

    if (target.checked) {
      dispatch('checkAll');
    } else {
      dispatch('uncheckAll');
    }
  };

  private handleClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;

    if (!hasClass(target, 'btn-sorting')) {
      return;
    }

    const { dispatch, sortOptions, dataProvider } = this.props;
    const th = findParent(target, 'cell');
    const targetColumnName = th!.getAttribute(dataAttr.COLUMN_NAME)!;
    let targetAscending = true;

    if (sortOptions) {
      const { columnName, ascending } = sortOptions;
      targetAscending = columnName === targetColumnName ? !ascending : targetAscending;
    }

    if (sortOptions.useClient) {
      dispatch('sort', targetColumnName, targetAscending);
    } else {
      dispatch('changeSortBtn', targetColumnName, targetAscending);
      const data = {
        sortColumn: targetColumnName,
        sortAscending: targetAscending
      };
      dataProvider.readData(1, data, true);
    }
  };

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

  private updateRowHeaderCheckbox() {
    const { checkedAllRows, disabled } = this.props;
    const input = this.el!.querySelector('input[name=_checked]') as HTMLInputElement;

    if (input) {
      input.checked = checkedAllRows;
      input.disabled = disabled;
    }
  }

  public componentDidUpdate() {
    const { scrollLeft, hasRowHeaderCheckbox } = this.props;

    this.el!.scrollLeft = scrollLeft;

    if (hasRowHeaderCheckbox) {
      this.updateRowHeaderCheckbox();
    }
  }

  private isSelected(index: number) {
    const { columnSelectionRange } = this.props;
    if (!columnSelectionRange) {
      return false;
    }
    const [start, end] = columnSelectionRange;
    return index >= start && index <= end;
  }

  public render() {
    const { headerHeight, cellBorderWidth, columns, side, sortOptions } = this.props;
    const areaStyle = { height: headerHeight + cellBorderWidth };
    const theadStyle = { height: headerHeight };
    const attrs = { [dataAttr.COLUMN_NAME]: name };

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
          <tbody>
            <tr style={theadStyle} onClick={this.handleClick} onDblClick={this.handleDblClick}>
              {columns.map(({ name, header, sortable }, index) => (
                <th
                  {...attrs}
                  key={name}
                  class={cls('cell', 'cell-header', [
                    !isRowHeader(name) && this.isSelected(index),
                    'cell-selected'
                  ])}
                  onMouseDown={(ev) => this.handleMouseDown(ev, name, sortable)}
                >
                  {name === '_checked' ? (
                    <span
                      dangerouslySetInnerHTML={{ __html: header }}
                      onChange={this.handleChange}
                    />
                  ) : (
                    header
                  )}
                  {sortable && (
                    <a
                      class={cls('btn-sorting', [
                        sortOptions.columnName === name,
                        sortOptions.ascending ? 'btn-sorting-up' : 'btn-sorting-down'
                      ])}
                    />
                  )}
                </th>
              ))}
            </tr>
          </tbody>
        </table>
        <ColumnResizer side={side} />
      </div>
    );
  }
}

export const HeaderArea = connect<StoreProps, OwnProps>((store, { side }) => {
  const {
    data,
    column,
    dimension: { headerHeight, cellBorderWidth },
    viewport,
    id,
    selection: { rangeBySide }
  } = store;

  return {
    headerHeight,
    cellBorderWidth,
    columns: store.column.visibleColumnsBySide[side],
    scrollLeft: side === 'L' ? 0 : viewport.scrollLeft,
    hasRowHeaderCheckbox: !!column.allColumnMap._checked,
    checkedAllRows: data.checkedAllRows,
    sortOptions: data.sortOptions,
    disabled: data.disabled,
    dataProvider: getDataProvider(id),
    columnSelectionRange: rangeBySide && rangeBySide[side].column ? rangeBySide[side].column : null
  };
})(HeaderAreaComp);
