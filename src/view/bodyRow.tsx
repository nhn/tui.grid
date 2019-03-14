import { h, Component } from 'preact';
import { BodyCell } from './bodyCell';
import { Row } from '../store/types';

interface Props {
  row: Row,
  columnNames: string[]
}

export class BodyRow extends Component<Props> {
  render() {
    const { row, columnNames } = this.props;

    return (
      <tr style={{ height: '40px' }}>
        {columnNames.map(name =>
          <BodyCell value={row[name]} />
        )}
      </tr>
    )
  }
}