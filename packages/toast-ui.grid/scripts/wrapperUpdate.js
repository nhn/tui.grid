const path = require('path');
const fs = require('fs');

const GRID_PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');
const REACT_PACKAGE_JSON_PATH = path.join(__dirname, '../../toast-ui.react-grid/package.json');
const VUE_PACKAGE_JSON_PATH = path.join(__dirname, '../../toast-ui.vue-grid/package.json');

const gridPackage = require(GRID_PACKAGE_JSON_PATH);
const reactGridPackage = require(REACT_PACKAGE_JSON_PATH);
const vueGridPackage = require(VUE_PACKAGE_JSON_PATH);

const version = gridPackage.version;

reactGridPackage.version = version;
reactGridPackage.dependencies['tui-grid'] = `^${version}`;

fs.writeFileSync(REACT_PACKAGE_JSON_PATH, `${JSON.stringify(reactGridPackage, null, 2)}\n`);

vueGridPackage.version = version;
vueGridPackage.dependencies['tui-grid'] = `^${version}`;

fs.writeFileSync(VUE_PACKAGE_JSON_PATH, `${JSON.stringify(vueGridPackage, null, 2)}\n`);
