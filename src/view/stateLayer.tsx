import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import i18n from '../i18n';
import { State } from '../store/types';
import { shallowEqual } from '../helper/common';

interface StoreProps {
  state: State;
  top: number;
  height: number;
  left: number;
  right: number;
}

type Props = StoreProps & DispatchProps;

class StateLayerComp extends Component<Props> {
  public shouldComponentUpdate(nextProps: Props) {
    return !shallowEqual(nextProps, this.props);
  }

  public render({ state, top, height, left, right }: Props) {
    const display = state === 'DONE' ? 'none' : 'block';
    const layerStyle = { display, top, height, left, right };
    let message = null;
    if (state === 'EMPTY') {
      message = i18n.get('display.noData');
    } else if (state === 'LOADING') {
      message = i18n.get('display.loadingData');
    }

    return (
      <div class={cls('layer-state')} style={layerStyle}>
        <div class={cls('layer-state-content')}>
          <p>{message}</p>
          {state === 'LOADING' && <div class={cls('layer-state-loading')} />}
        </div>
      </div>
    );
  }
}
export const StateLayer = connect(({ data, renderState, dimension }) => {
  const {
    headerHeight,
    bodyHeight,
    cellBorderWidth,
    tableBorderWidth,
    scrollXHeight,
    scrollYWidth
  } = dimension;
  const { state } = renderState;
  return {
    state: state === 'DONE' && data.rawData.length === 0 ? 'EMPTY' : state,
    top: headerHeight + cellBorderWidth + 1,
    height: bodyHeight - scrollXHeight - tableBorderWidth,
    left: 0,
    right: scrollYWidth
  };
})(StateLayerComp);
