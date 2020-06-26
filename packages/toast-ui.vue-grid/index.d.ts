import Vue from 'vue';
import TuiGrid from 'tui-grid';

type FunctionKeys<T extends object> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type GridFnKeys = FunctionKeys<TuiGrid>;

export declare class Grid extends Vue {
  invoke<T extends GridFnKeys>(fname: T, ...args: Parameters<TuiGrid[T]>): ReturnType<TuiGrid[T]>;
  getRootElement(): HTMLElement;
}
