import { Component, h } from 'preact';
import { cls } from '../helper/dom';
import { BodyArea } from './bodyArea';
import { HeadArea } from './headArea';
import { connect } from '../view/hoc';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  width: number;
  marginLeft: number;
  cornerTopHeight: number;
  cornerBottomHeight: number;
  bodyHeight: number;
  scrollXHeight: number;
  frozenBorderWidth: number;
  cellBorderWidth: number;
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
    const { scrollXHeight, frozenBorderWidth, cellBorderWidth } = this.props;

    const style = {
      height: scrollXHeight,
      width: frozenBorderWidth,
      marginLeft: -(frozenBorderWidth + cellBorderWidth)
    };

    return <div class={cls('scrollbar-frozen-border')} style={style} />;
  }

  renderFrozenBorder() {
    const { frozenBorderWidth } = this.props;
    const style = {
      marginLeft: -frozenBorderWidth,
      width: frozenBorderWidth
    };

    return <div class={cls('frozen-border')} style={style} />;
  }

  render() {
    const style = {
      display: 'block',
      marginLeft: this.props.marginLeft,
      width: this.props.width
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
        {this.renderFrozenBorder()}
      </div>
    );
  }
}

export const RightSide = connect<StoreProps>(({ dimension, columnCoords }) => {
  const {
    scrollbarWidth,
    scrollX,
    scrollY,
    summaryHeight,
    headerHeight,
    cellBorderWidth,
    tableBorderWidth,
    bodyHeight,
    summaryPosition,
    frozenBorderWidth
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
  const width = columnCoords.areaWidth.R;
  const marginLeft = columnCoords.areaWidth.L + tableBorderWidth;

  return {
    width,
    marginLeft,
    cornerTopHeight,
    cornerBottomHeight,
    scrollXHeight,
    bodyHeight,
    cellBorderWidth,
    frozenBorderWidth
  };
})(RightSideComp);
