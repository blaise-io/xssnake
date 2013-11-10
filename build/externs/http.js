var http = {};

/**
 * @typedef {function(http.ServerRequest, http.ServerResponse)}
 */
http.requestListener;

/**
 * @param {http.requestListener=} listener
 * @return {http.Server}
 */
http.createServer = function(listener) {};

/**
@param {http.requestListener=} listener
 * @constructor
 * @extends {EventEmitter}
 */
http.Server = function(listener) {};

/**
 * @param {(number|string)} portOrPath port if it's a number; path if it's a
 * @param {(string|Function)=} hostnameOrCallback hostname if it's a string;
 * @param {Function=} callback
 */
http.Server.prototype.listen = function(
    portOrPath, hostnameOrCallback, callback) {};

/**
 */
http.Server.prototype.close = function() {};

/**
 * @constructor
 * @extends {EventEmitter}
 * @private
 */
http.ServerRequest = function() {};

/** @type {string} */
http.ServerRequest.prototype.method;

/**
 * would be: '/status?name=ryan' rather than
 * 'http://example.com/status?name=ryan'.
 * @type {string}
 */
http.ServerRequest.prototype.url;

/** @type {Object} */
http.ServerRequest.prototype.headers;

/** @type {Object} */
http.ServerRequest.prototype.trailers;

/**
 * @type {string}
 */
http.ServerRequest.prototype.httpVersion;

/**
 * @type {string}
 */
http.ServerRequest.prototype.httpVersionMajor;

/**
 * @type {string}
 */
http.ServerRequest.prototype.httpVersionMinor;

/**
 * @param {?string} encoding either 'utf8' or 'binary'. If null (the default),
 */
http.ServerRequest.prototype.setEncoding = function(encoding) {};

http.ServerRequest.prototype.pause = function() {};

http.ServerRequest.prototype.resume = function() {};

/**
 * @type {*}
 */
http.ServerRequest.prototype.connection;

/**
 * @constructor
 * @extends {EventEmitter}
 * @private
 */
http.ServerResponse = function() {};

http.ServerResponse.prototype.writeContinue = function() {};

/**
 * @param {number} statusCode
 * @param {*=} reasonPhrase (string, if specified)
 * @param {*=} headers (Object.<string>, if specified)
 */
http.ServerResponse.prototype.writeHead = function(
    statusCode, reasonPhrase, headers) {};

/**
 * @type {number}
 */
http.ServerResponse.prototype.statusCode;

/**
 * @param {string} name
 * @param {string} value
 */
http.ServerResponse.prototype.setHeader = function(name, value) {};

/**
 * @param {string} name
 * @return {string|undefined} value
 */
http.ServerResponse.prototype.getHeader = function(name) {};

/**
 * @param {string} name
 */
http.ServerResponse.prototype.removeHeader = function(name) {};

/**
 * @param {string|Array} chunk may also be a Buffer
 * @param {string=} encoding defaults to 'utf8'
 */
http.ServerResponse.prototype.write = function(chunk, encoding) {};

/**
 * @param {Object} headers
 */
http.ServerResponse.prototype.addTrailers = function(headers) {};

/**
 * @param {(string|Array)=} data may also be a Buffer
 * @param {string=} encoding defaults to 'utf8'
 */
http.ServerResponse.prototype.end = function(data, encoding) {};

/**
 * @constructor
 * @extends {EventEmitter}
 * @private
 */
http.ClientRequest = function() {};

/**
 * @param {string|Array} chunk may also be a Buffer
 * @param {string=} encoding defaults to 'utf8'
 */
http.ClientRequest.prototype.write = function(chunk, encoding) {};

/**
 * @param {(string|Array)=} data may also be a Buffer
 * @param {string=} encoding defaults to 'utf8'
 */
http.ClientRequest.prototype.end = function(data, encoding) {};

/**
 */
http.ClientRequest.prototype.abort = function() {};

/**
 * @constructor
 * @extends {EventEmitter}
 * @private
 */
http.ClientResponse = function() {};

/**
 * @type {number}
 */
http.ClientResponse.prototype.statusCode;

/**
 * @type {string}
 */
http.ClientResponse.prototype.httpVersion;

/**
 * @type {string}
 */
http.ClientResponse.prototype.httpVersionMajor;

/**
 * @type {string}
 */
http.ClientResponse.prototype.httpVersionMinor;

/** @type {Object} */
http.ClientResponse.prototype.headers;

/** @type {Object} */
http.ClientResponse.prototype.trailers;

/**
 * @param {?string} encoding either 'utf8' or 'binary'. If null (the default),
 */
http.ClientResponse.prototype.setEncoding = function(encoding) {};

http.ClientResponse.prototype.pause = function() {};

http.ClientResponse.prototype.resume = function() {};

/**
 * @param {Object} options
 * @param {function(http.ClientResponse)} callback
 * @return {http.ClientRequest}
 */
http.request = function(options, callback) {};

/**
 * @param {Object} options
 * @param {function(http.ClientResponse)} callback
 * @return {http.ClientRequest}
 */
http.get = function(options, callback) {};
