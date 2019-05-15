import { h, Component } from 'preact';
import { cls, hideElement, showElement } from '../helper/dom';
import { connect } from './hoc';
import { Range, Side, SelectionRange } from '../store/types';
import { DispatchProps } from '../dispatch/create';

type ColumnWidths = { [key in Side]: number[] };

interface StoreProps {
  range: SelectionRange | null;
  rowOffsets: number[];
  rowHeights: number[];
  columnWidths: ColumnWidths;
  cellBorderWidth: number;
  visibleFrozenCount: number;
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SelectionLayerComp extends Component<Props> {
  private el?: HTMLElement;

  private getOwnSideColumnRange(columnRange: Range, side: Side, visibleFrozenCount: number) {
    let ownColumnRange: Range | null = null;

    if (side === 'L') {
      if (columnRange[0] < visibleFrozenCount) {
        ownColumnRange = [columnRange[0], Math.min(columnRange[1], visibleFrozenCount)];
      }
    } else if (columnRange[1] >= visibleFrozenCount) {
      ownColumnRange = [
        Math.max(columnRange[0], visibleFrozenCount) - visibleFrozenCount,
        columnRange[1] - visibleFrozenCount
      ];
    }

    return ownColumnRange;
  }

  private getVerticalStyles(rowRange: Range, rowOffsets: number[], rowHeights: number[]) {
    const top = rowOffsets[rowRange[0]];
    const bottom = rowOffsets[rowRange[1]] + rowHeights[rowRange[1]];

    return { top, height: bottom - top };
  }

  private getHorizontalStyles(
    columnRange: Range | null,
    columnWidths: ColumnWidths,
    side: Side,
    cellBorderWidth: number
  ) {
    let left = 0;
    let width = 0;
    if (!columnRange) {
      return { left, width };
    }

    const widths = columnWidths[side];
    const [startIndex] = columnRange;
    let [, endIndex] = columnRange;
    let i = 0;

    endIndex = Math.min(endIndex, widths.length - 1);

    for (; i <= endIndex; i += 1) {
      if (i < startIndex) {
        left += widths[i] + cellBorderWidth;
      } else {
        width += widths[i] + cellBorderWidth;
      }
    }
    width -= cellBorderWidth; // subtract last border width

    return { left, width };
  }

  public render() {
    let styles;
    const {
      range,
      side,
      columnWidths,
      rowOffsets,
      rowHeights,
      cellBorderWidth,
      visibleFrozenCount
    } = this.props;

    if (range) {
      const ownColumnRange = this.getOwnSideColumnRange(range.column, side, visibleFrozenCount);
      styles = Object.assign(
        {},
        this.getVerticalStyles(range.row, rowOffsets, rowHeights),
        this.getHorizontalStyles(ownColumnRange, columnWidths, side, cellBorderWidth)
      );
      showElement(this.el!);
    } else if (this.el && !range) {
      hideElement(this.el);
    }

    return (
      <div
        ref={(el) => {
          this.el = el;
        }}
        class={cls('layer-selection')}
        style={styles}
      />
    );
  }
}

export const SelectionLayer = connect<StoreProps, OwnProps>(
  ({ selection, columnCoords, rowCoords, dimension, column }) => {
    const { visibleFrozenCount } = column;
    const { cellBorderWidth } = dimension;
    const { range } = selection;
    const { widths: columnWidths } = columnCoords;
    const { offsets: rowOffsets, heights: rowHeights } = rowCoords;

    return {
      range,
      rowOffsets,
      rowHeights,
      cellBorderWidth,
      visibleFrozenCount,
      columnWidths
    };
  }
)(SelectionLayerComp);
