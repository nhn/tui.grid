import { Store, State } from '../store/types';

export function setRenderState({ renderState }: Store, state: State) {
  renderState.state = state;
}
