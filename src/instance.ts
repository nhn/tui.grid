import Grid from './grid';

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

export function getInstance(id: number): Grid {
  return instanceMap[id];
}
