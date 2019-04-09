import { h, Component } from 'preact';
import { cls } from '../helper/common';

export class FocusLayer extends Component {
  render() {
    return (
      <div class={cls('layer-focus')} style="display: none;">
        <div class={cls('layer-focus-border')} />
        <div class={cls('layer-focus-border')} />
        <div class={cls('layer-focus-border')} />
        <div class={cls('layer-focus-border')} />
      </div>
    );
  }
}
