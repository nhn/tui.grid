import { h, Component } from 'preact';
import { cls, hasClass } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface OwnProps {
  hello: null;
}
interface StoreProps {
  hello: null;
}

type Props = StoreProps & OwnProps & DispatchProps;

class FilterButtonComp extends Component<Props> {
  private active: boolean = false;

  private handleClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;

    if (!hasClass(target, 'btn-filter')) {
      return;
    }

    this.active = !this.active;
    console.log(this.active);
  };

  public render() {
    return (
      <a class={cls('btn-filter', [this.active, 'btn-filter-active'])} onClick={this.handleClick} />
    );
  }
}

export const FilterButton = connect<StoreProps, OwnProps>(() => ({}))(FilterButtonComp);
