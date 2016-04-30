/**
* @fileoverview CSS Rule string builder
* @author NHN Ent. FE Development Team
*/
'use strict';

/**
 * create css rule string and returns it
 * @param {String} selector - css selector
 * @param {String} property - css property
 * @param {String} value - css value
 */
var CSSRuleBuilder = tui.util.defineClass({
    init: function(selector) {
        if (!_.isString(selector) || !selector) {
            throw new Error('The Selector must be a string and not be empty.');
        }
        this._selector = selector;
        this._propValues = [];
    },

    /**
     * Add a set of css property and value.
     * @param {String} property - css property
     * @param {String} value - css value
     * @returns {CSSRuleBuilder}
     */
    add: function(property, value) {
        if (value) {
            this._propValues.push(property + ':' + value);
        }
        return this;
    },

    /**
     * Shortcut for add('border-color', value)
     * @param {String} value - css value
     * @returns {CSSRuleBuilder}
     */
    border: function(value) {
        return this.add('border-color', value);
    },

    /**
     * Add a border-width style to the rule.
     * @param {Boolean} vertical - whether the vertical border is visible
     * @param {Boolean} horizontal - whether the horizontal border is visible
     * @returns {CSSRuleBuilder}
     */
    borderWidth: function(vertical, horizontal) {
        var value;

        if (_.isBoolean(vertical)) {
            value = vertical ? '1px' : '0';
            this.add('border-left-width', value)
                .add('border-right-width', value);
        }
        if (_.isBoolean(horizontal)) {
            value = horizontal ? '1px' : '0';
            this.add('border-top-width', value)
                .add('border-bottom-width', value);
        }
        return this;
    },

    /**
     * Shortcut for add('background-color', value)
     * @param {String} value - css value
     * @returns {CSSRuleBuilder}
     */
    bg: function(value) {
        return this.add('background-color', value);
    },

    /**
     * Shortcut for add('color', value)
     * @param {String} value - css value
     * @returns {CSSRuleBuilder}
     */
    text: function(value) {
        return this.add('color', value);
    },

    /**
     * Create a CSS rule string with a selector and prop-values.
     * @returns {String}
     */
    build: function() {
        var result = '';

        if (this._propValues.length) {
            result = this._selector + '{' + this._propValues.join(';') + '}';
        }

        return result;
    }
});

module.exports = {
    /**
     * Creates new Builder instance.
     * @param {String} selector - selector
     * @returns {CSSRuleBuilder}
     */
    create: function(selector) {
        return new CSSRuleBuilder(selector);
    },

    /**
     * Creates a new Builder instance with a class name selector.
     * @param {String} className - class name
     * @returns {Builder}
     */
    createClassRule: function(className) {
        return this.create('.' + className);
    },

    /**
     * Creates an array of new Builder instances for the -webkit-scrollbar styles.
     * @param {String} selector - selector
     * @param {Object} options - options
     * @returns {String}
     */
    createWebkitScrollbarRules: function(selector, options) {
        return [
            this.create(selector + ' ::-webkit-scrollbar').bg(options.background),
            this.create(selector + ' ::-webkit-scrollbar-thumb').bg(options.thumb),
            this.create(selector + ' ::-webkit-scrollbar-thumb:hover').bg(options.active)
        ];
    },

    /**
     * Creates a builder instance for the IE scrollbar styles.
     * @param {String} selector - selector
     * @param {Object} options - options
     * @returns {String}
     */
    createIEScrollbarRule: function(selector, options) {
        var bgProps = [
            'scrollbar-3dlight-color',
            'scrollbar-darkshadow-color',
            'scrollbar-track-color',
            'scrollbar-shadow-color'
        ];
        var thumbProps = [
            'scrollbar-face-color',
            'scrollbar-highlight-color'
        ];
        var ieScrollbarRule = this.create(selector);

        _.each(bgProps, function(prop) {
            ieScrollbarRule.add(prop, options.background);
        });
        _.each(thumbProps, function(prop) {
            ieScrollbarRule.add(prop, options.thumb);
        });
        ieScrollbarRule.add('scrollbar-arrow-color', options.active);

        return ieScrollbarRule;
    },

    /**
     * Build all rules and returns the concatenated string.
     * @param {Array.<Rule>} rules - rule builders
     * @returns {String}
     */
    buildAll: function(rules) {
        return _.map(rules, function(rule) {
            return rule.build();
        }).join('');
    }
};
