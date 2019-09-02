import { h, Component } from 'preact';
import { SortedColumn, SortOptions, SortingType } from '../store/types';
import { cls, hasClass, findParent } from '../helper/dom';
import { connect } from './hoc';
import { getDataProvider } from '../instance';
import { DispatchProps } from '../dispatch/create';
import { DataProvider } from '../dataSource/types';
import { findPropIndex } from '../helper/common';

interface OwnProps {
  columnName: string;
  sortingType?: SortingType;
}
interface StoreProps {
  sortOptions: SortOptions;
  dataProvider: DataProvider;
  ascending: boolean;
  defaultAscending: boolean;
  active: boolean;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SortingButtonComp extends Component<Props> {
  private handleClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    const withCtrl = ev.ctrlKey || ev.metaKey;

    if (!hasClass(target, 'btn-sorting')) {
      return;
    }

    const { dispatch, sortOptions, dataProvider } = this.props;
    const th = findParent(target, 'cell');
    const targetColumnName = th!.getAttribute('data-column-name')!;
    let { defaultAscending: targetAscending } = this.props;

    if (sortOptions) {
      const { columns } = sortOptions;
      const index = findPropIndex('columnName', targetColumnName, columns);
      targetAscending = index !== -1 ? !columns[index].ascending : targetAscending;
    }

    if (sortOptions.useClient) {
      dispatch('sort', targetColumnName, targetAscending, withCtrl);
    } else {
      dispatch('changeSortOptions', targetColumnName, targetAscending, withCtrl);
      const data = {
        sortColumn: targetColumnName,
        sortAscending: targetAscending
      };
      dataProvider.readData(1, data, true);
    }
  };

  public render() {
    const { active, ascending } = this.props;

    return (
      <a
        class={cls('btn-sorting', [active, ascending ? 'btn-sorting-up' : 'btn-sorting-down'])}
        onClick={this.handleClick}
      />
    );
  }
}

export const SortingButton = connect<StoreProps, OwnProps>((store, props) => {
  const {
    data: { sortOptions },
    id
  } = store;
  const { columnName, sortingType = 'asc' } = props;
  const { columns } = sortOptions;
  const sortedColumnsWithType = columns as SortedColumn[];

  const index = findPropIndex('columnName', columnName, sortedColumnsWithType);
  const ascending = index !== -1 ? columns[index].ascending : true;

  return {
    sortOptions,
    ascending,
    dataProvider: getDataProvider(id),
    defaultAscending: sortingType === 'asc',
    active: index !== -1
  };
})(SortingButtonComp);
