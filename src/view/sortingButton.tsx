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
  ascending: boolean;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SortingButtonComp extends Component<Props> {
  private handleClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    const withCtrl = ev.ctrlKey || ev.metaKey;

    if (!hasClass(target, 'btn-sorting')) {
      return;
    }

    if (withCtrl) {
      console.log('ho!');
      // @TODO: columnNames 에 추가 될 예정
      // @TODO: ['name',
    } else {
      // @TODO: columnName 초기화
    }

    const { dispatch, sortOptions, dataProvider } = this.props;
    const th = findParent(target, 'cell');
    let targetColumnName = th!.getAttribute('data-column-name')!;
    let { ascending: targetAscending } = this.props;

    if (sortOptions) {
      const { columnName, ascending } = sortOptions;
      if (columnName !== 'sortKey' && targetAscending === !ascending) {
        targetColumnName = 'sortKey';
        targetAscending = true;
      } else {
        targetAscending = columnName === targetColumnName ? !ascending : targetAscending;
      }
    }

    if (sortOptions.useClient) {
      dispatch('sort', targetColumnName, targetAscending);
    } else {
      dispatch('changeSortOptions', targetColumnName, targetAscending);
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

export const SortingButton = connect<StoreProps, OwnProps>((store, props) => {
  const { data, column, id } = store;
  const { columnName } = props;
  const { sortingType } = column.allColumnMap[columnName];

  return {
    sortOptions: data.sortOptions,
    dataProvider: getDataProvider(id),
    ascending: sortingType === 'asc'
  };
})(SortingButtonComp);
