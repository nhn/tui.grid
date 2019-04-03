import { h, Component } from 'preact';
import { LeftSide } from './leftSide';
import { RightSide } from './rightSide';
import { StateLayer } from './stateLayer';
import { EditingLayer } from './editingLayer';
import { cls } from '../helper/common';
import { Store } from '../store/types';
import { Dispatch } from '../dispatch/create';

interface Props {
  store: Store;
  dispatch: Dispatch;
}

export class Root extends Component<Props> {
  el?: HTMLElement;

  getChildContext() {
    return {
      store: this.props.store,
      dispatch: this.props.dispatch
    };
  }

  componentDidMount() {
    // issue with ref (element is not in document)
    requestAnimationFrame(() => {
      const { clientWidth } = this.el!;

      if (clientWidth !== this.props.store.dimension.width) {
        this.props.dispatch('setWidth', clientWidth);
      }
    });
  }

  render() {
    return (
      <div class={cls('container')} ref={(el) => (this.el = el)} data-grid-id="1">
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
