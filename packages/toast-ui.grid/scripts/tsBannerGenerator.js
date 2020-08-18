/* eslint-disable */
const fs = require('fs');
const path = require('path');
const package = require('../package');

const { version } = package;
const declareFilePath = path.join(__dirname, '../types/index.d.ts');
const tsVersion = /[0-9.]+/.exec(package.devDependencies.typescript)[0];
const tsBanner = `// Type definitions for TOAST UI Grid v${version}\n// TypeScript Version: ${tsVersion}`;

fs.readFile(declareFilePath, 'utf8', (error, data) => {
  if (error) {
    throw error;
  }

  const declareRows = data.toString().split('\n');
  declareRows.splice(0, 2, tsBanner);

  fs.writeFile(declareFilePath, declareRows.join('\n'), 'utf8', (error) => {
    if (error) {
      throw error;
    }
    console.log('Completed Write Banner for Typescript!');
  });
});
