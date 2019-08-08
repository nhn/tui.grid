import { h, Component } from 'preact';
import { Store } from '../store/types';
import { Dispatch } from '../dispatch/create';
import { Container } from './container';
import GridEvent from '../event/gridEvent';
import { isFunction } from '../helper/common';
import { getInstance } from '../instance';

interface Props {
  rootElement: HTMLElement;
  store: Store;
  dispatch: Dispatch;
  onGridMounted?: Function;
  onGridBeforeDestroyed?: Function;
}

export class Root extends Component<Props> {
  public getChildContext() {
    return {
      store: this.props.store,
      dispatch: this.props.dispatch
    };
  }

  public componentDidMount() {
    const { onGridMounted, store } = this.props;
    const gridEvent = new GridEvent();
    gridEvent.setInstance(getInstance(store.id));

    if (isFunction(onGridMounted)) {
      setTimeout(() => {
        onGridMounted(gridEvent);
      });
    }
  }

  public componentWillUnmount() {
    const { onGridBeforeDestroyed, store } = this.props;
    const gridEvent = new GridEvent();
    gridEvent.setInstance(getInstance(store.id));

    if (isFunction(onGridBeforeDestroyed)) {
      onGridBeforeDestroyed(gridEvent);
    }
  }

  public render() {
    return <Container rootElement={this.props.rootElement} />;
  }
}
