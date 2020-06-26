import { configure, addDecorator } from '@storybook/html';
import { makeDecorator } from '@storybook/addons';
import Grid from '../src/grid';

const withDefaultConfig = makeDecorator({
  name: 'withDefaultConfig',
  wrapper: (getStory, context) => {
    Grid.setLanguage('en');
    Grid.applyTheme({ preset: 'default' });
    return getStory(context);
  },
});

addDecorator(withDefaultConfig);
configure(require.context('../stories', true, /.stories.tsx?$/), module);
