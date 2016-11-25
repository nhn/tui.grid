/**
 * @fileoverview Base class for Models
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Backbone = require('backbone');
var _ = require('underscore');

var common = require('./common');

/**
 * Base class for Models
 * @module base/model
 * @mixes module:base/common
 * @ignore
 */
var Model = Backbone.Model.extend(/**@lends module:base/model.prototype*/{});

_.assign(Model.prototype, common);

module.exports = Model;
