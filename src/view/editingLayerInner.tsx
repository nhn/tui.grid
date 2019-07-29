import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { CellValue, RowKey, ColumnInfo, SortOptions } from '../store/types';
import { DispatchProps } from '../dispatch/create';
import { CellEditor, CellEditorClass, CellEditorProps } from '../editor/types';
import { keyNameMap } from '../helper/keyboard';
import { getInstance } from '../instance';
import Grid from '../grid';
import { findPropIndex, isFunction } from '../helper/common';

interface StoreProps {
  left: number;
  top: number;
  width: number;
  height: number;
  contentHeight: number;
  columnInfo: ColumnInfo;
  grid: Grid;
  value: CellValue;
  sortOptions: SortOptions;
  focusedColumnName: string | null;
  focusedRowKey: RowKey | null;
}

interface OwnProps {
  rowKey: RowKey;
  columnName: string;
}

type Props = StoreProps & OwnProps & DispatchProps;

type KeyNameMap = typeof keyNameMap & {
  [keyCode: number]: string | undefined;
};

export class EditingLayerInnerComp extends Component<Props> {
  private editor?: CellEditor;

  private contentEl?: HTMLElement;

  private handleKeyDown = (ev: KeyboardEvent) => {
    const keyName = (keyNameMap as KeyNameMap)[ev.keyCode];

    switch (keyName) {
      case 'enter':
        this.finishEditing(true);
        break;
      case 'esc':
        this.finishEditing(false);
        break;
      default:
      // do nothing;
    }
  };

  private finishEditing(save: boolean) {
    if (this.editor) {
      const { dispatch, rowKey, columnName, sortOptions } = this.props;

      if (save) {
        dispatch('setValue', rowKey, columnName, this.editor.getValue());
        const index = findPropIndex('columnName', columnName, sortOptions.columns);
        if (index !== -1) {
          dispatch('sort', columnName, sortOptions.columns[index].ascending, true, false);
        }
      }
      dispatch('finishEditing', rowKey, columnName);
    }
  }

  public componentDidMount() {
    const { grid, rowKey, columnInfo, value, width } = this.props;

    const EditorClass: CellEditorClass = columnInfo.editor!.type;
    const editorProps: CellEditorProps = { grid, rowKey, columnInfo, value };
    const cellEditor: CellEditor = new EditorClass(editorProps);
    const editorEl = cellEditor.getElement();

    if (editorEl && this.contentEl) {
      this.contentEl.appendChild(editorEl);
      this.editor = cellEditor;

      const editorWidth = (this.editor.el as HTMLElement).getBoundingClientRect().width;

      if (editorWidth > width) {
        const CELL_PADDING_WIDTH = 10;
        (this.contentEl as HTMLElement).style.width = `${editorWidth + CELL_PADDING_WIDTH}px`;
      }

      if (isFunction(cellEditor.mounted)) {
        cellEditor.mounted();
      }
    }
  }

  public componentWillUnmount() {
    this.finishEditing(false);
    if (this.editor && this.editor.beforeDestroy) {
      this.editor.beforeDestroy();
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    const {
      focusedColumnName: prevFocusedColumnName,
      focusedRowKey: prevFocusedRowKey
    } = this.props;
    const { focusedColumnName, focusedRowKey } = nextProps;

    if (focusedColumnName !== prevFocusedColumnName || focusedRowKey !== prevFocusedRowKey) {
      this.finishEditing(true);
    }
  }

  public render() {
    const { top, left, width, height, contentHeight } = this.props;
    const lineHeight = `${contentHeight}px`;
    const styles = { top, left, width, height, lineHeight };

    return (
      <div
        style={styles}
        class={cls('layer-editing', 'cell-content', 'cell-content-editor')}
        onKeyDown={this.handleKeyDown}
        ref={(el) => {
          this.contentEl = el;
        }}
      />
    );
  }
}

export const EditingLayerInner = connect<StoreProps, OwnProps>((store, { rowKey, columnName }) => {
  const { cellPosRect, side, columnName: focusedColumnName, rowKey: focusedRowKey } = store.focus;
  const {
    cellBorderWidth,
    tableBorderWidth,
    headerHeight,
    width,
    frozenBorderWidth
  } = store.dimension;
  const { scrollLeft, scrollTop } = store.viewport;
  const { areaWidth } = store.columnCoords;
  const { viewData, sortOptions } = store.data;
  const { allColumnMap } = store.column;

  const { top, left, right, bottom } = cellPosRect!;
  const cellWidth = right - left + cellBorderWidth;
  const cellHeight = bottom - top + cellBorderWidth;
  const offsetTop = headerHeight - scrollTop + tableBorderWidth;
  const offsetLeft = Math.min(areaWidth.L - scrollLeft, width - right);
  const targetRow = viewData.find((row) => row.rowKey === rowKey)!;
  const { value } = targetRow.valueMap[columnName];

  return {
    grid: getInstance(store.id),
    left: left + (side === 'L' ? 0 : offsetLeft + frozenBorderWidth),
    top: top + offsetTop,
    width: cellWidth,
    height: cellHeight,
    contentHeight: cellHeight - 2 * cellBorderWidth,
    columnInfo: allColumnMap[columnName],
    value,
    sortOptions,
    focusedColumnName,
    focusedRowKey
  };
})(EditingLayerInnerComp);
