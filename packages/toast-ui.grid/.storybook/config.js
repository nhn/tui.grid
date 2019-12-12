import { configure, addDecorator } from '@storybook/html';
import { makeDecorator } from '@storybook/addons';
import Grid from '../src/grid';

const withDefaultTheme =  makeDecorator({
  name: 'withDefaultTheme',
  wrapper: (getStory, context) => {
    Grid.applyTheme({ preset: 'default' });
    return getStory(context);
  }
});

addDecorator(withDefaultTheme);
configure(require.context('../stories', true, /.stories.tsx?$/), module);
