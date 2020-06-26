import { Component, h } from 'preact';
import { SummaryPosition } from '@t/store/summary';
import { cls } from '../helper/dom';
import { BodyArea } from './bodyArea';
import { HeaderArea } from './headerArea';
import { SummaryArea } from './summaryArea';
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
  scrollX: boolean;
  scrollY: boolean;
  summaryPosition: SummaryPosition;
}

class RightSideComp extends Component<StoreProps & DispatchProps> {
  private renderScrollbarYInnerBorder() {
    const { cornerTopHeight, bodyHeight, scrollXHeight } = this.props;
    const style = {
      top: cornerTopHeight,
      height: bodyHeight - scrollXHeight,
    };

    return <div class={cls('scrollbar-y-inner-border')} style={style} />;
  }

  private renderScrollbarRightTop() {
    const style = { height: this.props.cornerTopHeight };

    return <div class={cls('scrollbar-right-top')} style={style} />;
  }

  private renderScrollbarYOuterBorder() {
    return <div class={cls('scrollbar-y-outer-border')} />;
  }

  private renderScrollbarRightBottom() {
    const style = { height: this.props.cornerBottomHeight };

    return <div class={cls('scrollbar-right-bottom')} style={style} />;
  }

  private renderScrollbarFrozenBorder() {
    const { scrollXHeight, frozenBorderWidth, cellBorderWidth } = this.props;

    const style = {
      height: scrollXHeight,
      width: frozenBorderWidth,
      marginLeft: frozenBorderWidth ? -(frozenBorderWidth + cellBorderWidth) : 0,
    };

    return <div class={cls('scrollbar-frozen-border')} style={style} />;
  }

  private renderFrozenBorder() {
    const { frozenBorderWidth } = this.props;
    const style = {
      marginLeft: -frozenBorderWidth,
      width: frozenBorderWidth,
    };

    return <div class={cls('frozen-border')} style={style} />;
  }

  public render() {
    const { marginLeft, width, summaryPosition, scrollY, scrollX, frozenBorderWidth } = this.props;
    const style = {
      display: 'block',
      marginLeft,
      width,
    };

    return (
      <div class={cls('rside-area')} style={style}>
        <HeaderArea side="R" />
        {summaryPosition === 'top' && <SummaryArea side="R" />}
        <BodyArea side="R" />
        {summaryPosition === 'bottom' && <SummaryArea side="R" />}
        {scrollY && this.renderScrollbarYInnerBorder()}
        {scrollY && this.renderScrollbarYOuterBorder()}
        {scrollY && this.renderScrollbarRightTop()}
        {scrollX && this.renderScrollbarFrozenBorder()}
        {(scrollX || scrollY) && this.renderScrollbarRightBottom()}
        {!!frozenBorderWidth && this.renderFrozenBorder()}
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
    frozenBorderWidth,
  } = dimension;

  let cornerTopHeight = headerHeight;
  let cornerBottomHeight = scrollX ? scrollbarWidth : 0;

  if (scrollY && summaryHeight) {
    if (summaryPosition === 'top') {
      cornerTopHeight += summaryHeight + tableBorderWidth;
    } else {
      cornerBottomHeight += summaryHeight;
    }
  }

  const scrollXHeight = scrollX ? scrollbarWidth : 0;
  let width = columnCoords.areaWidth.R;
  let marginLeft = columnCoords.areaWidth.L + frozenBorderWidth;

  if (marginLeft && !frozenBorderWidth) {
    marginLeft -= cellBorderWidth;
    width += cellBorderWidth;
  }

  return {
    width,
    marginLeft,
    cornerTopHeight,
    cornerBottomHeight,
    scrollXHeight,
    bodyHeight,
    cellBorderWidth,
    frozenBorderWidth,
    summaryPosition,
    scrollX,
    scrollY,
  };
})(RightSideComp);
