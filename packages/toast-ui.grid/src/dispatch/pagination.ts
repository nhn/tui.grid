import { PageOptions } from '@t/store/data';
import { Store } from '@t/store';
import { PageStateResetOption } from '@t/options';
import { isEmpty, shallowEqual, pruneObject } from '../helper/common';
import { isScrollPagination } from '../query/data';
import { initScrollPosition } from './viewport';
import { initSelection } from './selection';
import { initFocus } from './focus';
import { setCheckedAllRows, updateHeights } from './data';
import { updateAllSummaryValues } from './summary';
import { notify } from '../helper/observable';

export function updatePageOptions(
  { data }: Store,
  pageOptions: PageOptions,
  forceUpdatePage = false
) {
  const { pageOptions: orgPageOptions } = data;
  if (!isEmpty(orgPageOptions)) {
    // if infinite scrolling is applied, page number should be not reset to know the last loaded page
    if (!forceUpdatePage && isScrollPagination(data)) {
      delete pageOptions.page;
    }
    const newPageOptions = { ...orgPageOptions, ...pageOptions };

    if (!shallowEqual(newPageOptions, orgPageOptions)) {
      data.pageOptions = newPageOptions;
    }
  }
}

export function movePage(store: Store, page: number) {
  const { data } = store;

  initScrollPosition(store);

  data.pageOptions.page = page;
  notify(data, 'pageOptions');

  updateHeights(store);
  initSelection(store);
  initFocus(store);
  setCheckedAllRows(store);
  updateAllSummaryValues(store);
}

export function updatePageWhenRemovingRow(store: Store, deletedCount: number) {
  const { pageOptions } = store.data;

  if (!isEmpty(pageOptions)) {
    const { perPage, totalCount, page } = pageOptions;
    let modifiedLastPage = Math.floor((totalCount - deletedCount) / perPage);

    if ((totalCount - deletedCount) % perPage) {
      modifiedLastPage += 1;
    }

    updatePageOptions(
      store,
      {
        totalCount: totalCount - deletedCount,
        page: (modifiedLastPage < page ? modifiedLastPage : page) || 1,
      },
      true
    );
  }
}

export function resetPageState(store: Store, totalCount: number, pageState?: PageStateResetOption) {
  const pageOptions = pageState ? pruneObject(pageState) : { page: 1, totalCount };
  updatePageOptions(store, pageOptions, true);
}
