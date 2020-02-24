import { h, Component } from 'preact';
import { SummaryColumnContentMap, SummaryValueMap } from '@t/store/summary';
import { cls, dataAttr } from '../helper/dom';
import { shallowEqual } from '../helper/common';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { isRowHeader } from '../helper/column';

interface OwnProps {
  columnName: string;
}

interface StoreProps {
  content: SummaryColumnContentMap | null;
  summaryValue: SummaryValueMap;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class SummaryBodyCellComp extends Component<Props> {
  public shouldComponentUpdate(nextProps: Props) {
    return !shallowEqual(nextProps, this.props);
  }

  private getTemplate = () => {
    const { content, summaryValue, columnName } = this.props;

    if (!content || isRowHeader(columnName)) {
      return '';
    }

    const { template } = content;

    return typeof template === 'string' ? template : template!(summaryValue);
  };

  public render() {
    const { columnName } = this.props;
    const attrs = { [dataAttr.COLUMN_NAME]: columnName };
    const template = this.getTemplate();

    return (
      <td
        class={cls('cell', 'cell-summary')}
        dangerouslySetInnerHTML={{ __html: template }}
        {...attrs}
      />
    );
  }
}

export const SummaryBodyCell = connect<StoreProps, OwnProps>(({ summary }, { columnName }) => {
  const { summaryColumnContents, summaryValues } = summary;
  const content = summaryColumnContents[columnName];
  const summaryValue = summaryValues[columnName];

  return { content, summaryValue };
})(SummaryBodyCellComp);
