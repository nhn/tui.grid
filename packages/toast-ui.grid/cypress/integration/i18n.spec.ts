import i18n from '@/i18n';

describe('i18n', () => {
  it('when setting the locale code that the grid has already, the locale messages are set and changed.', () => {
    i18n.setLanguage('en');
    expect(i18n.get('display.noData')).to.eql('No data.');

    i18n.setLanguage('ko');
    expect(i18n.get('display.noData')).to.eql('데이터가 존재하지 않습니다.');
  });

  it('when setting the locale code that the grid does not have, the error is thrown.', () => {
    /* eslint-disable-next-line require-jsdoc */
    function setLocaleCodeWithNoMessage() {
      i18n.setLanguage('fr');
    }
    /* eslint-disable-next-line dot-notation */
    expect(setLocaleCodeWithNoMessage).to.throw();
  });

  it('when setting messages for the existing locale code, the locale messages are changed.', () => {
    i18n.setLanguage('en', {
      display: {
        noData: 'empty',
      },
    });
    expect(i18n.get('display.noData')).to.eql('empty');
  });

  it('when setting messages for the new locale code, the locale messages are set and changed.', () => {
    i18n.setLanguage('fr', {
      display: {
        noData: 'empty2',
      },
    });
    expect(i18n.get('display.noData')).to.eql('empty2');
  });
});
