import { Reactive, reactive } from '../helper/reactive';
import { Clipboard, ClipboardCopyOptions } from './types';

interface ClipboardOptions {
  copyOptions: ClipboardCopyOptions;
}

export function create({ copyOptions }: ClipboardOptions): Reactive<Clipboard> {
  return reactive({
    text: null
  });
}
