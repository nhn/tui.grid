import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { ActiveColumnAddress, ColumnInfo, Filter } from '../store/types';
import { cls } from '../helper/dom';
import { TextFilter } from './textFilter';
import { DatePickerFilter } from './datePickerFilter';
import { FilterOperator } from './filterOperator';
import { SelectFilter } from './selectFilter';
import { some } from '../helper/common';

interface StoreProps {
  filters: Filter[] | null;
  columnInfo: ColumnInfo;
  renderSecondFilter: boolean;
  currentColumnActive: boolean;
}

interface OwnProps {
  columnAddress: ActiveColumnAddress;
}

type Props = StoreProps & OwnProps & DispatchProps;

export class FilterLayerInnerComp extends Component<Props> {
  private renderFilter = (index: number) => {
    const { columnAddress, columnInfo } = this.props;
    const type = columnInfo.filter!.type;

    switch (type) {
      case 'text':
      case 'number':
        return <TextFilter columnAddress={columnAddress} filterIndex={index} />;
      case 'date':
        return <DatePickerFilter columnAddress={columnAddress} filterIndex={index} />;
      case 'select':
        return <SelectFilter columnAddress={columnAddress} />;
      default:
        return null;
    }
  };

  public render() {
    const {
      columnAddress,
      columnInfo,
      renderSecondFilter,
      dispatch,
      currentColumnActive
    } = this.props;
    const { showApplyBtn, showClearBtn } = columnInfo.filter!;
    const { left } = columnAddress;

    return (
      <div className={cls('filter-container')} style={{ left }}>
        <div>
          <span
            className={cls('btn-filter', [currentColumnActive, 'btn-filter-active'], 'filter-icon')}
          />
          <a
            className={cls('btn-close')}
            onClick={() => {
              dispatch('setActiveColumnAddress', null);
            }}
          />
        </div>
        {this.renderFilter(0)}
        {renderSecondFilter && <FilterOperator />}
        {renderSecondFilter && this.renderFilter(1)}
        <div className={cls('filter-btn-container')}>
          {showClearBtn && (
            <button
              className={cls('filter-btn', 'filter-btn-clear')}
              onClick={() => {
                dispatch('clearActiveFilterState');
              }}
            >
              Clear
            </button>
          )}
          {showApplyBtn && (
            <button
              className={cls('filter-btn', 'filter-btn-apply')}
              onClick={() => {
                dispatch('applyActiveFilterState');
              }}
            >
              Apply
            </button>
          )}
        </div>
      </div>
    );
  }
}

export const FilterLayerInner = connect<StoreProps, OwnProps>((store, { columnAddress }) => {
  const { data, column, filterLayerState } = store;
  const { filters } = data;
  const { allColumnMap } = column;

  const activeFilterState = filterLayerState.activeFilterState!;
  const currentColumnActive =
    !!filters && some(item => item.columnName === columnAddress.name, filters);

  const renderSecondFilter = !!(
    activeFilterState.type !== 'select' &&
    activeFilterState.operator &&
    activeFilterState.state[0] &&
    activeFilterState.state[0].value.length
  );

  return {
    columnInfo: allColumnMap[columnAddress.name],
    columnAddress,
    filters,
    renderSecondFilter,
    currentColumnActive
  };
})(FilterLayerInnerComp);
