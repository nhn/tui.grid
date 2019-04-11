import { h, AnyComponent, Component } from 'preact';
import { watch } from '../helper/reactive';
import { Store } from '../store/types';
import { DeepReadonly } from 'utility-types';
import { Dispatch, DispatchProps } from '../dispatch/create';

export function connect<SelectedProps = {}, OwnProps = {}>(
  selector?: (store: DeepReadonly<Store>, props: DeepReadonly<OwnProps>) => DeepReadonly<SelectedProps>
) {
  type Props = OwnProps & SelectedProps & DispatchProps;

  return function (WrappedComponent: AnyComponent<Props>) {
    return class extends Component<OwnProps, SelectedProps> {
      static displayName = `Connect:${WrappedComponent.name}`;

      componentWillMount() {
        if (selector) {
          watch(() => {
            this.setState(selector(this.context.store, (this.props as DeepReadonly<OwnProps>)));
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
