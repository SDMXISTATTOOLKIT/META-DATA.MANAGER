export const REQUEST_START = 'REQUEST_START';
export const REQUEST_SUCCESS = 'REQUEST_SUCCESS';
export const REQUEST_ERROR = 'REQUEST_ERROR';
export const REQUEST_METHOD_POST = 'POST';
export const REQUEST_METHOD_PUT = 'PUT';
export const REQUEST_METHOD_GET = 'GET';
export const REQUEST_METHOD_DELETE = 'DELETE';
export const REQUEST = 'REQUEST';

export const postRequest = (label, url, data, messages, contentType, doNotJSONParse) => ({
  type: REQUEST,
  method: REQUEST_METHOD_POST,
  label,
  url,
  data,
  messages,
  contentType,
  doNotJSONParse
});

export const putRequest = (label, url, data, messages, contentType) => ({
  type: REQUEST,
  method: REQUEST_METHOD_PUT,
  label,
  url,
  data,
  messages,
  contentType
});

export const getRequest = (label, url, messages, doNotJSONParse) => ({
  type: REQUEST,
  method: REQUEST_METHOD_GET,
  label,
  url,
  messages,
  doNotJSONParse
});

export const allRequest = (label, methods, urls, datas, messages, idsForErrorReport, sequential) => ({
  type: REQUEST,
  label,
  method: methods,
  url: urls,
  data: datas,
  messages,
  isArray: true,
  idsForErrorReport,
  sequential
});

export const deleteRequest = (label, url, messages) => ({
  type: REQUEST,
  method: REQUEST_METHOD_DELETE,
  label,
  url,
  messages
});

export const startRequest = (uuid, action) => ({
  ...action,
  type: REQUEST_START,
  uuid
});

export const successRequest = (uuid, action, response, header) => ({
  ...action,
  type: REQUEST_SUCCESS,
  uuid,
  response,
  header
});

export const errorRequest = (uuid, action, statusCode, error, hideFeedback) => ({
  ...action,
  type: REQUEST_ERROR,
  uuid,
  statusCode,
  error,
  hideFeedback
});
