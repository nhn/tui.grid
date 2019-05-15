import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { EditingLayerInner } from './editingLayerInner';
import { RowKey } from '../store/types';

interface StoreProps {
  editingAddress: {
    rowKey: RowKey;
    columnName: string;
  } | null;
}

type Props = StoreProps & DispatchProps;

export class EditingLayerComp extends Component<Props> {
  public render({ editingAddress }: Props) {
    if (!editingAddress) {
      return null;
    }

    const { rowKey, columnName } = editingAddress;
    return <EditingLayerInner rowKey={rowKey} columnName={columnName} />;
  }
}

export const EditingLayer = connect<StoreProps>(({ focus: { editingAddress } }) => ({
  editingAddress
}))(EditingLayerComp);
