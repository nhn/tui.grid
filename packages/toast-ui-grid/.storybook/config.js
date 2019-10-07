import { configure } from '@storybook/html';

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.ts$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
