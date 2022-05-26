import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { MenuItem, MenuPos } from '@t/store/contextMenu';
import { ContextMenuItem } from './contextMenuItem';

interface StoreProps {
  menuItems: MenuItem[] | null;
  pos: MenuPos | null;
}

type OwnProps = Partial<StoreProps>;

type Props = DispatchProps & StoreProps;

export class ContextMenuComp extends Component<Props> {
  private container: HTMLElement | null = null;

  private adjustPos() {
    const { pos } = this.props;

    const { left, top, right, bottom } = pos!;
    const { offsetHeight, offsetWidth } = this.container!;
    const computedTop = offsetHeight > bottom ? top + bottom - offsetHeight : top;
    const computedLeft = offsetWidth > right ? left + right - offsetWidth : left;

    this.container!.style.top = `${computedTop}px`;
    this.container!.style.left = `${computedLeft}px`;
  }

  componentDidMount() {
    if (this.props.pos) {
      this.adjustPos();
    }
  }

  componentDidUpdate() {
    if (this.props.pos) {
      this.adjustPos();
    }
  }

  render() {
    const { pos, menuItems } = this.props;

    if (pos) {
      return (
        <ul
          ref={(ref) => {
            this.container = ref;
          }}
          class={cls('context-menu')}
        >
          {menuItems!.map((menuItem) => (
            <ContextMenuItem key={menuItem.name} menuItem={menuItem} />
          ))}
        </ul>
      );
    }
    return null;
  }
}

export const ContextMenu = connect<StoreProps, OwnProps>(({ contextMenu }, { menuItems, pos }) => ({
  pos: pos || (contextMenu?.posInfo?.pos ?? null),
  menuItems: menuItems || contextMenu?.flattenTopMenuItems,
}))(ContextMenuComp);
