import { h, Component } from 'preact';
import { connect } from './hoc';
import { cls } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  bodyHeight: number;
}

type Props = StoreProps & DispatchProps;

class HeightResizeHandleComp extends Component<Props> {
  dragStartY = -1;
  dragStartBodyHeight = -1;

  handleMouseDown = (ev: MouseEvent) => {
    this.dragStartY = ev.pageY;
    this.dragStartBodyHeight = this.props.bodyHeight;

    document.body.style.cursor = 'row-resize';
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.clearDocumentEvents);
    document.addEventListener('selectstart', this.handleSelectStart);
  };

  handleSelectStart = (ev: Event) => {
    ev.preventDefault();
  };

  handleMouseMove = (ev: MouseEvent) => {
    const distance = ev.pageY - this.dragStartY;

    this.props.dispatch('setBodyHeight', this.dragStartBodyHeight + distance);
  };

  clearDocumentEvents = () => {
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.clearDocumentEvents);
    document.removeEventListener('selectstart', this.handleSelectStart);
  };

  render() {
    return (
      <div class={cls('height-resize-handle')} onMouseDown={this.handleMouseDown}>
        <button>
          <span />
        </button>
      </div>
    );
  }
}

export const HeightResizeHandle = connect(({ dimension }) => ({
  bodyHeight: dimension.bodyHeight
}))(HeightResizeHandleComp);
