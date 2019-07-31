import { Store, SummaryColumnContentMap } from '../store/types';
import {
  castToSummaryColumnContent,
  createSummaryValue,
  extractSummaryColumnContent
} from '../helper/summary';

export function setSummaryColumnContent(
  { summary, data }: Store,
  columnName: string,
  columnContent: string | SummaryColumnContentMap
) {
  const { rawData } = data;
  const columnValues = rawData.map(row => row[columnName]);
  const castedColumnContent = castToSummaryColumnContent(columnContent);
  const content = extractSummaryColumnContent(castedColumnContent, null);

  summary.summaryColumnContents[columnName] = content;
  summary.summaryValues[columnName] = createSummaryValue(content, columnValues);
}
