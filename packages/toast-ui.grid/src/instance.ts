import Grid from './grid';
import { GridId } from '@t/store';
import { DataProvider, ModifiedDataManager } from '@t/dataSource';
import { PaginationManager } from './pagination/paginationManager';
import { isObject } from './helper/common';

interface Instances {
  grid: Grid;
  dataProvider: DataProvider;
  dataManager: ModifiedDataManager;
  paginationManager: PaginationManager;
}

interface InstanceMap {
  [id: number]: Instances;
}

let currentId = 0;

const instanceMap: InstanceMap = {};

function generateId() {
  currentId += 1;
  return currentId;
}

export function register(instance: Grid) {
  const id = generateId();
  if (!isObject(instanceMap[id])) {
    instanceMap[id] = {} as Instances;
  }
  instanceMap[id].grid = instance;

  return id;
}

export function registerDataSources(
  id: number,
  dataProvider: DataProvider,
  dataManager: ModifiedDataManager,
  paginationManager: PaginationManager
) {
  instanceMap[id].dataProvider = dataProvider;
  instanceMap[id].dataManager = dataManager;
  instanceMap[id].paginationManager = paginationManager;
}

export function getInstance(id: GridId): Grid {
  return instanceMap[id].grid;
}

export function getDataProvider(id: GridId) {
  return instanceMap[id].dataProvider;
}

export function getDataManager(id: GridId) {
  return instanceMap[id].dataManager;
}

export function getPaginationManager(id: GridId) {
  return instanceMap[id].paginationManager;
}
