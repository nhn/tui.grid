/**
* @fileoverview theme manager
* @author NHN Ent. FE Development Team
*/
'use strict';

/**
 * create css rule string and returns it
 * @param {String} selector - css selector
 * @param {String} property - css property
 * @param {String} value - css value
 * @returns {String}
 */
var Builder = tui.util.defineClass({
    init: function(selector) {
        this._selector = selector;
        this._propValues = [];
    },

    /**
     * Add a set of css property and value.
     * @param {String} property - css property
     * @param {String} value - css value
     * @returns {Builder} this
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
     * @returns {Builder} this
     */
    border: function(value) {
        return this.add('border-color', value);
    },

    /**
     * Add a border-width style to the rule.
     * @param {Boolean} vertical - whether the vertical border is visible
     * @param {Boolean} horizontal - whether the horizontal border is visible
     * @returns {Builder} this
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
     * @returns {Builder} this
     */
    bg: function(value) {
        return this.add('background-color', value);
    },

    /**
     * Shortcut for add('color', value)
     * @param {String} value - css value
     * @returns {Builder} this
     */
    text: function(value) {
        return this.add('color', value);
    },

    /**
     * Create a rule string with selector and prop-values.
     * @returns {String}
     */
    build: function() {
        return this._selector + '{' + this._propValues.join(';') + '}';
    }
});

/**
 * Creates new Builder instance and returns it.
 * @param {String} selector - selector
 * @returns {Builder}
 */
function create(selector) {
    return new Builder(selector);
}

/**
 * Creates a rule string for the -webkit-scrollbar styles and returns it.
 * @param {String} selector - selector
 * @param {Object} colorset - options
 * @returns {String}
 */
function webkitScrollbarRuleString(selector, options) {
    var scrollbar = create(selector + ' ::-webkit-scrollbar')
        .bg(options.background).build();

    var thumb = create(selector + ' ::-webkit-scrollbar-thumb')
        .bg(options.thumb).build();

    var thumbHover = create(selector + ' ::-webkit-scrollbar-thumb:hover')
        .bg(options.active).build();

    return scrollbar + thumb + thumbHover;
}

/**
 * Creates a rule string for the IE scrollbar styles and returns it.
 * @param {String} selector - selector
 * @param {Object} options - options
 * @returns {String}
 */
function ieScrollbarRuleString(selector, options) {
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
    var ieRule = create(selector);

    _.each(bgProps, function(prop) {
        ieRule.add(prop, options.background);
    });
    _.each(thumbProps, function(prop) {
        ieRule.add(prop, options.thumb);
    });
    ieRule.add('scrollbar-arrow-color', options.active);

    return ieRule.build();
}

module.exports = {
    create: create,
    ieScrollbarRuleString: ieScrollbarRuleString,
    webkitScrollbarRuleString: webkitScrollbarRuleString
};
