/**
 * @fileoverview Test env
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 */

'use strict';

var testsContext = require.context('./', true, /spec\.js$/);
testsContext.keys().forEach(testsContext);
