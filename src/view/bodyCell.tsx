import { h, Component } from 'preact';
import { cls } from '../helper/common';

export class BodyCell extends Component {
  render() {
    return (
      <td class={cls('cell')} data-edit-type="normal" data-row-key="15" data-column-name="name">
        <div class={cls('cell-content')} style="white-space:nowrap">This Is Acting</div>
      </td>
    )
  }
}