import { Component, h } from 'preact';
import { cls } from '../helper/common';
import { BodyArea } from './bodyArea';
import { HeadArea } from './headArea';
import { connect } from '../view/hoc';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  width: number;
  cornerTopHeight: number;
  cornerBottomHeight: number;
  bodyHeight: number;
  scrollXHeight: number;
}

class RightSideComp extends Component<StoreProps & DispatchProps> {
  renderScrollbarYInnerBorder() {
    const { cornerTopHeight, bodyHeight, scrollXHeight } = this.props;
    const style = {
      top: cornerTopHeight,
      height: bodyHeight - scrollXHeight
    };
    return <div class={cls('scrollbar-y-inner-border')} style={style} />;
  }

  renderScrollbarRightTop() {
    const style = { height: this.props.cornerTopHeight };
    return <div class={cls('scrollbar-right-top')} style={style} />;
  }

  renderScrollbarYOuterBorder() {
    return <div class={cls('scrollbar-y-outer-border')} />;
  }

  renderScrollbarRightBottom() {
    const style = { height: this.props.cornerBottomHeight };
    return <div class={cls('scrollbar-right-bottom')} style={style} />;
  }

  renderScrollbarFrozenBorder() {
    return <div class={cls('scrollbar-frozen-border')} />;
  }

  render() {
    const style = {
      display: 'block',
      width: `${this.props.width}px`
    };

    return (
      <div class={cls('rside-area')} style={style}>
        <HeadArea side="R" />
        <BodyArea side="R" />
        {this.renderScrollbarYInnerBorder()}
        {this.renderScrollbarYOuterBorder()}
        {this.renderScrollbarRightTop()}
        {this.renderScrollbarRightBottom()}
        {this.renderScrollbarFrozenBorder()}
      </div>
    );
  }
}

export const RightSide = connect<StoreProps, {}, DispatchProps>(({ dimension }) => {
  const {
    width,
    scrollbarWidth,
    scrollX,
    scrollY,
    summaryHeight,
    headerHeight,
    cellBorderWidth,
    tableBorderWidth,
    bodyHeight,
    summaryPosition
  } = dimension;

  let cornerTopHeight = headerHeight;
  let cornerBottomHeight = scrollX ? scrollbarWidth : 0;

  if (scrollY && summaryHeight) {
    if (summaryPosition === 'top') {
      cornerTopHeight += summaryHeight - tableBorderWidth;
    } else {
      cornerBottomHeight += summaryHeight;
    }
  }

  const scrollXHeight = scrollX ? scrollbarWidth : 0;

  return { width, cornerTopHeight, cornerBottomHeight, scrollXHeight, bodyHeight };
})(RightSideComp);
