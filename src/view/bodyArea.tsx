import { h, Component } from 'preact';
import { BodyRows } from './bodyRows';
import { ColGroup } from './colGroup';
import { Side, Row, Column, Viewport } from '../store/types';
import { cls } from '../helper/common';
import { Dispatch } from '../dispatch/types';
import { connect } from './hoc';

interface OwnProps {
  side: Side;
}

interface InjectedProps {
  data: Row[];
  columns: Column[];
  bodyHeight: number;
  totalRowHeight: number;
  offsetY: number;
  dispatch: Dispatch;
}

type Props = OwnProps & InjectedProps;

export const BodyArea = connect((store, { side }: OwnProps) => {
  const { data, columns, dimension, viewport } = store;
  const { bodyHeight, totalRowHeight } = dimension;
  const { offsetY } = viewport;

  return {
    data,
    columns: side === 'L' ? [] : columns,
    bodyHeight,
    totalRowHeight,
    offsetY,
  }
})(
  (props: Props) => {
    const { side, bodyHeight, totalRowHeight, offsetY, dispatch } = props;

    const areaStyle = { overflow: 'scroll', height: `${bodyHeight}px` };
    const containerStyle = { height: `${totalRowHeight}px` };
    const tableStyle = { overflow: 'visible', top: `${offsetY}px` };

    const onScroll = ({ srcElement }: Event) => dispatch({
      type: 'setScroll',
      scrollX: srcElement.scrollLeft,
      scrollY: srcElement.scrollTop
    });

    return (
      <div class={cls('body-area')} style={areaStyle} onScroll={onScroll} >
        <div class={cls('body-container')} style={containerStyle} >
          <div class={cls('table-container')} style={tableStyle}>
            <table class={cls('table')}>
              <ColGroup side={side} />
              <BodyRows side={side} />
            </table>
            <div class={cls('layer-selection')} style="display: none;"></div>
          </div>
        </div>
      </div>
    );
  }
);