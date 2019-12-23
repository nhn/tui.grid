import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { EditingLayerInner } from './editingLayerInner';
import { EditingAddress, Side } from '../store/types';

interface StoreProps {
  editingAddress: EditingAddress;
  active: boolean;
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

export class EditingLayerComp extends Component<Props> {
  public render({ editingAddress, active }: Props) {
    if (!editingAddress || !active) {
      return null;
    }

    const { rowKey, columnName } = editingAddress;
    return <EditingLayerInner rowKey={rowKey} columnName={columnName} />;
  }
}

export const EditingLayer = connect<StoreProps, OwnProps>(
  ({ focus: { editingAddress, side: focusSide } }, { side }) => ({
    editingAddress,
    active: focusSide === side
  })
)(EditingLayerComp);
