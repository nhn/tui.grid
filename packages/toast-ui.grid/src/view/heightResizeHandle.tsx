import { h, Component } from 'preact';
import { connect } from './hoc';
import { cls, setCursorStyle } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  bodyHeight: number;
}

type Props = StoreProps & DispatchProps;

class HeightResizeHandleComp extends Component<Props> {
  private dragStartY = -1;

  private dragStartBodyHeight = -1;

  private handleMouseDown = (ev: MouseEvent) => {
    this.dragStartY = ev.pageY;
    this.dragStartBodyHeight = this.props.bodyHeight;

    setCursorStyle('row-resize');
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.clearDocumentEvents);
    document.addEventListener('selectstart', this.handleSelectStart);
  };

  private handleSelectStart = (ev: Event) => {
    ev.preventDefault();
  };

  private handleMouseMove = (ev: MouseEvent) => {
    const distance = ev.pageY - this.dragStartY;

    this.props.dispatch('setBodyHeight', this.dragStartBodyHeight + distance);
  };

  private clearDocumentEvents = () => {
    setCursorStyle('');
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.clearDocumentEvents);
    document.removeEventListener('selectstart', this.handleSelectStart);
  };

  public render() {
    return (
      <div class={cls('height-resize-handle')} onMouseDown={this.handleMouseDown}>
        <button type="button">
          <span />
        </button>
      </div>
    );
  }
}

export const HeightResizeHandle = connect(({ dimension }) => ({
  bodyHeight: dimension.bodyHeight,
}))(HeightResizeHandleComp);
