import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { Side, AreaInfo, RowKey } from '../store/types';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  styles: AreaInfo | null;
  hoveredRowKey: RowKey | null;
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SelectionLayerComp extends Component<Props> {
  private handleMouseMove = (ev: MouseEvent) => {
    const { dispatch } = this.props;
    const { pageX, pageY } = ev;
    dispatch('addRowHoverClassByPosition', { pageX, pageY });
  };

  public render() {
    const { styles } = this.props;
    return (
      <div onMouseMove={this.handleMouseMove}>
        {!!styles && <div class={cls('layer-selection')} style={styles} />}
      </div>
    );
  }
}

export const SelectionLayer = connect<StoreProps, OwnProps>(
  ({ selection: { rangeAreaInfo }, renderState }, { side }) => {
    const styles = rangeAreaInfo && rangeAreaInfo[side];
    const { hoveredRowKey } = renderState;

    return { styles, hoveredRowKey };
  }
)(SelectionLayerComp);
