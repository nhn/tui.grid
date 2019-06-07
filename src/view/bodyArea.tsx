import { h, Component } from 'preact';
import { BodyRows } from './bodyRows';
import { ColGroup } from './colGroup';
import { Side, DragData, DragStartData } from '../store/types';
import { cls, setCursorStyle } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';
import { FocusLayer } from './focusLayer';
import { SelectionLayer } from './selectionLayer';
import { some } from '../helper/common';

// Minimum distance (pixel) to detect if user wants to drag when moving mouse with button pressed.
export const MIN_DISTANCE_FOR_DRAG = 10;

interface OwnProps {
  side: Side;
}

interface StoreProps {
  bodyHeight: number;
  totalRowHeight: number;
  totalColumnWidth: number;
  scrollTop: number;
  scrollLeft: number;
  scrollXHeight: number;
  offsetTop: number;
  offsetLeft: number;
  dummyRowCount: number;
  scrollX: boolean;
  scrollY: boolean;
}

type Props = OwnProps & StoreProps & DispatchProps;

// only updates when these props are changed
// for preventing unnecessary rendering when scroll changes
const PROPS_FOR_UPDATE: (keyof StoreProps)[] = [
  'bodyHeight',
  'totalRowHeight',
  'offsetLeft',
  'offsetTop'
];

class BodyAreaComp extends Component<Props> {
  private el?: HTMLElement;

  private dragStartData: DragStartData = {
    pageX: null,
    pageY: null
  };

  private handleScroll = (ev: UIEvent) => {
    const { scrollLeft, scrollTop } = ev.srcElement as HTMLElement;
    const { dispatch } = this.props;

    if (this.props.side === 'R') {
      dispatch('setScrollLeft', scrollLeft);
    }
    dispatch('setScrollTop', scrollTop);
  };

  private handleMouseDown = (ev: MouseEvent) => {
    if (!this.el) {
      return;
    }

    const { el } = this;
    const { shiftKey } = ev;
    const pageX = ev.pageX - window.pageXOffset;
    const pageY = ev.pageY - window.pageYOffset;
    const { scrollTop, scrollLeft } = el;
    const { side, dispatch } = this.props;
    const { top, left } = el.getBoundingClientRect();

    dispatch(
      'mouseDownBody',
      { top, left, scrollTop, scrollLeft, side },
      { pageX, pageY, shiftKey }
    );

    this.dragStartData = { pageX, pageY };
    setCursorStyle('default');
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.clearDocumentEvents);
    document.addEventListener('selectstart', this.handleSelectStart);
  };

  private moveEnoughToTriggerDragEvent = (current: DragData) => {
    const dx = Math.abs(this.dragStartData.pageX! - current.pageX!);
    const dy = Math.abs(this.dragStartData.pageY! - current.pageY!);
    const distance = Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));

    return distance >= MIN_DISTANCE_FOR_DRAG;
  };

  private handleSelectStart = (ev: Event) => {
    ev.preventDefault();
  };

  private handleMouseMove = (ev: MouseEvent) => {
    const pageX = ev.pageX - window.pageXOffset;
    const pageY = ev.pageY - window.pageYOffset;

    if (this.moveEnoughToTriggerDragEvent({ pageX, pageY })) {
      const dragData: DragData = { pageX, pageY };
      this.props.dispatch('dragMoveBody', this.dragStartData as DragData, dragData);
    }
  };

  private clearDocumentEvents = () => {
    this.dragStartData = { pageX: null, pageY: null };
    this.props.dispatch('dragEnd');

    setCursorStyle('');
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.clearDocumentEvents);
    document.removeEventListener('selectstart', this.handleSelectStart);
  };

  public shouldComponentUpdate(nextProps: Props) {
    const currProps = this.props;

    return some((propName) => nextProps[propName] !== currProps[propName], PROPS_FOR_UPDATE);
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.el!.scrollTop = nextProps.scrollTop;
    this.el!.scrollLeft = nextProps.scrollLeft;
  }

  public render({
    side,
    bodyHeight,
    totalRowHeight,
    totalColumnWidth,
    scrollXHeight,
    offsetTop,
    offsetLeft,
    dummyRowCount,
    scrollX,
    scrollY
  }: Props) {
    const overflowX = scrollX ? 'scroll' : 'hidden';
    const overflowY = scrollY ? 'scroll' : 'hidden';
    const areaStyle = { overflowX, overflowY, height: bodyHeight };
    const tableContainerStyle = {
      top: offsetTop,
      left: offsetLeft,
      height: dummyRowCount ? bodyHeight - scrollXHeight : '',
      overflow: dummyRowCount ? 'hidden' : 'visible'
    };
    const containerStyle = {
      width: totalColumnWidth,
      height: totalRowHeight
    };

    return (
      <div
        class={cls('body-area')}
        style={areaStyle}
        onScroll={this.handleScroll}
        onMouseDown={this.handleMouseDown}
        ref={(el) => {
          this.el = el;
        }}
      >
        <div class={cls('body-container')} style={containerStyle}>
          <div class={cls('table-container')} style={tableContainerStyle}>
            <table class={cls('table')}>
              <ColGroup side={side} useViewport={true} />
              <BodyRows side={side} />
            </table>
          </div>
          <div class={cls('layer-selection')} style="display: none;" />
          <FocusLayer side={side} />
          <SelectionLayer side={side} />
        </div>
      </div>
    );
  }
}

export const BodyArea = connect<StoreProps, OwnProps>((store, { side }) => {
  const { columnCoords, rowCoords, dimension, viewport } = store;
  const { totalRowHeight } = rowCoords;
  const { totalColumnWidth } = columnCoords;
  const { bodyHeight, scrollXHeight, scrollX, scrollY } = dimension;
  const { offsetLeft, offsetTop, scrollTop, scrollLeft, dummyRowCount } = viewport;

  return {
    bodyHeight,
    totalRowHeight,
    offsetTop,
    scrollTop,
    totalColumnWidth: totalColumnWidth[side],
    offsetLeft: side === 'L' ? 0 : offsetLeft,
    scrollLeft: side === 'L' ? 0 : scrollLeft,
    scrollXHeight,
    dummyRowCount,
    scrollX,
    scrollY
  };
})(BodyAreaComp);
