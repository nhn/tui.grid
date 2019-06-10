import { h, Component } from 'preact';
import { cls, dataAttr } from '../helper/dom';
import { shallowEqual } from '../helper/common';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { SummaryColumnContentMap, SummaryValue } from '../store/types';

interface OwnProps {
  columnName: string;
}

interface StoreProps {
  content: SummaryColumnContentMap | null;
  summaryValue: SummaryValue;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class SummaryBodyCellComp extends Component<Props> {
  public shouldComponentUpdate(nextProps: Props) {
    if (shallowEqual(nextProps, this.props)) {
      return false;
    }
    return true;
  }

  private getTemplate = () => {
    const { content, summaryValue } = this.props;

    if (!content) {
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
