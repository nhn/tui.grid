import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { EditingLayerInner } from './editingLayerInner';
import { CellEditorOptions } from '../store/types';

interface StoreProps {
  showing: boolean;
  rowKey: number | null;
  columnName: string | null;
  editorOptions: CellEditorOptions | null;
}

type Props = StoreProps & DispatchProps;

export class EditingLayerComp extends Component<Props> {
  public render({ rowKey, columnName, showing, editorOptions }: Props) {
    if (!showing || !editorOptions || !rowKey || !columnName) {
      return null;
    }

    return (
      <EditingLayerInner rowKey={rowKey} columnName={columnName} editorOptions={editorOptions} />
    );
  }
}

export const EditingLayer = connect<StoreProps>((store) => {
  const { editing } = store.focus;
  if (editing) {
    const { rowKey, columnName } = editing;
    const { editor, viewer } = store.column.allColumns.find(({ name }) => columnName === name)!;
    if (editor && viewer) {
      return {
        rowKey,
        columnName,
        editorOptions: editor,
        showing: true
      };
    }
  }

  return { showing: false, editorOptions: null, rowKey: null, columnName: null };
})(EditingLayerComp);
