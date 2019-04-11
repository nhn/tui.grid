import { h, Component } from 'preact';
import { BodyRows } from './bodyRows';
import { ColGroup } from './colGroup';
import { Side, Row, ColumnInfo } from '../store/types';
import { cls } from '../helper/common';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  data: Row[];
  columns: ColumnInfo[];
  bodyHeight: number;
  totalRowHeight: number;
  scrollY: number;
  offsetY: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

class BodyAreaComp extends Component<Props> {
  el?: HTMLElement;

  componentDidUpdate() {
    this.el!.scrollTop = this.props.scrollY;
  }

  render({ side, bodyHeight, totalRowHeight, offsetY, dispatch }: Props) {
    const areaStyle = { overflow: 'scroll', height: `${bodyHeight}px` };
    const containerStyle = { height: `${totalRowHeight}px` };
    const tableStyle = { overflow: 'visible', top: `${offsetY}px` };

    const onScroll = (ev: UIEvent) => {
      const { scrollLeft, scrollTop } = ev.srcElement!;

      if (this.props.side === 'R') {
        dispatch('setScrollX', scrollLeft);
      }
      dispatch('setScrollY', scrollTop);
    };

    return (
      <div
        class={cls('body-area')}
        style={areaStyle}
        onScroll={onScroll}
        ref={(el) => (this.el = el)}
      >
        <div class={cls('body-container')} style={containerStyle}>
          <div class={cls('table-container')} style={tableStyle}>
            <table class={cls('table')}>
              <ColGroup side={side} />
              <BodyRows side={side} />
            </table>
            <div class={cls('layer-selection')} style="display: none;" />
          </div>
        </div>
      </div>
    );
  }
}

export const BodyArea = connect<StoreProps, OwnProps>((store, { side }) => {
  const { data, column, dimension, viewport } = store;
  const { bodyHeight, totalRowHeight } = dimension;
  const { offsetY, scrollY } = viewport;

  return {
    data,
    columns: column.visibleColumns[side],
    bodyHeight,
    totalRowHeight,
    scrollY,
    offsetY
  };
})(BodyAreaComp);
