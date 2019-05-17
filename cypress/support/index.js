// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

export function isSubSetOf(obj, target) {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    const prop = obj[key];
    const targetProp = target[key];

    if (typeof prop === 'object' && typeof targetProp === 'object') {
      if (!isSubSetOf(prop, targetProp)) {
        return false;
      }
    } else if (prop !== targetProp) {
      return false;
    }
  }
  return true;
}
