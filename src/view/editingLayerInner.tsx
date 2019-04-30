import { h, Component } from 'preact';
import { cls, findParent } from '../helper/dom';
import { connect } from './hoc';
import { CellValue } from '../store/types';
import { DispatchProps } from '../dispatch/create';
import { CellEditor } from '../editor/types';

interface StoreProps {
  left: number;
  top: number;
  width: number;
  height: number;
  contentHeight: number;
  value: CellValue;
}

interface OwnProps {
  rowKey: number;
  columnName: string;
  editorName: string;
}

type Props = StoreProps & OwnProps & DispatchProps;

export class EditingLayerInnerComp extends Component<Props> {
  private editor?: CellEditor;

  private contentEl?: HTMLElement;

  private handleKeyDown = (ev: KeyboardEvent) => {
    if (ev.keyCode === 13) {
      this.finishEditing();
    }
  };

  private handleMouseDownDocument = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    const { contentEl } = this;

    if (contentEl && contentEl !== target && !contentEl.contains(target)) {
      this.finishEditing();
    }
  };

  private finishEditing() {
    if (this.editor) {
      const { dispatch, rowKey, columnName } = this.props;

      dispatch('setValue', rowKey, columnName, this.editor.getValue());
      this.editor.onFinish();
      dispatch('finishEditing', rowKey, columnName);
    }
  }

  public componentDidMount() {
    const { editorName, value } = this.props;

    const Editor = this.context.editorMap[editorName];
    const cellEditor: CellEditor = new Editor(value, () => {});
    const editorEl = cellEditor.getElement();

    if (editorEl && this.contentEl) {
      this.contentEl.appendChild(editorEl);
      cellEditor.onStart();
      this.editor = cellEditor;

      document.addEventListener('mousedown', this.handleMouseDownDocument);
    }
  }

  public componentWillUnmount() {
    if (this.editor) {
      this.editor.onFinish();
      document.removeEventListener('mousedown', this.handleMouseDownDocument);
    }
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
        class={cls('layer-editing', 'cell-content')}
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
  const { cellBorderWidth, tableBorderWidth, headerHeight } = store.dimension;
  const { scrollLeft, scrollTop } = store.viewport;
  const { areaWidth } = store.columnCoords;
  const { viewData } = store.data;

  const offsetTop = headerHeight - scrollTop + tableBorderWidth;
  const offsetLeft = side === 'L' ? 0 : areaWidth.L - scrollLeft + tableBorderWidth;
  const { top, left, right, bottom } = cellPosRect!;
  const targetRow = viewData.find((row) => row.rowKey === rowKey)!;
  const height = bottom - top + cellBorderWidth;

  return {
    left: left + offsetLeft,
    top: top + offsetTop,
    width: right - left + cellBorderWidth,
    height,
    contentHeight: height - 2 * cellBorderWidth,
    value: targetRow[columnName]
  };
})(EditingLayerInnerComp);
