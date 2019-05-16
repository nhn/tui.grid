import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { Side, AreaInfo } from '../store/types';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  active: boolean;
  styles: AreaInfo | null;
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SelectionLayerComp extends Component<Props> {
  private el?: HTMLElement;

  public render() {
    const { styles, active } = this.props;

    return (
      <div>
        {active && (
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
    let active = false;
    const styles = rangeAreaInfo && rangeAreaInfo[side];
    if (styles !== null && styles.width !== 0) {
      active = true;
    }

    return { active, styles };
  }
)(SelectionLayerComp);
