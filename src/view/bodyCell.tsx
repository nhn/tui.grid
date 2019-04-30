import { h, Component } from 'preact';
import { cls, Attributes } from '../helper/dom';
import { CellValue, Row } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { BodyCellEditor } from './bodyCellEditor';
import { BodyCellViewer } from './bodyCellViewer';

interface OwnProps {
  row: Row;
  columnName: string;
}

interface StoreProps {
  value: CellValue;
  editor: string;
  viewer: string;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class BodyCellComp extends Component<Props> {
  public render() {
    const { row, columnName, value, editor, viewer } = this.props;
    const attrs: Attributes = {
      'data-row-key': String(row.rowKey),
      'data-column-name': columnName
    };

    return (
      <td class={cls('cell', 'cell-has-input', [!!editor, 'cell-editable'])} {...attrs}>
        {editor && !viewer ? (
          <BodyCellEditor
            rowKey={row.rowKey}
            columnName={columnName}
            editorName={editor}
            value={value}
          />
        ) : (
          <BodyCellViewer value={value} />
        )}
      </td>
    );
  }
}

export const BodyCell = connect<StoreProps, OwnProps>(({ column }, { row, columnName }) => {
  const columnInfo = column.allColumns.find(({ name }) => name === columnName)!;

  return {
    value: row[columnName],
    editor: columnInfo.editor,
    viewer: columnInfo.viewer
  };
})(BodyCellComp);
