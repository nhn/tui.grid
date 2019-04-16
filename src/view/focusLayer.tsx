import { h, Component } from 'preact';
import { cls } from '../helper/common';

export class FocusLayer extends Component {
  render() {
    const display = 'none';

    return (
      <div class={cls('layer-focus')} style={{ display }}>
        <div class={cls('layer-focus-border')} />
        <div class={cls('layer-focus-border')} />
        <div class={cls('layer-focus-border')} />
        <div class={cls('layer-focus-border')} />
      </div>
    );
  }
}
