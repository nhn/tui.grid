import { Component, h } from 'preact';
import Grid from '../grid';
import TuiPagination from 'tui-pagination';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { shallowEqual, isNumber, isEmpty } from '../helper/common';
import { getDataProvider, getPaginationManager, getInstance } from '../instance';
import { PageOptions } from '../store/types';
import { DataProvider } from '../dataSource/types';
import { PaginationManager } from '../pagination/paginationManager';

interface StoreProps {
  pageOptions: PageOptions;
  dataProvider: DataProvider;
  useClientPagination: boolean;
  paginationHolder: PaginationManager;
  grid: Grid;
}

type Props = StoreProps & DispatchProps;

class PaginationComp extends Component<Props> {
  private el?: HTMLDivElement;

  public tuiPagination?: TuiPagination;

  public shouldComponentUpdate(nextProps: Props) {
    return !shallowEqual(this.props.pageOptions, nextProps.pageOptions);
  }

  public componentDidMount() {
    if (!this.el) {
      return;
    }
    this.createPagination();
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (!this.el || !this.tuiPagination) {
      return;
    }
    const { pageOptions } = nextProps;
    const { totalCount, page, perPage } = pageOptions;
    if (isNumber(perPage) && this.props.pageOptions.perPage !== perPage) {
      this.tuiPagination.setItemsPerPage(perPage);
    }
    if (isNumber(totalCount) && this.props.pageOptions.totalCount !== totalCount) {
      this.tuiPagination.reset(totalCount);
    }
    if (isNumber(page) && this.tuiPagination.getCurrentPage() !== page) {
      this.removeEventListener();
      this.tuiPagination.movePageTo(page);
      this.addEventListener();
    }
  }

  public componentWillUnmount() {
    if (this.tuiPagination) {
      this.removeEventListener();
    }
  }

  private createPagination() {
    const {
      pageOptions,
      paginationHolder,
      grid: { usageStatistics }
    } = this.props;
    const { totalCount, perPage, page } = pageOptions;
    const options = {
      totalItems: totalCount,
      itemsPerPage: perPage,
      page,
      usageStatistics
    };
    this.tuiPagination = new TuiPagination(this.el!, options);
    this.addEventListener();
    paginationHolder.setPagination(this.tuiPagination);
  }

  private addEventListener() {
    const { dataProvider, useClientPagination, dispatch } = this.props;
    this.tuiPagination!.on('beforeMove', (evt: any) => {
      const currentPage = evt.page;
      if (useClientPagination) {
        dispatch('movePage', currentPage);
        dispatch('setScrollTop', 0);
      } else {
        dataProvider.readData(currentPage);
      }
    });
  }

  private removeEventListener() {
    this.tuiPagination!.off('beforeMove');
  }

  public render({ pageOptions }: Props) {
    return (
      !isEmpty(pageOptions) && (
        <div
          ref={el => {
            this.el = el;
          }}
          class={`tui-pagination ${cls('pagination')}`}
        />
      )
    );
  }
}
export const Pagination = connect<StoreProps>(({ id, data }) => ({
  pageOptions: data.pageOptions,
  useClientPagination: data.useClientPagination,
  dataProvider: getDataProvider(id),
  paginationHolder: getPaginationManager(id),
  grid: getInstance(id)
}))(PaginationComp);
