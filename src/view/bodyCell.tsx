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
  editable: boolean;
  align: string | 'left' | 'center' | 'right';
}

type Props = OwnProps & StoreProps & DispatchProps;

export class BodyCellComp extends Component<Props> {
  public render() {
    const { row, columnName, value, editable, align } = this.props;
    const attrs: Attributes = {
      'data-row-key': String(row.rowKey),
      'data-column-name': columnName
    };
    const isRowHeader = columnName === '_number';
    const style = { textAlign: align };

    return (
      <td
        class={cls('cell', [editable, 'cell-editable'], [isRowHeader, 'cell-row-head'])}
        style={style}
        {...attrs}
      >
        <BodyCellViewer value={value} />
      </td>
    );
  }
}

export const BodyCell = connect<StoreProps, OwnProps>(({ column }, { row, columnName }) => {
  const columnInfo = column.allColumnMap[columnName];

  return {
    value: row[columnName],
    editable: !!columnInfo.editor,
    align: columnInfo.align
  };
})(BodyCellComp);
