import { OptI18nData, OptI18nLanguage } from '@t/options';

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
      txtExport: 'Text Export',
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
      failResponse:
        'Um erro ocorreu euquanto processava sua solicitação.\nPor favor, tente novamente.',
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
      txtExport: 'Exportar Texto',
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
      txtExport: 'Texto exportar',
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
      txtExport: 'Text로 내보내기',
      csvExport: 'CSV로 내보내기',
      excelExport: '엑셀로 내보내기',
    },
  },
  nl: {
    display: {
      noData: 'Geen data.',
      loadingData: 'Data aan het laden.',
      resizeHandleGuide:
        'Je kunt de kolombreedte verschuiven met de muis, of terugbrengen naar standaard door dubbel te klikken',
    },
    net: {
      confirmCreate: 'Weet je zeker dat je {{count}} nieuwe wilt maken?',
      confirmUpdate: 'Weet je zeker dat je {{count}} stuk(s) wilt bijwerken?',
      confirmDelete: 'Weet je zeker dat je {{count}} stuk(s) wilt verwijderen?',
      confirmModify: 'Weet je zeker dat je {{count}} stuk(s) wilt aanpassen?',
      noDataToCreate: 'Niets om aan te maken.',
      noDataToUpdate: 'Niets om bij te werken.',
      noDataToDelete: 'Niets om te verwijderen.',
      noDataToModify: 'Niets om aan te passen.',
      failResponse: 'Er ging iets mis tijdens het ophalen van de data.\nProbeer het nog eens.',
    },
    filter: {
      contains: 'Bevat',
      eq: 'Is',
      ne: 'Is niet',
      start: 'Begint met',
      end: 'Eindigt met',
      after: 'Na',
      afterEq: 'Na of gelijk aan',
      before: 'Voor',
      beforeEq: 'Voor of gelijk aan',
      apply: 'Toepassen',
      clear: 'Leeg maken',
      selectAll: 'Selecteer alle',
      emptyValue: 'Lege waarde',
    },
    contextMenu: {
      copy: 'Kopieer',
      copyColumns: 'Kopieer kolommen',
      copyRows: 'Kopieer rijen',
      export: 'Exporteer',
      txtExport: 'Maak Tekst Export',
      csvExport: 'Maak CSV Export',
      excelExport: 'Maak Excel Export',
    },
  },
  it: {
    display: {
      noData: 'Nessun dato.',
      loadingData: 'Caricamento dati.',
      resizeHandleGuide:
        'È possibile modificare la larghezza della colonna trascinando il mouse e inizializzare la larghezza facendo doppio clic.',
    },
    net: {
      confirmCreate: 'Sei sicuro di voler creare {{count}} dati?',
      confirmUpdate: 'Sei sicuro di voler aggiornare {{count}} dati?',
      confirmDelete: 'Sei sicuro di voler eliminare {{count}} dati?',
      confirmModify: 'Sei sicuro di voler modificare {{count}} dati?',
      noDataToCreate: 'Nessun dato da creare.',
      noDataToUpdate: 'Nessun dato da aggiornare.',
      noDataToDelete: 'Nessun dato da eliminare.',
      noDataToModify: 'Nessun dato da modificare.',
      failResponse: 'Si è verificato un errore durante la richiesta dei dati.\nPer favore riprova.',
    },
    filter: {
      contains: 'Contiene',
      eq: 'Uguale',
      ne: 'Non è uguale',
      start: 'Inizia con',
      end: 'Finisce con',
      after: 'Dopo',
      afterEq: 'Dopo o Uguale',
      before: 'Prima',
      beforeEq: 'Prima o Uguale',
      apply: 'Applicare',
      clear: 'Chiari',
      selectAll: 'Seleziona tutto',
      emptyValue: 'Valore vuoto',
    },
    contextMenu: {
      copy: 'Copia',
      copyColumns: 'Copia colonne',
      copyRows: 'Copia righe',
      export: 'Esportare',
      txtExport: 'Esportazione Testo',
      csvExport: 'Esportazione CSV',
      excelExport: 'Esportazione Excel',
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
