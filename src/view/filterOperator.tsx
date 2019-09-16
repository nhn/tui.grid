import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import Grid from '../grid';
import { getInstance } from '../instance';
import { cls } from '../helper/dom';
import {
  ActivatedColumnAddress,
  ColumnInfo,
  FilterInfo,
  NumberFilterCode,
  TextFilterCode
} from '../store/types';
import { filterSelectOption } from '../helper/filter';
import { findProp } from '../helper/common';

type SelectOption = { [key in NumberFilterCode | TextFilterCode]: string };

interface StoreProps {
  grid: Grid;
  columnInfo: ColumnInfo;
  filterInfo: FilterInfo;
}

type Props = StoreProps & DispatchProps;

class FilterOperatorComp extends Component<Props> {
  private selectEl?: HTMLSelectElement;

  public componentDidMount() {}

  private getPreviousValue = () => {
    // const { columnInfo, filterInfo } = this.props;
  };

  public render() {
    // const { columnInfo } = this.props;
    // const selectOption = filterSelectOption[
    //   columnInfo.filter!.type as 'number' | 'text'
    // ] as SelectOption;

    return (
      <div className={cls('filter-comparator-container')}>
        <div className={cls('filter-comparator')}>
          <input type="radio" name="filterOperator" value="AND" id="AND" checked />
          <label for="AND" />
          <span>AND</span>
        </div>
        <div className={cls('filter-comparator')}>
          <input type="radio" id="OR" name="filterOperator" value="OR" />
          <label for="OR" />
          <span>OR</span>
        </div>
      </div>
    );
  }
}

export const FilterOperator = connect<StoreProps>(store => {
  const { column, id, data } = store;
  const { allColumnMap } = column;

  return {
    grid: getInstance(id),
    filterInfo: data.filterInfo
  };
})(FilterOperatorComp);
