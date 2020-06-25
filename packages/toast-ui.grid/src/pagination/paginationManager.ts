import TuiPagination from 'tui-pagination';

export interface PaginationManager {
  setPagination: (tuiPagination: TuiPagination) => void;
  getPagination: () => TuiPagination | null;
}

export function createPaginationManager(): PaginationManager {
  let pagination: TuiPagination | null = null;
  return {
    setPagination(targetPagination: TuiPagination) {
      pagination = targetPagination;
    },

    getPagination() {
      return pagination;
    },
  };
}
