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
    const { action } = menuItem;

    if (isString(action)) {
      this.props.dispatch(action);
    } else if (action) {
      action();
    }
    ev.stopPropagation();
    dispatch('hideContextMenu');
  };

  createClassNames() {
    const { subMenu, disabled, classNames = [] } = this.props.menuItem;
    const classList = classNames.concat('menu-item');

    if (subMenu) {
      classList.push('has-submenu');
    }

    if (disabled) {
      classList.push('disabled');
    }

    return classList.join(' ');
  }

  render({ menuItem }: Props) {
    const { name, label = '', disabled } = menuItem;

    if (name === 'separator') {
      return <li class="menu-item separator"></li>;
    }

    // eslint-disable-next-line no-undefined
    const getListener = (listener: JSX.MouseEventHandler) => (disabled ? undefined : listener);
    const classNames = this.createClassNames();
    const { subMenuInfo } = this.state;

    return (
      <li
        class={classNames}
        onClick={getListener(this.execAction)}
        onMouseEnter={getListener(this.showSubMenu)}
        onMouseLeave={getListener(this.hideSubMenu)}
      >
        <span dangerouslySetInnerHTML={{ __html: label }} />
        {subMenuInfo && <ContextMenu menuItems={subMenuInfo.menuItems} pos={subMenuInfo.pos} />}
      </li>
    );
  }
}

export const ContextMenuItem = connect<{}, OwnProps>()(ContextMenuItemComp);
