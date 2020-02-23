import { Dictionary } from '../../types/options';
import { API, Params } from '../../types/dataSource';
import { Store } from '../../types/store';
import { Dispatch } from '../dispatch/create';

export type Config = {
  api: API;
  hideLoadingBar: boolean;
  store: Store;
  dispatch: Dispatch;
  setLastRequiredData: (params: Params) => void;
  getLastRequiredData: () => Params;
  setRequestParams: (params: Dictionary<any>) => void;
  getRequestParams: () => Dictionary<any>;
};
