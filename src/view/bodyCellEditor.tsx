import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { CellValue } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { CellTextEditor } from '../editor/text';
import { CellEditor } from '../editor/base';

interface OwnProps {
  rowKey: number;
  columnName: string;
  value: CellValue;
}

interface StoreProps {
  editing: boolean;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class BodyCellEditorComp extends Component<Props> {
  private editor?: CellEditor;

  private contentEl?: HTMLElement;

  public componentDidMount() {
    const { rowKey, columnName, value, dispatch } = this.props;
    const editor = new CellTextEditor(value, (type: string) => {
      switch (type) {
        case 'start':
          dispatch('startEditing', rowKey, columnName);
          break;
        case 'finish':
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
    if (!nextProps.editing && this.editor) {
      this.editor.onFinish();
    }
  }

  private finishEditing() {
    if (!this.editor) {
      return;
    }

    const { dispatch, rowKey, columnName } = this.props;
    dispatch('setValue', rowKey, columnName, this.editor.getValue());
    this.editor.onFinish();
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
        onKeyDown={this.handleKeyDown}
        class={cls('cell-content')}
        style={styles}
        ref={(el) => {
          this.contentEl = el;
        }}
      />
    );
  }
}

export const BodyCellEditor = connect<StoreProps, OwnProps>(({ focus }, { rowKey, columnName }) => {
  const editing = focus.editing && focus.rowKey === rowKey && focus.columnName === columnName;

  return { editing };
})(BodyCellEditorComp);
