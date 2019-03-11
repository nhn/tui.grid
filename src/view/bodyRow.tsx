import { h, Component } from 'preact';
import { BodyCell } from './bodyCell';

export class BodyRow extends Component {
  render() {
    return (
      <tr>
        <BodyCell />
        <BodyCell />
        <BodyCell />
        <BodyCell />
        <BodyCell />
      </tr>
    )
  }
}