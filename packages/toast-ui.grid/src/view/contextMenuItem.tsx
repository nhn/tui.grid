import { h, Component } from 'preact';
import { MenuItem } from '@t/store/contextMenu';

interface OwnProps {
  menuItem: MenuItem;
}

type Props = OwnProps;

export class ContextMenuItem extends Component<Props> {
  render({ menuItem }: Props) {
    return (
      <li class="menu-item" data-item-name={menuItem.name}>
        <span>{menuItem.label}</span>
      </li>
    );
  }
}
