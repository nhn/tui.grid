import { h, AnyComponent, Component } from 'preact';
import { watch } from '../helper/reactive';
import { Store } from '../store/types';
import { Dispatch } from '../dispatch/types';

interface Selector<OwnProps, SelectedProps> {
  (store: Store, props: OwnProps): SelectedProps;
}

export function connect<SelectedProps, OwnProps, DispatchProps = {}>(
  selector: Selector<OwnProps, SelectedProps>
) {
  return function(WrappedComponent: AnyComponent<OwnProps & SelectedProps & DispatchProps>) {
    return class extends Component<OwnProps, SelectedProps & DispatchProps> {
      componentWillMount() {
        watch(() => {
          this.setState(selector(this.context.store, this.props));
        });
      }

      render() {
        const { props, state } = this;

        const dispatch = this.context.dispatch as Dispatch;
        return <WrappedComponent {...props} {...state} dispatch={dispatch} />;
      }
    };
  };
}
