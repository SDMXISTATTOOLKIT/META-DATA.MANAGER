import React, {Fragment} from 'react';
import {compose} from "redux";
import {translate} from 'react-i18next';
import {getArtefactTripletFromUrn, getStringFromArtefactTriplet} from "../../utils/sdmxJson";
import {Col, Icon, Row} from "antd";
import {MARGIN_MD} from "../../styles/constants";
import {getSdmxTypesTranslations} from "../../constants/getSdmxTypesTranslations";

const IMPORT_STRUCTURES_REPORT_STATUS_SUCCESS = "Success";
const IMPORT_STRUCTURES_REPORT_STATUS_WARNING = "Warning";
const IMPORT_STRUCTURES_REPORT_STATUS_ERROR = "Error";
const IMPORT_STRUCTURES_REPORT_STATUS_FAILURE = "Failure";

const ArtefactExportReport = ({
                                t,
                                report
                              }) =>
  report !== null
    ? (
      report.map(({maintainableObject, status, result}, index) => {

        const temp = maintainableObject.split("=")[0].split(".");
        const type = temp[temp.length - 1];

        return (
          <Fragment key={index}>
            <Row type="flex" justify="space-between" style={index > 0 ? {marginTop: MARGIN_MD} : null}>
              <Col>
                {`${getSdmxTypesTranslations(t)[type.toLowerCase()]} [${getStringFromArtefactTriplet(getArtefactTripletFromUrn(maintainableObject))}]`}
              </Col>
              {status === IMPORT_STRUCTURES_REPORT_STATUS_SUCCESS && (
                <Col>
                  <Fragment>
                    {`${t('scenes.utilities.importStructures.reportModal.status.success')} `}
                    <Icon type="check-circle" theme="filled" style={{color: 'green'}}/>
                  </Fragment>
                </Col>
              )}
            </Row>
            {status !== IMPORT_STRUCTURES_REPORT_STATUS_SUCCESS && (
              <Row>
                <Col>
                  {(() => {
                    switch (status) {
                      case IMPORT_STRUCTURES_REPORT_STATUS_WARNING:
                        return (
                          <Fragment>
                            <Icon type="exclamation-circle" theme="filled" style={{color: 'orange'}}/>{" "}
                            {`${t('scenes.utilities.importStructures.reportModal.status.warning')}: `}
                            {result}
                          </Fragment>
                        );
                      case IMPORT_STRUCTURES_REPORT_STATUS_ERROR:
                        return (
                          <Fragment>
                            <Icon type="close-circle" theme="filled" style={{color: 'red'}}/>{" "}
                            {`${t('scenes.utilities.importStructures.reportModal.status.error')}: `}
                            {result}
                          </Fragment>
                        );
                      case IMPORT_STRUCTURES_REPORT_STATUS_FAILURE:
                        return (
                          <Fragment>
                            <Icon type="close-circle" theme="filled" style={{color: 'red'}}/>{" "}
                            {`${t('scenes.utilities.importStructures.reportModal.status.error')}: `}
                            {result}
                          </Fragment>
                        );
                      default:
                        return status;
                    }
                  })()}
                </Col>
              </Row>
            )}
          </Fragment>
        );
      })
    )
    : <span/>;

export default compose(
  translate(),
)(ArtefactExportReport);
