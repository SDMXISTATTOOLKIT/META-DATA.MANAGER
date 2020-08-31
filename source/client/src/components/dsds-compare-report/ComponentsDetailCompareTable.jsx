import React, {Fragment} from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import {Button, Card, Col, Icon, Row} from "antd";
import {GUTTER_SM, MARGIN_MD} from "../../styles/constants";
import {DataLanguageConsumer} from "../../contexts/DataLanguage";
import {getLocalizedStr} from "../../middlewares/i18n/utils";
import _ from "lodash"

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages
});

const SPAN_COMPONENT_COL = 10;
const SPAN_CENTER_COL = 4;

const IconFontCNIcons = Icon.createFromIconfontCN({
  scriptUrl: './static/vendor/iconfont_cn/iconfont.js',
});

const mandatoryIconStyle = {
  type: 'm',
  style: {
    transform: 'scale(1.1)'
  },
  title: "Mandatory"
};

const getCodelistName = (codelist, lang, dataLangs) =>
  `[${codelist.id}+${codelist.agencyId}+${codelist.version}] ${(codelist.names && Object.keys(codelist.names).length > 0) ? getLocalizedStr(codelist.names, lang, dataLangs) : ''}`;

const getConceptName = concept =>
  `[${concept.id}+${concept.agencyId}+${concept.version}] ${concept.conceptId}`;

const ComponentsDetailCompareTable = ({
                                        t,
                                        appLanguage,
                                        dataLanguages,
                                        commonComponentsCodelist,
                                        commonComponentsConcept,
                                        sourceFile,
                                        targetFile,
                                        fetchCodelistCompareReport
                                      }) =>
  <DataLanguageConsumer>
    {dataLanguage => {
      const lang = dataLanguage || appLanguage;

      const keys = _.union(commonComponentsCodelist.map(({key}) => key), commonComponentsConcept.map(({key}) => key));

      let commonComponents = keys.map(key => ({
        key: (commonComponentsCodelist.find(comp => comp.key === key) || commonComponentsConcept.find(comp => comp.key === key)).key,
        mandatory: (commonComponentsCodelist.find(comp => comp.key === key) || commonComponentsConcept.find(comp => comp.key === key)).mandatory,
        sourceCodelist: (commonComponentsCodelist.find(comp => comp.key === key) || {}).source,
        targetCodelist: (commonComponentsCodelist.find(comp => comp.key === key) || {}).target,
        sourceConcept: (commonComponentsConcept.find(comp => comp.key === key) || {}).source,
        targetConcept: (commonComponentsConcept.find(comp => comp.key === key) || {}).target
      }));

      commonComponents = commonComponents.filter(component =>
        (component.sourceCodelist || component.targetCodelist || component.sourceConcept || component.targetConcept));

      return (
        <Fragment>
          {commonComponents.map((component, idx) =>
            <Card
              type="inner"
              key={idx}
              title={
                <Row type="flex" justify="center" gutter={GUTTER_SM}>
                  <Col>
                    {component.key}
                  </Col>
                  <Col>
                    {component.mandatory ? <IconFontCNIcons {...mandatoryIconStyle}/> : null}
                  </Col>
                </Row>
              }
              style={{marginBottom: MARGIN_MD}}
            >
              <Fragment>
                {(component.sourceCodelist || component.targetCodelist) && (
                  <Fragment>
                    <Row type="flex" justify="center" style={{marginBottom: MARGIN_MD}}>
                      <b>{t("components.dsdsCompareReport.componentsDetailCompareTable.codelist.label") + ':'}</b>
                    </Row>
                    <Row type="flex" justify="center" style={{marginBottom: MARGIN_MD}}>
                      <Col span={SPAN_COMPONENT_COL}>
                        {component.sourceCodelist && (
                          <Row type="flex" justify="end">
                            {getCodelistName(component.sourceCodelist, lang, dataLanguages)}
                          </Row>
                        )}
                      </Col>
                      <Col span={SPAN_CENTER_COL}>
                        {component.sourceCodelist && component.targetCodelist && fetchCodelistCompareReport && (
                          <Row type="flex" justify="center">
                            <Button onClick={() => fetchCodelistCompareReport(
                              {
                                id: component.sourceCodelist.id,
                                agencyID: component.sourceCodelist.agencyId,
                                version: component.sourceCodelist.version,
                              },
                              {
                                id: component.targetCodelist.id,
                                agencyID: component.targetCodelist.agencyId,
                                version: component.targetCodelist.version,
                              },
                              sourceFile,
                              targetFile
                            )}
                            >
                              {t("commons.buttons.detail.title")}
                            </Button>
                          </Row>
                        )}
                      </Col>
                      <Col span={SPAN_COMPONENT_COL}>
                        {component.targetCodelist && (
                          <Row type="flex" justify="start">
                            {getCodelistName(component.targetCodelist, lang, dataLanguages)}
                          </Row>
                        )}
                      </Col>
                    </Row>
                  </Fragment>
                )}
                {(component.sourceConcept || component.targetConcept) && (
                  <Fragment>
                    <Row type="flex" justify="center" style={{marginBottom: MARGIN_MD}}>
                      <b>{t("components.dsdsCompareReport.componentsDetailCompareTable.concept.label") + ':'}</b>
                    </Row>
                    <Row type="flex" justify="center" style={{marginBottom: MARGIN_MD}}>
                      <Col span={SPAN_COMPONENT_COL}>
                        {component.sourceConcept && (
                          <Row type="flex" justify="end">
                            {getConceptName(component.sourceConcept)}
                          </Row>
                        )}
                      </Col>
                      <Col span={SPAN_CENTER_COL}/>
                      <Col span={SPAN_COMPONENT_COL}>
                        {component.targetConcept && (
                          <Row type="flex" justify="start">
                            {getConceptName(component.targetConcept)}
                          </Row>
                        )}
                      </Col>
                    </Row>
                  </Fragment>
                )}
              </Fragment>
            </Card>
          )}
        </Fragment>
      )
    }}
  </DataLanguageConsumer>;

export default compose(
  translate(),
  connect(mapStateToProps)
)(ComponentsDetailCompareTable);