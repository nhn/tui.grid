import { Store } from '@t/store';
import { MenuPos } from '@t/store/contextMenu';

export function setContextMenuPos({ contextMenu }: Store, pos: MenuPos | null) {
  contextMenu.pos = pos;
}
