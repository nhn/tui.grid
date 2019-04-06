import { h } from 'preact';
import { BodyRows } from './bodyRows';
import { ColGroup } from './colGroup';
import { Side, Row, Column } from '../store/types';
import { cls } from '../helper/common';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  data: Row[];
  columns: Column[];
  bodyHeight: number;
  totalRowHeight: number;
  offsetY: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

function BodyAreaComp(props: Props) {
  const { side, bodyHeight, totalRowHeight, offsetY, dispatch } = props;

  const areaStyle = { overflow: 'scroll', height: `${bodyHeight}px` };
  const containerStyle = { height: `${totalRowHeight}px` };
  const tableStyle = { overflow: 'visible', top: `${offsetY}px` };

  const onScroll = (ev: UIEvent) => {
    const { scrollLeft, scrollTop } = ev.srcElement as HTMLElement;
    dispatch('setScroll', scrollLeft, scrollTop);
  };

  return (
    <div class={cls('body-area')} style={areaStyle} onScroll={onScroll}>
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

export const BodyArea = connect<StoreProps, OwnProps>((store, { side }) => {
  const { data, columns, dimension, viewport } = store;
  const { bodyHeight, totalRowHeight } = dimension;
  const { offsetY } = viewport;

  return {
    data,
    columns: side === 'L' ? [] : columns,
    bodyHeight,
    totalRowHeight,
    offsetY
  };
})(BodyAreaComp);
