import { Exports } from '@t/store/export';
import { observable } from '../helper/observable';

export function create({ excelCompatibilityMode = false }: Exports) {
  return observable<Exports>({ excelCompatibilityMode });
}
