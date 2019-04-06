import { h, AnyComponent, Component } from 'preact';
import { watch } from '../helper/reactive';
import { Store } from '../store/types';
import { Dispatch, DispatchProps } from '../dispatch/create';

export function connect<SelectedProps = {}, OwnProps = {}>(
  selector?: (store: Store, props: OwnProps) => SelectedProps
) {
  return function(WrappedComponent: AnyComponent<OwnProps & SelectedProps & DispatchProps>) {
    return class extends Component<OwnProps, SelectedProps> {
      componentWillMount() {
        if (selector) {
          watch(() => {
            this.setState(selector(this.context.store, this.props));
          });
        }
      }

      render() {
        const { props, state } = this;
        const dispatch: Dispatch = this.context.dispatch;

        return <WrappedComponent {...props} {...state} dispatch={dispatch} />;
      }
    };
  };
}
