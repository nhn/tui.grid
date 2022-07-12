import { CellRenderer, CellRendererProps } from '@t/renderer';
import { cls } from '../helper/dom';
import { isFunction } from '../helper/common';
import { sanitize } from 'dompurify';

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 0 : 1) extends <T>() => T extends Y
  ? 0
  : 1
  ? A
  : B;
type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>;
}[keyof T];
type StyleProps = Exclude<WritableKeys<CSSStyleDeclaration>, number | Function>;
type TargetType = 'attrs' | 'styles';

export class DefaultRenderer implements CellRenderer {
  private el: HTMLDivElement;

  private props: CellRendererProps;

  public constructor(props: CellRendererProps) {
    const el = document.createElement('div');
    const { ellipsis, whiteSpace, renderer } = props.columnInfo;
    let className = '';

    this.props = props;
    this.el = el;

    if (renderer) {
      const { attributes, styles, classNames } = renderer;

      if (attributes) {
        this.setAttrsOrStyles('attrs', attributes);
      }
      if (styles) {
        this.setAttrsOrStyles('styles', styles);
      }
      if (classNames) {
        className = ` ${classNames.join(' ')}`;
      }
    }

    el.className = cls('cell-content') + className;

    // @TODO: we should remove below options and consider common the renderer option for style, attribute and class names
    if (ellipsis) {
      el.style.textOverflow = 'ellipsis';
    }
    if (whiteSpace) {
      el.style.whiteSpace = whiteSpace;
    }

    this.render(props);
  }

  private setAttrsOrStyles(type: TargetType, targets: Record<string, any>) {
    Object.keys(targets).forEach((name) => {
      const value = isFunction(targets[name]) ? targets[name](this.props) : targets[name];
      if (type === 'attrs') {
        this.el.setAttribute(name, value);
      } else {
        this.el.style[name as StyleProps] = value;
      }
    });
  }

  public getElement() {
    return this.el;
  }

  public render(props: CellRendererProps) {
    this.el.innerHTML = sanitize(`${props.formattedValue}`);
  }
}
