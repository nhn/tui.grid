import { Store, SummaryColumnContentMap } from '../store/types';
import { castToSummaryColumnContent, extractSummaryColumnContent } from '../store/summary';

export function setSummaryColumnContent(
  { summary }: Store,
  columnName: string,
  columnContent: string | SummaryColumnContentMap
) {
  const castedColumnContent = castToSummaryColumnContent(columnContent);
  summary.summaryCulumnContents[columnName] = extractSummaryColumnContent(
    castedColumnContent,
    null
  );
}
