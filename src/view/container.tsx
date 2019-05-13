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
import { SummaryPosition } from '../store/types';

interface OwnProps {
  rootElement: HTMLElement;
}

interface StoreProps {
  width: number;
  autoWidth: boolean;
  editing: boolean;
  scrollXHeight: number;
  fitToParentHeight: boolean;
  summaryHeight: number;
  summaryPosition: SummaryPosition;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class ContainerComp extends Component<Props> {
  private el?: HTMLElement;

  private handleMouseDown = (ev: MouseEvent) => {
    const { dispatch, editing } = this.props;

    dispatch('setNavigating', true);
    if (!editing) {
      ev.preventDefault();
    }
  };

  private handleDblClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    const address = getCellAddress(target);

    if (address) {
      this.props.dispatch('startEditing', address.rowKey, address.columnName);
    }
  };

  public componentDidMount() {
    if (this.props.autoWidth) {
      window.addEventListener('resize', this.syncWithDOMWidth);
      requestAnimationFrame(this.syncWithDOMWidth);
    }
  }

  public componentWillUnmount() {
    if (this.props.autoWidth) {
      window.removeEventListener('resize', this.syncWithDOMWidth);
    }
  }

  private syncWithDOMWidth = () => {
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

  private getContentClassName = () => {
    const { summaryHeight, summaryPosition } = this.props;
    return cls('content-area', [
      !!summaryHeight,
      summaryPosition === 'top' ? 'has-summary-top' : 'has-summary-bottom'
    ]);
  };

  public shouldComponentUpdate(nextProps: Props) {
    if (this.props.autoWidth && nextProps.autoWidth) {
      return false;
    }

    return true;
  }

  public render() {
    const { width, autoWidth, scrollXHeight } = this.props;
    const style = { width: autoWidth ? '100%' : width };
    const contentClassName = this.getContentClassName();

    return (
      <div
        style={style}
        class={cls('container')}
        onMouseDown={this.handleMouseDown}
        onDblClick={this.handleDblClick}
        ref={(el) => {
          this.el = el;
        }}
        data-grid-id="1"
      >
        <div class={contentClassName}>
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

export const Container = connect<StoreProps, OwnProps>(({ dimension, focus }) => ({
  width: dimension.width,
  autoWidth: dimension.autoWidth,
  editing: !!focus.editingAddress,
  scrollXHeight: dimension.scrollX ? dimension.scrollbarWidth : 0,
  fitToParentHeight: dimension.fitToParentHeight,
  summaryHeight: dimension.summaryHeight,
  summaryPosition: dimension.summaryPosition
}))(ContainerComp);
