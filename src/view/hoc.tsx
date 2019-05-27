import { h, AnyComponent, Component } from 'preact';
import { watch } from '../helper/reactive';
import { Store } from '../store/types';
import { DeepReadonly } from 'utility-types';
import { DispatchProps } from '../dispatch/create';

export function connect<SelectedProps = {}, OwnProps = {}>(
  selector?: (
    store: DeepReadonly<Store>,
    props: DeepReadonly<OwnProps>
  ) => DeepReadonly<SelectedProps>
) {
  type Props = OwnProps & SelectedProps & DispatchProps;

  return function(WrappedComponent: AnyComponent<Props>) {
    return class extends Component<OwnProps, SelectedProps> {
      public static displayName = `Connect:${WrappedComponent.name}`;

      private unwatch?: () => void;

      private setStateUsingSelector(ownProps: OwnProps) {
        if (selector) {
          this.setState(selector(this.context.store, ownProps as DeepReadonly<OwnProps>));
        }
      }

      public componentWillMount() {
        if (selector) {
          this.unwatch = watch(() => {
            this.setStateUsingSelector(this.props);
          });
        }
      }

      public componentWillReceiveProps(nextProps: OwnProps) {
        this.setStateUsingSelector(nextProps);
      }

      public componentWillUnmount() {
        if (this.unwatch) {
          this.unwatch();
        }
      }

      public render() {
        const { props, state } = this;
        const { dispatch } = this.context;

        return <WrappedComponent {...props} {...state} dispatch={dispatch} />;
      }
    };
  };
}
