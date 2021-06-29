import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { MenuPosInfo, MenuItem } from '@t/store/contextMenu';
import { ContextMenuItem } from './contextMenuItem';

interface StoreProps {
  posInfo: MenuPosInfo | null;
  menuItems: MenuItem[];
}

type Props = DispatchProps & StoreProps;

export class ContextMenuComp extends Component<Props> {
  render() {
    const { posInfo, menuItems } = this.props;

    if (posInfo) {
      const { pos, rowKey, columnName } = posInfo;
      return (
        <div class={cls('context-menu-wrapper')} style={pos}>
          <ul class={cls('context-menu')}>
            {menuItems!.map((menuItem) => (
              <ContextMenuItem
                key={menuItem.name}
                menuItem={menuItem}
                rowKey={rowKey}
                columnName={columnName}
              />
            ))}
          </ul>
        </div>
      );
    }
    return null;
  }
}

export const ContextMenu = connect<StoreProps, Partial<StoreProps>>(
  ({ contextMenu }, { menuItems, posInfo }) => ({
    posInfo: posInfo || contextMenu.posInfo,
    menuItems: menuItems || contextMenu.flattenTopMenuItems,
  })
)(ContextMenuComp);
