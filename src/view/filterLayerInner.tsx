import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { ActivatedColumnAddress, ColumnInfo, FilterInfo } from '../store/types';
import { cls } from '../helper/dom';
import { TextFilter } from './textFilter';
import { DatePickerFilter } from './datePickerFilter';
import { FilterOperator } from './filterOperator';
import { SelectFilter } from './selectFilter';

interface StoreProps {
  filterInfo: FilterInfo;
  columnInfo: ColumnInfo;
  renderSecondFilter: boolean;
  columnAddress: ActivatedColumnAddress;
}

type Props = StoreProps & DispatchProps;

export class FilterLayerInnerComp extends Component<Props> {
  public componentDidMount() {}

  private handleClickApplyFilterBtn = () => {
    this.props.dispatch('applyFilterLayerState');
  };

  private handleClickClearFilterBtn = () => {
    this.props.dispatch('clearFilterLayerState');
  };

  private closeLayer = () => {
    this.props.dispatch('setActivatedColumnAddress', null);
  };

  // eslint-disable-next-line consistent-return
  private getFilterComponent = (index: number) => {
    const { columnInfo } = this.props;
    const type = columnInfo.filter!.type;

    switch (type) {
      case 'text':
      case 'number':
        return <TextFilter filterIndex={index} />;
      case 'date':
        return <DatePickerFilter filterIndex={index} />;
      case 'select':
        return <SelectFilter />;
      default:
      //no default
    }
  };

  public render() {
    const { columnAddress, columnInfo, renderSecondFilter } = this.props;
    const { showApplyBtn, showClearBtn } = columnInfo.filter!;
    const left = columnAddress.left - 17;

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

export const FilterLayerInner = connect<StoreProps>(store => {
  const { data, column } = store;
  const { filterInfo } = data;
  const { allColumnMap } = column;

  const columnAddress = data.filterInfo.activatedColumnAddress!;
  const filterLayerState = filterInfo.filterLayerState!;

  const renderSecondFilter = !!(
    filterLayerState.type !== 'select' &&
    filterLayerState.operator &&
    filterLayerState.state[0] &&
    (filterLayerState.state[0].value as string).length
  );

  return {
    columnInfo: allColumnMap[columnAddress.name],
    columnAddress,
    filterInfo,
    renderSecondFilter
  };
})(FilterLayerInnerComp);
