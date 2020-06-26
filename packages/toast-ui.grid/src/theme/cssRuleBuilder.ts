import { OptScrollbarStyle, OptCellStyle } from '@t/options';
import { cls, ClassNameType } from '../helper/dom';
import { isBoolean } from '../helper/common';

/**
 * create css rule string and returns it
 * @module {theme/cssBuilder}
 * @param selector - css selector
 * @param property - css property
 * @param  value - css value
 * @ignore
 */
class CSSRuleBuilder {
  public constructor(selector: string) {
    this.init(selector);
  }

  private selector = '';

  private propValues: string[] = [];

  public init(selector: string) {
    if (!(typeof selector === 'string') || !selector) {
      throw new Error('The Selector must be a string and not be empty.');
    }
    this.selector = selector;
    this.propValues = [];
  }

  /**
   * Add a set of css property and value.
   * @param property - css property
   * @param  value - css value
   */
  public add(property: string, value?: string) {
    if (value) {
      this.propValues.push(`${property}:${value}`);
    }

    return this;
  }

  /**
   * Shortcut for add('border-color', value)
   */
  public border(value?: string) {
    return this.add('border-color', value);
  }

  /**
   * Add a border-width style to the rule.
   * @param options - visible options
   * @param [options.showVerticalBorder] - whether the vertical border is visible
   * @param [options.showHorizontalBorder] - whether the horizontal border is visible
   */
  public borderWidth(options: OptCellStyle) {
    const vertical = options.showVerticalBorder;
    const horizontal = options.showHorizontalBorder;
    let value: '1px' | '0';

    if (isBoolean(vertical)) {
      value = vertical ? '1px' : '0';
      this.add('border-left-width', value).add('border-right-width', value);
    }

    if (isBoolean(horizontal)) {
      value = horizontal ? '1px' : '0';
      this.add('border-top-width', value).add('border-bottom-width', value);
    }

    return this;
  }

  /**
   * Add a vertical border style to the rule.
   * @param options - visible options
   * @param [options.showVerticalBorder] - whether the vertical border is visible
   * @param position - Position of the vertical border ('right' or 'left')
   */
  public verticalBorderStyle(options: OptCellStyle, position?: string) {
    const vertical = options.showVerticalBorder;
    let value: 'solid' | 'hidden';

    if (isBoolean(vertical) && position) {
      value = vertical ? 'solid' : 'hidden';

      this.add(`border-${position}-style`, value);
    }

    return this;
  }

  /**
   * Shortcut for add('background-color', value)
   */
  public bg(value?: string) {
    return this.add('background-color', value);
  }

  /**
   * Shortcut for add('color', value)
   */
  public text(value?: string) {
    return this.add('color', value);
  }

  /**
   * Create a CSS rule string with a selector and prop-values.
   */
  public build() {
    let result = '';

    if (this.propValues.length) {
      result = `${this.selector}{${this.propValues.join(';')}}`;
    }

    return result;
  }
}

/**
 * Creates new Builder instance.
 */
export function create(selector: string) {
  return new CSSRuleBuilder(selector);
}

/**
 * Creates a new Builder instance with a class name selector.
 */
export function createClassRule(className: ClassNameType) {
  return create(`.${cls(className)}`);
}

/**
 * Creates a new Builder instance with a nested class name.
 * @param selector - selector to compose class names
 * @param classNames - classNames
 */
export function createNestedClassRule(
  selector: string,
  classNames: ClassNameType[]
): CSSRuleBuilder {
  return create(`.${classNames.map((className) => cls(className)).join(selector)}`);
}

/**
 * Creates an array of new Builder instances for the -webkit-scrollbar styles.
 */
export function createWebkitScrollbarRules(selector: string, options: OptScrollbarStyle) {
  return [
    create(`${selector} ::-webkit-scrollbar`).bg(options.background),
    create(`${selector} ::-webkit-scrollbar-thumb`).bg(options.thumb),
    create(`${selector} ::-webkit-scrollbar-thumb:hover`).bg(options.active),
  ];
}

/**
 * Creates a builder instance for the IE scrollbar styles.
 */
export function createIEScrollbarRule(selector: string, options: OptScrollbarStyle) {
  const bgProps = [
    'scrollbar-3dlight-color',
    'scrollbar-darkshadow-color',
    'scrollbar-track-color',
    'scrollbar-shadow-color',
  ];
  const thumbProps = ['scrollbar-face-color', 'scrollbar-highlight-color'];
  const ieScrollbarRule = create(selector);

  bgProps.forEach(function (prop) {
    ieScrollbarRule.add(prop, options.background);
  });
  thumbProps.forEach(function (prop) {
    ieScrollbarRule.add(prop, options.thumb);
  });
  ieScrollbarRule.add('scrollbar-arrow-color', options.active);

  return ieScrollbarRule;
}
/**
 * Build all rules and returns the concatenated string.
 */
export function buildAll(rules: CSSRuleBuilder[]) {
  return rules
    .map(function (rule) {
      return rule.build();
    })
    .join('');
}
