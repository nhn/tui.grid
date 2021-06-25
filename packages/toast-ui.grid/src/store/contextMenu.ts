import { observable } from '../helper/observable';
import { ContextMenu, MenuItem } from '@t/store/contextMenu';

export function create() {
  return observable<ContextMenu>({
    pos: null,
    menuGroups: [
      [
        {
          name: 'id1',
          label: 'text1',
          action: () => {
            console.log(123);
          },
        },
        {
          name: 'id2',
          label: 'text1',
          action: () => {
            console.log(123);
          },
          subMenu: [
            {
              name: 'id8',
              label: 'text1-2',
              action: () => {
                console.log(1111);
              },
            },
          ],
        },
      ],
      [
        {
          name: 'id3',
          label: 'text1',
          action: () => {
            console.log(123);
          },
          subMenu: [
            {
              name: 'id7',
              label: 'text1-1',
              action: () => {
                console.log(1111);
              },
            },
          ],
        },
        {
          name: 'id5',
          label: 'text1',
          action: () => {
            console.log(123);
          },
        },
      ],
    ],

    get menuItemMap() {
      return this.menuGroups.reduce((acc: Record<string, MenuItem>, group: MenuItem[]) => {
        group.forEach((menuItem) => {
          acc[menuItem.name] = menuItem;
        });
        return acc;
      }, {});
    },
  });
}
