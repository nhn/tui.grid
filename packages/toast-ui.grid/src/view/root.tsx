import { h, Component } from 'preact';
import { Store } from '@t/store';
import { Dispatch } from '../dispatch/create';
import { Container } from './container';
import GridEvent from '../event/gridEvent';
import { getEventBus } from '../event/eventBus';

interface Props {
  rootElement: HTMLElement;
  store: Store;
  dispatch: Dispatch;
}

export class Root extends Component<Props> {
  public getChildContext() {
    return {
      store: this.props.store,
      dispatch: this.props.dispatch,
    };
  }

  public componentDidMount() {
    const eventBus = getEventBus(this.props.store.id);
    const gridEvent = new GridEvent();

    setTimeout(() => {
      /**
       * Occurs when the grid is mounted on DOM
       * @event Grid#onGridMounted
       * @property {Grid} instance - Current grid instance
       */
      eventBus.trigger('onGridMounted', gridEvent);
    });
  }

  public componentWillUnmount() {
    const eventBus = getEventBus(this.props.store.id);
    const gridEvent = new GridEvent();

    /**
     * Occurs before the grid is detached from DOM
     * @event Grid#onGridBeforeDestroy
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('onGridBeforeDestroy', gridEvent);
  }

  public render() {
    return <Container rootElement={this.props.rootElement} />;
  }
}
