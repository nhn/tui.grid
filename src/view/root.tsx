import { h, Component } from 'preact';
import { LeftSide } from './leftSide';
import { RightSide } from './rightSide';
import { StateLayer } from './stateLayer';
import { EditingLayer } from './editingLayer';
import { cls } from '../helper/common';

export class Root extends Component {
  render() {
    const style = {
      width: 800,
      height: 500
    };

    return (
      <div class={cls('container')} data-grid-id="1" style={style}>
        <div class={cls('content-area', 'no-scroll-x', 'no-scroll-y')}>
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

