import { h, Component } from 'preact';
import { Rect, Side } from '@t/store/focus';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  active: boolean;
  cellPosRect: Rect | null;
  cellBorderWidth: number;
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

class FocusLayerComp extends Component<Props> {
  public render() {
    const { active, cellPosRect, cellBorderWidth } = this.props;

    if (cellPosRect === null) {
      return null;
    }

    const { top, left, right, bottom } = cellPosRect;
    const height = bottom - top;
    const width = right - left;

    const leftStyle = {
      top,
      left,
      width: cellBorderWidth,
      height: height + cellBorderWidth,
    };

    const topStyle = {
      top: top === 0 ? cellBorderWidth : top,
      left,
      width: width + cellBorderWidth,
      height: cellBorderWidth,
    };

    const rightStyle = {
      top,
      left: left + width,
      width: cellBorderWidth,
      height: height + cellBorderWidth,
    };

    const bottomStyle = {
      top: top + height,
      left,
      width: width + cellBorderWidth,
      height: cellBorderWidth,
    };

    return (
      <div class={cls('layer-focus', [!active, 'layer-focus-deactive'])}>
        <div class={cls('layer-focus-border')} style={leftStyle} />
        <div class={cls('layer-focus-border')} style={topStyle} />
        <div class={cls('layer-focus-border')} style={rightStyle} />
        <div class={cls('layer-focus-border')} style={bottomStyle} />
      </div>
    );
  }
}

export const FocusLayer = connect<StoreProps, OwnProps>(({ focus, dimension }, { side }) => {
  const { cellPosRect, editingAddress, navigating } = focus;

  return {
    active: !!editingAddress || navigating,
    cellPosRect: side === focus.side ? cellPosRect : null,
    cellBorderWidth: dimension.cellBorderWidth,
  };
})(FocusLayerComp);
