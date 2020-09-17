import { Row, CellValue, ListItem } from '@t/store/data';
import { ColumnInfo, Column, FormatterProps, Formatter } from '@t/store/column';
import { listItemText } from '../../formatter/listItemText';
import { encodeHTMLEntity, isFunction, isString, isNil } from '../../helper/common';

interface MaxTextInfo {
  formattedValue: string;
  row: Row;
}
let maxTextMap: Record<string, MaxTextInfo> = {};

export function initMaxTextMap() {
  maxTextMap = {};
}

export function setMaxTextMap(column: Column, row: Row) {
  column.autoResizingColumn.forEach((columnInfo) => {
    const { name } = columnInfo;
    const formattedValue = createFormattedValue(row, columnInfo);

    if (!maxTextMap[name] || maxTextMap[name].formattedValue.length < formattedValue.length) {
      setMaxColumnTextMap(name, formattedValue, row);
    }
  });
}

export function setMaxColumnTextMap(columnName: string, formattedValue: string, row: Row) {
  maxTextMap[columnName] = { formattedValue, row };
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
  } else if (isFunction(formatter)) {
    value = formatter(props);
  } else if (isString(formatter)) {
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
  if (isNil(value)) {
    return '';
  }
  return String(value);
}
