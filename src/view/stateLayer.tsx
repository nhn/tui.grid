import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  hasData: boolean;
  top: number;
  height: number;
  left: number;
  right: number;
}

type Props = StoreProps & DispatchProps;

class StateLayerComp extends Component<Props> {
  // @TODO: need to match i18n code and net api
  // private getMessage(renderState: string) {}

  public render({ hasData, top, height, left, right }: Props) {
    const display = hasData ? 'none' : 'block';
    const layerStyle = { display, top, height, left, right };

    return (
      <div class={cls('layer-state')} style={layerStyle}>
        <div class={cls('layer-state-content')}>
          <p>No data.</p>
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
    scrollYWidth
  } = dimension;

  return {
    hasData: !!data.rawData.length,
    top: headerHeight + cellBorderWidth + 1,
    height: bodyHeight - scrollXHeight - tableBorderWidth,
    left: 0,
    right: scrollYWidth
  };
})(StateLayerComp);
