import {
  DataProvider,
  Datasource,
  RequestOptions,
  API,
  Params,
  Response,
  RequestTypeCode,
  RequestType,
  DownloadType
} from './types';
import { Store, Dictionary, Row, RowKey } from '../store/types';
import { OptRow } from '../types';
import { Dispatch } from '../dispatch/create';
import { isUndefined, isObject, omit } from '../helper/common';
import CustomHttpRequest from './customHttpRequest';
import { getDataManager } from '../helper/inject';
import { getConfirmMessage, getAlertMessage } from './helper/message';
import { encodeParams } from './helper/encoder';
import { getMappingData } from './modifiedDataManager';
import { getEventBus } from '../event/eventBus';

interface SendOptions {
  url: string;
  method: string;
  options: RequestOptions;
  requestTypeCode: RequestTypeCode;
}

class ServerSideDataProvider implements DataProvider {
  private initialRequest: boolean;

  private api: API;

  private withCredentials: boolean;

  private lastRequiredData: Params;

  private store: Store;

  private dispatch: Dispatch;

  public constructor(store: Store, dispatch: Dispatch, data: Datasource) {
    const datasource = data;
    const { api, initialRequest = true, withCredentials = false } = datasource;

    this.initialRequest = initialRequest;
    this.api = api;
    this.withCredentials = withCredentials;
    this.lastRequiredData = { perPage: store.data.pageOptions.perPage! };
    this.store = store;
    this.dispatch = dispatch;

    if (this.initialRequest === true) {
      this.readData(1);
    }
  }

  private createRequestOptions(options = {}): RequestOptions {
    const defaultOptions = {
      checkedOnly: false,
      modifiedOnly: true,
      showConfirm: true,
      withCredentials: this.withCredentials
    };
    return { ...defaultOptions, ...options };
  }

  private createRequestParams(type: RequestTypeCode, options: RequestOptions) {
    const { checkedOnly, modifiedOnly } = options;
    const { ignoredColumns } = this.store.column;
    const manager = getDataManager(this.store.id);
    if (modifiedOnly) {
      return type === 'M'
        ? manager.getAllModifiedData({ checkedOnly, ignoredColumns })
        : manager.getModifiedData(type, { checkedOnly, ignoredColumns });
    }
    return { rows: getMappingData(this.store.data.rawData, { checkedOnly, ignoredColumns }) };
  }

  private handleSuccessReadData = (response: Response) => {
    const { result, data } = response;
    if (!result || isUndefined(data)) {
      return;
    }
    this.dispatch('resetData', data.contents);
    this.dispatch('setPagination', data.pagination);
  };

  public readData(page: number, data = {}, resetData = false) {
    if (!this.api) {
      return;
    }
    const { api, withCredentials } = this;
    const { perPage } = this.store.data.pageOptions;
    const { method, url } = api.readData;
    const dataWithType = data as Params;
    // assign request params
    const params = resetData
      ? { perPage, ...dataWithType, page }
      : { ...this.lastRequiredData, ...dataWithType, page };
    this.lastRequiredData = params;

    const request = new CustomHttpRequest({
      method,
      url,
      params,
      callback: this.handleSuccessReadData,
      callbackWhenever: () => this.dispatch('setRenderState', 'DONE'),
      withCredentials,
      eventBus: getEventBus(this.store.id)
    });

    this.dispatch('setRenderState', 'LOADING');
    request.open();
    request.send();
  }

  public createData(url: string, method: string, options: RequestOptions) {
    this.send({ url, method, options, requestTypeCode: 'C' });
  }

  public updateData(url: string, method: string, options: RequestOptions) {
    this.send({ url, method, options, requestTypeCode: 'U' });
  }

  public deleteData(url: string, method: string, options: RequestOptions) {
    this.send({ url, method, options, requestTypeCode: 'D' });
  }

  public modifyData(url: string, method: string, options: RequestOptions) {
    this.send({ url, method, options, requestTypeCode: 'M' });
  }

  public request(requestType: RequestType, options: RequestOptions) {
    let { url, method } = options;
    if (this.api && isObject(this.api[requestType])) {
      url = url || this.api[requestType]!.url;
      method = method || this.api[requestType]!.method;
    }

    if (!url || !method) {
      throw new Error('url and method should be essential for request.');
    }
    const requestOptions = this.createRequestOptions(options);
    this[requestType](url, method, requestOptions);
  }

  // @TODO need to imporove download logic by using blob or msSave
  public download(downloadType: DownloadType) {
    const data =
      downloadType === 'downloadExcelAll'
        ? omit(this.lastRequiredData, ['page', 'perPage'])
        : this.lastRequiredData;
    if (!this.api[downloadType]) {
      throw new Error(`${downloadType} API should be essential for request.`);
    }
    if (!this.api[downloadType]!.url) {
      throw new Error('url and method should be essential for request.');
    }
    const { url } = this.api[downloadType]!;
    const params = encodeParams(data);
    window.location.href = `${url}?${params}`;
  }

  public reloadData() {
    this.readData(this.lastRequiredData.page || 1);
  }

  private send(sendOptions: SendOptions) {
    const { url, method, options, requestTypeCode } = sendOptions;
    const manager = getDataManager(this.store.id);
    const params = this.createRequestParams(requestTypeCode, options);

    if (!options.showConfirm || this.confirm(requestTypeCode, this.getCount(params))) {
      const { withCredentials } = options;
      const request = new CustomHttpRequest({
        method,
        url,
        params,
        callback: () => manager.clear(params),
        callbackWhenever: () => this.dispatch('setRenderState', 'DONE'),
        withCredentials: isUndefined(withCredentials) ? this.withCredentials : withCredentials,
        eventBus: getEventBus(this.store.id)
      });
      this.dispatch('setRenderState', 'LOADING');
      request.open();
      request.send();
    }
  }

  private getCount(rowsMap: Dictionary<Row[] | RowKey[]>) {
    return Object.keys(rowsMap).reduce((acc, key) => acc + rowsMap[key].length, 0);
  }

  // @TODO need to options for custom conrifm UI
  private confirm(type: RequestTypeCode, count: number) {
    let result = false;

    if (count > 0) {
      result = confirm(getConfirmMessage(type, count));
    } else {
      alert(getAlertMessage(type));
    }
    return result;
  }
}

export function createProvider(
  store: Store,
  dispatch: Dispatch,
  data?: OptRow[] | Datasource
): DataProvider {
  if (!Array.isArray(data) && isObject(data)) {
    return new ServerSideDataProvider(store, dispatch, data as Datasource);
  }
  // dummy instance
  return {
    createData: () => {},
    updateData: () => {},
    deleteData: () => {},
    modifyData: () => {},
    request: () => {},
    readData: () => {},
    reloadData: () => {},
    download: () => {}
  };
}
