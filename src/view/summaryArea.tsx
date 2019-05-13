import { h, Component } from 'preact';
import { ColGroup } from './colGroup';
import { SummaryBodyRow } from './summaryBodyRow';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { ColumnInfo, Side } from '../store/types';
import { DispatchProps } from '../dispatch/create';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  showing: boolean;
  height: number;
  columns: ColumnInfo[];
  scrollLeft: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

class SummaryAreaComp extends Component<Props> {
  private el?: HTMLElement;

  public componentWillReceiveProps(nextProps: Props) {
    this.el!.scrollLeft = nextProps.scrollLeft;
  }

  /**
   * Event handler for 'scroll' event
   * @param {UIEvent} ev - scroll event
   * @private
   */
  private handleScroll = (ev: UIEvent) => {
    const { scrollLeft } = ev.srcElement as HTMLElement;
    const { dispatch, side } = this.props;
    if (side === 'R') {
      dispatch('setScrollLeft', scrollLeft);
    }
  };

  public render({ showing, height, columns, side }: Props) {
    const display = showing ? 'table' : 'none';
    const tableStyle = { display, height };

    return (
      <div
        class={cls('summary-area')}
        onScroll={this.handleScroll}
        ref={(el) => {
          this.el = el;
        }}
      >
        <table class={cls('table')} style={tableStyle}>
          <ColGroup side={side} />
          <SummaryBodyRow columns={columns} />
        </table>
      </div>
    );
  }
}
export const SummaryArea = connect<StoreProps, OwnProps>((store, { side }) => {
  const { column, dimension, viewport } = store;
  const { summaryHeight } = dimension;
  const { scrollLeft } = viewport;

  return {
    showing: !!summaryHeight,
    height: summaryHeight,
    columns: column.visibleColumnsBySide[side],
    scrollLeft
  };
})(SummaryAreaComp);
