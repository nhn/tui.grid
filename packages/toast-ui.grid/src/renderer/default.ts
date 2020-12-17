import { CellRenderer, CellRendererProps } from '@t/renderer';
import { cls } from '../helper/dom';
import { isFunction } from '../helper/common';

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 0 : 1) extends <T>() => T extends Y
  ? 0
  : 1
  ? A
  : B;
type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>;
}[keyof T];
type StyleProps = Exclude<WritableKeys<CSSStyleDeclaration>, number | Function>;
interface DefaultOptions {
  styles?: Record<string, string>;
  attributes?: Record<string, string>;
  classNames?: string[];
}

export class DefaultRenderer implements CellRenderer {
  private el: HTMLDivElement;

  private props: CellRendererProps;

  public constructor(props: CellRendererProps) {
    const el = document.createElement('div');
    const { ellipsis, whiteSpace, renderer } = props.columnInfo;
    let className = '';

    this.props = props;
    this.el = el;

    if (renderer.options) {
      const { attributes, styles, classNames }: DefaultOptions = renderer.options;
      this.setAttributes(attributes);
      this.setStyles(styles);

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

  private setStyles(styles?: Record<string, any>) {
    if (styles) {
      Object.keys(styles).forEach((name) => {
        const value = styles[name];
        this.el.style[name as StyleProps] = isFunction(value) ? value(this.props) : value;
      });
    }
  }

  private setAttributes(attributes?: Record<string, any>) {
    if (attributes) {
      Object.keys(attributes).forEach((name) => {
        const value = attributes[name];
        this.el.setAttribute(name, isFunction(value) ? value(this.props) : value);
      });
    }
  }

  public getElement() {
    return this.el;
  }

  public render(props: CellRendererProps) {
    this.el.innerHTML = `${props.formattedValue}`;
  }
}
