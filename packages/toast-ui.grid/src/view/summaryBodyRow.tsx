import { h, Component } from 'preact';
import { ColumnInfo } from '@t/store/column';
import { SummaryBodyCell } from './summaryBodyCell';
import { shallowEqual } from '../helper/common';

interface OwnProps {
  columns: ColumnInfo[];
}

type Props = OwnProps;

export class SummaryBodyRow extends Component<Props> {
  public shouldComponentUpdate(nextProps: Props) {
    return !shallowEqual(nextProps, this.props);
  }

  public render({ columns }: Props) {
    const columnNames = columns.map(({ name }) => name);

    return (
      <tbody>
        <tr>
          {columnNames.map((name) => (
            <SummaryBodyCell key={name} columnName={name} />
          ))}
        </tr>
      </tbody>
    );
  }
}
