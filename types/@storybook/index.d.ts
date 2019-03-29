// Type definitions for @storybook/html 5.0

declare module '@storybook/html' {
  type Renderable = HTMLElement | string;
  type RenderFunction = () => Renderable;

  interface DecoratorParameters {
    [key: string]: any;
  }
  type StoryDecorator = (story: RenderFunction, context: { kind: string, story: string }) => Renderable | null;

  interface Story {
    readonly kind: string;
    add(storyName: string, callback: RenderFunction, parameters?: DecoratorParameters): this;
    addDecorator(decorator: StoryDecorator): this;
    addParameters(parameters: DecoratorParameters): this;
  }

  export function addDecorator(decorator: StoryDecorator): void;
  export function addParameters(parameters: DecoratorParameters): void;
  export function clearDecorators(): void;
  export function configure(fn: () => void, module: NodeModule): void;
  export function setAddon(addon: object): void;
  export function storiesOf(name: string, module: NodeModule): Story;
  export function storiesOf<T>(name: string, module: NodeModule): Story & T;
  export function forceReRender(): void;

  interface StoryObject {
    name: string;
    render: RenderFunction;
  }

  interface StoryBucket {
    kind: string;
    stories: StoryObject[];
  }

  export function getStorybook(): StoryBucket[];
}
