
import { h, Component } from 'preact';
import { Column, Side } from '../store/types';
import { ColGroup } from './colGroup';
import { cls } from '../helper/common';
import { connect } from './hoc';

interface OwnProps {
  side: Side
}

interface InjectedProps {
  columns: Column[];
  scrollX: number;
}

type Props = OwnProps & InjectedProps;

export const HeadArea = connect((store, { side }: OwnProps) => {
  return {
    columns: side === 'L' ? [] : store.columns,
    scrollX: side === 'L' ? 0 : store.viewport.scrollX
  }
})(
  class extends Component<Props> {
    el: HTMLElement = null;

    componentDidUpdate() {
      const { side, scrollX } = this.props;

      this.el.scrollLeft = scrollX;
    }

    render({ columns, side }: Props) {
      const style = { height: '34px' };

      return (
        <div class={cls('head-area')} style={style} ref={el => this.el = el}>
          <table class={cls('table')}>
            <ColGroup side={side} />
            <tbody>
              <tr>
                {columns.map(({ name, title }) =>
                  <th
                    data-column-name={name}
                    class={cls('cell', 'cell-head')}
                    style={{ height: `33px` }}>{title}</th>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  }
)

