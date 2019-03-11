const CLS_PREFIX = 'tui-grid-';

type ClassName =
  'body-area' |
  'body-container' |
  'border-line' |
  'border-line-top' |
  'border-line-left' |
  'border-line-right' |
  'border-line-bottom' |
  'cell-content' |
  'cell' |
  'cell-head' |
  'column-resize-container' |
  'column-resize-handle' |
  'column-resize-handle-last' |
  'container' |
  'content-area' |
  'head-area' |
  'no-scroll-x' |
  'no-scroll-y' |
  'lside-area' |
  'rside-area' |
  'layer-selection' |
  'layer-focus-border' |
  'layer-state' |
  'layer-editing' |
  'table-container' |
  'table';

export function cls(...names: ClassName[]) {
  const result = [];

  for (let name of names) {
    if (Array.isArray(name)) {
      name = name[0] ? name[1] : null;
    }

    if (name) {
      result.push(`${CLS_PREFIX}${name}`);
    }
  }

  return result.join(' ');
}