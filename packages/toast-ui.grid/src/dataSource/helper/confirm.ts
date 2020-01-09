import { RequestTypeCode } from '../types';
import { Dictionary, Row, RowKey } from '../../store/types';
import { getConfirmMessage, getAlertMessage } from '../../i18n/message';

export function confirmMutation(type: RequestTypeCode, params: Dictionary<Row[] | RowKey[]>) {
  const count = Object.keys(params).reduce((acc, key) => acc + params[key].length, 0);
  return count ? confirm(getConfirmMessage(type, count)) : alert(getAlertMessage(type));
}
