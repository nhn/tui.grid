import { OptI18nLanguage, OptI18nData } from '@t/options';

interface MapType<T> {
  [propName: string]: T;
}

type MessageMapType = MapType<string>;
type ReplacementObjType = MapType<string>;

const messages: OptI18nLanguage = {
  en: {
    display: {
      noData: 'No data.',
      loadingData: 'Loading data.',
      resizeHandleGuide:
        'You can change the width of the column by mouse drag, and initialize the width by double-clicking.',
    },
    net: {
      confirmCreate: 'Are you sure you want to create {{count}} data?',
      confirmUpdate: 'Are you sure you want to update {{count}} data?',
      confirmDelete: 'Are you sure you want to delete {{count}} data?',
      confirmModify: 'Are you sure you want to modify {{count}} data?',
      noDataToCreate: 'No data to create.',
      noDataToUpdate: 'No data to update.',
      noDataToDelete: 'No data to delete.',
      noDataToModify: 'No data to modify.',
      failResponse: 'An error occurred while requesting data.\nPlease try again.',
    },
    filter: {
      contains: 'Contains',
      eq: 'Equals',
      ne: 'Not equals',
      start: 'Starts with',
      end: 'Ends with',
      after: 'After',
      afterEq: 'After or Equal',
      before: 'Before',
      beforeEq: 'Before or Equal',
      apply: 'Apply',
      clear: 'Clear',
      selectAll: 'Select All',
      emptyValue: 'Empty Value',
    },
    contextMenu: {
      copy: 'Copy',
      copyColumns: 'Copy Columns',
      copyRows: 'Copy Rows',
      export: 'Export',
      csvExport: 'CSV Export',
      excelExport: 'Excel Export',
    },
  },
  pt: {
    display: {
      noData: 'Nenhuma informação.',
      loadingData: 'Carregando informações.',
      resizeHandleGuide:
        'Você pode alterar a largura da coluna arrastando o mouse e inicializar a largura clicando duas vezes.',
    },
    net: {
      confirmCreate: 'Tem certeza que deseja criar {{count}} dados?',
      confirmUpdate: 'Tem ceretza que deseja atualizar {{count}} dados?',
      confirmDelete: 'Tem certeza que deseja apagar {{count}} dados?',
      confirmModify: 'Tem certeza que deseja modificar {{count}} dados?',
      noDataToCreate: 'Não há informação a criar.',
      noDataToUpdate: 'Não há informação a atualizar.',
      noDataToDelete: 'Não há informação a apagar.',
      noDataToModify: 'Não há informação a modificar.',
      failResponse: 'Um erro ocorreu euquanto processava sua solicitação.\nPor favor, tente novamente.',
    },
    filter: {
      contains: 'Contém',
      eq: 'Igual',
      ne: 'Diferente de',
      start: 'Começa com',
      end: 'Termina com',
      after: 'Depois',
      afterEq: 'Depois ou igual',
      before: 'Antes',
      beforeEq: 'Antes ou igual',
      apply: 'Aplicar',
      clear: 'Limpar',
      selectAll: 'Selecionar tudo',
      emptyValue: 'Está vazio',
    },
    contextMenu: {
      copy: 'Copiar',
      copyColumns: 'Copiar colunas',
      copyRows: 'Copiar linhas',
      export: 'Exportar',
      csvExport: 'Exportar CSV',
      excelExport: 'Exportar Excel',
    },
  },
  es: {
    display: {
      noData: 'No hay información.',
      loadingData: 'Cargando información.',
      resizeHandleGuide:
        'Puedes cambiar el ancho de la columna arrastrando el ratón e inicializar el ancho haciendo doble clic.',
    },
    net: {
      confirmCreate: '¿Estás seguro que quieres crear {{count}} filas?',
      confirmUpdate: '¿Estás seguro que quieres actualizar {{count}} filas?',
      confirmDelete: '¿Estás seguro que quieres eliminar {{count}} filas?',
      confirmModify: '¿Estás seguro que quieres modificar {{count}} filas?',
      noDataToCreate: 'No hay información para crear.',
      noDataToUpdate: 'No hay información para actualizar.',
      noDataToDelete: 'No hay información para eliminar.',
      noDataToModify: 'No hay información para modificar.',
      failResponse: 'Se produjo un error al solicitar datos. \nVuelve a intentarlo.',
    },
    filter: {
      contains: 'Contiene',
      eq: 'Igual',
      ne: 'Distinto',
      start: 'Empieza con',
      end: 'Termina en',
      after: 'Después',
      afterEq: 'Después o Igual',
      before: 'Antes',
      beforeEq: 'Antes o Igual',
      apply: 'Aplicar',
      clear: 'Limpiar',
      selectAll: 'Seleccionar Todo',
      emptyValue: 'Vaciar Valor',
    },
    contextMenu: {
      copy: 'Copiar',
      copyColumns: 'Copiar Columnas',
      copyRows: 'Copiar Filas',
      export: 'exportar',
      csvExport: 'CSV exportar',
      excelExport: 'Excel exportar',
    },
  },
  ko: {
    display: {
      noData: '데이터가 존재하지 않습니다.',
      loadingData: '데이터를 불러오는 중입니다.',
      resizeHandleGuide:
        '마우스 드래그하여 컬럼 너비를 조정할 수 있고, 더블 클릭으로 컬럼 너비를 초기화할 수 있습니다.',
    },
    net: {
      confirmCreate: '{{count}}건의 데이터를 생성하겠습니까?',
      confirmUpdate: '{{count}}건의 데이터를 수정하겠습니까?',
      confirmDelete: '{{count}}건의 데이터를 삭제하겠습니까?',
      confirmModify: '{{count}}건의 데이터를 처리하겠습니까?',
      noDataToCreate: '생성할 데이터가 없습니다.',
      noDataToUpdate: '수정할 데이터가 없습니다.',
      noDataToDelete: '삭제할 데이터가 없습니다.',
      noDataToModify: '처리할 데이터가 없습니다.',
      failResponse: '데이터 요청 중에 에러가 발생하였습니다.\n다시 시도하여 주시기 바랍니다.',
    },
    filter: {
      contains: 'Contains',
      eq: 'Equals',
      ne: 'Not equals',
      start: 'Starts with',
      end: 'Ends with',
      after: 'After',
      afterEq: 'After or Equal',
      before: 'Before',
      beforeEq: 'Before or Equal',
      apply: 'Apply',
      clear: 'Clear',
      selectAll: 'Select All',
      emptyValue: 'Empty Value',
    },
    contextMenu: {
      copy: '복사',
      copyColumns: '열 복사',
      copyRows: '행 복사',
      export: '내보내기',
      csvExport: 'CSV로 내보내기',
      excelExport: '엑셀로 내보내기',
    },
  },
};

