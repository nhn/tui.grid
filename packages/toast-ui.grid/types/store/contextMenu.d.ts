import { RowKey } from './data';

export interface MenuPos {
  left: number;
  top: number;
}

interface ActionParams {
  rowKey: RowKey;
  columnName: string;
}
export interface MenuItem {
  name: string;
  label?: string;
  action?: ((params: ActionParams) => void) | 'copy' | 'copyColumns' | 'copyRows';
  classNames?: string[];
  subMenu?: MenuItem[];
}

export interface MenuPosInfo {
  pos: MenuPos;
  rowKey: RowKey;
  columnName: string;
}

export type MenuItemMap = Record<string, MenuItem>;

export interface ContextMenu {
  posInfo: MenuPosInfo | null;
  menuGroups: MenuItem[][];
  menuItemMap: MenuItemMap;
  flattenTopMenuItems: MenuItem[];
}
