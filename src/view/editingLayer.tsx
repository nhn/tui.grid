import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { EditingLayerInner } from './editingLayerInner';
import { EditingAddress } from '../store/types';

interface StoreProps {
  editingAddress: EditingAddress;
}

type Props = StoreProps & DispatchProps;

export class EditingLayerComp extends Component<Props> {
  public render({ editingAddress }: Props) {
    return <EditingLayerInner editingAddress={editingAddress} />;
  }
}

export const EditingLayer = connect<StoreProps>(({ focus: { editingAddress } }) => ({
  editingAddress
}))(EditingLayerComp);
