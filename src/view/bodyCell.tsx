import { h, Component } from 'preact';
import { cls, Attributes } from '../helper/dom';
import { CellValue, Row } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { CellEditor } from '../editor/base';
import { BodyCellEditor } from './bodyCellEditor';

interface OwnProps {
  row: Row;
  columnName: string;
}

interface StoreProps {
  value: CellValue;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class BodyCellComp extends Component<Props> {
  private editor?: CellEditor;

  public componentShouldUpdate() {
    return false;
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props.value !== nextProps.value && this.editor) {
      this.editor.onChange(nextProps.value);
    }
  }

  public render() {
    const { row, columnName, value } = this.props;
    const attrs: Attributes = {
      'data-row-key': String(row.rowKey),
      'data-column-name': columnName
    };

    return (
      <td class={cls('cell', 'cell-has-input')} {...attrs}>
        <BodyCellEditor rowKey={row.rowKey} columnName={columnName} value={value} />
      </td>
    );
  }
}

export const BodyCell = connect<StoreProps, OwnProps>((_, { row, columnName }) => ({
  value: row[columnName]
}))(BodyCellComp);
