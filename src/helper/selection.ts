import { SelectionRange } from '../store/types';
import { isNull } from './common';

export function isSameInputRange(inp1: SelectionRange | null, inp2: SelectionRange | null) {
  if (isNull(inp1) || isNull(inp2)) {
    return inp1 === inp2;
  }

  return (
    inp1.column[0] === inp2.column[0] &&
    inp1.column[1] === inp2.column[1] &&
    inp1.row[0] === inp2.row[0] &&
    inp1.row[1] === inp2.row[1]
  );
}
