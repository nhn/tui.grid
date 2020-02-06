import { CellEditor, CellEditorProps, CheckboxOptions } from './types';
import { CellValue, ListItem } from '../store/types';
import { getListItems } from '../helper/editor';
import { cls, hasClass } from '../helper/dom';

const WRAPPER_CLASSNAME = cls('editor-checkbox-wrapper');
const LIST_ITEM_CLASSNAME = cls('editor-checkbox');
const UNCHECKED_RADIO_LABEL_CLASSNAME = cls('editor-label-icon-radio');
const CHECKED_RADIO_LABEL_CLASSNAME = cls('editor-label-icon-radio-checked');
const UNCHECKED_CHECKBOX_LABEL_CLASSNAME = cls('editor-label-icon-checkbox');
const CHECKED_CHECKBOX_LABEL_CLASSNAME = cls('editor-label-icon-checkbox-checked');

export class CheckboxEditor implements CellEditor {
  public el: HTMLElement;

  private wrapper: HTMLUListElement;

  private readonly inputType: 'checkbox' | 'radio';

  public constructor(props: CellEditorProps) {
    const { columnInfo, width } = props;
    const el = document.createElement('div');
    el.className = cls('editor-layer-inner');

    const { type } = columnInfo.editor!.options as CheckboxOptions;
    this.inputType = type;

    const listItems = getListItems(props);
    const wrapper = this.createWrapper(listItems, width);
    el.appendChild(wrapper);

    this.el = el;
    this.wrapper = wrapper;
    this.setValue(props.value);
  }

  private onChangeInput = (ev: Event) => {
    this.setLabelClass((ev.target as HTMLInputElement).value);
  };

  private createWrapper(listItems: ListItem[], width: number) {
    const wrapper = document.createElement('ul');
    wrapper.className = WRAPPER_CLASSNAME;
    wrapper.style.minWidth = `${width - 15}px`;

    listItems.forEach(({ text, value }) => {
      const listItemEl = document.createElement('li');

      listItemEl.className = LIST_ITEM_CLASSNAME;
      listItemEl.appendChild(this.createCheckboxLabel(value, text));

      wrapper.appendChild(listItemEl);
    });

    wrapper.addEventListener('change', this.onChangeInput);

    return wrapper;
  }

  private createCheckboxLabel(value: CellValue, text: string) {
    const input = document.createElement('input');
    const label = document.createElement('label');
    const span = document.createElement('span');

    label.id = `checkbox-${value}`;
    label.className =
      this.inputType === 'radio'
        ? UNCHECKED_RADIO_LABEL_CLASSNAME
        : UNCHECKED_CHECKBOX_LABEL_CLASSNAME;

    input.type = this.inputType;
    input.name = 'checkbox';
    input.value = String(value);

    span.innerText = text;

    label.appendChild(input);
    label.appendChild(span);

    return label;
  }

  private getFirstInput() {
    return this.el.querySelector('input');
  }

  public getElement() {
    return this.el;
  }

  private setLabelClass(inputValue: CellValue) {
    const label = this.el.querySelector(`#checkbox-${inputValue}`) as HTMLLabelElement;
    if (this.inputType === 'checkbox') {
      label.className = hasClass(label, 'editor-label-icon-checkbox-checked')
        ? UNCHECKED_CHECKBOX_LABEL_CLASSNAME
        : CHECKED_CHECKBOX_LABEL_CLASSNAME;
    } else {
      const checkedLabel = this.el.querySelector(`.${CHECKED_RADIO_LABEL_CLASSNAME}`);
      if (checkedLabel) {
        checkedLabel.className = UNCHECKED_RADIO_LABEL_CLASSNAME;
      }

      label.className = CHECKED_RADIO_LABEL_CLASSNAME;
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
    this.wrapper.style.top = `${this.el.getBoundingClientRect().bottom}px`;
    const firstInput = this.getFirstInput();
    if (firstInput) {
      firstInput.focus();
    }
  }

  public beforeDestroy() {
    this.wrapper.removeEventListener('change', this.onChangeInput);
  }
}
