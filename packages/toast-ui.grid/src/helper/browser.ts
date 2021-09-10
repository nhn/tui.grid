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

export function isSupportMsSaveOrOpenBlob() {
  return !!(window.navigator as NavigatorWithMsSaveOrOpenBlob).msSaveOrOpenBlob;
}

export function downloadBlob(blob: Blob, fileName: string) {
  if (isSupportMsSaveOrOpenBlob()) {
    (window.navigator as NavigatorWithMsSaveOrOpenBlob).msSaveOrOpenBlob(blob, `${fileName}.csv`);
  } else {
    const targetLink = document.createElement('a');

    targetLink.download = `${fileName}.csv`;

    if (typeof targetLink.download === 'undefined') {
      targetLink.setAttribute('target', '_blank');
    }

    targetLink.href = window.URL.createObjectURL(blob);
    targetLink.click();
  }
}
