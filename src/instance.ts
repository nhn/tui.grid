import Grid from './grid';
import { GridId } from './store/types';

let currentId = 0;

const instanceMap: { [id: number]: Grid } = {};

function generateId() {
  currentId += 1;
  return currentId;
}

export function register(instance: Grid) {
  const id = generateId();
  instanceMap[id] = instance;

  return id;
}

export function getInstance(id: GridId): Grid {
  return instanceMap[id];
}
