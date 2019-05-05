import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { CellEditorOptions, CellValue } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { CellEditor } from '../editor/types';

interface OwnProps {
  rowKey: number;
  columnName: string;
  editorOptions: CellEditorOptions;
  value: CellValue;
}

interface StoreProps {
  editing: boolean;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class BodyCellEditorComp extends Component<Props> {
  private editor?: CellEditor;

  private contentEl?: HTMLElement;

  private isMouseDown: boolean = false;

  private handleMouseClick = (ev: MouseEvent) => {
    const { editing, rowKey, columnName, dispatch } = this.props;

    if (!editing) {
      dispatch('startEditing', rowKey, columnName);
    }
  };

  public componentDidMount() {
    const { rowKey, columnName, value, editorOptions, dispatch } = this.props;
    const Editor = this.context.editorMap[editorOptions.type];
    const editor: CellEditor = new Editor(editorOptions, value, (type: string) => {
      switch (type) {
        case 'start':
          dispatch('startEditing', rowKey, columnName);
          break;
        case 'finish':
          dispatch('setValue', rowKey, columnName, editor.getValue());
          dispatch('finishEditing', rowKey, columnName);
          break;
        default:
      }
    });
    const editorEl = editor.getElement();

    if (editorEl && this.contentEl) {
      this.contentEl.appendChild(editorEl);
      this.editor = editor;
    }
  }

  public componentShouldUpdate() {
    return false;
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (!this.editor || this.props.editing === nextProps.editing) {
      return;
    }

    if (nextProps.editing) {
      if (!this.isMouseDown) {
        this.editor.start();
      }
    } else {
      this.editor.finish();
    }
  }

  private finishEditing() {
    if (this.editor) {
      const { dispatch, rowKey, columnName } = this.props;

      dispatch('setValue', rowKey, columnName, this.editor.getValue());
      this.editor.finish();
    }
  }

  private handleKeyDown = (ev: KeyboardEvent) => {
    if (ev.keyCode === 13) {
      this.finishEditing();
    }
  };

  public render() {
    const styles = { 'white-space': 'nowrap' };

    return (
      <div
        onClick={this.handleMouseClick}
        onKeyDown={this.handleKeyDown}
        class={cls('cell-content', 'cell-content-editor')}
        style={styles}
        ref={(el) => {
          this.contentEl = el;
        }}
      />
    );
  }
}

export const BodyCellEditor = connect<StoreProps, OwnProps>(({ focus }, { rowKey, columnName }) => {
  const { editing } = focus;
  return {
    editing: !!editing && editing.rowKey === rowKey && editing.columnName === columnName
  };
})(BodyCellEditorComp);
