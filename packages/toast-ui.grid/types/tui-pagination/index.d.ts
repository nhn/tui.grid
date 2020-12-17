// Type definitions for tui-pagination 3.4.0

declare module 'tui-pagination' {
  export default class Pagination {
    constructor(element: string | HTMLElement, options?: object);

    getCurrentPage(): number;

    movePageTo(targetPage: number): void;

    reset(totalItems: number): void;

    setItemsPerPage(itemCount: number): void;

    setTotalItems(itemCount: number): void;

    on(eventType: string, callback: (evt: any) => void): void;

    off(eventType: string): void;
  }
}
