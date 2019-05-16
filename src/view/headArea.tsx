import { h, Component } from 'preact';
import { ColumnInfo, Side } from '../store/types';
import { ColGroup } from './colGroup';
import { cls } from '../helper/dom';
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
}

type Props = OwnProps & StoreProps & DispatchProps;

class HeadAreaComp extends Component<Props> {
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
    const { headerHeight, cellBorderWidth, columns, side } = this.props;
    const areaStyle = { height: headerHeight + cellBorderWidth };
    const theadStyle = { height: headerHeight };

    return (
      <div
        class={cls('head-area')}
        style={areaStyle}
        ref={(el) => {
          this.el = el;
        }}
      >
        <table class={cls('table')}>
          <ColGroup side={side} />
          <tbody>
            <tr style={theadStyle}>
              {columns.map(({ name, header }) => (
                <th key={name} data-column-name={name} class={cls('cell', 'cell-head')}>
                  {name === '_checked' ? (
                    <span
                      dangerouslySetInnerHTML={{ __html: header }}
                      onChange={this.handleChange}
                    />
                  ) : (
                    header
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

export const HeadArea = connect<StoreProps, OwnProps>((store, { side }) => {
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
    checkedAllRows: data.checkedAllRows
  };
})(HeadAreaComp);
