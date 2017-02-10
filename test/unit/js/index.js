/* eslint-disable */
require('es5-shim');

var testsContext = require.context('.', true, /spec\.js$/);
testsContext.keys().forEach(testsContext);
