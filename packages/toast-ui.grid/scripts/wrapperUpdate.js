const path = require('path');
const fs = require('fs');

const GRID_PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');
const REACT_PACKAGE_JSON_PATH = path.join(__dirname, '../../toast-ui.react-grid/package.json');
const VUE_PACKAGE_JSON_PATH = path.join(__dirname, '../../toast-ui.vue-grid/package.json');

const gridPackage = JSON.parse(fs.readFileSync(GRID_PACKAGE_JSON_PATH, 'utf8'));
const reactGridPackage = JSON.parse(fs.readFileSync(REACT_PACKAGE_JSON_PATH, 'utf8'));
const vueGridPackage = JSON.parse(fs.readFileSync(VUE_PACKAGE_JSON_PATH, 'utf8'));

const version = gridPackage.version;

reactGridPackage.version = version;
reactGridPackage.dependencies['tui-grid'] = `^${version}`;

fs.writeFileSync(REACT_PACKAGE_JSON_PATH, `${JSON.stringify(reactGridPackage, null, 2)}\n`);

vueGridPackage.version = version;
vueGridPackage.dependencies['tui-grid'] = `^${version}`;

fs.writeFileSync(VUE_PACKAGE_JSON_PATH, `${JSON.stringify(vueGridPackage, null, 2)}\n`);
