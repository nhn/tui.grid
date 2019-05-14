import { h, Component } from 'preact';
import { BodyRows } from './bodyRows';
import { ColGroup } from './colGroup';
import { Side, ColumnInfo, DragData } from '../store/types';
import { cls } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { connect } from './hoc';
import { FocusLayer } from './focusLayer';
import { SelectionLayer } from './selectionLayer';

// Minimum distance (pixel) to detect if user wants to drag when moving mouse with button pressed.
const MIN_DISATNCE_FOR_DRAG = 10;

interface OwnProps {
  side: Side;
}

interface StoreProps {
  columns: ColumnInfo[];
  bodyHeight: number;
  totalRowHeight: number;
  scrollTop: number;
  scrollLeft: number;
  offsetY: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

// only updates when these props are changed
// for preventing unnecessary rendering when scroll changes
const PROPS_FOR_UPDATE: (keyof StoreProps)[] = [
  'columns',
  'bodyHeight',
  'totalRowHeight',
  'offsetY'
];

class BodyAreaComp extends Component<Props> {
  private el?: HTMLElement;

  private dragStartData = {
    pageX: -1,
    pageY: -1
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
    const { pageX, pageY } = ev;
    const { scrollTop, scrollLeft } = el;
    const { side, dispatch } = this.props;
    const { top, left } = el.getBoundingClientRect();

    dispatch('mouseDownBody', { top, left, scrollTop, scrollLeft, side }, ev);

    this.dragStartData = { pageX, pageY };
    document.body.style.cursor = 'default';
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.clearDocumentEvents);
    document.addEventListener('selectstart', this.handleSelectStart);
  };

  private moveEnoughToTriggerDragEvent = (start: DragData, current: DragData) => {
    const dx = Math.abs(start.pageX - current.pageX);
    const dy = Math.abs(start.pageY - current.pageY);
    const distance = Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));

    return distance >= MIN_DISATNCE_FOR_DRAG;
  };

  private handleSelectStart = (ev: Event) => {
    ev.preventDefault();
  };

  private handleMouseMove = (ev: MouseEvent) => {
    if (!this.el) {
      return;
    }

    const { pageX, pageY } = ev;

    if (this.moveEnoughToTriggerDragEvent(this.dragStartData, { pageX, pageY })) {
      this.props.dispatch('dragMoveBody', ev);
    }
  };

  private clearDocumentEvents = () => {
    this.dragStartData = { pageX: -1, pageY: -1 };
    this.props.dispatch('dragEndBody');

    document.body.style.cursor = '';
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.clearDocumentEvents);
    document.removeEventListener('selectstart', this.handleSelectStart);
  };

  public shouldComponentUpdate(nextProps: Props) {
    const currProps = this.props;

    return PROPS_FOR_UPDATE.some((propName) => nextProps[propName] !== currProps[propName]);
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.el!.scrollTop = nextProps.scrollTop;
    this.el!.scrollLeft = nextProps.scrollLeft;
  }

  public render({ side, bodyHeight, totalRowHeight, offsetY }: Props) {
    const areaStyle = { overflow: 'scroll', height: bodyHeight };
    const tableStyle = { overflow: 'visible', top: offsetY };
    const containerStyle = { height: totalRowHeight };

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
          <div class={cls('table-container')} style={tableStyle}>
            <table class={cls('table')}>
              <ColGroup side={side} />
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
  const { column, dimension, viewport } = store;
  const { bodyHeight, totalRowHeight } = dimension;
  const { offsetY, scrollTop, scrollLeft } = viewport;

  return {
    columns: column.visibleColumnsBySide[side],
    bodyHeight,
    totalRowHeight,
    scrollTop,
    offsetY,
    scrollLeft: side === 'L' ? 0 : scrollLeft
  };
})(BodyAreaComp);
