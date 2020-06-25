import { h, AnyComponent, Component } from 'preact';
import { Store } from '@t/store';
import { observe } from '../helper/observable';
import { DispatchProps } from '../dispatch/create';

export function connect<SelectedProps = {}, OwnProps = {}>(
  selector?: (store: Store, props: OwnProps) => SelectedProps,
  forceUpdate?: boolean
) {
  type Props = OwnProps & SelectedProps & DispatchProps;

  return function (WrappedComponent: AnyComponent<Props>) {
    return class extends Component<OwnProps, SelectedProps> {
      public static displayName = `Connect:${WrappedComponent.name}`;

      private unobserve?: () => void;

      private setStateUsingSelector(ownProps: OwnProps) {
        if (selector) {
          this.setState(selector(this.context.store, ownProps as OwnProps));
          if (forceUpdate) {
            this.forceUpdate();
          }
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
        this.setStateUsingSelector(nextProps);
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
