import {Col, Icon, message, Modal, Row} from 'antd';
import React, {Fragment} from 'react';
import {REQUEST, REQUEST_ERROR, REQUEST_SUCCESS} from '../api/actions';
import {GUTTER_MD, MARGIN_MD, MODAL_WIDTH_LG, MODAL_WIDTH_SM} from '../../styles/constants';
import ReportWarningList, {getReportWarningListStr, getReportWrongLinesStr} from './ReportWarningList';
import {getReportInfoListStr, ReportInfoList} from './ReportInfoList';
import StringDownloadButton from '../../components/string-download-button';
import moment from 'moment';
import {getErrorCodesTranslations} from '../../constants/getErrorCodesTranslations';
import {getStatusCodesTranslations} from "../../constants/getStatusCodesTranslations";
import {PAGE_NAVIGATE} from "../../page/actions";

const middlewareFactory = i18next => () => next => action => {

  const t = i18next.t.bind(i18next);

  switch (action.type) {
    case PAGE_NAVIGATE:
      Modal.destroyAll();
      return next(action);
    case REQUEST:
      if (typeof (action.messages) === 'function') {
        action.messages = action.messages(t);
      }
      return next(action);
    case REQUEST_SUCCESS:

      if (action.response && (action.response.ReportDictionary || action.response.WarnDictionary)) {
        const infos = action.response.ReportDictionary;
        const warnings = action.response.WarnDictionary;
        const wrongLines = action.response.WrongLines;
        const reportFileNameId = action.reportFileNameId;

        const reportFileNameTime = moment()
          .format('YYYY-MM-DD_HH-mm-ss');

        if (window.modal !== undefined) {
          window.modal.destroy();
        }

        const modal = Modal.info();
        modal.update({
          width: MODAL_WIDTH_LG,
          title:
            <Row type="flex" justify="end">
              <Col>
                <Icon type="close" onClick={modal.destroy} style={{cursor: 'pointer'}}/>
              </Col>
            </Row>,
          content:
            <Fragment>
              <ReportInfoList t={t} infos={infos}/>
              <div style={{marginTop: MARGIN_MD}}>
                <ReportWarningList t={t} warnings={warnings}/>
              </div>
              <Row type="flex" justify="end" style={{marginTop: MARGIN_MD}} gutter={GUTTER_MD}>
                <Col>
                  <StringDownloadButton
                    str={`${getReportInfoListStr(t, infos)}\r\n${getReportWarningListStr(t, warnings)}`}
                    fileName={`report_${reportFileNameId ? `${reportFileNameId}_` : ''}${reportFileNameTime}.txt`}
                    mimeType="text/plain"
                  >
                    {t('middlewares.feedback.buttons.warningListDownload')}
                  </StringDownloadButton>
                </Col>
                {wrongLines && wrongLines.length > 0 && (
                  <Col>
                    <StringDownloadButton
                      str={getReportWrongLinesStr(wrongLines)}
                      fileName={`wrong-lines_${reportFileNameId ? `${reportFileNameId}_` : ''}${reportFileNameTime}.csv`}
                      mimeType="text/csv"
                    >
                      {t('middlewares.feedback.buttons.wrongLinesDownload')}
                    </StringDownloadButton>
                  </Col>
                )}
              </Row>
            </Fragment>
        });
        window.modal = modal;
      }
      return next(action);
    case REQUEST_ERROR:

      if (!action.hideFeedback) {

        let content = null;
        let isWarning = false;

        if (action.error) {
          const {
            errorCode,
            report
          } = action.error;
          const translatedErrorCode = getErrorCodesTranslations(t)[errorCode];
          const reportFileNameId = action.reportFileName;
          const reportFileNameTime = moment()
            .format('YYYY-MM-DD_HH-mm-ss');

          /* gestione custom di alcuni errori */
          if (errorCode === "DEF_CAT_SCHEME_EMPTY") {
            isWarning = true;
          }
          if (errorCode === "LOADING_CONCURRENT_UPLOAD_SAME_CUBE") {
            return next(action);
          }

          content =
            <Fragment>
              {
                translatedErrorCode !== undefined
                  ? translatedErrorCode
                  : errorCode
              }
              {report && Object.keys(report).length > 0 && (
                <div style={{marginTop: MARGIN_MD}}>
                  <ReportWarningList t={t} warnings={report}/>
                  <Row type="flex" justify="end" style={{marginTop: MARGIN_MD}}>
                    <Col>
                      <StringDownloadButton
                        str={`${getReportWarningListStr(t, report)}`}
                        fileName={`report_${reportFileNameId ? `${reportFileNameId}_` : ''}${reportFileNameTime}.txt`}
                        mimeType="text/plain"
                      >
                        {t('middlewares.feedback.buttons.warningListDownload')}
                      </StringDownloadButton>
                    </Col>
                  </Row>
                </div>
              )}
            </Fragment>;
        } else if (action.statusCode) {
          const translatedStatusCode = getStatusCodesTranslations(t)[action.statusCode];
          content =
            <Fragment>
              {translatedStatusCode !== undefined
                ? translatedStatusCode
                : t('errors.unknown', {code: `${action.statusCode}`})
              }
            </Fragment>;
        } else {
          content = t('errors.generic');
        }
        message.destroy();

        // TODO: improve
        if (window.modal !== undefined) {
          window.modal.destroy();
        }

        window.modal = (isWarning ? Modal.warn : Modal.error)({
          title: isWarning ? t('errors.titleForWarning') : t('errors.title'),
          content,
          onOk: (closeDialog) => {
            closeDialog();
          },
          width:
            action.error && action.error.report && Object.keys(action.error.report).length > 0
              ? MODAL_WIDTH_LG
              : MODAL_WIDTH_SM
        });
      }

      return next(action);
    default:
      return next(action);
  }
};

export default middlewareFactory;
