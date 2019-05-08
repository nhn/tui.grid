import { h, Component } from 'preact';
import { cls, Attributes } from '../helper/dom';
import { CellValue, Row } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { BodyCellViewer } from './bodyCellViewer';

interface OwnProps {
  row: Row;
  columnName: string;
}

interface StoreProps {
  value: CellValue;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class BodyCellComp extends Component<Props> {
  public render() {
    const { row, columnName, value } = this.props;
    const attrs: Attributes = {
      'data-row-key': String(row.rowKey),
      'data-column-name': columnName
    };

    return (
      <td class={cls('cell', 'cell-has-input')} {...attrs}>
        <BodyCellViewer value={value} />
      </td>
    );
  }
}

export const BodyCell = connect<StoreProps, OwnProps>((store, { row, columnName }) => {
  return { value: row[columnName] };
})(BodyCellComp);
