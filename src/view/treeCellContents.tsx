import { h, Component } from 'preact';
import { cls, findParent } from '../helper/dom';
import { RowKey, TreeCellInfo } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { DEFAULT_INDENT_WIDTH } from '../helper/tree';

interface OwnProps {
  rowKey: RowKey;
  treeInfo: TreeCellInfo;
}

interface StoreProps {
  rowKey: RowKey;
  depth: number;
  indentWidth: number;
  leaf: boolean;
  expanded: boolean;
  useIcon: boolean;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class TreeCellContentsComp extends Component<Props> {
  private handleClick = (ev: MouseEvent) => {
    ev.stopPropagation();

    const { dispatch, rowKey } = this.props;
    const target = ev.target as HTMLElement;

    if (findParent(target, 'tree-button-collapse')) {
      dispatch('expandByRowKey', rowKey, false);
    } else if (findParent(target, 'tree-button-expand')) {
      dispatch('collapseByRowKey', rowKey, false);
    }
  };

  private getIndentComponent(depth: number, leaf: boolean) {
    const indentItem = [];

    for (let i = 0, len = depth + 1; i < len; i += 1) {
      indentItem.push(
        <span class={cls('tree-depth')}>
          {i === len - 1 && !leaf && (
            <button
              class={cls('btn-tree')}
              style={{ left: i * DEFAULT_INDENT_WIDTH }}
              onClick={this.handleClick}
            >
              <i />
            </button>
          )}
        </span>
      );
    }

    return indentItem;
  }

  public render() {
    const { depth, indentWidth, leaf, expanded, useIcon } = this.props;

    return (
      <div
        class={cls(
          'tree-extra-content',
          [!leaf && expanded, 'tree-button-expand'],
          [!leaf && !expanded, 'tree-button-collapse']
        )}
      >
        {this.getIndentComponent(depth, leaf)}
        {useIcon && (
          <span class={cls('tree-icon')} style={{ left: indentWidth - DEFAULT_INDENT_WIDTH }}>
            <i />
          </span>
        )}
      </div>
    );
  }
}

export const TreeCellContents = connect<StoreProps, OwnProps>(
  ({ column }, { treeInfo, rowKey }) => {
    const { allColumnMap, treeColumnName } = column;
    const { tree } = allColumnMap[treeColumnName];
    const { depth, indentWidth, leaf, expanded = true } = treeInfo;

    return {
      rowKey,
      depth,
      indentWidth,
      leaf,
      expanded,
      useIcon: !!tree && tree.useIcon
    };
  }
)(TreeCellContentsComp);
