export interface MenuPos {
  left: number;
  top: number;
}

export interface MenuItem {
  name: string;
  label: string;
  action: () => void;
  subMenu?: MenuItem[];
}

export type MenuItemMap = Record<string, MenuItem>;

export interface ContextMenu {
  pos: MenuPos | null;
  menuGroups: MenuItem[][];
  menuItemMap: MenuItemMap;
}
