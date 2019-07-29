import { h, AnyComponent, Component } from 'preact';
import { observe, isObservable } from '../helper/observable';
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

      private unobserve?: () => void;

      private setStateUsingSelector(ownProps: OwnProps) {
        if (selector) {
          this.setState(selector(this.context.store, ownProps as DeepReadonly<OwnProps>));
        }
      }

      public componentWillMount() {
        if (selector) {
          this.unobserve = observe(() => {
            this.setStateUsingSelector(this.props);
          });
        }
      }

      public componentWillReceiveProps(nextProps: OwnProps) {
        if (selector) {
          if (this.unobserve) {
            this.unobserve();
          }
          this.unobserve = observe(() => {
            this.setStateUsingSelector(nextProps);
          });
        }
      }

      public componentWillUnmount() {
        if (this.unobserve) {
          this.unobserve();
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
