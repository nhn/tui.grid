import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { EditingLayerInner } from './editingLayerInner';
import { CellEditorOptions, RowKey } from '../store/types';

interface StoreProps {
  editingAddress: {
    rowKey: RowKey;
    columnName: string;
  } | null;
  editorOptions?: CellEditorOptions;
}

type Props = StoreProps & DispatchProps;

export class EditingLayerComp extends Component<Props> {
  public render({ editingAddress, editorOptions }: Props) {
    if (!editingAddress || !editorOptions) {
      return null;
    }

    const { rowKey, columnName } = editingAddress;
    return (
      <EditingLayerInner rowKey={rowKey} columnName={columnName} editorOptions={editorOptions} />
    );
  }
}

export const EditingLayer = connect<StoreProps>(({ focus, column }) => {
  let editorOptions;
  const { editingAddress } = focus;

  if (editingAddress) {
    editorOptions = column.allColumnMap[editingAddress.columnName].editor;
  }

  return { editingAddress, editorOptions };
})(EditingLayerComp);
