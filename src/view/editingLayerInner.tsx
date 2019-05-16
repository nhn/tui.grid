import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { CellValue, RowKey, ColumnInfo, Dictionary, SortOptions } from '../store/types';
import { DispatchProps } from '../dispatch/create';
import { CellEditor, CellEditorClass, CellEditorProps } from '../editor/types';
import { keyNameMap } from '../helper/keyboard';
import { getInstance } from '../instance';
import Grid from '../grid';

interface StoreProps {
  left: number;
  top: number;
  width: number;
  height: number;
  contentHeight: number;
  columnInfo: ColumnInfo;
  grid: Grid;
  value: CellValue;
  editorOptions: Dictionary<any>;
  sortOptions: SortOptions;
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

  private handleMouseDownDocument = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    const { contentEl } = this;

    if (contentEl && contentEl !== target && !contentEl.contains(target)) {
      this.finishEditing(true);
    }
  };

  private finishEditing(save: boolean) {
    if (this.editor) {
      const { dispatch, rowKey, columnName, sortOptions } = this.props;

      if (save) {
        dispatch('setValue', rowKey, columnName, this.editor.getValue());
        if (sortOptions.columnName === columnName) {
          dispatch('sort', columnName, sortOptions.ascending);
        }
      }
      if (typeof this.editor.finish === 'function') {
        this.editor.finish();
      }
      dispatch('finishEditing', rowKey, columnName);
    }
  }

  public componentDidMount() {
    const { grid, rowKey, columnInfo, value, editorOptions } = this.props;

    const EditorClass: CellEditorClass = columnInfo.editor!;
    const editorProps: CellEditorProps = { grid, rowKey, columnInfo, value, editorOptions };
    const cellEditor: CellEditor = new EditorClass(editorProps);
    const editorEl = cellEditor.getElement();

    if (editorEl && this.contentEl) {
      this.contentEl.appendChild(editorEl);
      this.editor = cellEditor;

      if (typeof cellEditor.start === 'function') {
        cellEditor.start();
      }
      document.addEventListener('mousedown', this.handleMouseDownDocument);
    }
  }

  public componentWillUnmount() {
    this.finishEditing(false);
    document.removeEventListener('mousedown', this.handleMouseDownDocument);
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
  const { cellPosRect, side } = store.focus;
  const { cellBorderWidth, tableBorderWidth, headerHeight, width } = store.dimension;
  const { scrollLeft, scrollTop } = store.viewport;
  const { areaWidth } = store.columnCoords;
  const { viewData, sortOptions } = store.data;
  const { allColumnMap } = store.column;

  const { top, left, right, bottom } = cellPosRect!;
  const cellWidth = right - left + cellBorderWidth;
  const cellHeight = bottom - top + cellBorderWidth;
  const offsetTop = headerHeight - scrollTop + tableBorderWidth;
  const offsetLeft = Math.min(areaWidth.L - scrollLeft + tableBorderWidth, width - right);
  const targetRow = viewData.find((row) => row.rowKey === rowKey)!;
  const { value, editorOptions } = targetRow.valueMap[columnName];

  return {
    grid: getInstance(store.id),
    left: left + (side === 'L' ? 0 : offsetLeft),
    top: top + offsetTop,
    width: cellWidth,
    height: cellHeight,
    contentHeight: cellHeight - 2 * cellBorderWidth,
    columnInfo: allColumnMap[columnName],
    value,
    editorOptions,
    sortOptions
  };
})(EditingLayerInnerComp);
