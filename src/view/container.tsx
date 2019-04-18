import { h, Component } from 'preact';
import { LeftSide } from './leftSide';
import { RightSide } from './rightSide';
import { StateLayer } from './stateLayer';
import { EditingLayer } from './editingLayer';
import { HeightResizeHandle } from './heightResizeHandle';
import { Clipboard } from './clipboard';
import { cls, getCellAddress } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';

interface OwnProps {
  rootElement: HTMLElement;
}

interface StoreProps {
  width: number;
  autoWidth: boolean;
  scrollXHeight: number;
  fitToParentHeight: boolean;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class ContainerComp extends Component<Props> {
  el?: HTMLElement;

  handleMouseDown = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    const focusBlockTags = ['input', 'a', 'button', 'select', 'textarea'];
    const focusBlocked = focusBlockTags.includes(target.tagName.toLowerCase());
    /* const cellAddress = getCellAddress(target); */
    const isMainButton = false;

    if (!focusBlocked && !isMainButton) {
      ev.preventDefault();
      this.props.dispatch('setFocusActive', true);
    }
  };

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
    const { clientWidth, clientHeight } = this.el!;
    const { width, fitToParentHeight, rootElement } = this.props;

    if (clientWidth !== width) {
      this.props.dispatch('setWidth', clientWidth, true);
    }

    if (fitToParentHeight) {
      const { parentElement } = rootElement;
      if (parentElement && parentElement.clientHeight !== clientHeight) {
        this.props.dispatch('setHeight', parentElement.clientHeight);
      }
    }
  };

  shouldComponentUpdate(nextProps: Props) {
    if (this.props.autoWidth && nextProps.autoWidth) {
      return false;
    }
    return true;
  }

  render() {
    const { width, autoWidth, scrollXHeight } = this.props;
    const style = { width: autoWidth ? '100%' : width };

    return (
      <div
        style={style}
        class={cls('container')}
        onMouseDown={this.handleMouseDown}
        ref={(el) => (this.el = el)}
        data-grid-id="1"
      >
        <div class={cls('content-area')}>
          <LeftSide />
          <RightSide />
          <div class={cls('border-line', 'border-line-top')} />
          <div class={cls('border-line', 'border-line-left')} />
          <div class={cls('border-line', 'border-line-right')} />
          <div class={cls('border-line', 'border-line-bottom')} style={{ bottom: scrollXHeight }} />
        </div>
        <HeightResizeHandle />
        <StateLayer />
        <EditingLayer />
        <Clipboard />
      </div>
    );
  }
}

export const Container = connect<StoreProps, OwnProps>(({ dimension }) => ({
  width: dimension.width,
  autoWidth: dimension.autoWidth,
  scrollXHeight: dimension.scrollX ? dimension.scrollbarWidth : 0,
  fitToParentHeight: dimension.fitToParentHeight
}))(ContainerComp);
