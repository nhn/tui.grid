import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls, findParentByTagName } from '../helper/dom';
import { MenuPos, MenuItem, MenuItemMap } from '@t/store/contextMenu';
import { ContextMenuItem } from './contextMenuItem';

interface StoreProps {
  pos: MenuPos | null;
  menuGroups: MenuItem[][];
  menuItemMap: MenuItemMap;
}

type Props = DispatchProps & StoreProps;

interface State {
  subMenuInfo: {
    pos: MenuPos;
    menuItems: MenuItem[];
  } | null;
}

export class ContextMenuComp extends Component<Props, State> {
  private showSubMenu = (ev: MouseEvent) => {
    const currentItem = findParentByTagName(ev.target as HTMLElement, 'li')!;

    if (currentItem) {
      const menuItem = this.props.menuItemMap[currentItem.getAttribute('data-item-name')!];

      if (menuItem) {
        let subMenuInfo = null;

        if (menuItem.subMenu?.length) {
          const { offsetWidth, offsetTop } = currentItem;
          const pos = { top: offsetTop, left: offsetWidth + 1 };
          subMenuInfo = { menuItems: menuItem.subMenu, pos };
        }
        this.setState({ subMenuInfo });
      }
    }
  };

  private flattenMenuGroups() {
    const { menuGroups } = this.props;

    return menuGroups.reduce((acc, group) => {
      const menuItems = group.map((menuItem) => menuItem);
      return acc.concat(menuItems);
    }, []);
  }

  render() {
    const { pos } = this.props;
    const menuItems = this.flattenMenuGroups();
    const { subMenuInfo } = this.state;
    const wrapperStyle = { display: pos ? 'block' : 'none', ...pos };

    return (
      <div class={cls('context-menu-wrapper')} style={wrapperStyle} onMouseOver={this.showSubMenu}>
        <ul class={cls('context-menu')}>
          {menuItems.map((menuItem) => (
            <ContextMenuItem key={menuItem.name} menuItem={menuItem} />
          ))}
        </ul>
        {subMenuInfo && (
          <ul class={cls('context-menu')} style={{ position: 'absolute', ...subMenuInfo.pos }}>
            {subMenuInfo.menuItems.map((menuItem) => (
              <ContextMenuItem key={menuItem.name} menuItem={menuItem} />
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export const ContextMenu = connect<StoreProps>(({ contextMenu }) => ({
  pos: contextMenu.pos,
  menuItemMap: contextMenu.menuItemMap,
  menuGroups: contextMenu.menuGroups,
}))(ContextMenuComp);
