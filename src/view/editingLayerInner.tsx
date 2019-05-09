import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { CellValue, CellEditorOptions, RowKey } from '../store/types';
import { DispatchProps } from '../dispatch/create';
import { CellEditor, CellEditorClass } from '../editor/types';
import { keyNameMap } from '../helper/keyboard';

interface StoreProps {
  left: number;
  top: number;
  width: number;
  height: number;
  contentHeight: number;
  value: CellValue;
}

interface OwnProps {
  rowKey: RowKey;
  columnName: string;
  editorOptions: CellEditorOptions;
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
      const { dispatch, rowKey, columnName } = this.props;

      if (save) {
        dispatch('setValue', rowKey, columnName, this.editor.getValue());
      }
      if (typeof this.editor.finish === 'function') {
        this.editor.finish();
      }
      dispatch('finishEditing', rowKey, columnName);
    }
  }

  public componentDidMount() {
    const { editorOptions, value } = this.props;

    const Editor: CellEditorClass = this.context.editorMap[editorOptions.type];
    const cellEditor: CellEditor = new Editor(editorOptions, value, () => {});
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

  public componentShouldUpdate() {
    return false;
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
  const { viewData } = store.data;

  const { top, left, right, bottom } = cellPosRect!;
  const cellWidth = right - left + cellBorderWidth;
  const cellHeight = bottom - top + cellBorderWidth;
  const offsetTop = headerHeight - scrollTop + tableBorderWidth;
  const offsetLeft = Math.min(areaWidth.L - scrollLeft + tableBorderWidth, width - right);
  const targetRow = viewData.find((row) => row.rowKey === rowKey)!;

  return {
    left: left + (side === 'L' ? 0 : offsetLeft),
    top: top + offsetTop,
    width: cellWidth,
    height: cellHeight,
    contentHeight: cellHeight - 2 * cellBorderWidth,
    value: targetRow[columnName]
  };
})(EditingLayerInnerComp);
