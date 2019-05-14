import { Store, SummaryColumnContentMap } from '../store/types';
import {
  castToSummaryColumnContent,
  createSummaryValue,
  extractSummaryColumnContent
} from '../store/summary';

export function setSummaryColumnContent(
  { summary, data }: Store,
  columnName: string,
  columnContent: string | SummaryColumnContentMap
) {
  const { rawData } = data;
  const columnValues = rawData.map((row) => row[columnName]);
  const castedColumnContent = castToSummaryColumnContent(columnContent);
  const content = extractSummaryColumnContent(castedColumnContent, null);

  summary.summaryColumnContents[columnName] = content;
  summary.summaryValues[columnName] = createSummaryValue(content, columnValues);
}

export function getSummaryValues({ summary }: Store, columnName: string) {
  const content = summary.summaryColumnContents[columnName];
  if (content && content.useAutoSummary) {
    return summary.summaryValues[columnName];
  }
  return null;
}
