import { h, Component } from 'preact';
import { SortingType } from '@t/store/column';
import { SortState } from '@t/store/data';
import { DataProvider } from '@t/dataSource';
import { cls, hasClass, findParentByClassName } from '../helper/dom';
import { connect } from './hoc';
import { getDataProvider } from '../instance';
import { DispatchProps } from '../dispatch/create';
import { findPropIndex } from '../helper/common';

interface OwnProps {
  columnName: string;
  sortingType?: SortingType;
}
interface StoreProps {
  sortState: SortState;
  dataProvider: DataProvider;
  ascending: boolean;
  defaultAscending: boolean;
  active: boolean;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SortingButtonComp extends Component<Props> {
  private handleClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    const multiple = ev.ctrlKey || ev.metaKey;

    if (!hasClass(target, 'btn-sorting')) {
      return;
    }

    const { dispatch, sortState, dataProvider, defaultAscending } = this.props;
    const { columns } = sortState;
    const th = findParentByClassName(target, 'cell');
    const columnName = th!.getAttribute('data-column-name')!;
    const index = findPropIndex('columnName', columnName, columns);
    const ascending = index !== -1 ? !columns[index].ascending : defaultAscending;

    if (sortState.useClient) {
      dispatch('sort', columnName, ascending, multiple);
    } else {
      // @TODO: apply multi sort to dataSource
      dataProvider.sort(columnName, ascending, true);
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
    data: { sortState },
    id,
  } = store;
  const { columnName, sortingType = 'asc' } = props;
  const { columns } = sortState;

  const index = findPropIndex('columnName', columnName, columns);
  const ascending = index !== -1 ? columns[index].ascending : true;

  return {
    sortState,
    ascending,
    dataProvider: getDataProvider(id),
    defaultAscending: sortingType === 'asc',
    active: index !== -1,
  };
})(SortingButtonComp);
