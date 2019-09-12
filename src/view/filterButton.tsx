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

    const { activatedColumnAddress, columnName, dispatch } = this.props;

    if (!activatedColumnAddress || activatedColumnAddress.name !== columnName) {
      dispatch('setActivatedColumnAddress', {
        name: columnName,
        left: target.getBoundingClientRect().left
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
  columnName
}))(FilterButtonComp);
