import { ContextMenu, MenuItem } from '@t/store/contextMenu';
import { observable } from '../helper/observable';
import i18n from '../i18n';

function setMenuItemRecursively(itemMap: Record<string, MenuItem>, menuItem: MenuItem) {
  itemMap[menuItem.name] = menuItem;

  if (menuItem.subMenu) {
    menuItem.subMenu.forEach((subMenuItem) => {
      setMenuItemRecursively(itemMap, subMenuItem);
    });
  }
}

function createDefaultContextMenu(): MenuItem[][] {
  return [
    [
      {
        name: 'copy',
        label: i18n.get('contextMenu.copy'),
        action: 'copy',
      },
      {
        name: 'copyColumns',
        label: i18n.get('contextMenu.copyColumns'),
        action: 'copyColumns',
      },
      {
        name: 'copyRows',
        label: i18n.get('contextMenu.copyRows'),
        action: 'copyRows',
      },
    ],
  ];
}

interface ContextMenuOptions {
  menuGroups?: MenuItem[][];
}

export function create({ menuGroups }: ContextMenuOptions) {
  return observable<ContextMenu>({
    posInfo: null,
    menuGroups: menuGroups || createDefaultContextMenu(),

    get menuItemMap() {
      return this.menuGroups.reduce((acc: Record<string, MenuItem>, group: MenuItem[]) => {
        group.forEach((menuItem) => {
          setMenuItemRecursively(acc, menuItem);
        });
        return acc;
      }, {});
    },

    get flattenTopMenuItems() {
      return this.menuGroups.reduce((acc: MenuItem[], group: MenuItem[], groupIndex: number) => {
        const menuItems: MenuItem[] = [];
        group.forEach((menuItem, itemIndex) => {
          menuItems.push(menuItem);
          if (groupIndex < this.menuGroups.length - 1 && itemIndex === group.length - 1) {
            menuItems.push({ name: 'seperator' });
          }
        });
        return acc.concat(menuItems);
      }, []);
    },
  });
}
