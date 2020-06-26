import { h, Component } from 'preact';
import { Side } from '@t/store/focus';
import { ColumnInfo } from '@t/store/column';
import { ColGroup } from './colGroup';
import { SummaryBodyRow } from './summaryBodyRow';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  height: number;
  columns: ColumnInfo[];
  scrollLeft: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

class SummaryAreaComp extends Component<Props> {
  private el?: HTMLElement;

  public componentWillReceiveProps(nextProps: Props) {
    if (this.el) {
      this.el!.scrollLeft = nextProps.scrollLeft;
    }
  }

  private handleScroll = (ev: UIEvent) => {
    const { scrollLeft } = ev.target as HTMLElement;
    const { dispatch, side } = this.props;
    if (side === 'R') {
      dispatch('setScrollLeft', scrollLeft);
    }
  };

  public render({ height, columns, side }: Props) {
    const tableStyle = { height };

    return (
      height > 0 && (
        <div
          class={cls('summary-area')}
          onScroll={this.handleScroll}
          ref={(el) => {
            this.el = el;
          }}
        >
          <table class={cls('table')} style={tableStyle}>
            <ColGroup side={side} useViewport={false} />
            <SummaryBodyRow columns={columns} />
          </table>
        </div>
      )
    );
  }
}
export const SummaryArea = connect<StoreProps, OwnProps>((store, { side }) => {
  const { column, dimension, viewport } = store;
  const { summaryHeight } = dimension;
  const { scrollLeft } = viewport;

  return {
    height: summaryHeight,
    columns: column.visibleColumnsBySideWithRowHeader[side],
    scrollLeft,
  };
})(SummaryAreaComp);
