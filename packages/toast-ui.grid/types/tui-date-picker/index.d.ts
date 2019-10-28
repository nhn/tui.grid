declare module 'tui-date-picker' {
  type CalendarType = 'date' | 'month' | 'year';
  type DatePickerEventType = 'change' | 'close' | 'draw' | 'open';

  interface DatePickerOptions {
    date?: Date;
    language?: string;
    showToday?: boolean;
    showJumpButtons?: boolean;
    type?: CalendarType;
    usageStatistics?: boolean;
    input?: {
      element?: HTMLElement | string;
      format?: string;
    };
  }

  export default class {
    constructor(container: string | HTMLElement, options?: DatePickerOptions);

    public open(): void;

    public destroy(): void;

    public on(type: DatePickerEventType, handler: Function): void;
  }
}
