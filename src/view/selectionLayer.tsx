import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { Side, AreaInfo } from '../store/types';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  styles: AreaInfo | null;
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SelectionLayerComp extends Component<Props> {
  private el?: HTMLElement;

  public render() {
    const { styles } = this.props;

    return (
      <div>
        {!!styles && (
          <div
            ref={(el) => {
              this.el = el;
            }}
            class={cls('layer-selection')}
            style={styles}
          />
        )}
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
