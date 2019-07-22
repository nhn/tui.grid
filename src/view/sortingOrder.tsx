import { h, Component } from 'preact';
import { SortOptions } from '../store/types';
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

class SortingOrderComp extends Component<Props> {
  public render() {
    const { sortOptions } = this.props;
    return <span style={{ color: '#bbb' }}>1</span>;
  }
}

export const SortingOrder = connect<StoreProps, OwnProps>((store, props) => {
  const { data, column, id } = store;
  const { columnName } = props;
  const { sortingType } = column.allColumnMap[columnName];

  return {
    sortOptions: data.sortOptions,
    dataProvider: getDataProvider(id),
    ascending: sortingType === 'asc'
  };
})(SortingOrderComp);
