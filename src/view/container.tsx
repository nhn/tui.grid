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
import { SummaryPosition, ViewRow, EditingEvent, RowKey } from '../store/types';
import { EventBus, getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';

interface OwnProps {
  rootElement: HTMLElement;
}

interface StoreProps {
  gridId: number;
  width: number;
  autoWidth: boolean;
  editing: boolean;
  editingEvent: EditingEvent;
  scrollXHeight: number;
  fitToParentHeight: boolean;
  summaryHeight: number;
  summaryPosition: SummaryPosition;
  showLeftSide: boolean;
  disabled: boolean;
  viewData: ViewRow[];
  eventBus: EventBus;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class ContainerComp extends Component<Props> {
  private el?: HTMLElement;

  private handleMouseover = (event: MouseEvent) => {
    const { eventBus } = this.props;
    const gridEvent = new GridEvent({ event });

    /**
     * Occurs when a mouse pointer is moved onto the Grid.
     * The properties of the event object include the native MouseEvent object.
     * @event Grid#mouseover
     * @property {Event} nativeEvent - Event object
     * @property {string} targetType - Type of event target
     * @property {number} rowKey - rowKey of the target cell
     * @property {string} columnName - columnName of the target cell
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('mouseover', gridEvent);
  };

  private handleClick = (event: MouseEvent) => {
    const { eventBus, editingEvent } = this.props;
    const gridEvent = new GridEvent({ event });

    /**
     * Occurs when a mouse button is clicked on the Grid.
     * The properties of the event object include the native event object.
     * @event Grid#click
     * @property {Event} nativeEvent - Event object
     * @property {string} targetType - Type of event target
     * @property {number} rowKey - rowKey of the target cell
     * @property {string} columnName - columnName of the target cell
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('click', gridEvent);

    if (!gridEvent.isStopped() && editingEvent === 'click') {
      this.startEditing(event.target as HTMLElement);
    }
  };

  private handleMouseout = (event: MouseEvent) => {
    const { eventBus } = this.props;
    const gridEvent = new GridEvent({ event });

    /**
     * Occurs when a mouse pointer is moved off from the Grid.
     * The event object has all properties copied from the native MouseEvent.
     * @event Grid#mouseout
     * @property {Event} nativeEvent - Event object
     * @property {string} targetType - Type of event target
     * @property {number | string} rowKey - rowKey of the target cell
     * @property {string} columnName - columnName of the target cell
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('mouseout', gridEvent);
  };

  private handleMouseDown = (event: MouseEvent) => {
    if (!this.el) {
      return;
    }

    const { dispatch, editing, eventBus } = this.props;
    const { el } = this;
    const gridEvent = new GridEvent({ event });

    /**
     * Occurs when a mouse button is downed on the Grid.
     * The event object has all properties copied from the native MouseEvent.
     * @event Grid#mousedown
     * @property {Event} nativeEvent - Event object
     * @property {string} targetType - Type of event target
     * @property {number | string} rowKey - rowKey of the target cell
     * @property {string} columnName - columnName of the target cell
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('mousedown', gridEvent);

    if (!gridEvent.isStopped()) {
      dispatch('setNavigating', true);
      if (!editing) {
        event.preventDefault();
      }

      const { top, left } = el.getBoundingClientRect();

      dispatch('setOffsetTop', top + el.scrollTop);
      dispatch('setOffsetLeft', left + el.scrollLeft);
    }
  };

  private handleDblClick = (event: MouseEvent) => {
    if (!this.el) {
      return;
    }

    const { eventBus, editingEvent } = this.props;
    const gridEvent = new GridEvent({ event });

    /**
     * Occurs when a mouse button is double clicked on the Grid.
     * The properties of the event object include the native event object.
     * @event Grid#dblclick
     * @property {Event} nativeEvent - Event object
     * @property {string} targetType - Type of event target
     * @property {number} rowKey - rowKey of the target cell
     * @property {string} columnName - columnName of the target cell
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('dblClick', gridEvent);

    if (!gridEvent.isStopped() && editingEvent === 'dblclick') {
      this.startEditing(event.target as HTMLElement);
    }
  };

  private startEditing(eventTarget: HTMLElement) {
    const { dispatch } = this.props;
    const address = getCellAddress(eventTarget);

    if (address) {
      const { rowKey, columnName } = address;
      dispatch('startEditing', rowKey, columnName);
    }

    const el = this.el!;
    const { top, left } = el.getBoundingClientRect();

    dispatch('setOffsetTop', top + el.scrollTop);
    dispatch('setOffsetLeft', left + el.scrollLeft);
  }

  public componentDidMount() {
    if (this.props.autoWidth) {
      window.addEventListener('resize', this.syncWithDOMWidth);
      // In Preact, the componentDidMount is called before the DOM elements are actually mounted.
      // https://github.com/preactjs/preact/issues/648
      // Use requestAnimationFrame to wait until the DOM element is actually mounted
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
        onClick={this.handleClick}
        onMouseOut={this.handleMouseout}
        onMouseOver={this.handleMouseover}
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
    editingEvent: focus.editingEvent,
    viewData: data.viewData,
    eventBus: getEventBus(id)
  })
)(ContainerComp);
