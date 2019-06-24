import { h, Component } from 'preact';
import { SortOptions } from '../store/types';
import { cls, hasClass, findParent } from '../helper/dom';
import { connect } from './hoc';
import { getDataProvider } from '../instance';
import { DispatchProps } from '../dispatch/create';
import { DataProvider } from '../dataSource/types';

interface OwnProps {
  columnName: string;
}
interface StoreProps {
  sortOptions: SortOptions;
  dataProvider: DataProvider;
}

type Props = StoreProps & OwnProps & DispatchProps;

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
    const { columnName, sortOptions } = this.props;
    const { columnName: sortedColumnName, ascending } = sortOptions;
    return (
      <a
        class={cls('btn-sorting', [
          columnName === sortedColumnName,
          ascending ? 'btn-sorting-up' : 'btn-sorting-down'
        ])}
        onClick={this.handleClick}
      />
    );
  }
}

export const SortingButton = connect<StoreProps, OwnProps>((store) => {
  const { data, id } = store;

  return {
    sortOptions: data.sortOptions,
    dataProvider: getDataProvider(id)
  };
})(SortingButtonComp);
