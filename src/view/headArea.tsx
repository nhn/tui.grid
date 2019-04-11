import { h, Component } from 'preact';
import { ColumnInfo, Side } from '../store/types';
import { ColGroup } from './colGroup';
import { cls } from '../helper/common';
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
  scrollX: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

class HeadAreaComp extends Component<Props> {
  el?: HTMLElement;

  componentDidUpdate() {
    this.el!.scrollLeft = this.props.scrollX;
  }

  render() {
    const { headerHeight, cellBorderWidth, columns, side } = this.props;
    const areaStyle = { height: headerHeight + cellBorderWidth };
    const theadStyle = { height: headerHeight };

    return (
      <div class={cls('head-area')} style={areaStyle} ref={(el) => (this.el = el)}>
        <table class={cls('table')}>
          <ColGroup side={side} />
          <tbody>
            <tr style={theadStyle}>
              {columns.map(({ name, title }) => (
                <th data-column-name={name} class={cls('cell', 'cell-head')}>
                  {title}
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
  const { headerHeight, cellBorderWidth } = store.dimension;

  return {
    headerHeight,
    cellBorderWidth,
    columns: store.column.visibleColumns[side],
    scrollX: side === 'L' ? 0 : store.viewport.scrollX
  };
})(HeadAreaComp);
