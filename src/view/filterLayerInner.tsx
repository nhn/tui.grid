import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import Grid from '../grid';
import { getInstance } from '../instance';
import { ActivatedColumnAddress, CellValue, ColumnInfo, FilterInfo, Row } from '../store/types';
import { cls } from '../helper/dom';
import { pluck, uniq } from '../helper/common';
import { TextFilter } from './textFilter';
import { DatePickerFilter } from './datePickerFilter';
import { FilterOperator } from './filterOperator';
import { SelectFilter } from './selectFilter';

interface StoreProps {
  grid: Grid;
  columnData: CellValue[];
  filterInfo: FilterInfo;
  columnInfo: ColumnInfo;
  firstFilterHasValue: boolean;
}

interface OwnProps {
  columnAddress: ActivatedColumnAddress;
}

type Props = StoreProps & OwnProps & DispatchProps;

export class FilterLayerInnerComp extends Component<Props> {
  public componentDidMount() {}

  private handleClickApplyFilterBtn = () => {
    console.log('click apply btn');
  };

  private closeLayer = () => {
    this.props.dispatch('setActivatedColumnAddress', null);
  };

  public render() {
    const { columnAddress, columnInfo, firstFilterHasValue } = this.props;
    const { showApplyBtn, showClearBtn } = columnInfo.filter!;
    const left = columnAddress.left - 17;
    const renderSecondFilter = columnInfo.filter!.operator && firstFilterHasValue;
    return (
      <div className={cls('filter-container')} style={{ left }}>
        <div>
          <span className={cls('btn-filter', 'filter-icon-active')} />
          <a className={cls('btn-close')} onClick={this.closeLayer} />
        </div>
        {/*<TextFilter columnAddress={columnAddress} filterIndex={0} />*/}
        {/*{renderSecondFilter && <FilterOperator />}*/}
        {/*{renderSecondFilter && <TextFilter columnAddress={columnAddress} filterIndex={1} />}*/}
        {/*<DatePickerFilter columnAddress={columnAddress} filterIndex={0} />*/}
        <SelectFilter columnAddress={columnAddress} filterIndex={0} />

        <div className={cls('filter-btn-container')}>
          {showClearBtn && <button className={cls('filter-btn', 'filter-btn-clear')}>Clear</button>}
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
  const { data, column, id } = store;
  const { filterInfo, rawData } = data;
  const { allColumnMap } = column;

  // @TODO: 조건 다시 살피기
  const firstFilterHasValue =
    !!filterInfo.filterLayerState &&
    filterInfo.filterLayerState.state[0].value &&
    (filterInfo.filterLayerState.state[0].value as string).length;

  return {
    grid: getInstance(id),
    columnData: uniq(pluck(rawData as Row[], columnAddress.name)),
    columnInfo: allColumnMap[columnAddress.name],
    columnAddress,
    filterInfo,
    firstFilterHasValue
  };
})(FilterLayerInnerComp);
