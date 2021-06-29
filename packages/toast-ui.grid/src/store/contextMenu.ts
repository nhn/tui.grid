import { ContextMenu, MenuItem } from '@t/store/contextMenu';
import { observable } from '../helper/observable';
import i18n from '../i18n';

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

    get flattenTopMenuItems() {
      return this.menuGroups.reduce((acc: MenuItem[], group: MenuItem[], groupIndex: number) => {
        const menuItems: MenuItem[] = [];
        group.forEach((menuItem, itemIndex) => {
          menuItems.push(menuItem);
          if (groupIndex < this.menuGroups.length - 1 && itemIndex === group.length - 1) {
            menuItems.push({ name: 'separator' });
          }
        });
        return acc.concat(menuItems);
      }, []);
    },
  });
}
