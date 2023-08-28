import { Component, h } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { ColumnInfo } from '@t/store/column';

interface StoreProps {
  header: string;
  customHeader: ColumnInfo['customHeader'];
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
      dispatch('checkAll', false);
    } else {
      dispatch('uncheckAll', false);
    }
  };

  public componentDidMount() {
    this.setCheckboxState();
  }

  public componentDidUpdate() {
    this.setCheckboxState();
  }

  private setCheckboxState() {
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
        ref={(el) => {
          this.el = el;
        }}
        dangerouslySetInnerHTML={{ __html: this.props.header }}
        onChange={this.handleChange}
      />
    );
  }
}

export const HeaderCheckbox = connect<StoreProps>((store) => {
  const {
    data: { checkedAllRows, disabledAllCheckbox },
    column: { allColumnMap },
  } = store;

  const { header, customHeader } = allColumnMap._checked;

  return {
    header,
    customHeader,
    checkedAllRows,
    disabled: disabledAllCheckbox,
  };
})(HeaderCheckboxComp);
