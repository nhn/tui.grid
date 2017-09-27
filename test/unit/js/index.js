/**
 * @fileoverview Test env
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var testsContext = require.context('./', true, /spec\.js$/);
testsContext.keys().forEach(testsContext);
