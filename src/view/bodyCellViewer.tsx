import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { CellValue } from '../store/types';

interface OwnProps {
  value: CellValue;
}

export class BodyCellViewerComp extends Component<OwnProps> {
  public render() {
    const styles = { 'white-space': 'nowrap' };

    return (
      <div class={cls('cell-content')} style={styles}>
        {this.props.value}
      </div>
    );
  }
}

export const BodyCellViewer = BodyCellViewerComp;
