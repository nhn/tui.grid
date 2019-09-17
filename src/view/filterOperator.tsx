import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';

interface StoreProps {
  operator: 'AND' | 'OR';
}

type Props = StoreProps & DispatchProps;

class FilterOperatorComp extends Component<Props> {
  private handleChangeOperator = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value as 'AND' | 'OR';
    this.props.dispatch('setFilterLayerOperator', value);
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

export const FilterOperator = connect<StoreProps>(store => {
  const { data } = store;

  return {
    operator: data.filterInfo.filterLayerState!.operator || 'AND'
  };
})(FilterOperatorComp);
