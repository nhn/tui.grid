import { h, Component } from 'preact';
import { cls } from '../helper/dom';

export class StateLayer extends Component {
  public render() {
    return <div class={cls('layer-state')} style="display: none;" />;
  }
}
