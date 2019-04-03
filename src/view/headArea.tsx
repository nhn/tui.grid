import { h, Component } from 'preact';
import { Column, Side } from '../store/types';
import { ColGroup } from './colGroup';
import { cls } from '../helper/common';
import { connect } from './hoc';
import { ColumnResizer } from './columnResizer';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  columns: Column[];
  scrollX: number;
}

type Props = OwnProps & StoreProps;

class HeadAreaComp extends Component<Props> {
  el?: HTMLElement;

  componentDidUpdate() {
    const { scrollX } = this.props;

    (this.el as HTMLElement).scrollLeft = scrollX;
  }

  render() {
    const style = { height: '34px' };
    const { columns, side } = this.props;

    return (
      <div class={cls('head-area')} style={style} ref={(el) => (this.el = el)}>
        <table class={cls('table')}>
          <ColGroup side={side} />
          <tbody>
            <tr>
              {columns.map(({ name, title }) => (
                <th
                  data-column-name={name}
                  class={cls('cell', 'cell-head')}
                  style={{ height: `33px` }}
                >
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
  return {
    columns: side === 'L' ? [] : store.columns,
    scrollX: side === 'L' ? 0 : store.viewport.scrollX
  };
})(HeadAreaComp);
