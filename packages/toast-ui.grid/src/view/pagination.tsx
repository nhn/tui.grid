import { Component, h } from 'preact';
import TuiPagination from 'tui-pagination';
import { PageOptions } from '@t/store/data';
import { DataProvider } from '@t/dataSource';
import Grid from '../grid';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { shallowEqual, isNumber } from '../helper/common';
import { getDataProvider, getPaginationManager, getInstance } from '../instance';
import { PaginationManager } from '../pagination/paginationManager';
import { getEventBus, EventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';

interface StoreProps {
  pageOptions: PageOptions;
  dataProvider: DataProvider;
  paginationHolder: PaginationManager;
  grid: Grid;
  eventBus: EventBus;
}

type Props = StoreProps & DispatchProps;

class PaginationComp extends Component<Props> {
  private el?: HTMLDivElement;

  public tuiPagination?: TuiPagination;

  public shouldComponentUpdate(nextProps: Props) {
    return !shallowEqual(this.props.pageOptions, nextProps.pageOptions);
  }

  public componentDidMount() {
    this.createPagination();
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (!this.el || !this.tuiPagination) {
      return;
    }
    const { pageOptions } = nextProps;
    const { totalCount, page, perPage } = pageOptions;

    if (!isNumber(totalCount) || !isNumber(page) || !isNumber(perPage)) {
      return;
    }

    if (
      this.props.pageOptions.perPage !== perPage ||
      this.props.pageOptions.totalCount !== totalCount
    ) {
      this.tuiPagination.setItemsPerPage(perPage);
      this.tuiPagination.reset(totalCount);
    }
    if (this.tuiPagination.getCurrentPage() !== page) {
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
      grid: { usageStatistics },
    } = this.props;
    const { totalCount, perPage } = pageOptions;
    const options = {
      ...pageOptions,
      totalItems: totalCount,
      itemsPerPage: perPage,
      usageStatistics,
    };
    this.tuiPagination = new TuiPagination(this.el!, options);
    this.addEventListener();
    paginationHolder.setPagination(this.tuiPagination);
  }

  private addEventListener() {
    const { dataProvider, pageOptions, dispatch, eventBus } = this.props;

    this.tuiPagination!.on('beforeMove', (ev: any) => {
      const { page } = ev;
      const gridEvent = new GridEvent({ page });

      /**
       * Occurs before moving the page.
       * @event Grid#beforePageMove
       * @property {number} page - Target page number
       * @property {Grid} instance - Current grid instance
       */
      eventBus.trigger('beforePageMove', gridEvent);

      if (!gridEvent.isStopped()) {
        if (pageOptions.useClient) {
          dispatch('movePage', page);
        } else {
          dataProvider.readData(page);
        }
      }
    });
    this.tuiPagination!.on('afterMove', (ev: any) => {
      const gridEvent = new GridEvent({ page: ev.page });

      /**
       * Occurs after moving the page.
       * @event Grid#afterPageMove
       * @property {number} page - Target page number
       * @property {Grid} instance - Current grid instance
       */
      eventBus.trigger('afterPageMove', gridEvent);
    });
  }

  private removeEventListener() {
    this.tuiPagination!.off('beforeMove');
    this.tuiPagination!.off('afterMove');
  }

  public render() {
    return (
      <div
        ref={(el) => {
          this.el = el;
        }}
        class={`tui-pagination ${cls('pagination')}`}
      />
    );
  }
}
export const Pagination = connect<StoreProps>(({ id, data }) => ({
  pageOptions: data.pageOptions,
  dataProvider: getDataProvider(id),
  paginationHolder: getPaginationManager(id),
  grid: getInstance(id),
  eventBus: getEventBus(id),
}))(PaginationComp);
