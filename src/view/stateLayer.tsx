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
class StateLayeComp extends Component<Props> {
  // @TODO: need to match i18n code and net api
  // private getMessage(renderState: string) {}

  public render({ hasData, top, height, left, right }: Props) {
    const layerStyle = { display: hasData ? 'none' : 'block', top, height, left, right };

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
    scrollX,
    scrollY,
    scrollbarWidth,
    cellBorderWidth,
    tableBorderWidth
  } = dimension;
  const scrollXHeight = scrollX ? scrollbarWidth : 0;
  const scrollYWidth = scrollY ? scrollbarWidth : 0;

  return {
    hasData: !!(data.rawData && data.rawData.length),
    top: headerHeight + cellBorderWidth + 1,
    height: bodyHeight - scrollXHeight - tableBorderWidth,
    left: 0,
    right: scrollYWidth
  };
})(StateLayeComp);
