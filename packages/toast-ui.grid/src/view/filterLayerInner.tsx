import { h, Component } from 'preact';
import { Filter, ActiveColumnAddress } from '@t/store/filterLayerState';
import { ColumnInfo } from '@t/store/column';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { TextFilter } from './textFilter';
import { DatePickerFilter } from './datePickerFilter';
import { FilterOperator } from './filterOperator';
import { SelectFilter } from './selectFilter';
import { some } from '../helper/common';
import i18n from '../i18n';

interface StoreProps {
  filters: Filter[] | null;
  columnInfo: ColumnInfo;
  renderSecondFilter: boolean;
  currentColumnActive: boolean;
}

interface OwnProps {
  columnAddress: ActiveColumnAddress;
  filterState: Filter;
}

type Props = StoreProps & OwnProps & DispatchProps;

export class FilterLayerInnerComp extends Component<Props> {
  private el!: HTMLElement;

  state = { left: this.props.columnAddress.left };

  private renderFilter = (index: number) => {
    const { columnAddress, filterState, columnInfo } = this.props;
    const type = columnInfo.filter!.type;

    switch (type) {
      case 'text':
      case 'number':
        return (
          <TextFilter columnAddress={columnAddress} filterState={filterState} filterIndex={index} />
        );
      case 'date':
        return (
          <DatePickerFilter
            columnAddress={columnAddress}
            filterState={filterState}
            filterIndex={index}
          />
        );
      case 'select':
        return <SelectFilter columnAddress={columnAddress} filterState={filterState} />;
      default:
        return null;
    }
  };

  componentDidMount() {
    const { left } = this.el.getBoundingClientRect();
    const { clientWidth } = this.el;
    const { innerWidth } = window;

    if (innerWidth < left + clientWidth) {
      const orgLeft = this.state.left;
      this.setState({ left: orgLeft - (left + clientWidth - innerWidth) });
    }
  }

  public render() {
    const {
      columnInfo,
      renderSecondFilter,
      dispatch,
      currentColumnActive,
      filterState,
    } = this.props;
    const { showApplyBtn, showClearBtn } = columnInfo.filter!;
    const { left } = this.state;

    return (
      <div
        className={cls('filter-container')}
        style={{ left }}
        ref={(el) => {
          this.el = el;
        }}
      >
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
        {renderSecondFilter && <FilterOperator filterState={filterState} />}
        {renderSecondFilter && this.renderFilter(1)}
        <div className={cls('filter-btn-container')}>
          {showClearBtn && (
            <button
              className={cls('filter-btn', 'filter-btn-clear')}
              onClick={() => {
                dispatch('clearActiveFilterState');
              }}
            >
              {i18n.get('filter.clear')}
            </button>
          )}
          {showApplyBtn && (
            <button
              className={cls('filter-btn', 'filter-btn-apply')}
              onClick={() => {
                dispatch('applyActiveFilterState');
              }}
            >
              {i18n.get('filter.apply')}
            </button>
          )}
        </div>
      </div>
    );
  }
}

export const FilterLayerInner = connect<StoreProps, OwnProps>(
  (store, { columnAddress, filterState }) => {
    const { data, column } = store;
    const { filters } = data;
    const { allColumnMap } = column;

    const currentColumnActive =
      !!filters && some((item) => item.columnName === columnAddress.name, filters);

    const renderSecondFilter = !!(
      filterState.type !== 'select' &&
      filterState.operator &&
      filterState.state[0] &&
      filterState.state[0].value.length
    );

    return {
      columnInfo: allColumnMap[columnAddress.name],
      columnAddress,
      filters,
      renderSecondFilter,
      currentColumnActive,
    };
  }
)(FilterLayerInnerComp);
