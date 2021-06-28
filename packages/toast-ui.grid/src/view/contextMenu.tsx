import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { MenuPos, MenuItem } from '@t/store/contextMenu';
import { ContextMenuItem } from './contextMenuItem';

interface StoreProps {
  pos?: MenuPos | null;
  menuItems?: MenuItem[];
}

type Props = DispatchProps & StoreProps;

export class ContextMenuComp extends Component<Props> {
  render() {
    const { pos, menuItems } = this.props;

    if (pos) {
      return (
        <div class={cls('context-menu-wrapper')} style={pos}>
          <ul class={cls('context-menu')}>
            {menuItems!.map((menuItem) => (
              <ContextMenuItem key={menuItem.name} menuItem={menuItem} />
            ))}
          </ul>
        </div>
      );
    }
    return null;
  }
}

export const ContextMenu = connect<StoreProps, StoreProps>(
  ({ contextMenu }, { menuItems, pos }) => ({
    pos: pos || contextMenu.pos,
    menuItems: menuItems || contextMenu.flattenTopMenuItems,
  })
)(ContextMenuComp);
