import { Params } from './types';
import { encodeParams } from './helper/encoder';
import { EventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';

export interface Options {
  method: string;
  url: string;
  withCredentials: boolean;
  params?: Params;
  callback?: Function;
  callbackWhenever: Function;
  eventBus: EventBus;
}

export default class GridAjax {
  private method: string;

  private url: string;

  private params: Params;

  private callback: Function;

  private callbackWhenever: Function;

  private eventBus: EventBus;

  private xhr: XMLHttpRequest;

  public constructor(options: Options) {
    const {
      method,
      url,
      withCredentials,
      params = {},
      callback = () => {},
      callbackWhenever,
      eventBus
    } = options;

    this.method = method.toUpperCase();
    this.url = url;
    this.params = params;
    this.callback = callback;
    this.callbackWhenever = callbackWhenever;
    this.eventBus = eventBus;
    this.xhr = new XMLHttpRequest();
    this.xhr.withCredentials = withCredentials;
  }

  private shouldEncode = () => {
    return this.method === 'GET' || this.method === 'DELETE';
  };

  private handleReadyStateChange = () => {
    const { xhr, callback, eventBus, callbackWhenever } = this;
    if (xhr.readyState !== XMLHttpRequest.DONE) {
      return;
    }
    callbackWhenever();
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
      callback(response);
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
  };

  public open() {
    const { method, url, params, xhr, shouldEncode } = this;
    if (shouldEncode()) {
      xhr.open(method, `${url}?${encodeParams(params)}`);
    } else {
      xhr.open(method, url);
      // @TODO neeto to application/json content-type options and custom options(authorization, custom header etc..)
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoder');
    }
    xhr.onreadystatechange = this.handleReadyStateChange;
  }

  public send() {
    const { url, method, xhr, shouldEncode, eventBus, callbackWhenever } = this;
    const options = {
      url,
      method,
      withCredentials: xhr.withCredentials,
      params: this.params
    };
    const gridEvent = new GridEvent({ options });
    /**
     * Occurs before the http request is sent
     * @event Grid#beforeRequest
     * @type {module:event/gridEvent}
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('beforeRequest', gridEvent);
    if (gridEvent.isStopped()) {
      callbackWhenever();
      return;
    }
    const params = shouldEncode() ? null : encodeParams(this.params, true);
    xhr.send(params);
  }
}
