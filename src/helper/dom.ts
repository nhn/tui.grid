/**
 * create style element and append it into the head element.
 * @param {String} id - element id
 * @param {String} cssString - css string
 */

export function appendStyleElement(id: string, cssString: string): void {
  const style = document.createElement('style') as HTMLStyleElement;

  style.type = 'text/css';
  style.id = id;
  style.appendChild(document.createTextNode(cssString));

  document.getElementsByTagName('head')[0].appendChild(style);
}