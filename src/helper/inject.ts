import { Dictionary, GridId } from '../store/types';
import { isObject } from './common';
import { DataProvider, ModifiedDataManager } from '../datasource/types';
import { PaginationManager } from '../pagination/paginationManager';

type InstanceList =
  | ['dataProvider', DataProvider]
  | ['dataManager', ModifiedDataManager]
  | ['paginationManager', PaginationManager];

interface InjectionMap {
  dataProvider: DataProvider;
  dataManager: ModifiedDataManager;
  paginationManager: PaginationManager;
}

const injectionMap: Dictionary<InjectionMap> = {};

export function inject(id: GridId, ...instanceList: InstanceList[]) {
  if (!isObject(injectionMap[id])) {
    injectionMap[id] = {} as InjectionMap;
  }
  instanceList.forEach(([name, instance]) => {
    injectionMap[id][name] = instance;
  });
}

export function getDataProvider(id: GridId) {
  return injectionMap[id].dataProvider;
}

export function getDataManager(id: GridId) {
  return injectionMap[id].dataManager;
}

export function getPaginationManager(id: GridId) {
  return injectionMap[id].paginationManager;
}
