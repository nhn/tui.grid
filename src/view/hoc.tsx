import { h, AnyComponent, Component } from 'preact';
import { watch } from '../store/reactive';
import { Store } from '../store/types';

interface Selector<OwnProps> {
  (store: Store, props: OwnProps): any
}

export function connect<OwnProps>(selector: Selector<OwnProps>) {
  type SelectedProps = ReturnType<Selector<OwnProps>>;
  type InjectedProps = OwnProps & SelectedProps;

  return function (WrappedComponent: AnyComponent<InjectedProps>) {
    return class extends Component<OwnProps, SelectedProps> {
      componentWillMount() {
        watch(() => {
          this.setState(selector(this.context.store, this.props));
        });
      }

      render(props: OwnProps, state: SelectedProps) {
        const { dispatch } = this.context;
        return <WrappedComponent {...props} {...state} dispatch={dispatch} />
      }
    };
  }
}
