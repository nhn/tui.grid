import { h, Component } from 'preact';
import { cls, hasClass } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { ActivatedColumnAddress, FilterInfo } from '../store/types';
import { someProp } from '../helper/common';

interface OwnProps {
  columnName: string;
}
interface StoreProps {
  filterInfo: FilterInfo;
  activatedColumnAddress: ActivatedColumnAddress | null;
  offsetLeft: number;
}

type Props = StoreProps & OwnProps & DispatchProps;

class FilterButtonComp extends Component<Props> {
  private isActiveFilter = () => {
    const {
      filterInfo: { filters },
      columnName
    } = this.props;

    if (!filters) {
      return false;
    }

    return someProp('columnName', columnName, filters);
  };

  private handleClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;

    if (!hasClass(target, 'btn-filter')) {
      return;
    }

    const { activatedColumnAddress, columnName, dispatch, offsetLeft } = this.props;

    if (!activatedColumnAddress || activatedColumnAddress.name !== columnName) {
      const left = target.getBoundingClientRect().left - offsetLeft - 9;
      dispatch('setActivatedColumnAddress', {
        name: columnName,
        left
      });
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
  activatedColumnAddress: store.data.filterInfo.activatedColumnAddress,
  filterInfo: store.data.filterInfo,
  columnName,
  offsetLeft: store.dimension.offsetLeft
}))(FilterButtonComp);
