import { Row, RowKey } from '../store/data';
import { Dictionary, OptRow } from '../options';

export type ModificationTypeCode = 'CREATE' | 'UPDATE' | 'DELETE';

export type ModifiedDataMap = { [type in ModificationTypeCode]: Row[] };

export type RequestTypeCode = ModificationTypeCode | 'MODIFY';

export type RequestType = 'createData' | 'updateData' | 'deleteData' | 'modifyData';

export type Serializer = (params: Params) => string;

export type AjaxConfig = {
  contentType?: ContentType;
  mimeType?: string;
  withCredentials?: boolean;
  headers?: Dictionary<string>;
  serializer?: Serializer;
};

export type AjaxConfigKeys = keyof AjaxConfig;

export type DataProvider = {
  request: (requestType: RequestType, options: RequestOptions) => void | never;
  readData: (page: number, data?: Params, resetData?: boolean) => void | never;
  reloadData: () => void | never;
  setRequestParams: (params: Dictionary<any>) => void | never;
  sort: (columnName: string, ascending: boolean, cancelable: boolean) => void | never;
  unsort: (columnName?: string) => void | never;
};

export type ContentType = 'application/x-www-form-urlencoded' | 'application/json';

export type DataSource = {
  api: API;
  initialRequest?: boolean;
  hideLoadingBar?: boolean;
} & AjaxConfig;

export type ModifiedRows = {
  createdRows?: Row[] | RowKey[];
  updatedRows?: Row[] | RowKey[];
  deletedRows?: Row[] | RowKey[];
};

export type MutationParams = ModifiedRows & { rows?: Row[] | RowKey[] };

export type Params = {
  rows?: Row[] | RowKey[];
  page?: number;
  perPage?: number;
  sortColumn?: string;
  sortAscending?: boolean;
} & ModifiedRows &
  Dictionary<any>;

export type Url = string | (() => string);

export type APIInfo = {
  url: Url;
  method: string;
  initParams?: Dictionary<any>;
} & AjaxConfig;

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

export interface ResponseData {
  contents: OptRow[];
  pagination: {
    page: number;
    totalCount: number;
  };
}

export interface Response {
  result: boolean;
  data?: ResponseData;
  message?: string;
}

export interface ModifiedDataManager {
  setOriginData: (data: OptRow[]) => void;
  getOriginData: () => OptRow[];
  getModifiedData: (type: ModificationTypeCode, options: ModifiedRowsOptions) => ModifiedRows;
  getAllModifiedData: (options: ModifiedRowsOptions) => ModifiedRows;
  isModified: () => boolean;
  isModifiedByType: (type: ModificationTypeCode) => boolean;
  push: (type: ModificationTypeCode, row: Row[], mixed?: boolean) => void;
  clearSpecificRows: (rowMap: MutationParams) => void;
  clear: (type: RequestTypeCode) => void;
  clearAll: () => void;
  isMixedOrder: () => boolean;
}
