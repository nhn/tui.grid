import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { ActiveColumnAddress } from '../store/types';
import { FilterLayerInner } from './filterLayerInner';

interface StoreProps {
  activeColumnAddress: ActiveColumnAddress | null;
}

type Props = StoreProps & DispatchProps;

export class FilterLayerComp extends Component<Props> {
  public render({ activeColumnAddress }: Props) {
    return activeColumnAddress && <FilterLayerInner columnAddress={activeColumnAddress} />;
  }
}

export const FilterLayer = connect<StoreProps>(({ filterLayerState }) => {
  const { activeColumnAddress } = filterLayerState;
  return { activeColumnAddress };
})(FilterLayerComp);
