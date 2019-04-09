import { h, Component } from 'preact';
import { cls } from '../helper/common';
import { CellValue } from '../store/types';

interface Props {
  value: CellValue;
}

export class BodyCell extends Component<Props> {
  render() {
    const { value } = this.props;

    return (
      <td class={cls('cell')}>
        <div class={cls('cell-content')} style="white-space:nowrap">
          {value}
        </div>
      </td>
    );
  }
}
