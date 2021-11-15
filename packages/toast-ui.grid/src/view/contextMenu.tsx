import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { MenuItem, MenuPos } from '@t/store/contextMenu';
import { ContextMenuItem } from './contextMenuItem';

interface StoreProps {
  menuItems: MenuItem[];
  pos: MenuPos | null;
}

type OwnProps = Partial<StoreProps>;

type Props = DispatchProps & StoreProps;

export class ContextMenuComp extends Component<Props> {
  render() {
    const { pos, menuItems } = this.props;

    if (pos) {
      return (
        <ul class={cls('context-menu')} style={pos}>
          {menuItems.map((menuItem) => (
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
  menuItems: menuItems || contextMenu!.flattenTopMenuItems,
}))(ContextMenuComp);
