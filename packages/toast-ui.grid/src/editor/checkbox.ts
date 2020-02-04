import { CellEditor, CellEditorProps, CheckboxOptions } from './types';
import { CellValue } from '../store/types';
import { getListItems } from '../helper/editor';
import { cls, hasClass } from '../helper/dom';

const ID_PREFIX = 'tui-grid-check-input';

export class CheckboxEditor implements CellEditor {
  public el: HTMLElement;

  private inputType: 'checkbox' | 'radio';

  public constructor(props: CellEditorProps) {
    const el = document.createElement('div');
    el.className = cls('editing-layer-inner');

    const wrapper = document.createElement('ul');
    wrapper.className = cls('editor-checkbox-wrapper');

    const { type } = props.columnInfo.editor!.options as CheckboxOptions;
    this.inputType = type;
    const listItems = getListItems(props);

    listItems.forEach(({ text, value }) => {
      const id = `${ID_PREFIX}-${value}`;
      const listItemEl = document.createElement('li');
      listItemEl.className = cls('editor-checkbox');
      listItemEl.appendChild(this.createCheckbox(value, ID_PREFIX, id, text));
      wrapper.appendChild(listItemEl);
    });

    el.appendChild(wrapper);

    this.el = el;
    this.setValue(props.value);
  }

  private onChangeInput = (ev: MouseEvent) => {
    this.setLabelClass((ev.target as HTMLInputElement).value);
  };

  private createCheckbox(value: CellValue, name: string, id: string, text: string) {
    const input = document.createElement('input');
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.className = cls(`editor-label-icon-${this.inputType}`);
    input.addEventListener('change', this.onChangeInput);

    input.type = this.inputType;
    input.id = id;
    input.name = name;
    input.value = String(value);
    input.setAttribute('data-value-type', 'string');

    const textEl = document.createElement('span');
    textEl.innerText = text;
    label.appendChild(input);
    label.appendChild(textEl);

    return label;
  }

  private getFirstInput() {
    return this.el.querySelector('input');
  }

  public getElement() {
    return this.el;
  }

  private setLabelClass(inputValue: CellValue) {
    const label = this.el.querySelector(
      `label[for=${ID_PREFIX}-${inputValue}]`
    ) as HTMLLabelElement;
    if (this.inputType === 'checkbox') {
      if (hasClass(label, 'editor-label-icon-checkbox-checked')) {
        label.className = cls('editor-label-icon-checkbox');
      } else {
        label.className = cls('editor-label-icon-checkbox-checked');
      }
    } else {
      const checkedLabel = this.el.querySelector(
        `.${cls('editor-label-icon-radio-checked')}`
      ) as HTMLLabelElement;

      if (checkedLabel) {
        checkedLabel.className = cls('editor-label-icon-radio');
      }

      label.className = cls('editor-label-icon-radio-checked');
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
    // @TODO: label element 이벤트 해제
    this.el.querySelector('input')!.removeEventListener('change', this.onChangeInput);
  }
}
