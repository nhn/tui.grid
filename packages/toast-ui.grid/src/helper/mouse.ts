export function emitMouseup(el: HTMLElement) {
  const mouseupEvent = new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(mouseupEvent);
}
