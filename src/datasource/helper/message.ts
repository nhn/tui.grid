import { RequestTypeCode } from '../types';
import i18n from '../../i18n';

type MessageMap = { [key in RequestTypeCode]: string };

const confirmMessageMap: MessageMap = {
  C: 'net.confirmCreate',
  U: 'net.confirmUpdate',
  D: 'net.confirmDelete',
  M: 'net.confirmModify'
};

const alertMessageMap: MessageMap = {
  C: 'net.noDataToCreate',
  U: 'net.noDataToUpdate',
  D: 'net.noDataToDelete',
  M: 'net.noDataToModify'
};

export function getConfirmMessage(type: RequestTypeCode, count: number) {
  return i18n.get(confirmMessageMap[type], { count: String(count) });
}

export function getAlertMessage(type: RequestTypeCode) {
  return i18n.get(alertMessageMap[type]);
}
