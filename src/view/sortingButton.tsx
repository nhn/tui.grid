import { h, Component } from 'preact';
import { SortOptions } from '../store/types';
import { cls, hasClass, findParent } from '../helper/dom';
import { connect } from './hoc';
import { getDataProvider } from '../instance';
import { DispatchProps } from '../dispatch/create';
import { DataProvider } from '../dataSource/types';

interface StoreProps {
  sortOptions: SortOptions;
  dataProvider: DataProvider;
}

type Props = StoreProps & DispatchProps;

class SortingButtonComp extends Component<Props> {
  private handleClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;

    if (!hasClass(target, 'btn-sorting')) {
      return;
    }

    const { dispatch, sortOptions, dataProvider } = this.props;
    const th = findParent(target, 'cell');
    const targetColumnName = th!.getAttribute('data-column-name')!;
    let targetAscending = true;

    if (sortOptions) {
      const { columnName, ascending } = sortOptions;
      targetAscending = columnName === targetColumnName ? !ascending : targetAscending;
    }

    if (sortOptions.useClient) {
      dispatch('sort', targetColumnName, targetAscending);
    } else {
      dispatch('changeSortBtn', targetColumnName, targetAscending);
      const data = {
        sortColumn: targetColumnName,
        sortAscending: targetAscending
      };
      dataProvider.readData(1, data, true);
    }
  };

  public render() {
    const {
      sortOptions: { columnName, ascending }
    } = this.props;

    return (
      <a
        class={cls('btn-sorting', [
          columnName === name,
          ascending ? 'btn-sorting-up' : 'btn-sorting-down'
        ])}
        onClick={this.handleClick}
      />
    );
  }
}

export const SortingButton = connect<StoreProps>((store) => {
  const { data, id } = store;

  return {
    sortOptions: data.sortOptions,
    dataProvider: getDataProvider(id)
  };
})(SortingButtonComp);
