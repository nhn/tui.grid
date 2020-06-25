import { h, Component } from 'preact';
import { LoadingState } from '@t/store/data';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import i18n from '../i18n';

interface StoreProps {
  loadingState: LoadingState;
  top: number;
  height: number;
  left: number;
  right: number;
}

type Props = StoreProps & DispatchProps;

class StateLayerComp extends Component<Props> {
  public render({ loadingState, top, height, left, right }: Props) {
    const display = loadingState === 'DONE' ? 'none' : 'block';
    const layerStyle = { display, top, height, left, right };
    let message = null;
    if (loadingState === 'EMPTY') {
      message = i18n.get('display.noData');
    } else if (loadingState === 'LOADING') {
      message = i18n.get('display.loadingData');
    }

    return (
      <div class={cls('layer-state')} style={layerStyle}>
        <div class={cls('layer-state-content')}>
          <p>{message}</p>
          {loadingState === 'LOADING' && <div class={cls('layer-state-loading')} />}
        </div>
      </div>
    );
  }
}
export const StateLayer = connect(({ data, dimension }) => {
  const {
    headerHeight,
    bodyHeight,
    cellBorderWidth,
    tableBorderWidth,
    scrollXHeight,
    scrollYWidth,
  } = dimension;
  return {
    loadingState: data.loadingState,
    top: headerHeight + cellBorderWidth,
    height: bodyHeight - scrollXHeight - tableBorderWidth,
    left: 0,
    right: scrollYWidth + tableBorderWidth,
  };
})(StateLayerComp);
