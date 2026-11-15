import { Store } from '@t/store';
import { Range } from '@t/store/selection';
import { cls, isSupportWindowClipboardData, setClipboardSelection } from '../helper/dom';
import { getText } from '../query/clipboard';
import { getInstance } from '../instance';

function getPlainText(html: string) {
  const doc = document.implementation.createHTMLDocument('');
  doc.body.innerHTML = html;

  return doc.body.textContent ?? '';
}

export function execCopy(store: Store, ranges?: { rowRange: Range; columnRange: Range }) {
  const { el } = getInstance(store.id);
  const targetText = getText(store, ranges);
  const clipboard = el.querySelector(`.${cls('clipboard')}`)!;
  clipboard.textContent = getPlainText(targetText);

  if (isSupportWindowClipboardData()) {
    setClipboardSelection(clipboard.childNodes[0] ?? clipboard);
  }
  // Accessing the clipboard is a security concern on chrome
  document.execCommand('copy');
}
