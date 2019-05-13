import { h, Component } from 'preact';
import { cls, Attributes } from '../helper/dom';
import { CellValue, Row, ColumnInfo } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { BodyCellViewer } from './bodyCellViewer';

interface OwnProps {
  row: Row;
  columnName: string;
}

interface StoreProps {
  value: CellValue;
  editable: boolean;
  align: string | 'left' | 'center' | 'right';
  column: ColumnInfo;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class BodyCellComp extends Component<Props> {
  public render() {
    const { row, column, value, align } = this.props;
    const attrs: Attributes = {
      'data-row-key': String(row.rowKey),
      'data-column-name': column.name
    };
    const editable = !!column.editor;

    return (
      <td class={cls('cell', 'cell-has-input', [editable, 'cell-editable'])} {...attrs}>
        <BodyCellViewer column={column} value={value} />
      </td>
    );
  }
}

export const BodyCell = connect<StoreProps, OwnProps>(({ column }, { row, columnName }) => {
  const columnInfo = column.allColumnMap[columnName];

  return {
    value: row[columnName],
    align: columnInfo.align,
    column: columnInfo
  };
})(BodyCellComp);
