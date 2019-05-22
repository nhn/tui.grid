import { h, Component } from 'preact';
import { LeftSide } from './leftSide';
import { RightSide } from './rightSide';
import { StateLayer } from './stateLayer';
import { EditingLayer } from './editingLayer';
import { HeightResizeHandle } from './heightResizeHandle';
import { Clipboard } from './clipboard';
import { cls, getCellAddress, Attributes } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';
import { SummaryPosition, ViewRow } from '../store/types';
import { find } from '../helper/common';

interface OwnProps {
  rootElement: HTMLElement;
}

interface StoreProps {
  gridId: number;
  width: number;
  autoWidth: boolean;
  editing: boolean;
  scrollXHeight: number;
  fitToParentHeight: boolean;
  summaryHeight: number;
  summaryPosition: SummaryPosition;
  showLeftSide: boolean;
  disabled: boolean;
  viewData: ViewRow[];
}

type Props = OwnProps & StoreProps & DispatchProps;

export class ContainerComp extends Component<Props> {
  private el?: HTMLElement;

  private handleMouseDown = (ev: MouseEvent) => {
    if (!this.el) {
      return;
    }

    const { dispatch, editing } = this.props;
    const { el } = this;

    dispatch('setNavigating', true);
    if (!editing) {
      ev.preventDefault();
    }

    const { top, left } = el.getBoundingClientRect();

    dispatch('setOffsetTop', top + el.scrollTop);
    dispatch('setOffsetLeft', left + el.scrollLeft);
  };

  private handleDblClick = (ev: MouseEvent) => {
    if (!this.el) {
      return;
    }

    const { el } = this;
    const { dispatch, disabled, viewData } = this.props;
    const target = ev.target as HTMLElement;
    const address = getCellAddress(target);

    if (address) {
      const row = find((data) => data.rowKey === address.rowKey, viewData);
      const rowDisabled = row!.valueMap[address.columnName].disabled;
      if (!disabled && !rowDisabled) {
        dispatch('startEditing', address.rowKey, address.columnName);
      }
    }

    const { top, left } = el.getBoundingClientRect();

    dispatch('setOffsetTop', top + el.scrollTop);
    dispatch('setOffsetLeft', left + el.scrollLeft);
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
    const { gridId, width, autoWidth, scrollXHeight, showLeftSide } = this.props;
    const style = { width: autoWidth ? '100%' : width };
    const contentClassName = this.getContentClassName();
    const attrs: Attributes = { 'data-grid-id': gridId };

    return (
      <div
        {...attrs}
        style={style}
        class={cls('container', [showLeftSide, 'show-lside-area'])}
        onMouseDown={this.handleMouseDown}
        onDblClick={this.handleDblClick}
        ref={(el) => {
          this.el = el;
        }}
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

export const Container = connect<StoreProps, OwnProps>(
  ({ id, dimension, focus, columnCoords, data }) => ({
    gridId: id,
    width: dimension.width,
    autoWidth: dimension.autoWidth,
    editing: !!focus.editingAddress,
    scrollXHeight: dimension.scrollX ? dimension.scrollbarWidth : 0,
    fitToParentHeight: dimension.fitToParentHeight,
    summaryHeight: dimension.summaryHeight,
    summaryPosition: dimension.summaryPosition,
    showLeftSide: !!columnCoords.areaWidth.L,
    disabled: data.disabled,
    viewData: data.viewData
  })
)(ContainerComp);
