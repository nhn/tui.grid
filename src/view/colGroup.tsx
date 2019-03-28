import { h, Component } from 'preact';
import { Side, Column, Store } from '../store/types';
import { connect } from './hoc';

interface OwnProps {
  side: Side
}

interface InjectedProps {
  columns: Column[]
}

type Props = OwnProps & InjectedProps;

export const ColGroup = connect(({ viewport }: Store, { side }: OwnProps) => ({
  columns: side === 'L' ? viewport.colsL : viewport.colsR
}))(
  class extends Component<Props> {
    render({ columns }: Props) {
      return (
        <colgroup>
          {columns.map(({ name, width }) =>
            <col data-column-name={name} style={{ width: `${100}px` }} />
          )}
        </colgroup>
      )
    }
  }
);