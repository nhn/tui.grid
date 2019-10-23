import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { OperatorType } from '../types';
import { Filter } from 'src/store/types';

interface StoreProps {
  operator: OperatorType;
}

interface OwnProps {
  filterState: Filter;
}

type Props = StoreProps & OwnProps & DispatchProps;

class FilterOperatorComp extends Component<Props> {
  private handleChangeOperator = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value as OperatorType;
    this.props.dispatch('setActiveFilterOperator', value);
  };

  public render() {
    const { operator } = this.props;

    return (
      <div className={cls('filter-comparator-container')}>
        <div className={cls('filter-comparator')}>
          <input
            type="radio"
            name="filterOperator"
            value="AND"
            id="AND"
            checked={operator === 'AND'}
            onChange={this.handleChangeOperator}
          />
          <label for="AND" />
          <span>AND</span>
        </div>
        <div className={cls('filter-comparator')}>
          <input
            type="radio"
            id="OR"
            name="filterOperator"
            value="OR"
            checked={operator === 'OR'}
            onChange={this.handleChangeOperator}
          />
          <label for="OR" />
          <span>OR</span>
        </div>
      </div>
    );
  }
}

export const FilterOperator = connect<StoreProps, OwnProps>((_, { filterState }) => ({
  operator: filterState!.operator || 'AND'
}))(FilterOperatorComp);
