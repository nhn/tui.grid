import { GridEventProps } from '@t/event';
import { OptExport } from '@t/store/export';
import GridEvent from '../event/gridEvent';

export type EventType = 'beforeExport' | 'afterExport';

export interface EventParams {
  exportFormat: 'csv' | 'xlsx';
  exportOptions: OptExport;
  data: string[][];
}

export function createExportEvent(eventType: EventType, eventParams: EventParams) {
  const { exportFormat, exportOptions, data } = eventParams;
  let props: GridEventProps = {};

  switch (eventType) {
    /**
     * Occurs before export
     * @event Grid#beforeExport
     * @property {'csv' | 'xlsx'} exportFormat - Export format
     * @property {Object} exportOptions - Used export options
     *    @property {boolean} exportOptions.includeHeader - Whether to include headers
     *    @property {boolean} exportOptions.includeHiddenColumns - Whether to include hidden columns
     *    @property {string[]} exportOptions.columnNames - Columns names to export
     *    @property {boolean} exportOptions.onlySelected - Whether to export only the selected range
     *    @property {boolean} exportOptions.onlyFiltered - Whether to export only the filtered data
     *    @property {','|';'|'\t'|'|'} exportOptions.delimiter - Delimiter to export CSV
     *    @property {string} exportOptions.fileName - File name to export
     *    @property {string[][]} data - Data to be finally exported
     * @property {Grid} instance - Current grid instance
     */
    case 'beforeExport':
      props = { exportFormat, exportOptions, data };
      break;
    /**
     * Occurs after export
     * @event Grid#afterExport
     * @property {'csv' | 'xlsx'} exportFormat - Export format
     * @property {Object} exportOptions - Used export options
     *    @property {boolean} exportOptions.includeHeader - Whether to include headers
     *    @property {boolean} exportOptions.includeHiddenColumns - Whether to include hidden columns
     *    @property {string[]} exportOptions.columnNames - Columns names to export
     *    @property {boolean} exportOptions.onlySelected - Whether to export only the selected range
     *    @property {boolean} exportOptions.onlyFiltered - Whether to export only the filtered data
     *    @property {','|';'|'\t'|'|'} exportOptions.delimiter - Delimiter to export CSV
     *    @property {string} exportOptions.fileName - File name to export
     *    @property {string[][]} data - Data to be finally exported
     * @property {Grid} instance - Current grid instance
     */
    case 'afterExport':
      props = { exportFormat, exportOptions, data };
      break;
    default: // do nothing
  }

  return new GridEvent(props);
}
