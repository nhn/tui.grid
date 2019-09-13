import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import Grid from '../grid';
import { getInstance } from '../instance';
import {
  ActivatedColumnAddress,
  CellValue,
  ColumnInfo,
  FilterInfo,
  FilterParams,
  Row
} from '../store/types';
import { cls } from '../helper/dom';
import { isFunction, pluck, some, uniq } from '../helper/common';
import { FilterItem, FilterItemClass, FilterItemProps } from '../filter/types';

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
  private firstFilter?: HTMLDivElement;

  private firstFilterItem: FilterItem | null = null;

  private secondFilter?: HTMLDivElement;

  private secondFilterItem: FilterItem | null = null;

  private createFilter = (index: number) => {
    const { grid, columnInfo, columnData, filterInfo } = this.props;
    const filter = columnInfo.filter!;
    const FilterClass: FilterItemClass = filter.filterClass;
    const filterProps: FilterItemProps = {
      grid,
      columnInfo,
      columnData,
      index,
      filterInfo
    };

    const filterItem = new FilterClass({ ...filterProps, index });
    const filterEl = filterItem.getElement();

    if (filterEl) {
      if (index === 1 && this.firstFilter) {
        this.firstFilter.appendChild(filterEl);
        this.firstFilterItem = filterItem;
      } else if (index === 2 && this.secondFilter) {
        this.secondFilter.appendChild(filterEl);
        this.secondFilterItem = filterItem;
      }

      if (isFunction(filterItem.mounted)) {
        filterItem.mounted();
      }
    }
  };

  public componentDidMount() {
    const { columnInfo } = this.props;
    // @TODO; operator를 filterInfo에서 갖고 있어야함
    if (columnInfo.filter!.operator) {
      //  operator의 위치는....
    }
    this.createFilter(1);
    // this.createFilter(2);
  }

  private closeLayer = () => {
    this.props.dispatch('setActivatedColumnAddress', null);
  };

  private handleClickApplyFilterBtn = () => {
    // @ 각 필터의 state 값을 가져온다.
    // @ 그리고 적용시킨다.
  };

  public render() {
    const { columnAddress, columnInfo, firstFilterHasValue } = this.props;
    const { showApplyBtn, showClearBtn } = columnInfo.filter!;
    const left = columnAddress.left - 17;
    const renderSecondFilter = columnInfo.filter!.operator && firstFilterHasValue;
    // @TODO: inner 구조 개선 필요, 컴퍼넌트화 필요.는 불가능?
    return (
      <div className={cls('filter-container')} style={{ left }}>
        <div>
          <span className={cls('btn-filter', 'filter-icon-active')} />
          <a className={cls('btn-close')} onClick={this.closeLayer} />
        </div>
        <div
          ref={el => {
            this.firstFilter = el;
          }}
        />
        {/* 여기부터 filter operator */}
        {/*<div className={cls('filter-comparator-container')}>*/}
        {/*  <div className={cls('filter-comparator')}>*/}
        {/*    <input type="radio" name="filterOperator" value="AND" id="AND" checked />*/}
        {/*    <label for="AND" />*/}
        {/*    <span>AND</span>*/}
        {/*  </div>*/}
        {/*  <div className={cls('filter-comparator')}>*/}
        {/*    <input type="radio" id="OR" name="filterOperator" value="OR" />*/}
        {/*    <label for="OR" />*/}
        {/*    <span>OR</span>*/}
        {/*  </div>*/}
        {/*</div>*/}
        {/*{renderSecondFilter && (*/}
        <div
          ref={el => {
            this.secondFilter = el;
          }}
        />
        {/*)}*/}
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

  const firstFilterHasValue =
    !!filterInfo.filters &&
    some(filter => filter.columnName === columnAddress.name, filterInfo.filters as FilterParams[]);

  return {
    grid: getInstance(id),
    columnData: uniq(pluck(rawData as Row[], columnAddress.name)),
    columnInfo: allColumnMap[columnAddress.name],
    columnAddress,
    filterInfo,
    firstFilterHasValue
  };
})(FilterLayerInnerComp);