let messageMap: MessageMapType = {};

/**
 * Flatten message map
 * @param {object} data - Messages
 * @returns {object} Flatten message object (key format is 'key.subKey')
 * @ignore
 */
function flattenMessageMap(data: OptI18nData = {}): MessageMapType {
  type KeyType = keyof OptI18nData;

  const obj: MessageMapType = {};
  let newKey: string;

  Object.keys(data).forEach((key) => {
    const keyWithType = key as KeyType;
    const groupMessages = data[keyWithType] as MessageMapType;

    Object.keys(groupMessages).forEach((subKey) => {
      newKey = `${key}.${subKey}`;
      obj[newKey] = groupMessages[subKey];
    });
  });

  return obj;
}

/**
 * Replace text
 * @param {string} text - Text including handlebar expression
 * @param {Object} values - Replaced values
 * @returns {string} Replaced text
 */
function replaceText(text: string, values: ReplacementObjType): string {
  return text
    ? text.replace(/\{\{(\w*)\}\}/g, (_, prop) => (values.hasOwnProperty(prop) ? values[prop] : ''))
    : '';
}

export default {
  /**
   * Set messages
   * @param {string} localeCode - Code to set locale messages and
   *     this is the language or language-region combination. (ex: en-US)
   * @param {object} [data] - Messages using in Grid
   */
  setLanguage(localeCode: string, data?: OptI18nData) {
    const localeMessages = messages[localeCode];

    if (!localeMessages && !data) {
      throw new Error('You should set messages to map the locale code.');
    }

    const newData = flattenMessageMap(data);

    if (localeMessages) {
      const originData = flattenMessageMap(localeMessages);
      messageMap = { ...originData, ...newData };
    } else {
      messageMap = newData;
    }
  },

  /**
   * Get message
   * @param {string} key - Key to find message (ex: 'net.confirmCreate')
   * @param {object} [replacements] - Values to replace string
   * @returns {string} Message
   */
  get(key: string, replacements: ReplacementObjType = {}) {
    const message = messageMap[key];

    return replaceText(message, replacements);
  },
};

