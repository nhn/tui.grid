type MsSaveOrOpenBlob = (blob: any, defaultName?: string | undefined) => boolean;

export interface NavigatorWithMsSaveOrOpenBlob extends Navigator {
  msSaveOrOpenBlob: MsSaveOrOpenBlob;
}

export function isEdge() {
  const rEdge = /Edge\/(\d+)\./;
  return rEdge.exec(window.navigator.userAgent);
}

export function isMobile() {
  return /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );
}

export function isSupportWindowNavigatorMsSaveOrOpenBlob() {
  return !!(window.navigator as NavigatorWithMsSaveOrOpenBlob).msSaveOrOpenBlob;
}
