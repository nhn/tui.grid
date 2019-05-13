import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { CellValue, ColumnInfo } from '../store/types';
import { Dispatch } from '../dispatch/create';

interface OwnProps {
  value: CellValue;
  column: ColumnInfo;
}

export class BodyCellViewer extends Component<OwnProps> {
  private getListItem() {
    const { editor } = this.props.column;
    if (editor) {
      const { type } = editor;
      if (['checkbox', 'radio', 'select'].includes(type)) {
        return editor.listItem;
      }
    }

    return null;
  }

  public render() {
    const styles = { 'white-space': 'nowrap' };
    const listItem = this.getListItem();

    return (
      <div class={cls('cell-content')} style={styles}>
        {this.props.value}
      </div>
    );
  }
}
