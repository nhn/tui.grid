import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  hello: null;
}

type Props = StoreProps & DispatchProps;

export class FilterLayerComp extends Component<Props> {
  public render(props: Props) {
    return 'Hello!';
  }
}

export const FilterLayer = connect<StoreProps>(() => ({}))(FilterLayerComp);
