import { CellEditor } from './types';
import { CellValue } from '../store/types';

let currentId = 0;

function getNextId() {
  currentId += 1;

  return `tui-grid-input-${currentId}`;
}

export interface CheckboxOptions {
  type: 'checkbox' | 'radio';
  listItems: {
    text: string;
    value: CellValue;
  }[];
}

export class CheckboxEditor implements CellEditor {
  private el!: HTMLElement;

  public constructor(options: CheckboxOptions, value: CellValue) {
    const el = document.createElement('fieldset');

    const { listItems } = options;
    const name = getNextId();

    listItems.forEach((item) => {
      const id = `${name}-${item.value}`;
      el.appendChild(this.createCheckbox(item.value, name, id, options.type));
      el.appendChild(this.createLabel(item.text, id));
    });
    this.el = el;

    this.setValue(value);
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
      .forEach((inputValue) => {
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

  public start() {
    const firstInput = this.getFirstInput();
    if (firstInput) {
      firstInput.focus();
    }
  }
}
