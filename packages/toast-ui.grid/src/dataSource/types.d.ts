import { Row, RowKey, Dictionary, Store } from '../store/types';
import { Dispatch } from '../dispatch/create';
import { OptRow } from '../types';

export type ModificationTypeCode = 'CREATE' | 'UPDATE' | 'DELETE';

export type ModifiedDataMap = { [type in ModificationTypeCode]: Row[] };

export type RequestTypeCode = ModificationTypeCode | 'MODIFY';

export type RequestType = 'createData' | 'updateData' | 'deleteData' | 'modifyData';

export type RequestFunction = (url: string, method: string, options: RequestOptions) => void;

export type Serializer = (params: Params) => string;

export type AjaxConfig = {
  contentType?: ContentType;
  mimeType?: string;
  withCredentials?: boolean;
  headers?: Dictionary<string>;
  serializer?: Serializer;
};

export type DataProvider = {
  request: (requestType: RequestType, options: RequestOptions) => void | never;
  readData: (page: number, data?: Params, resetData?: boolean) => void | never;
  reloadData: () => void | never;
};

export type ContentType = 'application/x-www-form-urlencoded' | 'application/json';

export type Config = {
  api: API;
  ajaxConfig: AjaxConfig;
  store: Store;
  dispatch: Dispatch;
  setLastRequiredData: (params: Params) => void;
  getLastRequiredData: () => Params;
};

export type DataSource = {
  api: API;
  initialRequest?: boolean;
} & AjaxConfig;

export type Params = {
  rows?: Row[] | RowKey[];
  createdRows?: Row[] | RowKey[];
  updatedRows?: Row[] | RowKey[];
  deletedRows?: Row[] | RowKey[];
  page?: number;
  perPage?: number;
  sortColumn?: string;
  sortAscending?: boolean;
} & Dictionary<any>;

export type Url = string | (() => string);

export interface APIInfo {
  url: Url;
  method: string;
  initParams?: Dictionary<any>;
}

export interface API {
  createData?: APIInfo;
  readData: APIInfo;
  updateData?: APIInfo;
  deleteData?: APIInfo;
  modifyData?: APIInfo;
}

export interface RequestOptions {
  url?: string;
  method?: string;
  checkedOnly?: boolean;
  modifiedOnly?: boolean;
  showConfirm?: boolean;
  withCredentials?: boolean;
}

export interface ModifiedRowsOptions {
  checkedOnly?: boolean;
  withRawData?: boolean;
  rowKeyOnly?: boolean;
  ignoredColumns?: string[];
}

export interface Response {
  result: boolean;
  data?: {
    contents: OptRow[];
    pagination: {
      page: number;
      totalCount: number;
    };
  };
  message?: string;
}

export interface ModifiedDataManager {
  setOriginData: (data: OptRow[]) => void;
  getOriginData: () => OptRow[];
  getModifiedData: (
    type: ModificationTypeCode,
    options: ModifiedRowsOptions
  ) => Dictionary<Row[] | RowKey[]>;
  getAllModifiedData: (options: ModifiedRowsOptions) => Dictionary<Row[] | RowKey[]>;
  isModified: () => boolean;
  isModifiedByType: (type: ModificationTypeCode) => boolean;
  push: (type: ModificationTypeCode, row: Row) => void;
  clear: (type: Dictionary<Row[] | RowKey[]>) => void;
  clearAll: () => void;
}
