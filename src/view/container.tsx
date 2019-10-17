import { h, Component } from 'preact';
import { LeftSide } from './leftSide';
import { RightSide } from './rightSide';
import { StateLayer } from './stateLayer';
import { EditingLayer } from './editingLayer';
import { FilterLayer } from './filterLayer';
import { HeightResizeHandle } from './heightResizeHandle';
import { Clipboard } from './clipboard';
import { Pagination } from './pagination';
import { cls, getCellAddress, dataAttr, findParent } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';
import { SummaryPosition, ViewRow, EditingEvent, RenderState } from '../store/types';
import { EventBus, getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { isMobile } from '../helper/browser';
import { isNull } from '../helper/common';
import { keyNameMap } from '../helper/keyboard';
import { KeyNameMap } from '../types';

interface OwnProps {
  rootElement: HTMLElement;
}

interface StoreProps {
  gridId: number;
  width: number;
  autoWidth: boolean;
  editing: boolean;
  filtering: boolean;
  editingEvent: EditingEvent;
  scrollXHeight: number;
  fitToParentHeight: boolean;
  heightResizable: boolean;
  summaryHeight: number;
  summaryPosition: SummaryPosition;
  showLeftSide: boolean;
  disabled: boolean;
  viewData: ViewRow[];
  eventBus: EventBus;
  scrollX: boolean;
  scrollY: boolean;
  renderState: RenderState;
}

interface TouchEventInfo {
  start: boolean;
  move: boolean;
  eventInfo: {
    pageX: number;
    pageY: number;
    timestamp: number;
  };
}

type Props = OwnProps & StoreProps & DispatchProps;

const DOUBLE_TAP_DURATION = 200;
const TAP_THRESHOLD = 10;

export class ContainerComp extends Component<Props> {
  private el?: HTMLElement;

  private touchEvent: TouchEventInfo = {
    start: false,
    move: false,
    eventInfo: {
      pageX: -1,
      pageY: -1,
      timestamp: 0
    }
  };

  private handleTouchStart = () => {
    if (!this.el || !isMobile()) {
      return;
    }

    this.touchEvent.start = true;
  };

  private handleTouchMove = () => {
    if (!this.el || !isMobile() || !this.touchEvent.start) {
      return;
    }

    this.touchEvent.move = true;
  };

  private getCellRowKey = (elem: HTMLElement) => {
    const address = getCellAddress(elem);
    if (address) {
      return address.rowKey;
    }

    return null;
  };

  private handleTouchEnd = (event: TouchEvent) => {
    if (!this.el || !isMobile()) {
      return;
    }

    const { timeStamp } = event;
    const { pageX, pageY } = event.changedTouches[0];
    const { eventInfo, start, move } = this.touchEvent;

    if (start && !move) {
      const { pageX: prevPageX, pageY: prevPageY, timestamp: prevTimestamp } = eventInfo;

      if (timeStamp - prevTimestamp <= DOUBLE_TAP_DURATION) {
        if (
          Math.abs(prevPageX - pageX) <= TAP_THRESHOLD &&
          Math.abs(prevPageY - pageY) <= TAP_THRESHOLD
        ) {
          this.startEditing(event.target as HTMLElement);
        }
      } else {
        eventInfo.pageX = pageX;
        eventInfo.pageY = pageY;
        eventInfo.timestamp = timeStamp;
      }
    }

    this.touchEvent.start = false;
    this.touchEvent.move = false;
  };

  private handleMouseover = (event: MouseEvent) => {
    const { eventBus, dispatch, renderState } = this.props;
    const { hoveredRowKey } = renderState;
    const gridEvent = new GridEvent({ event });
    const rowKey = this.getCellRowKey(event.target as HTMLElement);

    if (!isNull(rowKey)) {
      dispatch('removeRowClassName', hoveredRowKey!, cls('row-hover'));

      if (hoveredRowKey !== rowKey) {
        dispatch('setHoveredRowKey', rowKey);
        dispatch('addRowClassName', rowKey, cls('row-hover'));
      }
    }

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
    const { eventBus, dispatch, renderState } = this.props;
    const { hoveredRowKey } = renderState;

    const gridEvent = new GridEvent({ event });

    if (!isNull(hoveredRowKey)) {
      dispatch('removeRowClassName', hoveredRowKey, cls('row-hover'));
      dispatch('setHoveredRowKey', null);
    }

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

    const { dispatch, editing, eventBus, filtering } = this.props;

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
      if (!editing && !filtering) {
        event.preventDefault();
      }

      const { top, left } = el.getBoundingClientRect();

      dispatch('setOffsetTop', top + el.scrollTop);
      dispatch('setOffsetLeft', left + el.scrollLeft);
    }
  };

  private handleDblClick = (event: MouseEvent) => {
    if (!this.el || isMobile()) {
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
    eventBus.trigger('dblclick', gridEvent);

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
  }

  public componentDidMount() {
    if (this.props.autoWidth) {
      window.addEventListener('resize', this.syncWithDOMWidth);
      // In Preact, the componentDidMount is called before the DOM elements are actually mounted.
      // https://github.com/preactjs/preact/issues/648
      // Use setTimeout to wait until the DOM element is actually mounted
      window.setTimeout(this.syncWithDOMWidth, 0);
    }

    document.addEventListener('mousedown', this.handleDocumentMouseDown);
    document.addEventListener('keydown', this.handleDocumentKeyDown);
  }

  private handleDocumentKeyDown = (ev: KeyboardEvent) => {
    const keyName = (keyNameMap as KeyNameMap)[ev.keyCode];
    if (keyName === 'esc') {
      this.props.dispatch('setActiveColumnAddress', null);
    }
  };

  private handleDocumentMouseDown = (ev: Event) => {
    const { dispatch, filtering } = this.props;
    if (filtering) {
      const target = ev.target as HTMLElement;
      if (!findParent(target, 'btn-filter') && !findParent(target, 'filter-container')) {
        dispatch('setActiveColumnAddress', null);
      }
    }
  };

  public componentWillUnmount() {
    if (this.props.autoWidth) {
      window.removeEventListener('resize', this.syncWithDOMWidth);
    }
  }

  private syncWithDOMWidth = () => {
    this.props.dispatch('refreshLayout', this.el!, this.props.rootElement.parentElement!);
  };

  public shouldComponentUpdate(nextProps: Props) {
    if (this.props.autoWidth && nextProps.autoWidth) {
      return false;
    }
    return true;
  }

  public render() {
    const {
      summaryHeight,
      summaryPosition,
      heightResizable,
      gridId,
      width,
      autoWidth,
      scrollXHeight,
      showLeftSide,
      scrollX,
      scrollY
    } = this.props;
    const style = { width: autoWidth ? '100%' : width };
    const attrs = { [dataAttr.GRID_ID]: gridId };

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
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
        ref={el => {
          this.el = el;
        }}
      >
        <div
          class={cls(
            'content-area',
            [!!summaryHeight, summaryPosition === 'top' ? 'has-summary-top' : 'has-summary-bottom'],
            [!scrollX, 'no-scroll-x'],
            [!scrollY, 'no-scroll-y']
          )}
        >
          <LeftSide />
          <RightSide />
          <div class={cls('border-line', 'border-line-top')} />
          <div class={cls('border-line', 'border-line-left')} />
          <div class={cls('border-line', 'border-line-right')} />
          <div class={cls('border-line', 'border-line-bottom')} style={{ bottom: scrollXHeight }} />
        </div>
        {heightResizable && <HeightResizeHandle />}
        <StateLayer />
        <EditingLayer />
        <Clipboard />
        <Pagination />
        <FilterLayer />
      </div>
    );
  }
}

export const Container = connect<StoreProps, OwnProps>(
  ({ id, dimension, focus, columnCoords, data, filterLayerState, renderState }) => ({
    gridId: id,
    width: dimension.width,
    autoWidth: dimension.autoWidth,
    editing: !!focus.editingAddress,
    filtering: !!filterLayerState.activeColumnAddress,
    scrollXHeight: dimension.scrollX ? dimension.scrollbarWidth : 0,
    fitToParentHeight: dimension.fitToParentHeight,
    summaryHeight: dimension.summaryHeight,
    summaryPosition: dimension.summaryPosition,
    heightResizable: dimension.heightResizable,
    showLeftSide: !!columnCoords.areaWidth.L,
    disabled: data.disabled,
    editingEvent: focus.editingEvent,
    viewData: data.viewData,
    eventBus: getEventBus(id),
    scrollX: dimension.scrollX,
    scrollY: dimension.scrollY,
    renderState
  })
)(ContainerComp);
