import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { OperatorType, Filter } from '@t/store/filterLayerState';

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
        {['AND', 'OR'].map((operatorType) => {
          const checked = operator === operatorType;

          return (
            <div
              key={operatorType}
              className={cls('filter-comparator', [checked, 'filter-comparator-checked'])}
            >
              <label>
                <input
                  type="radio"
                  name="filterOperator"
                  value={operatorType}
                  checked={checked}
                  onChange={this.handleChangeOperator}
                />
                <span>{operatorType}</span>
              </label>
            </div>
          );
        })}
      </div>
    );
  }
}

export const FilterOperator = connect<StoreProps, OwnProps>((_, { filterState }) => ({
  operator: filterState!.operator || 'AND',
}))(FilterOperatorComp);
