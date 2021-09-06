export function isEdge() {
  const rEdge = /Edge\/(\d+)\./;
  return rEdge.exec(window.navigator.userAgent);
}

export function isIE9() {
  return window.navigator.userAgent.indexOf('MSIE 9') !== -1;
}

export function isMobile() {
  return /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );
}
