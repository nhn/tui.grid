import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { findPropIndex } from '../helper/common';
import { SortedColumn } from '../store/types';

interface OwnProps {
  columnName: string;
}
interface StoreProps {
  order: number;
  showOrder: boolean;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SortingOrderComp extends Component<Props> {
  public render() {
    const { order, showOrder } = this.props;
    return showOrder && <span style={{ color: '#bbb', fontWeight: 100 }}>{order}</span>;
  }
}

export const SortingOrder = connect<StoreProps, OwnProps>((store, props) => {
  const { columns } = store.data.sortOptions;
  const { columnName } = props;
  const sortedColumnsWithType = columns as SortedColumn[];
  const order = findPropIndex('columnName', columnName, sortedColumnsWithType) + 1;
  const showOrder = !!order && columns.length > 1;

  return {
    order,
    showOrder
  };
})(SortingOrderComp);
