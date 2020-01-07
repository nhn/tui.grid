import { Params, ContentType, AjaxConfig, Serializer } from './types';
import { serialize } from './helper/serializer';
import { EventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { Dictionary } from '../store/types';
import { isObject, isFunction } from '../helper/common';

type CallbackFunction = (...args: any[]) => void;

type Options = {
  method: string;
  url: string;
  params?: Params;
  success?: CallbackFunction;
  preCallback?: CallbackFunction;
  postCallback?: CallbackFunction;
  eventBus: EventBus;
} & AjaxConfig;

const ENCODED_SPACE_REGEXP = /%20/g;
const QS_DELIM_REGEXP = /\?/;

export default class GridAjax {
  private method: string;

  private url: string;

  private params: Params;

  private success: Function;

  private preCallback: Function;

  private postCallback: Function;

  private eventBus: EventBus;

  private xhr: XMLHttpRequest;

  private contentType: ContentType;

  private withCredentials: boolean;

  private headers?: Dictionary<string>;

  private mimeType?: string;

  private serializer?: Serializer;

  public constructor(options: Options) {
    const {
      method,
      url,
      params = {},
      success = () => {},
      preCallback = () => {},
      postCallback = () => {},
      eventBus,
      contentType = 'application/x-www-form-urlencoded',
      withCredentials = false,
      mimeType,
      headers,
      serializer
    } = options;

    this.method = method.toUpperCase();
    this.url = url;
    this.params = params;
    this.success = success;
    this.preCallback = preCallback;
    this.postCallback = postCallback;
    this.eventBus = eventBus;
    this.contentType = contentType;
    this.withCredentials = withCredentials;
    this.headers = headers;
    this.mimeType = mimeType;
    this.serializer = serializer;

    this.xhr = new XMLHttpRequest();
  }

  private hasRequestBody = () => {
    return /^(?:POST|PUT|PATCH)$/.test(this.method);
  };

  private handleReadyStateChange = () => {
    const { xhr, success, eventBus, preCallback, postCallback } = this;
    if (xhr.readyState !== XMLHttpRequest.DONE) {
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
      } else if (!response.result) {
        /**
         * Occurs after the response event, if the result is false
         * @event Grid#failResponse
         * @type {module:event/gridEvent}
         * @property {XmlHttpRequest} xhr - XmlHttpRequest
         * @property {Grid} instance - Current grid instance
         */
        eventBus.trigger('failResponse', gridEvent);
      }

      if (gridEvent.isStopped()) {
        return;
      }
      success(response);
    } else {
      /**
       * Occurs after the response event, if the response is Error
       * @event Grid#errorResponse
       * @type {module:event/gridEvent}
       * @property {XmlHttpRequest} xhr - XmlHttpRequest
       * @property {Grid} instance - Current grid instance
       */
      eventBus.trigger('errorResponse', gridEvent);
    }
    postCallback();
  };

  private applyConfig = () => {
    const { xhr, contentType, mimeType, withCredentials, headers } = this;
    // set withCredentials
    xhr.withCredentials = withCredentials;

    // overide MIME type
    if (mimeType) {
      xhr.overrideMimeType(mimeType);
    }

    // set user defined request headers
    if (isObject(headers)) {
      Object.keys(headers).forEach(name => {
        if (headers[name]) {
          xhr.setRequestHeader(name, headers[name]);
        }
      });
    }

    // set 'x-requested-with' header to prevent CSRF in old browser
    xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', `${contentType}; charset=UTF-8`);
  };

  private getSerialized = () => {
    return isFunction(this.serializer) ? this.serializer(this.params) : serialize(this.params);
  };

  public open() {
    const {
      xhr,
      url,
      method,
      getSerialized,
      hasRequestBody,
      applyConfig,
      handleReadyStateChange
    } = this;

    let requestUrl = url;

    if (!hasRequestBody()) {
      // serialize query string
      const serialized = getSerialized();
      const qs = (QS_DELIM_REGEXP.test(url) ? '&' : '?') + serialized;
      requestUrl = `${url}${qs}`;
    }

    xhr.open(method, requestUrl);
    applyConfig();
    xhr.onreadystatechange = handleReadyStateChange;
  }

  public send() {
    const { xhr, hasRequestBody, getSerialized, eventBus, preCallback, contentType, params } = this;
    const gridEvent = new GridEvent({ xhr });
    /**
     * Occurs before the http request is sent
     * @event Grid#beforeRequest
     * @type {module:event/gridEvent}
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('beforeRequest', gridEvent);
    if (gridEvent.isStopped()) {
      preCallback();
      return;
    }

    let body = null;
    if (hasRequestBody()) {
      // The space character '%20' is replaced to '+', because application/x-www-form-urlencoded follows rfc-1866
      body =
        contentType.indexOf('application/x-www-form-urlencoded') !== -1
          ? getSerialized().replace(ENCODED_SPACE_REGEXP, '+')
          : JSON.stringify(params);
    }
    xhr.send(body);
  }
}
