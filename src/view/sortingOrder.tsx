import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { findPropIndex } from '../helper/common';

interface OwnProps {
  columnName: string;
}
interface StoreProps {
  order: number;
  multiSort: boolean;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SortingOrderComp extends Component<Props> {
  public render() {
    const { order, multiSort } = this.props;
    return !!order && multiSort && <span style={{ color: '#bbb' }}>{order}</span>;
  }
}

export const SortingOrder = connect<StoreProps, OwnProps>((store, props) => {
  const {
    data: {
      sortOptions: { columns }
    }
  } = store;
  const { columnName } = props;
  const order = findPropIndex('columnName', columnName, [...columns]) + 1;
  const multiSort = columns.length > 1;

  return {
    order,
    multiSort
  };
})(SortingOrderComp);
