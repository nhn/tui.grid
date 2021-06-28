import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls, findParentByTagName } from '../helper/dom';
import { MenuPos, MenuItem, MenuItemMap } from '@t/store/contextMenu';
import { ContextMenuItem } from './contextMenuItem';
import { isString } from '../helper/common';

interface StoreProps {
  pos: MenuPos | null;
  menuItems: MenuItem[];
  menuItemMap: MenuItemMap;
}

type Props = DispatchProps & StoreProps;

interface State {
  subMenuInfo: {
    pos: MenuPos;
    menuItems: MenuItem[];
  } | null;
}

const BORDER_WIDTH = 1;

export class ContextMenuComp extends Component<Props, State> {
  private showSubMenu = (ev: MouseEvent) => {
    const currentItem = findParentByTagName(ev.target as HTMLElement, 'li')!;

    if (currentItem) {
      const menuItem = this.props.menuItemMap[currentItem.getAttribute('data-item-name')!];

      if (menuItem) {
        let subMenuInfo = null;

        if (menuItem.subMenu?.length) {
          const { offsetWidth, offsetTop } = currentItem;
          const pos = { top: offsetTop - BORDER_WIDTH, left: offsetWidth + BORDER_WIDTH };
          subMenuInfo = { menuItems: menuItem.subMenu, pos };
        }
        this.setState({ subMenuInfo });
      }
    }
  };

  private execAction = (ev: MouseEvent) => {
    const currentItem = findParentByTagName(ev.target as HTMLElement, 'li')!;

    if (currentItem) {
      const menuItem = this.props.menuItemMap[currentItem.getAttribute('data-item-name')!];

      if (menuItem) {
        if (isString(menuItem.action)) {
          this.props.dispatch(menuItem.action);
        } else {
          menuItem.action();
        }
      }
    }
    this.props.dispatch('setContextMenuPos', null);
  };

  render() {
    const { pos, menuItems } = this.props;
    const { subMenuInfo } = this.state;
    const wrapperStyle = { display: pos ? 'block' : 'none', ...pos };

    return (
      <div
        class={cls('context-menu-wrapper')}
        style={wrapperStyle}
        onMouseOver={this.showSubMenu}
        onClick={this.execAction}
      >
        <ul class={cls('context-menu')}>
          {menuItems.map((menuItem) => (
            <ContextMenuItem key={menuItem.name} menuItem={menuItem} />
          ))}
        </ul>
        {subMenuInfo && (
          <ul class={cls('context-menu')} style={{ position: 'absolute', ...subMenuInfo.pos }}>
            {subMenuInfo.menuItems.map((menuItem) => (
              <ContextMenuItem key={menuItem.name} menuItem={menuItem} isSubMenu={true} />
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
  menuItems: contextMenu.flattenTopMenuItems,
}))(ContextMenuComp);
