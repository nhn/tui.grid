import { h, Component } from 'preact';
import { LeftSide } from './leftSide';
import { RightSide } from './rightSide';
import { StateLayer } from './stateLayer';
import { EditingLayer } from './editingLayer';
import { cls } from '../helper/common';
import { Store } from '../store/types';
import { Dispatch } from '../dispatch/types';

interface Props {
  store: Store,
  dispatch: Dispatch
}

export class Root extends Component<Props> {
  getChildContext() {
    return {
      store: this.props.store,
      dispatch: this.props.dispatch
    };
  }

  render() {
    return (
      <div class={cls('container')} data-grid-id="1">
        <div class={cls('content-area')}>
          <LeftSide />
          <RightSide />
          <div class={cls('border-line', 'border-line-top')}></div>
          <div class={cls('border-line', 'border-line-left')}></div>
          <div class={cls('border-line', 'border-line-right')}></div>
          <div class={cls('border-line', 'border-line-bottom')}></div>
        </div>
        <StateLayer />
        <EditingLayer />
      </div>
    );
  }
}

