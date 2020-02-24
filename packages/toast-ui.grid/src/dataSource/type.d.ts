import { Dictionary } from '@t/options';
import { API, Params } from '@t/dataSource';
import { Store } from '@t/store';
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
