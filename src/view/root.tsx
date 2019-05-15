import { h, Component } from 'preact';
import { Store } from '../store/types';
import { Dispatch } from '../dispatch/create';
import { Container } from './container';

interface Props {
  rootElement: HTMLElement;
  store: Store;
  dispatch: Dispatch;
}

export class Root extends Component<Props> {
  public getChildContext() {
    return {
      store: this.props.store,
      dispatch: this.props.dispatch
    };
  }

  public render() {
    return <Container rootElement={this.props.rootElement} />;
  }
}
