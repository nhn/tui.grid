import { h, Component } from 'preact';
import { LeftSide } from './leftSide';
import { RightSide } from './rightSide';
import { StateLayer } from './stateLayer';
import { EditingLayer } from './editingLayer';
import { cls } from '../helper/common';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';

interface StoreProps {
  width: number;
  autoWidth: boolean;
}

type Props = StoreProps & DispatchProps;

export class ContainerComp extends Component<Props> {
  el?: HTMLElement;

  componentDidMount() {
    if (this.props.autoWidth) {
      window.addEventListener('resize', this.syncWithDOMWidth);
      requestAnimationFrame(this.syncWithDOMWidth);
    }
  }

  componentWillUnmount() {
    if (this.props.autoWidth) {
      window.removeEventListener('resize', this.syncWithDOMWidth);
    }
  }

  syncWithDOMWidth = () => {
    const { clientWidth } = this.el!;

    if (clientWidth !== this.props.width) {
      this.props.dispatch('setWidth', clientWidth, true);
    }
  };

  shouldComponentUpdate(nextProps: Props) {
    if (this.props.autoWidth && nextProps.autoWidth) {
      return false;
    }
    return true;
  }

  render() {
    const { width, autoWidth } = this.props;
    const style = { width: autoWidth ? '100%' : width };

    return (
      <div style={style} class={cls('container')} ref={(el) => (this.el = el)} data-grid-id="1">
        <div class={cls('content-area')}>
          <LeftSide />
          <RightSide />
          <div class={cls('border-line', 'border-line-top')} />
          <div class={cls('border-line', 'border-line-left')} />
          <div class={cls('border-line', 'border-line-right')} />
          <div class={cls('border-line', 'border-line-bottom')} />
        </div>
        <StateLayer />
        <EditingLayer />
      </div>
    );
  }
}

export const Container = connect<StoreProps, {}, DispatchProps>(({ dimension }) => ({
  width: dimension.width,
  autoWidth: dimension.autoWidth
}))(ContainerComp);
