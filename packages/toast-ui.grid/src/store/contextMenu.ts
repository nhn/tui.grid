import { ContextMenu, MenuItem, CreateMenuGroups } from '@t/store/contextMenu';
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
  createMenuGroups?: CreateMenuGroups;
}

export function create({ createMenuGroups }: ContextMenuOptions) {
  return observable<ContextMenu>({
    posInfo: null,
    createMenuGroups: createMenuGroups || createDefaultContextMenu,

    get flattenTopMenuItems() {
      if (!this.posInfo) {
        return [];
      }

      const { rowKey, columnName } = this.posInfo;
      const menuGroups = this.createMenuGroups({ rowKey, columnName });

      return menuGroups.reduce((acc: MenuItem[], group: MenuItem[], groupIndex: number) => {
        const menuItems: MenuItem[] = [];
        group.forEach((menuItem, itemIndex) => {
          menuItems.push(menuItem);
          if (groupIndex < menuGroups.length - 1 && itemIndex === group.length - 1) {
            menuItems.push({ name: 'separator' });
          }
        });
        return acc.concat(menuItems);
      }, []);
    },
  });
}
