import { RowKey } from './data';

export interface MenuPos {
  left: number;
  top: number;
  bottom: number;
  right: number;
}

export interface MenuItem {
  name: string;
  label?: string;
  disabled?: boolean;
  action?:
    | (() => void)
    | 'copy'
    | 'copyColumns'
    | 'copyRows'
    | 'csvExport'
    | 'excelExport'
    | 'txtExport';
  classNames?: string[];
  subMenu?: MenuItem[];
}

export interface MenuPosInfo {
  pos: MenuPos;
  rowKey: RowKey;
  columnName: string;
}

export type CreateMenuGroups =
  | ((params: { rowKey: RowKey; columnName: string }) => MenuItem[][])
  | null;

export interface ContextMenu {
  posInfo: MenuPosInfo | null;
  createMenuGroups: CreateMenuGroups;
  flattenTopMenuItems: MenuItem[] | null;
}
