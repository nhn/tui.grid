import { CellEditor, CellEditorProps, CheckboxOptions } from './types';
import { CellValue } from '../store/types';
import { getListItems } from '../helper/editor';
import { cls, hasClass } from '../helper/dom';

const NAME = 'tui-grid-check-input';
const classNameMap = {
  WRAPPER: cls('editor-checkbox-wrapper'),
  LIST_ITEM: cls('editor-checkbox'),
  UNCHECKED_RADIO_LABEL: cls('editor-label-icon-radio'),
  CHECKED_RADIO_LABEL: cls('editor-label-icon-radio-checked'),
  UNCHECKED_CHECKBOX_LABEL: cls('editor-label-icon-checkbox'),
  CHECKED_CHECKBOX_LABEL: cls('editor-label-icon-checkbox-checked')
};

export class CheckboxEditor implements CellEditor {
  public el: HTMLElement;

  private readonly inputType: 'checkbox' | 'radio';

  public constructor(props: CellEditorProps) {
    const { columnInfo, width } = props;
    const el = document.createElement('div');
    el.className = cls('editor-layer-inner');

    const wrapper = document.createElement('ul');
    wrapper.className = classNameMap.WRAPPER;
    wrapper.style.width = `${width - 15}px`;

    const { type } = columnInfo.editor!.options as CheckboxOptions;
    this.inputType = type;

    getListItems(props).forEach(({ text, value }) => {
      const id = `${NAME}-${value}`;
      const listItemEl = document.createElement('li');

      listItemEl.className = classNameMap.LIST_ITEM;
      listItemEl.appendChild(this.createCheckboxLabel(value, id, text, width));

      wrapper.appendChild(listItemEl);
    });

    el.appendChild(wrapper);
    this.el = el;
    this.setValue(props.value);
  }

  private onChangeInput = (ev: Event) => {
    this.setLabelClass((ev.target as HTMLInputElement).value);
  };

  private createCheckboxLabel(value: CellValue, id: string, text: string, width: number) {
    const input = document.createElement('input');
    const label = document.createElement('label');
    const span = document.createElement('span');

    label.setAttribute('for', id);
    label.className =
      this.inputType === 'radio'
        ? classNameMap.UNCHECKED_RADIO_LABEL
        : cls('editor-label-icon-checkbox');

    input.type = this.inputType;
    input.id = id;
    input.name = NAME;
    input.value = String(value);
    input.setAttribute('data-value-type', 'string');

    span.innerText = text;
    span.style.width = `${width - 50}px`;

    label.appendChild(input);
    label.appendChild(span);
    input.addEventListener('change', this.onChangeInput);

    return label;
  }

  private getFirstInput() {
    return this.el.querySelector('input');
  }

  public getElement() {
    return this.el;
  }

  private setLabelClass(inputValue: CellValue) {
    const label = this.el.querySelector(`label[for=${NAME}-${inputValue}]`) as HTMLLabelElement;
    if (this.inputType === 'checkbox') {
      label.className = hasClass(label, 'editor-label-icon-checkbox-checked')
        ? classNameMap.UNCHECKED_CHECKBOX_LABEL
        : classNameMap.CHECKED_CHECKBOX_LABEL;
    } else {
      const checkedLabel = this.el.querySelector(`.${classNameMap.CHECKED_RADIO_LABEL}`);
      if (checkedLabel) {
        checkedLabel.className = classNameMap.UNCHECKED_RADIO_LABEL;
      }

      label.className = classNameMap.CHECKED_RADIO_LABEL;
    }
  }

  private setValue(value: CellValue) {
    String(value)
      .split(',')
      .forEach(inputValue => {
        const input = this.el.querySelector(`input[value="${inputValue}"]`) as HTMLInputElement;
        if (input) {
          input.checked = true;
          this.setLabelClass(inputValue);
        }
      });
  }

  public getValue() {
    const checkedInputs = this.el.querySelectorAll('input:checked');
    const checkedValues = [];
    for (let i = 0, len = checkedInputs.length; i < len; i += 1) {
      checkedValues.push((checkedInputs[i] as HTMLInputElement).value);
    }

    return checkedValues.join(',');
  }

  public mounted() {
    const firstInput = this.getFirstInput();
    if (firstInput) {
      firstInput.focus();
    }
  }

  public beforeDestroy() {
    this.el.querySelector('input')!.removeEventListener('change', this.onChangeInput);
  }
}
