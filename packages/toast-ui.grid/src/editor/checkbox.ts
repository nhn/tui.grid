import { CellEditor, CellEditorProps, CheckboxOptions } from './types';
import { CellValue } from '../store/types';
import { getListItems } from '../helper/editor';

export class CheckboxEditor implements CellEditor {
  public el: HTMLElement;

  public constructor(props: CellEditorProps) {
    const name = 'tui-grid-check-input';
    const el = document.createElement('fieldset');
    const { type } = props.columnInfo.editor!.options as CheckboxOptions;
    const listItems = getListItems(props);

    listItems.forEach(({ text, value }) => {
      const id = `${name}-${value}`;
      el.appendChild(this.createCheckbox(value, name, id, type));
      el.appendChild(this.createLabel(text, id));
    });
    this.el = el;

    this.setValue(props.value);
  }

  private createLabel(text: string, id: string) {
    const label = document.createElement('label');
    label.innerText = text;
    label.setAttribute('for', id);

    return label;
  }

  private createCheckbox(
    value: CellValue,
    name: string,
    id: string,
    inputType: 'checkbox' | 'radio'
  ) {
    const input = document.createElement('input');

    input.type = inputType;
    input.id = id;
    input.name = name;
    input.value = String(value);
    input.setAttribute('data-value-type', 'string');

    return input;
  }

  private getFirstInput() {
    return this.el.querySelector('input');
  }

  public getElement() {
    return this.el;
  }

  private setValue(value: CellValue) {
    String(value)
      .split(',')
      .forEach(inputValue => {
        const input = this.el.querySelector(`input[value="${inputValue}"]`) as HTMLInputElement;
        if (input) {
          input.checked = true;
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
}
