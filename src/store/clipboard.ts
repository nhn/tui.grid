import { Reactive, reactive } from '../helper/reactive';
import { Clipboard, ClipboardCopyOptions, Selection } from './types';

interface ClipboardOptions {
  copyOptions: ClipboardCopyOptions;
  selection: Selection;
}

export function create({ copyOptions, selection }: ClipboardOptions): Reactive<Clipboard> {
  return reactive({
    text: null
  });
}
