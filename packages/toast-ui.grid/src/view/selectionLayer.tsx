import { h, Component } from 'preact';
import { AreaInfo } from '@t/store/selection';
import { Side } from '@t/store/focus';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  styles: AreaInfo | null;
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SelectionLayerComp extends Component<Props> {
  private handleMouseMove = (ev: MouseEvent) => {
    const { dispatch } = this.props;
    const { pageX, pageY } = ev;
    dispatch('setHoveredRowKeyByPosition', { pageX, pageY });
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
  ({ selection: { rangeAreaInfo } }, { side }) => {
    const styles = rangeAreaInfo && rangeAreaInfo[side];

    return { styles };
  }
)(SelectionLayerComp);
