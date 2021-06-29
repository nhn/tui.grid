import { h, Component } from 'preact';
import { RowKey } from '@t/store/data';
import { MenuItem, MenuPosInfo } from '@t/store/contextMenu';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';
import { isString } from '../helper/common';
import { ContextMenu } from './contextMenu';

interface OwnProps {
  menuItem: MenuItem;
  rowKey: RowKey;
  columnName: string;
}

type Props = OwnProps & DispatchProps;

interface State {
  subMenuInfo: {
    posInfo: MenuPosInfo;
    menuItems: MenuItem[];
  } | null;
}

class ContextMenuItemComp extends Component<Props, State> {
  private showSubMenu = (ev: MouseEvent) => {
    const { menuItem, rowKey, columnName } = this.props;

    if (menuItem.subMenu?.length) {
      const { offsetWidth } = ev.target as HTMLElement;
      const pos = { top: -6, left: offsetWidth };
      const subMenuInfo = { menuItems: menuItem.subMenu, posInfo: { pos, rowKey, columnName } };

      this.setState({ subMenuInfo });
    }
  };

  private hideSubMenu = () => {
    this.setState({ subMenuInfo: null });
  };

  private execAction = (ev: MouseEvent) => {
    const { menuItem, dispatch, rowKey, columnName } = this.props;

    if (menuItem.action) {
      if (isString(menuItem.action)) {
        this.props.dispatch(menuItem.action);
      } else {
        menuItem.action({ rowKey, columnName });
      }
    }
    ev.stopPropagation();
    dispatch('hideContextMenu');
  };

  render({ menuItem }: Props) {
    const { name, subMenu, label = '', classNames = [] } = menuItem;

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
        {subMenuInfo && (
          <ContextMenu menuItems={subMenuInfo.menuItems} posInfo={subMenuInfo.posInfo} />
        )}
      </li>
    );
  }
}

export const ContextMenuItem = connect<{}, OwnProps>()(ContextMenuItemComp);
