import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { EditingLayerInner } from './editingLayerInner';
import { CellEditorOptions } from '../store/types';

interface StoreProps {
  showing: boolean;
  rowKey?: number | string;
  columnName?: string;
  editorOptions?: CellEditorOptions;
}

type Props = StoreProps & DispatchProps;

export class EditingLayerComp extends Component<Props> {
  public render({ rowKey, columnName, showing, editorOptions }: Props) {
    if (!showing) {
      return null;
    }

    return (
      <EditingLayerInner rowKey={rowKey!} columnName={columnName!} editorOptions={editorOptions!} />
    );
  }
}

export const EditingLayer = connect<StoreProps>((store) => {
  const { editing } = store.focus;
  if (editing) {
    const { rowKey, columnName } = editing;
    const { editor } = store.column.allColumns.find(({ name }) => columnName === name)!;

    if (editor) {
      return {
        rowKey,
        columnName,
        editorOptions: editor,
        showing: true
      };
    }
  }

  return { showing: false };
})(EditingLayerComp);
