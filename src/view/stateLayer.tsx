import { h, Component } from 'preact';
import { cls } from '../helper/dom';

export class StateLayer extends Component {
  render() {
    return <div class={cls('layer-state')} style="display: none;" />;
  }
}
