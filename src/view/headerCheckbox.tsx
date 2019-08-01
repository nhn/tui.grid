import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  header: string;
  checkedAllRows: boolean;
  disabled: boolean;
}

type Props = StoreProps & DispatchProps;

class HeaderCheckboxComp extends Component<Props> {
  private el?: HTMLElement;

  private handleChange = (ev: Event) => {
    const target = ev.target as HTMLInputElement;
    const { dispatch } = this.props;

    if (target.checked) {
      dispatch('checkAll');
    } else {
      dispatch('uncheckAll');
    }
  };

  public componentDidUpdate() {
    const { checkedAllRows, disabled } = this.props;
    const input: HTMLInputElement | null = this.el!.querySelector(
      'input[name=_checked]'
    ) as HTMLInputElement;

    if (input) {
      input.checked = checkedAllRows;
      input.disabled = disabled;
    }
  }

  public render() {
    return (
      <span
        ref={el => {
          this.el = el;
        }}
        dangerouslySetInnerHTML={{ __html: this.props.header }}
        onChange={this.handleChange}
      />
    );
  }
}

export const HeaderCheckbox = connect<StoreProps>(store => {
  const {
    data: { checkedAllRows, disabled },
    column: { allColumnMap }
  } = store;

  return {
    header: allColumnMap._checked.header,
    checkedAllRows,
    disabled
  };
})(HeaderCheckboxComp);
