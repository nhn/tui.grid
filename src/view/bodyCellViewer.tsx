import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { ColumnInfo, CellRenderData, Dictionary } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface OwnProps {
  valueMap: Dictionary<CellRenderData>;
  column: ColumnInfo;
}

interface StoreProps {
  renderData: CellRenderData;
}

type Props = OwnProps & StoreProps & DispatchProps;

class BodyCellViewerComp extends Component<Props> {
  public render() {
    const styles = { 'white-space': 'nowrap' };

    return (
      <div class={cls('cell-content')} style={styles}>
        {this.props.renderData.formattedValue}
      </div>
    );
  }
}

export const BodyCellViewer = connect<StoreProps, OwnProps>((_, { valueMap, column }) => ({
  renderData: valueMap[column.name]
}))(BodyCellViewerComp);
