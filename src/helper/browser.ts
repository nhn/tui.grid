export function isEdge() {
  const rEdge = /Edge\/(\d+)\./;
  return rEdge.exec(window.navigator.userAgent);
}
