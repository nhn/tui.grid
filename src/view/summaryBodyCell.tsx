import { h, Component } from 'preact';
import { cls, Attributes } from '../helper/dom';
import { shallowEqual } from '../helper/common';
import { calculate } from '../helper/summary';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { CellValue, SummaryColumnContent } from '../store/types';

interface OwnProps {
  columnName: string;
}

interface StoreProps {
  content: SummaryColumnContent;
  columnValues: CellValue[];
}

type Props = OwnProps & StoreProps & DispatchProps;

export class SummaryBodyCellComp extends Component<Props> {
  public shouldComponentUpdate(nextProps: Props) {
    if (shallowEqual(nextProps, this.props)) {
      return false;
    }
    return true;
  }

  private createSumaryMap = () => {
    const { content, columnValues } = this.props;
    const initSummaryMap = { sum: 0, min: 0, max: 0, avg: 0, cnt: 0 };
    const summaryMap = content && content.useAutoSummary ? calculate(columnValues) : initSummaryMap;

    return summaryMap;
  };

  private getTemplate = () => {
    const { content } = this.props;

    if (content === null) return '';

    const { template } = content;

    return typeof template === 'string' ? template : template!(this.createSumaryMap());
  };

  public render() {
    const { columnName } = this.props;
    const attrs: Attributes = {
      'data-column-name': columnName
    };
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

export const SummaryBodyCell = connect<StoreProps, OwnProps>(
  ({ data, summary }, { columnName }) => {
    const { rawData } = data;
    const {
      summaryCulumnContents: { [columnName]: content }
    } = summary;
    const columnValues = rawData.map((row) => row[columnName]);

    return { content, columnValues };
  }
)(SummaryBodyCellComp);
