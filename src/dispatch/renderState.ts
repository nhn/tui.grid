import { Store, State, RowKey } from '../store/types';

export function setRenderState({ renderState }: Store, state: State) {
  renderState.state = state;
}

export function setHoveredRowKey({ renderState }: Store, rowKey: RowKey | null) {
  renderState.hoveredRowKey = rowKey;
}
