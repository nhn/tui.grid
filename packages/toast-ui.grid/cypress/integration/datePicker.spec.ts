import { cls } from '@/helper/dom';

const columns = [
  {
    name: 'default',
    editor: 'datePicker'
  },
  {
    name: 'timePicker',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy-MM-dd HH:mm A',
        timepicker: true
      }
    }
  },
  {
    name: 'timePickerWithTab',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy-MM-dd HH:mm A',
        timepicker: {
          layoutType: 'tab',
          inputType: 'spinbox'
        }
      }
    }
  },
  {
    name: 'monthPicker',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy-MM',
        type: 'month',
        showIcon: false
      }
    }
  },
  {
    name: 'yearPicker',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy',
        type: 'year'
      }
    }
  }
];
const data = [
  {
    id: 549731,
    default: '2019-11-11',
    timePicker: '2019-11-11 11:11 AM',
    timePickerWithTab: '2019-11-11 11:11 AM',
    monthPicker: '2019-11',
    yearPicker: '2019'
  }
];

before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });

  cy.createGrid({
    data,
    columns
  });
});

describe('default datePicker', () => {
  it('Cell value is applied correctly in the datePicker.', () => {
    cy.getCellContent(0, 'default').should('have.text', '2019-11-11');

    cy.getCell(0, 'default')
      .click()
      .trigger('dblclick');

    cy.get('.tui-calendar-title').should('have.text', 'November 2019');
    cy.get('.tui-is-selected').should('have.text', '11');
  });

  it('select the date, the selected date is applied in the cell.', () => {
    cy.getCell(0, 'default')
      .click()
      .trigger('dblclick');

    cy.get('.tui-calendar-date')
      .contains('14')
      .click();

    cy.getCell(0, 'timePicker').click();
    cy.getCellContent(0, 'default').should('have.text', '2019-11-14');
  });
});

describe('timepicker', () => {
  it('use time picker to pick a time.', () => {
    cy.getCellContent(0, 'timePicker').should('have.text', '2019-11-11 11:11 AM');

    cy.getCell(0, 'timePicker')
      .click()
      .trigger('dblclick');

    cy.get('.tui-timepicker-hour')
      .get('select')
      .eq(2)
      .select('PM');

    cy.getCell(0, 'default').click();
    cy.getCellContent(0, 'timePicker').should('have.text', '2019-11-11 11:11 PM');
  });

  it('use time picker tab', () => {
    cy.getCellContent(0, 'timePickerWithTab').should('have.text', '2019-11-11 11:11 AM');

    cy.getCell(0, 'timePickerWithTab')
      .click()
      .trigger('dblclick');
    cy.get('.tui-datepicker-selector-button')
      .eq(1)
      .click();

    cy.get('.tui-timepicker-btn-up')
      .eq(1)
      .click();
    cy.getCell(0, 'default').click();

    cy.getCellContent(0, 'timePickerWithTab').should('have.text', '2019-11-11 11:12 AM');
  });
});

describe('month picker', () => {
  it('You can choose the month, year excluding date.', () => {
    cy.getCellContent(0, 'monthPicker').should('have.text', '2019-11');

    cy.getCell(0, 'monthPicker')
      .click()
      .trigger('dblclick');

    cy.get('.tui-calendar-month')
      .contains('Mar')
      .click();
    cy.getCell(0, 'default').click();

    cy.getCellContent(0, 'monthPicker').should('have.text', '2019-03');
  });
});

describe('year picker', () => {
  it('You can only choose the year.', () => {
    cy.getCellContent(0, 'yearPicker').should('have.text', '2019');

    cy.getCell(0, 'yearPicker')
      .click()
      .trigger('dblclick');
    cy.get('.tui-calendar-year')
      .contains('2020')
      .click();
    cy.getCell(0, 'default').click();

    cy.getCellContent(0, 'yearPicker').should('have.text', '2020');
  });
});

describe('show icon', () => {
  it("can't see the icon, when showIcon field false.", () => {
    cy.getCell(0, 'default')
      .click()
      .trigger('dblclick');

    cy.get(`.${cls('date-icon')}`).should('visible');
    cy.get(`.${cls('layer-datepicker')} input`).should('have.class', cls('datepicker-input'));

    cy.getCell(0, 'monthPicker')
      .click()
      .trigger('dblclick');

    cy.get(`.${cls('date-icon')}`).should('not.visible');
    cy.get(`.${cls('layer-datepicker')} input`).should('have.class', cls('content-text'));
  });
});
