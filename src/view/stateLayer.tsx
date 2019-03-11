import { h, Component } from 'preact';
import { cls } from '../helper/common';

export class StateLayer extends Component {
  render() {
    return (
      <div class={cls('layer-state')} style="display: none;"></div>
    )
  }
}