import { Params, AjaxConfig, Serializer } from '../../../types/dataSource';
import { serialize } from './serializer';
import { EventBus } from '../../event/eventBus';
import GridEvent from '../../event/gridEvent';
import { isObject, isFunction } from '../../helper/common';

type CallbackFunction = (...args: any[]) => void;
type Options = {
  method: string;
  url: string;
  success: CallbackFunction;
  preCallback: CallbackFunction;
  postCallback: CallbackFunction;
  eventBus: EventBus;
  params?: Params;
} & AjaxConfig;
type AjaxProcessFunction = (xhr: XMLHttpRequest, options: Options) => void;

const ENCODED_SPACE_REGEXP = /%20/g;
const QS_DELIM_REGEXP = /\?/;

function hasRequestBody(method: string) {
  return /^(?:POST|PUT|PATCH)$/.test(method.toUpperCase());
}

function getSerialized(params: Params, serializer?: Serializer) {
  return isFunction(serializer) ? serializer(params) : serialize(params);
}

function handleReadyStateChange(xhr: XMLHttpRequest, options: Options) {
  const { eventBus, success, preCallback, postCallback } = options;

  // eslint-disable-next-line eqeqeq
  if (xhr.readyState != XMLHttpRequest.DONE) {
    return;
  }

  preCallback();
  const gridEvent = new GridEvent({ xhr });
  /**
   * Occurs when the response is received from the server
   * @event Grid#response
   * @type {module:event/gridEvent}
   * @property {XmlHttpRequest} xhr - XmlHttpRequest
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('response', gridEvent);

  if (gridEvent.isStopped()) {
    return;
  }

  if (xhr.status === 200) {
    const response = JSON.parse(xhr.responseText);
    if (response.result) {
      /**
       * Occurs after the response event, if the result is true
       * @event Grid#successResponse
       * @type {module:event/gridEvent}
       * @property {XmlHttpRequest} xhr - XmlHttpRequest
       * @property {Grid} instance - Current grid instance
       */
      eventBus.trigger('successResponse', gridEvent);

      if (gridEvent.isStopped()) {
        return;
      }

      success(response);
    } else if (!response.result) {
      /**
       * Occurs after the response event, if the result is false
       * @event Grid#failResponse
       * @type {module:event/gridEvent}
       * @property {XmlHttpRequest} xhr - XmlHttpRequest
       * @property {Grid} instance - Current grid instance
       */
      eventBus.trigger('failResponse', gridEvent);

      if (gridEvent.isStopped()) {
        return;
      }
    }
  } else {
    /**
     * Occurs after the response event, if the response is Error
     * @event Grid#errorResponse
     * @type {module:event/gridEvent}
     * @property {XmlHttpRequest} xhr - XmlHttpRequest
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('errorResponse', gridEvent);

    if (gridEvent.isStopped()) {
      return;
    }
  }
  postCallback();
}

function open(xhr: XMLHttpRequest, options: Options) {
  const { url, method, serializer, params = {} } = options;

  let requestUrl = url;

  if (!hasRequestBody(method)) {
    // serialize query string
    const qs = (QS_DELIM_REGEXP.test(url) ? '&' : '?') + getSerialized(params, serializer);
    requestUrl = `${url}${qs}`;
  }

  xhr.open(method, requestUrl);
}

function applyConfig(xhr: XMLHttpRequest, options: Options) {
  const { method, contentType, mimeType, headers, withCredentials = false } = options;
  // set withCredentials
  xhr.withCredentials = withCredentials;

  // overide MIME type
  if (mimeType) {
    xhr.overrideMimeType(mimeType);
  }

  // set user defined request headers
  if (isObject(headers)) {
    Object.keys(headers).forEach((name) => {
      if (headers[name]) {
        xhr.setRequestHeader(name, headers[name]);
      }
    });
  }

  // set 'Content-Type' when request has body
  if (hasRequestBody(method)) {
    xhr.setRequestHeader('Content-Type', `${contentType}; charset=UTF-8`);
  }

  // set 'x-requested-with' header to prevent CSRF in old browser
  xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
}

function send(xhr: XMLHttpRequest, options: Options) {
  const {
    method,
    eventBus,
    serializer,
    preCallback,
    params = {},
    contentType = 'application/x-www-form-urlencoded',
  } = options;

  let body = null;

  if (hasRequestBody(method)) {
    // The space character '%20' is replaced to '+', because application/x-www-form-urlencoded follows rfc-1866
    body =
      contentType.indexOf('application/x-www-form-urlencoded') !== -1
        ? getSerialized(params, serializer).replace(ENCODED_SPACE_REGEXP, '+')
        : JSON.stringify(params);
  }

  xhr.onreadystatechange = () => handleReadyStateChange(xhr, options);

  const gridEvent = new GridEvent({ xhr });
  /**
   * Occurs before the http request is sent
   * @event Grid#beforeRequest
   * @type {module:event/gridEvent}
   * @property {XMLHttpRequest} xhr - Current XMLHttpRequest instance
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('beforeRequest', gridEvent);
  if (gridEvent.isStopped()) {
    preCallback();
    return;
  }

  xhr.send(body);
}

export function gridAjax(options: Options) {
  const xhr = new XMLHttpRequest();
  [open, applyConfig, send].forEach((fn: AjaxProcessFunction) => fn(xhr, options));
}
