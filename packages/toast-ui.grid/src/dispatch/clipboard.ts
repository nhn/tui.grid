import { Store } from '@t/store';
import { Range } from '@t/store/selection';
import { cls, isSupportWindowClipboardData, setClipboardSelection } from '../helper/dom';
import { getText } from '../query/clipboard';
import { getInstance } from '../instance';

export function execCopy(store: Store, ranges?: { rowRange: Range; columnRange: Range }) {
  const { el } = getInstance(store.id);
  const targetText = getText(store, ranges);
  const clipboard = el.querySelector(`.${cls('clipboard')}`)!;
  clipboard.innerHTML = targetText;

  if (isSupportWindowClipboardData()) {
    setClipboardSelection(clipboard.childNodes[0]);
  }
  // Accessing the clipboard is a security concern on chrome
  document.execCommand('copy');
}
