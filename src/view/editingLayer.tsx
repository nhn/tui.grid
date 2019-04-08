import { h, Component } from 'preact';
import { cls } from '../helper/common';

export class EditingLayer extends Component {
  render() {
    return <div class={cls('layer-editing', 'cell-content')} />;
  }
}
