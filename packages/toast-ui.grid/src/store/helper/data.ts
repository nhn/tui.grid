import { Row, CellValue, ListItem } from '@t/store/data';
import { ColumnInfo, Column, FormatterProps, Formatter } from '@t/store/column';
import { listItemText } from '../../formatter/listItemText';
import { encodeHTMLEntity } from '../../helper/common';

const maxTextMap: Record<string, string> = {};

export function setMaxTextMap(column: Column, row: Row) {
  column.autoResizingColumn.forEach((columnInfo) => {
    const { name } = columnInfo;
    const formattedValue = createFormattedValue(row, columnInfo);

    if (!maxTextMap[name] || maxTextMap[name].length < formattedValue.length) {
      maxTextMap[name] = formattedValue;
    }
  });
}

export function getMaxTextMap() {
  return maxTextMap;
}

export function createFormattedValue(row: Row, columnInfo: ColumnInfo) {
  const { name, formatter, defaultValue } = columnInfo;
  const formatterProps = { row, column: columnInfo, value: row[name] };

  return getFormattedValue(
    formatterProps,
    formatter,
    row[name] || defaultValue,
    row._relationListItemMap[name]
  );
}

export function getFormattedValue(
  props: FormatterProps,
  formatter?: Formatter,
  defaultValue?: CellValue,
  relationListItems?: ListItem[]
) {
  let value: CellValue;

  if (formatter === 'listItemText') {
    value = listItemText(props, relationListItems);
  } else if (typeof formatter === 'function') {
    value = formatter(props);
  } else if (typeof formatter === 'string') {
    value = formatter;
  } else {
    value = defaultValue;
  }

  const strValue = getCellDisplayValue(value);

  if (strValue && props.column.escapeHTML) {
    return encodeHTMLEntity(strValue);
  }
  return strValue;
}

function getCellDisplayValue(value: CellValue) {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  return String(value);
}
