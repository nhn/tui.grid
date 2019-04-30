import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { EditingLayerInner } from './editingLayerInner';

interface StoreProps {
  showing: boolean;
  rowKey: number | null;
  columnName: string | null;
  editorName: string | null;
}

type Props = StoreProps & DispatchProps;

export class EditingLayerComp extends Component<Props> {
  public render({ rowKey, columnName, showing, editorName }: Props) {
    if (!showing || !editorName || !rowKey || !columnName) {
      return null;
    }

    return <EditingLayerInner rowKey={rowKey} columnName={columnName} editorName={editorName} />;
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
        editorName: editor,
        showing: true
      };
    }
  }

  return { showing: false, editorName: null, rowKey: null, columnName: null };
})(EditingLayerComp);
