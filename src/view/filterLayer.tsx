import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { FilterInfo } from '../store/types';
import { FilterLayerInner } from './filterLayerInner';

interface StoreProps {
  filterInfo: FilterInfo;
}

type Props = StoreProps & DispatchProps;

export class FilterLayerComp extends Component<Props> {
  public render({ filterInfo: { activatedColumnAddress } }: Props) {
    return activatedColumnAddress && <FilterLayerInner />;
  }
}

export const FilterLayer = connect<StoreProps>(({ data: { filterInfo } }) => ({ filterInfo }))(
  FilterLayerComp
);
