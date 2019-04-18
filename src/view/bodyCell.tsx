import { h, Component } from 'preact';
import { cls, Attributes } from '../helper/dom';
import { CellValue } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface OwnProps {
  rowKey: number;
  columnName: string;
  value: CellValue;
}

type Props = OwnProps & DispatchProps;

export class BodyCellComp extends Component<Props> {
  render() {
    const { rowKey, columnName, value } = this.props;
    const attrs: Attributes = {
      'data-row-key': String(rowKey),
      'data-column-name': columnName
    };

    return (
      <td class={cls('cell')} {...attrs}>
        <div class={cls('cell-content')} style="white-space:nowrap">
          {value}
        </div>
      </td>
    );
  }
}

export const BodyCell = connect<{}, OwnProps>()(BodyCellComp);
