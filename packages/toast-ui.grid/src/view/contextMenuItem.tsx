import { h, Component } from 'preact';
import { MenuItem, MenuPos } from '@t/store/contextMenu';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';
import { isString } from '../helper/common';
import { ContextMenu } from './contextMenu';

interface OwnProps {
  menuItem: MenuItem;
}

type Props = OwnProps & DispatchProps;

interface State {
  subMenuInfo: {
    pos: MenuPos;
    menuItems: MenuItem[];
  } | null;
}

class ContextMenuItemComp extends Component<Props, State> {
  private showSubMenu = (ev: MouseEvent) => {
    const { menuItem } = this.props;

    if (menuItem.subMenu?.length) {
      const { offsetWidth } = ev.target as HTMLElement;
      const pos = { top: -6, left: offsetWidth };
      const subMenuInfo = { menuItems: menuItem.subMenu, pos };

      this.setState({ subMenuInfo });
    }
  };

  private hideSubMenu = () => {
    this.setState({ subMenuInfo: null });
  };

  private execAction = (ev: MouseEvent) => {
    const { menuItem, dispatch } = this.props;

    if (menuItem.action) {
      if (isString(menuItem.action)) {
        this.props.dispatch(menuItem.action);
      } else {
        menuItem.action();
      }
    }
    ev.stopPropagation();
    dispatch('setContextMenuPos', null);
  };

  render({ menuItem }: Props) {
    const { name, label = '', subMenu, classNames = [] } = menuItem;

    if (name === 'seperator') {
      return <li class="menu-item seperator"></li>;
    }

    const { subMenuInfo } = this.state;
    const classList = classNames.concat('menu-item');

    if (subMenu) {
      classList.push('has-submenu');
    }

    return (
      <li
        class={classList.join(' ')}
        onClick={this.execAction}
        onMouseEnter={this.showSubMenu}
        onMouseLeave={this.hideSubMenu}
      >
        <span dangerouslySetInnerHTML={{ __html: label }} />
        {subMenuInfo && <ContextMenu menuItems={subMenuInfo.menuItems} pos={subMenuInfo.pos} />}
      </li>
    );
  }
}

export const ContextMenuItem = connect<{}, OwnProps>()(ContextMenuItemComp);
