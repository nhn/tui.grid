import { h, Component } from 'preact';
import { Store } from '../store/types';
import { Dispatch } from '../dispatch/create';
import { Container } from './container';
import { EditorMap } from '../editor/manager';

interface Props {
  rootElement: HTMLElement;
  store: Store;
  dispatch: Dispatch;
  editorMap: EditorMap;
}

export class Root extends Component<Props> {
  public getChildContext() {
    return {
      store: this.props.store,
      dispatch: this.props.dispatch,
      editorMap: this.props.editorMap
    };
  }

  public render() {
    return <Container rootElement={this.props.rootElement} />;
  }
}
