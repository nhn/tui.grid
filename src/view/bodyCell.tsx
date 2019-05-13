import { h, Component } from 'preact';
import { cls, Attributes } from '../helper/dom';
import { ColumnInfo, ViewRow } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { BodyCellViewer } from './bodyCellViewer';

interface OwnProps {
  viewRow: ViewRow;
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
    const { viewRow, column, value, align } = this.props;
    const attrs: Attributes = {
      'data-row-key': String(viewRow.rowKey),
      'data-column-name': column.name
    };
    const editable = !!column.editor;

    return (
      <td class={cls('cell', 'cell-has-input', [editable, 'cell-editable'])} {...attrs}>
        <BodyCellViewer column={column} valueMap={viewRow.valueMap} />
      </td>
    );
  }
}

export const BodyCell = connect<StoreProps, OwnProps>(({ column }, { columnName }) => {
  const columnInfo = column.allColumnMap[columnName];

  return {
    value: row[columnName],
    align: columnInfo.align,
    column: columnInfo
  };
})(BodyCellComp);
