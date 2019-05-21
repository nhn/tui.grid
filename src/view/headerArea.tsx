import { h, Component } from 'preact';
import { ColumnInfo, Side, SortOptions } from '../store/types';
import { ColGroup } from './colGroup';
import { cls, hasClass, findParent } from '../helper/dom';
import { connect } from './hoc';
import { ColumnResizer } from './columnResizer';
import { DispatchProps } from '../dispatch/create';

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

    const { dispatch, sortOptions } = this.props;
    const th = findParent(target, 'cell');
    const targetColumnName = th!.getAttribute('data-column-name')!;
    let targetAscending = true;

    if (sortOptions) {
      const { columnName, ascending } = sortOptions;
      targetAscending = columnName === targetColumnName ? !ascending : targetAscending;
    }
    dispatch('sort', targetColumnName, targetAscending);
  };

  private handleDblClick = (ev: MouseEvent) => {
    ev.stopPropagation();
  };

  private updateRowHeaderCheckbox() {
    const { checkedAllRows } = this.props;
    const input = this.el!.querySelector('input[name=_checked]') as HTMLInputElement;

    if (input) {
      input.checked = checkedAllRows;
    }
  }

  public componentDidUpdate() {
    const { scrollLeft, hasRowHeaderCheckbox } = this.props;

    this.el!.scrollLeft = scrollLeft;

    if (hasRowHeaderCheckbox) {
      this.updateRowHeaderCheckbox();
    }
  }

  public render() {
    const { headerHeight, cellBorderWidth, columns, side, sortOptions } = this.props;
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
          <ColGroup side={side} />
          <tbody>
            <tr style={theadStyle} onClick={this.handleClick} onDblClick={this.handleDblClick}>
              {columns.map(({ name, header, sortable }) => (
                <th key={name} data-column-name={name} class={cls('cell', 'cell-header')}>
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
    viewport
  } = store;

  return {
    headerHeight,
    cellBorderWidth,
    columns: store.column.visibleColumnsBySide[side],
    scrollLeft: side === 'L' ? 0 : viewport.scrollLeft,
    hasRowHeaderCheckbox: !!column.allColumnMap._checked,
    checkedAllRows: data.checkedAllRows,
    sortOptions: data.sortOptions
  };
})(HeaderAreaComp);
