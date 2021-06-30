import { h, Component } from 'preact';
import { RowKey, ViewRow } from '@t/store/data';
import { Dictionary } from '@t/options';
import { ColumnInfo } from '@t/store/column';
import { EditingAddress, Rect, Side } from '@t/store/focus';
import { CellEditor } from '@t/editor';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { getKeyStrokeString, TabCommandType } from '../helper/keyboard';
import { findProp, isNull } from '../helper/common';
import { getInstance } from '../instance';
import Grid from '../grid';

interface StoreProps {
  active: boolean;
  grid: Grid;
  focusedColumnName: string | null;
  focusedRowKey: RowKey | null;
  forcedDestroyEditing: boolean;
  cellBorderWidth: number;
  filteredViewData: ViewRow[];
  allColumnMap: Dictionary<ColumnInfo>;
  editingAddress: EditingAddress;
  cellPosRect?: Rect | null;
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
        this.saveAndFinishEditing(true);
        break;
      case 'esc':
        this.cancelEditing();
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

  private getEditingCellInfo() {
    const { rowKey, columnName } = this.props.editingAddress!;
    const value = this.editor!.getValue();

    return { rowKey, columnName, value };
  }

  private cancelEditing() {
    const { rowKey, columnName, value } = this.getEditingCellInfo();

    if (this.editor?.beforeDestroy) {
      this.editor.beforeDestroy();
    }

    this.props.dispatch('finishEditing', rowKey, columnName, value, {
      save: false,
      triggeredByKey: true,
    });
  }

  private saveAndFinishEditing(triggeredByKey = false) {
    const { dispatch, active } = this.props;

    if (this.editor && active) {
      const { rowKey, columnName, value } = this.getEditingCellInfo();

      dispatch('setValue', rowKey, columnName, value);

      if (this.editor?.beforeDestroy) {
        this.editor.beforeDestroy();
      }

      dispatch('finishEditing', rowKey, columnName, value, { save: true, triggeredByKey });
    }
  }

  private createEditor() {
    const { allColumnMap, filteredViewData, editingAddress, grid, cellPosRect } = this.props;

    const { rowKey, columnName } = editingAddress!;
    const { right, left } = cellPosRect!;
    const columnInfo = allColumnMap[columnName];
    const { value, formattedValue } = findProp('rowKey', rowKey, filteredViewData)!.valueMap[
      columnName
    ]!;
    const EditorClass = columnInfo.editor!.type;
    const editorProps = {
      grid,
      rowKey,
      columnInfo,
      value,
      formattedValue,
      width: right - left,
      portalEditingKeydown: this.handleKeyDown,
    };
    const cellEditor = new EditorClass(editorProps);
    const editorEl = cellEditor.getElement();

    if (editorEl && this.contentEl) {
      this.contentEl.appendChild(editorEl);
      this.editor = cellEditor;

      if (cellEditor.mounted) {
        // To access the actual mounted DOM elements
        setTimeout(() => {
          cellEditor.mounted!();
        });
      }
    }
  }

  public componentDidUpdate(prevProps: Props) {
    if (
      !prevProps.active &&
      this.props.active &&
      this.props.editingAddress?.columnName === this.props.focusedColumnName
    ) {
      this.createEditor();
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    const {
      focusedColumnName: prevFocusedColumnName,
      focusedRowKey: prevFocusedRowKey,
      active: prevActive,
    } = this.props;
    const { focusedColumnName, focusedRowKey, active, forcedDestroyEditing } = nextProps;

    if (
      (prevActive && !active && forcedDestroyEditing) ||
      (prevActive &&
        (focusedColumnName !== prevFocusedColumnName || focusedRowKey !== prevFocusedRowKey))
    ) {
      this.saveAndFinishEditing();
    }
  }

  public render({ active, cellPosRect, cellBorderWidth }: Props) {
    if (!active) {
      return null;
    }

    const { top, left, right, bottom } = cellPosRect!;
    const height = bottom - top;
    const width = right - left;

    const editorStyles = {
      top: top ? top : cellBorderWidth,
      left,
      width: width + cellBorderWidth,
      height: top ? height + cellBorderWidth : height,
      lineHeight: top ? `${height - cellBorderWidth}px` : `${height - cellBorderWidth * 2}px`,
    };

    return (
      <div
        style={editorStyles}
        className={cls('layer-editing', 'cell-content', 'cell-content-editor')}
        onKeyDown={this.handleKeyDown}
        ref={(el) => {
          this.contentEl = el;
        }}
      />
    );
  }
}

export const EditingLayer = connect<StoreProps, OwnProps>((store, { side }) => {
  const { data, column, id, focus, dimension } = store;
  const {
    editingAddress,
    side: focusSide,
    rowKey: focusedRowKey,
    columnName: focusedColumnName,
    forcedDestroyEditing,
    cellPosRect,
  } = focus;

  return {
    grid: getInstance(id),
    active: side === focusSide && !isNull(editingAddress),
    focusedRowKey,
    focusedColumnName,
    forcedDestroyEditing,
    cellPosRect,
    cellBorderWidth: dimension.cellBorderWidth,
    editingAddress,
    filteredViewData: data.filteredViewData,
    allColumnMap: column.allColumnMap,
  };
}, true)(EditingLayerComp);
