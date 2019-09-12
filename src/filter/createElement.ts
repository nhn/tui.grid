import { cls } from '../helper/dom';
import { CellValue, Dictionary } from '../store/types';

export function createInput(onKeyUp: EventHandlerNonNull, placeholder?: string) {
  const input = document.createElement('input');
  input.className = cls('filter-input');
  input.type = 'text';
  input.addEventListener('keyup', onKeyUp);
  if (placeholder) {
    input.placeholder = placeholder;
  }

  return input;
}

export function createListItem(text: CellValue) {
  if (!text) {
    return null;
  }

  const li = document.createElement('li');
  const input = document.createElement('input');
  const label = document.createElement('label');
  const span = document.createElement('span');

  //@TODO: li 선택 되었을 때 색칠 해줘야 함, 'filter-list-item-checked'
  li.className = cls('filter-list-item');
  const inputId = `${text}_checkbox`;
  input.type = 'checkbox';
  input.id = inputId;
  label.htmlFor = inputId;
  span.textContent = text.toString();
  li.appendChild(input);
  li.appendChild(label);
  li.appendChild(span);

  return li;
}

export function createSelect(item: Dictionary<string>) {
  const selectContainer = document.createElement('div');
  const select = document.createElement('select');

  selectContainer.className = cls('filter-dropdown');
  selectContainer.appendChild(select);

  Object.keys(item).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.text = item[key];
    select.appendChild(option);
  });

  return selectContainer;
}
