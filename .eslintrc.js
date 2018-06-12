module.exports = {
    "extends": "tui",
    "parserOptions": {
        "ecmaVersion": 3
    },
    "env": {
        "browser": true,
        "jasmine": true,
        "jquery": true,
        "commonjs": true
    },
    "globals": {
        "tui": true,
        "setFixtures": true,
        "loadFixtures": true
    },
    rules: {
        'linebreak-style': 0,
        complexity: 0
    }
};
