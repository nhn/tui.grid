import { configure, addDecorator } from '@storybook/react';
import { makeDecorator } from '@storybook/addons';
import Grid from 'tui-grid';

const withDefaultConfig = makeDecorator({
  name: 'withDefaultConfig',
  wrapper: (getStory, context) => {
    Grid.setLanguage('en');
    Grid.applyTheme({ preset: 'default' });
    return getStory(context);
  },
});

addDecorator(withDefaultConfig);

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
