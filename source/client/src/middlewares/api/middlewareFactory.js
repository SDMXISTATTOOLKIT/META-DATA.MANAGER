import {errorRequest, REQUEST, startRequest, successRequest} from './actions';
import {Card, Col, Icon, message, Modal, Row} from 'antd';
import axios from 'axios';
import React from 'react';
import uuidv4 from 'uuid';
import {clearAppUser} from "../../reducers/app/actions";
import {addSpinnerAction, completeSpinnerAction} from "../spinner/actions";
import {getStatusCodesTranslations} from "../../constants/getStatusCodesTranslations";
import {getErrorCodesTranslations} from "../../constants/getErrorCodesTranslations";
import {GUTTER_SM, MARGIN_SM, MODAL_WIDTH_MD} from "../../styles/constants";

const apiMiddlewareFactory = (baseUrl, i18next) => {

  message.config({
    duration: 3,
    maxCount: 1
  });

  const t = i18next.t.bind(i18next);

  const fetchFromApi = axios.create({baseURL: baseUrl});

  return (
    ({dispatch, getState}) => next => action => {

      const handleResponseSuccess = (uuid, action, res, hideFeedback) => {

        if (res[0].headers['token-expired']) {
          handleTokenExpired()
        }

        if (!hideFeedback && action.messages !== undefined && action.messages.success !== undefined) {
          message.success(action.messages.success);
        }

        const successAction = successRequest(
          uuid,
          action,
          action.isArray ? res.map(res => res.data) : res[0].data,
          action.isArray ? res.map(res => res.headers) : res[0].headers
        );

        dispatch(successAction);
        dispatch(completeSpinnerAction(successAction, uuid));
      };

      const handleTokenExpired = () => {
        dispatch(clearAppUser())
      };

      const handleCustomError = (uuid, action, errObj, hideFeedback) => {
        dispatch(errorRequest(uuid, action, null, errObj, hideFeedback));
        dispatch(completeSpinnerAction(action, uuid));
        console.error(`${errObj.errorCode}${errObj.stackTrace ? `- ${errObj.stackTrace}` : ''}`);
      };

      const handleGenericError = (uuid, action, statusCode, hideFeedback) => {
        dispatch(errorRequest(uuid, action, statusCode, null, hideFeedback));
        dispatch(completeSpinnerAction(action, uuid));
        console.error(`${action.label}${statusCode ? ` - ${statusCode}` : ''}`);
      };

      const handleResponseError = (uuid, action, res, hideFeedback) => {

        if (res.response) {

          if (res.response.headers['token-expired']) {
            handleTokenExpired()
          }

          if (res.response.data) {

            if (action.doNotJSONParse) {

              res.response.data = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(res.response.data)));
            }
            if (res.response.data.errorCode) {
              handleCustomError(uuid, action, res.response.data, hideFeedback);
              if (res.response.data.errorCode === "CONFIG_NODE_SESSION_NOT_FOUND") {
                dispatch(clearAppUser());
              }
            } else {
              handleGenericError(uuid, action, res.response.status, hideFeedback);
            }
          } else {
            handleGenericError(uuid, action, res.response.status, hideFeedback);
          }
        } else {
          handleGenericError(uuid, action, null, hideFeedback);
        }
      };

      const result = next(action);

      if (action.type === REQUEST) {

        let {
          method,
          url,
          data,
          isArray,
          contentType,
          doNotJSONParse,
          sequential
        } = action;

        if (!isArray) {
          method = [method];
          url = [url];
          data = [data];
        }

        // if (messages !== undefined && messages !== null && messages.start !== undefined) {
        //   message.loading(messages.start, 0);
        // }

        const uuid = uuidv4();

        const startAction = startRequest(uuid, action);

        dispatch(startAction);
        dispatch(addSpinnerAction(startAction, uuid));

        const token = getState().app.user.token;

        const requestsParams =
          method.map((method, idx) => {
            let headers = {nodeId: getState().app.endpointId};
            if (contentType) {
              headers['Content-Type'] = contentType;
            }
            if (token) {
              headers['Authorization'] = `bearer ${token}`;
            }
            return ({
              withCredentials: true,
              headers,
              method,
              url: url[idx],
              transformResponse: doNotJSONParse ? res => res : null,
              data: data && data[idx] ? data[idx] : undefined,
              responseType: doNotJSONParse ? 'arraybuffer' : undefined
            });
          });

        const handleResponses = resArr => {
          const errorsCount = resArr.filter(({status}) => status !== 200).length;

          if (errorsCount === 0) {
            handleResponseSuccess(uuid, action, resArr)
          } else {
            handleResponseError(
              uuid,
              action,
              resArr.filter(({status}) => status !== 200)[0],
              resArr.length > 1 && action.idsForErrorReport
            );

            if (resArr.length > 1 && action.idsForErrorReport) {
              Modal.error({
                title: t("errors.some"),
                width: MODAL_WIDTH_MD,
                content:
                  <Card
                    type="inner"
                    bodyStyle={{
                      maxHeight: 320,
                      overflowY: "auto",
                      overflowX: "hidden"
                    }}
                  >
                    {resArr.map((res, index) =>
                      <div
                        style={
                          index < resArr.length - 1
                            ? {marginBottom: MARGIN_SM}
                            : null
                        }
                        key={index}
                      >
                        <Row type="flex" gutter={GUTTER_SM}>
                          <Col>
                            {res.status === 200
                              ? <Icon type="check-circle" theme="filled" style={{color: 'green'}}/>
                              : <Icon type="close-circle" theme="filled" style={{color: 'red'}}/>
                            }
                          </Col>
                          <Col>{action.idsForErrorReport[index]}</Col>
                        </Row>
                        {res.status !== 200 && (
                          <Row>
                            <Col>
                              {(() => {
                                if (!res.response) {
                                  return t('errors.generic');
                                } else {

                                  if (action.doNotJSONParse) {
                                    res.response.data =
                                      JSON.parse(String.fromCharCode.apply(null, new Uint8Array(res.response.data)));
                                  }

                                  if (!res.response.data || !res.response.data.errorCode) {

                                    const translatedStatusCode = getStatusCodesTranslations(t)[res.response.status];

                                    return translatedStatusCode !== undefined
                                      ? translatedStatusCode
                                      : t('errors.unknown', {code: `${res.response.status}`});

                                  } else {

                                    const translatedErrorCode = getErrorCodesTranslations(t)[res.response.data.errorCode];

                                    return translatedErrorCode !== undefined
                                      ? translatedErrorCode
                                      : res.response.data.errorCode;
                                  }
                                }
                              })()}
                            </Col>
                          </Row>
                        )}
                      </div>
                    )}
                  </Card>
              });
            }
          }
        };

        if (sequential) {

          let resArr = [];

          const foo = index => {
            fetchFromApi(requestsParams[index])
              .catch(err => err)
              .then(res => {
                resArr.push(res);
                if (index < requestsParams.length - 1) {
                  foo(index + 1)
                } else {
                  handleResponses(resArr);
                }
              });
          };

          foo(0);

        } else {
          axios.all(
            requestsParams.map(fetchFromApi).map(promise => promise.catch(err => err))
          ).then(handleResponses);
        }
      }

      return result;
    });
};

export default apiMiddlewareFactory;
