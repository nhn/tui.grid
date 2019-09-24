import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { ActiveColumnAddress, ColumnInfo, FilterInfo } from '../store/types';
import { cls } from '../helper/dom';
import { TextFilter } from './textFilter';
import { DatePickerFilter } from './datePickerFilter';
import { FilterOperator } from './filterOperator';
import { SelectFilter } from './selectFilter';

interface StoreProps {
  filterInfo: FilterInfo;
  columnInfo: ColumnInfo;
  renderSecondFilter: boolean;
}

interface OwnProps {
  columnAddress: ActiveColumnAddress;
}

type Props = StoreProps & OwnProps & DispatchProps;

export class FilterLayerInnerComp extends Component<Props> {
  private handleClickApplyFilterBtn = () => {
    this.props.dispatch('applyActiveFilterState');
  };

  private handleClickClearFilterBtn = () => {
    this.props.dispatch('clearActiveFilterState');
  };

  private closeLayer = () => {
    this.props.dispatch('setActiveColumnAddress', null);
  };

  // eslint-disable-next-line consistent-return
  private getFilterComponent = (index: number) => {
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
      //no default
    }
  };

  public render() {
    const { columnAddress, columnInfo, renderSecondFilter } = this.props;
    const { showApplyBtn, showClearBtn } = columnInfo.filter!;
    const { left } = columnAddress;

    return (
      <div className={cls('filter-container')} style={{ left }}>
        <div>
          <span className={cls('btn-filter', 'filter-icon-active')} />
          <a className={cls('btn-close')} onClick={this.closeLayer} />
        </div>
        {this.getFilterComponent(0)}
        {renderSecondFilter && <FilterOperator />}
        {renderSecondFilter && this.getFilterComponent(1)}
        <div className={cls('filter-btn-container')}>
          {showClearBtn && (
            <button
              className={cls('filter-btn', 'filter-btn-clear')}
              onClick={this.handleClickClearFilterBtn}
            >
              Clear
            </button>
          )}
          {showApplyBtn && (
            <button
              className={cls('filter-btn', 'filter-btn-apply')}
              onClick={this.handleClickApplyFilterBtn}
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
  const { data, column } = store;
  const { filterInfo } = data;
  const { allColumnMap } = column;

  const activeFilterState = filterInfo.activeFilterState!;

  const renderSecondFilter = !!(
    activeFilterState.type !== 'select' &&
    activeFilterState.operator &&
    activeFilterState.state[0] &&
    (activeFilterState.state[0].value as string).length
  );

  return {
    columnInfo: allColumnMap[columnAddress.name],
    columnAddress,
    filterInfo,
    renderSecondFilter
  };
})(FilterLayerInnerComp);
