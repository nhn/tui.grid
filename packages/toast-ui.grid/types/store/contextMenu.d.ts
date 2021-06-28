export interface MenuPos {
  left: number;
  top: number;
}

export interface MenuItem {
  name: string;
  label?: string;
  action?: (() => void) | 'copy' | 'copyColumns' | 'copyRows';
  classNames?: string[];
  subMenu?: MenuItem[];
}

export type MenuItemMap = Record<string, MenuItem>;

export interface ContextMenu {
  pos: MenuPos | null;
  menuGroups: MenuItem[][];
  menuItemMap: MenuItemMap;
  flattenTopMenuItems: MenuItem[];
}
