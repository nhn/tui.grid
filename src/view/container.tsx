import { h, Component } from 'preact';
import { LeftSide } from './leftSide';
import { RightSide } from './rightSide';
import { StateLayer } from './stateLayer';
import { EditingLayer } from './editingLayer';
import { cls } from '../helper/common';
import { Store } from '../store/types';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';

interface StoreProps {
  width: number;
}

type Props = StoreProps & DispatchProps;

export class ContainerComp extends Component<Props> {
  el?: HTMLElement;

  componentDidMount() {
    // issue with ref (element is not in document)
    requestAnimationFrame(() => {
      const { clientWidth } = this.el!;

      if (clientWidth !== this.props.width) {
        this.props.dispatch('setWidth', clientWidth);
      }
    });
  }

  render() {
    const { width } = this.props;
    const style = { width: width ? width : '100%' };

    return (
      <div style={style} class={cls('container')} ref={(el) => (this.el = el)} data-grid-id="1">
        <div class={cls('content-area')}>
          <LeftSide />
          <RightSide />
          <div class={cls('border-line', 'border-line-top')} />
          <div class={cls('border-line', 'border-line-left')} />
          <div class={cls('border-line', 'border-line-right')} />
          <div class={cls('border-line', 'border-line-bottom')} />
        </div>
        <StateLayer />
        <EditingLayer />
      </div>
    );
  }
}

export const Container = connect<StoreProps, {}, DispatchProps>(({ dimension }) => ({
  width: dimension.width
}))(ContainerComp);
