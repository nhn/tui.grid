import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { Rect, Side } from '../store/types';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  side: Side;
  active: boolean;
  cellPosRect: Rect | null;
  cellBorderWidth: number;
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SelectionLayerComp extends Component<Props> {
  public render() {
    const { side, active, cellPosRect, cellBorderWidth } = this.props;

    console.log(side);

    return <div class={cls('layer-focus', 'layer-selection')} />;
  }
}

export const SelectionLayer = connect<StoreProps, OwnProps>(({ focus, dimension }, { side }) => {
  const { cellPosRect, active } = focus;

  return {
    active,
    side,
    cellPosRect: side === focus.side ? cellPosRect : null,
    cellBorderWidth: dimension.cellBorderWidth
  };
})(SelectionLayerComp);
