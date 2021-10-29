import { h, Component } from 'preact';
import { Filter, ActiveColumnAddress } from '@t/store/filterLayerState';
import { cls, hasClass } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { someProp } from '../helper/common';

interface OwnProps {
  columnName: string;
}
interface StoreProps {
  filters: Filter[] | null;
  activeColumnAddress: ActiveColumnAddress | null;
  offsetLeft: number;
}

type Props = StoreProps & OwnProps & DispatchProps;

const DISTANCE_FROM_ICON_TO_LAYER = 9;

class FilterButtonComp extends Component<Props> {
  private isActiveFilter = () => {
    const { filters, columnName } = this.props;

    return filters ? someProp('columnName', columnName, filters) : false;
  };

  private handleClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;

    if (!hasClass(target, 'btn-filter')) {
      return;
    }

    const { activeColumnAddress, columnName, dispatch, offsetLeft } = this.props;

    if (!activeColumnAddress || activeColumnAddress.name !== columnName) {
      const left = target.getBoundingClientRect().left - offsetLeft - DISTANCE_FROM_ICON_TO_LAYER;
      dispatch('saveAndFinishEditing');
      dispatch('setActiveColumnAddress', { name: columnName, left });
    }
  };

  public render() {
    return (
      <a
        class={cls('btn-filter', [this.isActiveFilter(), 'btn-filter-active'])}
        onClick={this.handleClick}
      />
    );
  }
}

export const FilterButton = connect<StoreProps, OwnProps>((store, { columnName }) => ({
  activeColumnAddress: store.filterLayerState.activeColumnAddress,
  filters: store.data.filters,
  columnName,
  offsetLeft: store.dimension.offsetLeft,
}))(FilterButtonComp);
