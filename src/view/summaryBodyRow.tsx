import { h, Component } from 'preact';
import { SummaryBodyCell } from './summaryBodyCell';
import { shallowEqual } from '../helper/common';
import { ColumnInfo } from '../store/types';

interface OwnProps {
  columns: ColumnInfo[];
}

type Props = OwnProps;

export class SummaryBodyRow extends Component<Props> {
  public shouldComponentUpdate(nextProps: Props) {
    if (shallowEqual(nextProps, this.props)) {
      return false;
    }

    return true;
  }

  public render({ columns }: Props) {
    const columnNames = columns.map(({ name }) => name);

    return (
      <tbody>
        <tr>
          {columnNames.map(name => (
            <SummaryBodyCell key={name} columnName={name} />
          ))}
        </tr>
      </tbody>
    );
  }
}
