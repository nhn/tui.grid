declare module 'tui-date-picker' {
  type CalendarType = 'date' | 'month' | 'year';

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

  export default class DatePicker {
    constructor(container: string | HTMLElement, options?: DatePickerOptions);

    public open(): void;

    // public addCssClass(className: string): void;
    // public removeCssClass(className: string): void;
    // public addRange(start: Date | number, end: Date | number): void;
    // public changeLanguage(language: string): void;
    // public close(): void;
    // public destroy(): void;
    // public disable(): void;
    // public drawLowerCalendar(date: Date): void;
    // public drawUpperCalendar(date: Date): void;
    // public enable(): void;
    // public findOverlappedRange(startDate: Date | number, endDate: Date | number): Date[];
    // public getCalendar(): TuiCalendar;
    // public getCalendarType(): CalendarType;
    // ... 아직 추가 안함..
  }
}
