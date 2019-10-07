import { RequestTypeCode } from '../types';
import i18n from '../../i18n';

type MessageMap = { [key in RequestTypeCode]: string };

const confirmMessageMap: MessageMap = {
  CREATE: 'net.confirmCreate',
  UPDATE: 'net.confirmUpdate',
  DELETE: 'net.confirmDelete',
  MODIFY: 'net.confirmModify'
};

const alertMessageMap: MessageMap = {
  CREATE: 'net.noDataToCreate',
  UPDATE: 'net.noDataToUpdate',
  DELETE: 'net.noDataToDelete',
  MODIFY: 'net.noDataToModify'
};

export function getConfirmMessage(type: RequestTypeCode, count: number) {
  return i18n.get(confirmMessageMap[type], { count: String(count) });
}

export function getAlertMessage(type: RequestTypeCode) {
  return i18n.get(alertMessageMap[type]);
}
