import { RequestTypeCode, MutationParams } from '../../../types/dataSource';
import { getConfirmMessage, getAlertMessage } from '../../i18n/message';

export function confirmMutation(type: RequestTypeCode, params: MutationParams) {
  const count = Object.keys(params).reduce(
    (acc, key) => acc + params[key as keyof MutationParams]!.length,
    0
  );
  return count ? confirm(getConfirmMessage(type, count)) : alert(getAlertMessage(type));
}
