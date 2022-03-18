import { assertCurrentPage } from '../helper/assert';

export {};

const columns = [
  {
    name: 'default',
    editor: 'datePicker',
  },
  {
    name: 'timePicker',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy-MM-dd HH:mm A',
        timepicker: true,
      },
    },
  },
  {
    name: 'timePickerWithTab',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy-MM-dd HH:mm A',
        timepicker: {
          layoutType: 'tab',
          inputType: 'spinbox',
        },
      },
    },
  },
  {
    name: 'monthPicker',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy-MM',
        type: 'month',
        showIcon: false,
      },
    },
  },
  {
    name: 'yearPicker',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy',
        type: 'year',
      },
    },
  },
  {
    name: 'instantApply',
    editor: { type: 'datePicker', options: { instantApply: true } },
  },
];
const data = [
  {
    id: 549731,
    default: '2019-11-11',
    timePicker: '2019-11-11 11:11 AM',
    timePickerWithTab: '2019-11-11 11:11 AM',
    monthPicker: '2019-11',
    yearPicker: '2019',
    instantApply: '2019-11-11',
  },
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.createGrid({
    data,
    columns,
  });
});

describe('default datePicker', () => {
  it('Cell value is applied correctly in the datePicker.', () => {
    cy.getCell(0, 'default').should('have.text', '2019-11-11');

    cy.gridInstance().invoke('startEditing', 0, 'default');

    cy.get('.tui-calendar-title').should('have.text', 'November 2019');
    assertCurrentPage(11);

    cy.gridInstance().invoke('finishEditing');
  });

  it('select the date, the selected date is applied in the cell.', () => {
    cy.gridInstance().invoke('startEditing', 0, 'default');

    cy.get('.tui-calendar-date').contains('14').click();

    cy.gridInstance().invoke('finishEditing');

    cy.getCell(0, 'default').should('have.text', '2019-11-14');
  });
});

describe('timepicker', () => {
  it('use time picker to pick a time.', () => {
    cy.getCell(0, 'timePicker').should('have.text', '2019-11-11 11:11 AM');

    cy.gridInstance().invoke('startEditing', 0, 'timePicker');

    cy.get('.tui-timepicker-hour').get('select').eq(2).select('PM');
    cy.gridInstance().invoke('finishEditing');

    cy.getCell(0, 'timePicker').should('have.text', '2019-11-11 11:11 PM');
  });

  it('use time picker tab', () => {
    cy.getCell(0, 'timePickerWithTab').should('have.text', '2019-11-11 11:11 AM');

    cy.gridInstance().invoke('startEditing', 0, 'timePickerWithTab');

    cy.get('.tui-datepicker-selector-button').eq(1).click();
    cy.get('.tui-timepicker-btn-up').eq(1).click();

    cy.gridInstance().invoke('finishEditing');

    cy.getCell(0, 'timePickerWithTab').should('have.text', '2019-11-11 11:12 AM');
  });
});

describe('month picker', () => {
  it('You can choose the month, year excluding date.', () => {
    cy.getCell(0, 'monthPicker').should('have.text', '2019-11');

    cy.gridInstance().invoke('startEditing', 0, 'monthPicker');

    cy.get('.tui-calendar-month .tui-is-selectable').contains('Mar').click();

    cy.gridInstance().invoke('finishEditing');

    cy.getCell(0, 'monthPicker').should('have.text', '2019-03');
  });
});

describe('year picker', () => {
  it('You can only choose the year.', () => {
    cy.getCell(0, 'yearPicker').should('have.text', '2019');

    cy.gridInstance().invoke('startEditing', 0, 'yearPicker');

    cy.get('.tui-calendar-year .tui-is-selectable').contains('2020').click({ force: true });

    cy.gridInstance().invoke('finishEditing');

    cy.getCell(0, 'yearPicker').should('have.text', '2020');
  });
});

describe('show icon', () => {
  it("can't see the icon, when showIcon field false.", () => {
    cy.gridInstance().invoke('startEditing', 0, 'monthPicker');

    cy.getByCls('date-icon').should('not.exist');
  });
});

it('focus the editing cell when datepicker layer is closed', () => {
  cy.gridInstance().invoke('startEditing', 0, 'default');
  cy.focused().as('editingInput');
  cy.get('.tui-calendar-date').contains('14').click();

  cy.get('@editingInput').should('be.focused');
});

it('should apply selected value instantly when instantApply option is true', () => {
  cy.gridInstance().invoke('startEditing', 0, 'instantApply');
  cy.get('.tui-calendar-date').contains('14').click();

  cy.getCell(0, 'instantApply').should('have.text', '2019-11-14');
});
