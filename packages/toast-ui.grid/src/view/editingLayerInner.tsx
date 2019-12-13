import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { CellValue, RowKey, ColumnInfo, SortState, Filter } from '../store/types';
import { DispatchProps } from '../dispatch/create';
import { CellEditor, CellEditorClass, CellEditorProps } from '../editor/types';
import { getKeyStrokeString, TabCommandType } from '../helper/keyboard';
import { getInstance } from '../instance';
import Grid from '../grid';
import { isFunction, isNull, findProp } from '../helper/common';
import { findIndexByRowKey } from '../query/data';

interface StoreProps {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  contentHeight?: number;
  columnInfo?: ColumnInfo;
  value?: CellValue;
  grid: Grid;
  sortState: SortState;
  filter?: Filter;
  focusedColumnName: string | null;
  focusedRowKey: RowKey | null;
  forcedDestroyEditing: boolean;
}

interface OwnProps {
  rowKey: RowKey;
  columnName: string;
}

type Props = StoreProps & OwnProps & DispatchProps;

/**
 * Process of unmounting the Editing layer
 * 1. In case of controlling by the keyMap
 * - Step 1: call the handleKeyDown method.
 * - Step 2: dispath the finishEditing.
 * - Step 3: occur the editingFinish event and editingAdress will be 'null'.
 * - Step 4: call the componentWillUnmount lifecycle method.
 * - Step 5: the layer is unmounted.
 *
 * 2. In case of controlling by clicking another cell
 * - Step 1: call the componentWillReceiveProps lifecycle method.
 * - Step 2: dispath the finishEditing.
 * - Step 3: occur the editingFinish event and editingAddress will be 'null'.
 * - Step 4: call the componentWillUnmount lifecycle method.
 * - Step 5: the layer is unmounted.
 *
 * 3. In case of controlling by finishEditing grid API with value parameter.
 *    (ex. grid.finishEditing(0, 'columnName', 'someValue');)
 * - Step 1: dispath the saveAndFinishEditing.
 * - Step 2: call the finishEditing function in dispatch/focus.ts
 * - Step 3: occur the editingFinish event and editingAddress will be 'null'.
 * - Step 4: call the componentWillUnmount lifecycle method.
 * - Step 5: the layer is unmounted.
 *
 * 4. In case of controlling by finishEditing grid API with 'undefined' value parameter.
 *    (ex. grid.finishEditing(0, 'columnName');)
 * - Step 1: dispath the saveAndFinishEditing.
 * - Step 2: editingAddress will be 'null'.
 * - Step 3: call the componentWillUnmount lifecycle method.
 * - Step 4: dispath the finishEditing(due to forcedDestroyEditing prop is 'true').
 * - Step 5: occur the editingFinish event(editingAddress is already 'null').
 * - Step 6: the layer is unmounted.
 */
export class EditingLayerInnerComp extends Component<Props> {
  private editor?: CellEditor;

  private contentEl?: HTMLElement;

  private moveTabFocus(ev: KeyboardEvent, command: TabCommandType) {
    const { dispatch } = this.props;

    ev.preventDefault();
    dispatch('moveTabFocus', command);
    dispatch('setScrollToFocus');
  }

  private handleKeyDown = (ev: KeyboardEvent) => {
    const keyName = getKeyStrokeString(ev);

    switch (keyName) {
      case 'enter':
        this.finishEditing(true);
        break;
      case 'esc':
        this.finishEditing(false);
        break;
      case 'tab':
        this.moveTabFocus(ev, 'nextCell');
        break;
      case 'shift-tab':
        this.moveTabFocus(ev, 'prevCell');
        break;
      default:
      // do nothing;
    }
  };

  private finishEditing(save: boolean) {
    if (this.editor) {
      const { dispatch, rowKey, columnName } = this.props;
      const value = this.editor.getValue();
      if (save) {
        dispatch('setValue', rowKey, columnName, value);
      }
      dispatch('finishEditing', rowKey, columnName, value);
    }
  }

  public componentDidMount() {
    const { grid, rowKey, columnInfo, value, width } = this.props;
    const EditorClass: CellEditorClass = columnInfo!.editor!.type;
    const editorProps: CellEditorProps = { grid, rowKey, columnInfo: columnInfo!, value };
    const cellEditor: CellEditor = new EditorClass(editorProps);
    const editorEl = cellEditor.getElement();

    if (editorEl && this.contentEl) {
      this.contentEl.appendChild(editorEl);
      this.editor = cellEditor;

      const editorWidth = editorEl.getBoundingClientRect().width;

      if (editorWidth > width!) {
        const CELL_PADDING_WIDTH = 10;
        (this.contentEl as HTMLElement).style.width = `${editorWidth + CELL_PADDING_WIDTH}px`;
      }

      if (isFunction(cellEditor.mounted)) {
        cellEditor.mounted();
      }
    }
  }

  public componentWillUnmount() {
    if (this.props.forcedDestroyEditing) {
      this.finishEditing(true);
    }
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
        ref={el => {
          this.contentEl = el;
        }}
      />
    );
  }
}

export const EditingLayerInner = connect<StoreProps, OwnProps>((store, { rowKey, columnName }) => {
  const { data, column, id, focus, viewport, dimension, columnCoords } = store;
  const {
    cellPosRect,
    side,
    columnName: focusedColumnName,
    rowKey: focusedRowKey,
    forcedDestroyEditing
  } = focus;
  const { filteredViewData, sortState } = data;
  const state = {
    grid: getInstance(id),
    sortState,
    focusedColumnName,
    focusedRowKey,
    forcedDestroyEditing
  };

  if (isNull(cellPosRect)) {
    return state;
  }

  const { cellBorderWidth, headerHeight, width, frozenBorderWidth } = dimension;
  const { scrollLeft, scrollTop } = viewport;
  const { areaWidth } = columnCoords;
  const { allColumnMap, rowHeaderCount } = column;
  const { top, left, right, bottom } = cellPosRect;
  const diffForTopCell = !top ? cellBorderWidth : 0;
  const diffForRowHeader = rowHeaderCount ? (rowHeaderCount - 1) * cellBorderWidth : 0;
  const cellWidth = right - left + cellBorderWidth;
  const cellHeight = bottom - top + cellBorderWidth - diffForTopCell;
  const offsetTop = headerHeight - scrollTop + diffForTopCell;
  const offsetLeft = Math.min(areaWidth.L - scrollLeft, width - right);
  const targetRow = filteredViewData[findIndexByRowKey(data, column, id, rowKey)];
  const borderWidth = frozenBorderWidth - diffForRowHeader;
  let value, filter;
  if (targetRow) {
    value = targetRow.valueMap[columnName].value;
  }
  if (data.filters) {
    filter = findProp('columnName', columnName, data.filters);
  }

  return {
    ...state,
    left: left + (side === 'L' ? 0 : offsetLeft + borderWidth),
    top: top + offsetTop,
    width: cellWidth,
    height: cellHeight,
    contentHeight: cellHeight - 2 * cellBorderWidth,
    columnInfo: allColumnMap[columnName],
    value,
    filter
  };
})(EditingLayerInnerComp);
