import { CellEditor, CellEditorProps, CheckboxOptions } from './types';
import { CellValue, ListItem } from '../store/types';
import { getListItems } from '../helper/editor';
import { cls, hasClass } from '../helper/dom';
import { getKeyStrokeString } from '../helper/keyboard';
import { findPropIndex, includes } from '../helper/common';

const WRAPPER_CLASSNAME = cls('editor-checkbox-wrapper');
const LIST_ITEM_CLASSNAME = cls('editor-checkbox');
const HOVERED_LIST_ITEM_CLASSNAME = `${cls('editor-checkbox-hovered')} ${LIST_ITEM_CLASSNAME}`;
const UNCHECKED_RADIO_LABEL_CLASSNAME = cls('editor-label-icon-radio');
const CHECKED_RADIO_LABEL_CLASSNAME = cls('editor-label-icon-radio-checked');
const UNCHECKED_CHECKBOX_LABEL_CLASSNAME = cls('editor-label-icon-checkbox');
const CHECKED_CHECKBOX_LABEL_CLASSNAME = `${cls('editor-label-icon-checkbox-checked')}`;

interface InputElement {
  labelId: string;
  input: HTMLInputElement;
}

export class CheckboxEditor implements CellEditor {
  public el: HTMLElement;

  private wrapper: HTMLUListElement;

  private readonly inputType: 'checkbox' | 'radio';

  private hoveredItemId = '';

  private inputElements: InputElement[] = [];

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

  private createWrapper(listItems: ListItem[], width: number) {
    const wrapper = document.createElement('ul');
    wrapper.className = WRAPPER_CLASSNAME;
    wrapper.style.minWidth = `${width - 10}px`;

    listItems.forEach(({ text, value }) => {
      const listItemEl = document.createElement('li');

      listItemEl.className = LIST_ITEM_CLASSNAME;
      listItemEl.appendChild(this.createCheckboxLabel(value, text));

      wrapper.appendChild(listItemEl);
    });

    wrapper.addEventListener('change', this.onChange);
    wrapper.addEventListener('mouseover', this.onMouseover);
    wrapper.addEventListener('keydown', this.onKeydown);

    return wrapper;
  }

  private createCheckboxLabel(value: CellValue, text: string) {
    const input = document.createElement('input');
    const label = document.createElement('label');
    const span = document.createElement('span');
    const labelId = `checkbox-${value}`;

    label.id = labelId;
    label.className =
      this.inputType === 'radio'
        ? UNCHECKED_RADIO_LABEL_CLASSNAME
        : UNCHECKED_CHECKBOX_LABEL_CLASSNAME;

    input.type = this.inputType;
    input.name = 'checkbox';
    input.value = String(value);

    span.innerText = text;

    this.inputElements.push({ labelId, input });

    label.appendChild(input);
    label.appendChild(span);

    return label;
  }

  private getLabelId = (target: HTMLElement) => {
    const targetId = target.id;
    return targetId ? targetId : target.parentElement!.id;
  };

  private onMouseover = (ev: MouseEvent) => {
    const targetId = this.getLabelId(ev.target as HTMLElement);
    this.highlightItem(targetId);
  };

  private onChange = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    this.setLabelClass(value);
    this.highlightItem(`checkbox-${value}`);
  };

  private isArrowKey = (keyName: string) => {
    return includes(['up', 'down', 'left', 'right'], keyName);
  };

  private onKeydown = (ev: KeyboardEvent) => {
    const keyName = getKeyStrokeString(ev);
    if (this.isArrowKey(keyName)) {
      ev.preventDefault();
      const elementIdx = findPropIndex('labelId', this.hoveredItemId, this.inputElements);
      const elementLen = this.inputElements.length;
      const offset = elementLen + (keyName === 'down' || keyName === 'right' ? 1 : -1);
      const { labelId } = this.inputElements[(elementIdx + offset) % elementLen];

      this.highlightItem(labelId);
    }
  };

  private highlightItem = (targetId: string) => {
    if (targetId.length) {
      if (this.hoveredItemId) {
        this.el.querySelector(
          `#${this.hoveredItemId}`
        )!.parentElement!.className = LIST_ITEM_CLASSNAME;
      }

      const label = this.el.querySelector(`#${targetId}`) as HTMLLabelElement;
      label.parentElement!.className = HOVERED_LIST_ITEM_CLASSNAME;
      label.querySelector('input')!.focus();
      this.hoveredItemId = targetId;
    }
  };

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

  private getFirstInput() {
    const checkedInput = this.el.querySelector('input:checked') as HTMLInputElement | null;
    return checkedInput ? checkedInput : this.el.querySelector('input');
  }

  public getElement() {
    return this.el;
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
      this.highlightItem(`checkbox-${firstInput.value}`);
    }
  }

  public beforeDestroy() {
    this.wrapper.removeEventListener('change', this.onChange);
    this.wrapper.removeEventListener('mouseover', this.onMouseover);
  }
}
