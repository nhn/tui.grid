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
  disabled?: (params: ActionParams) => boolean;
  action?: ((params: ActionParams) => void) | 'copy' | 'copyColumns' | 'copyRows';
  classNames?: string[];
  subMenu?: MenuItem[];
}

export interface MenuPosInfo {
  pos: MenuPos;
  rowKey: RowKey;
  columnName: string;
}

export interface ContextMenu {
  posInfo: MenuPosInfo | null;
  menuGroups: MenuItem[][];
  flattenTopMenuItems: MenuItem[];
}
