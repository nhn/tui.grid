import { h, Component } from 'preact';
import { RowKey, TreeCellInfo } from '@t/store/data';
import { cls, findParentByClassName } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { TREE_INDENT_WIDTH } from '../helper/constant';

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
  treeIndentWidth: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class TreeCellContentsComp extends Component<Props> {
  private handleClick = (ev: MouseEvent) => {
    ev.stopPropagation();

    const { dispatch, rowKey } = this.props;
    const target = ev.target as HTMLElement;

    if (findParentByClassName(target, 'tree-button-collapse')) {
      dispatch('expandByRowKey', rowKey, false);
    } else if (findParentByClassName(target, 'tree-button-expand')) {
      dispatch('collapseByRowKey', rowKey, false);
    }
  };

  private getIndentComponent(depth: number, leaf: boolean) {
    const indentItem = [];

    for (let i = 0, len = depth; i < len; i += 1) {
      indentItem.push(
        <span class={cls('tree-depth')}>
          {i === len - 1 && !leaf && (
            <button
              class={cls('btn-tree')}
              style={{ left: i * this.props.treeIndentWidth }}
              onClick={this.handleClick}
              type="button"
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
          <span class={cls('tree-icon')} style={{ left: indentWidth - TREE_INDENT_WIDTH }}>
            <i />
          </span>
        )}
      </div>
    );
  }
}

export const TreeCellContents = connect<StoreProps, OwnProps>(
  ({ column }, { treeInfo, rowKey }) => {
    const { treeIcon: useIcon = true, treeIndentWidth = TREE_INDENT_WIDTH } = column;
    const { depth, indentWidth, leaf, expanded = false } = treeInfo;

    return {
      rowKey,
      depth,
      indentWidth,
      leaf,
      expanded,
      useIcon,
      treeIndentWidth,
    };
  }
)(TreeCellContentsComp);
