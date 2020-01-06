import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import {
  CellValue,
  ColumnInfo,
  EditingAddress,
  Filter,
  RowKey,
  Side,
  SortState
} from '../store/types';
import { cls } from '../helper/dom';
import { getKeyStrokeString, TabCommandType } from '../helper/keyboard';
import { CellEditor, CellEditorClass, CellEditorProps } from '../editor/types';
import { findIndexByRowKey } from '../query/data';
import { findProp, isFunction, isNull } from '../helper/common';
import { getInstance } from '../instance';
import Grid from '../grid';

interface EditorStyles {
  top: number;
  left: number;
  width: number;
  height: number;
  lineHeight: string;
}

interface StoreProps {
  active: boolean;
  grid: Grid;
  focusedColumnName: string | null;
  focusedRowKey: RowKey | null;
  forcedDestroyEditing: boolean;
  editingAddress?: EditingAddress;
  value?: CellValue;
  sortState?: SortState;
  filter?: Filter;
  columnInfo?: ColumnInfo;
  editorStyles?: EditorStyles;
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

export class EditingLayerComp extends Component<Props> {
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
    const { dispatch, editingAddress } = this.props;
    if (this.editor && editingAddress) {
      const { rowKey, columnName } = editingAddress;
      const value = this.editor.getValue();
      if (save) {
        dispatch('setValue', rowKey, columnName, value);
      }
      dispatch('finishEditing', rowKey, columnName, value);
    }
  }

  private createEditor() {
    const { columnInfo, value, editingAddress, grid, editorStyles } = this.props;

    const EditorClass: CellEditorClass = columnInfo!.editor!.type;
    const editorProps: CellEditorProps = {
      grid,
      rowKey: editingAddress!.rowKey,
      columnInfo: columnInfo!,
      value
    };
    const cellEditor: CellEditor = new EditorClass(editorProps);
    const editorEl = cellEditor.getElement();

    if (editorEl && this.contentEl) {
      this.contentEl.appendChild(editorEl);
      this.editor = cellEditor;

      const editorWidth = editorEl.getBoundingClientRect().width;
      const { width } = editorStyles!;

      if (editorWidth > width) {
        const CELL_PADDING_WIDTH = 10;
        (this.contentEl as HTMLElement).style.width = `${editorWidth + CELL_PADDING_WIDTH}px`;
      }

      if (isFunction(cellEditor.mounted)) {
        cellEditor.mounted();
      }
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { active: prevActive } = prevProps;
    const { active } = this.props;

    if (!prevActive && active) {
      this.createEditor();
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    const {
      focusedColumnName: prevFocusedColumnName,
      focusedRowKey: prevFocusedRowKey,
      active: prevActive
    } = this.props;
    const { focusedColumnName, focusedRowKey, active, forcedDestroyEditing } = nextProps;

    if (prevActive && !active) {
      if (this.editor && this.editor.beforeDestroy) {
        this.editor.beforeDestroy();
      }

      if (forcedDestroyEditing) {
        this.finishEditing(true);
      }

      return;
    }

    if (
      prevActive &&
      (focusedColumnName !== prevFocusedColumnName || focusedRowKey !== prevFocusedRowKey)
    ) {
      this.finishEditing(true);
    }
  }

  public render({ active, editorStyles }: Props) {
    if (!active) {
      return null;
    }

    return (
      <div
        style={editorStyles}
        className={cls('layer-editing', 'cell-content', 'cell-content-editor')}
        onKeyDown={this.handleKeyDown}
        ref={el => {
          this.contentEl = el;
        }}
      />
    );
  }
}

export const EditingLayer = connect<StoreProps, OwnProps>((store, { side }) => {
  const { data, column, id, focus, dimension } = store;
  const grid = getInstance(id);
  const {
    editingAddress,
    side: focusSide,
    rowKey: focusedRowKey,
    columnName: focusedColumnName,
    forcedDestroyEditing,
    cellPosRect
  } = focus;

  const active = side === focusSide && !isNull(editingAddress);
  const state = {
    grid,
    active,
    focusedRowKey,
    focusedColumnName,
    forcedDestroyEditing
  };

  if (!active) {
    return state;
  }

  const { cellBorderWidth } = dimension;
  const { top, left, right, bottom } = cellPosRect!;
  const diffForTopCell = !top ? cellBorderWidth : 0;

  const width = right - left + cellBorderWidth;
  const height = bottom - top + cellBorderWidth - diffForTopCell;
  const lineHeight = `${height - 2 * cellBorderWidth}px`;

  const editorStyles = { top, left, width, height, lineHeight };

  const { filteredViewData, sortState } = data;
  const { rowKey, columnName } = editingAddress!;
  const targetRow = filteredViewData[findIndexByRowKey(data, column, id, rowKey)];
  let value, filter;

  if (targetRow) {
    value = targetRow.valueMap[columnName].value;
  }

  if (data.filters) {
    filter = findProp('columnName', columnName, data.filters);
  }

  return {
    ...state,
    value,
    filter,
    sortState,
    editorStyles,
    editingAddress,
    columnInfo: column.allColumnMap[columnName]
  };
})(EditingLayerComp);
